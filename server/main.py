import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
from .manager import GameManager


# Setup logging properly
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── FastAPI app ───
app = FastAPI()

# IMPORTANT: Ensure CORS is handled at the FastAPI level too
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Socket.io Async Server ───
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*', # Allow all origins for dev
    logger=True, 
    engineio_logger=True
)

# ─── Business Logic ───
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
manager = GameManager()

@app.on_event("startup")
async def startup_event():
    await manager.rehydrate_active_rooms()

# ═══════════════════════════════════════════════════════════════
# Socket.io Events
# ═══════════════════════════════════════════════════════════════

@sio.event
async def connect(sid, environ):
    logger.info(f"DEBUG: Socket connect attempt: {sid}")

import asyncio
import time
import re

disconnect_timers = {} # Tracks forfeiture timeouts. Keyed by (room_id, role)
guest_last_message = {} # Tracks rate limit. Keyed by (guest_id)

async def handle_disconnect_timeout(room_id: str, role: str):
    """Waits 30 seconds, then forfeits the game for the disconnected player."""
    await asyncio.sleep(30)
    
    # Check if timer was cancelled (they reconnected)
    timer_key = (room_id, role)
    if timer_key not in disconnect_timers:
        return

    room = manager.get_room(room_id)
    if room and not room.engine.is_game_over():
        logger.info(f"DEBUG: Player {role} in {room_id} forfeited due to timeout.")
        
        # Broadcast forfeit chat message
        await sio.emit("chatMessage", {
            "author": "System",
            "content": "Player forfeited. Game over.",
            "isSystem": True
        }, room=room_id)
        
        # Determine winner based on role that disconnected
        loser = role
        winner = 'b' if role == 'w' else 'w'
        
        # Update engine status (this is a simplifed forfeit in our hybrid engine)
        # We manually update Supabase rooms table since python-chess doesn't have an inbuilt 'forfeit' status easily exposed like that
        try:
            from .core.supabase_client import supabase
            supabase.table('rooms').update({
                'status': 'finished',
                'winner_id': room._white_user_id if winner == 'w' else room._black_user_id,
                'updated_at': 'now()'
            }).eq('id', room_id).execute()
        except Exception as e:
            logger.error(f"Failed to record forfeit: {e}")

        # Broadcast game over
        status = {"is_over": True, "winner": winner, "reason": "forfeit"}
        await sio.emit("gameOver", status, room=room_id)
        
    # Cleanup timer
    disconnect_timers.pop(timer_key, None)

@sio.event
async def disconnect(sid):
    room_id, role = manager.remove_player_from_all(sid)
    logger.info(f"DEBUG: Socket disconnected: {sid} from room {room_id} with role {role}")
    
    if room_id:
        room = manager.get_room(room_id)
        if room:
            await sio.emit("roomState", room.get_room_state(), room=room_id)
            
            # Use GameRoom's disconnect handler
            if role in ['w', 'b'] and not room.get_room_state()['status']['is_over']:
                # Pass a callback to emit gameOver if timeout happens
                await room.handle_disconnect_timeout(role, sio.emit)
                await sio.emit("playerDisconnected", {"role": role, "timeout": 60}, room=room_id)

@sio.on("joinRoom")
async def handle_join(sid, room_id, name=None, user_id=None):
    if not room_id: return
    clean_id = str(room_id) if not isinstance(room_id, dict) else str(room_id.get('id', ''))
    
    room = await manager.get_or_create_room(clean_id)
    if not room: return

    manager.remove_player_from_all(sid)
    await sio.enter_room(sid, clean_id)

    role = room.add_player(sid, name, user_id)
    
    async with sio.session(sid) as session:
        session['room_id'] = clean_id
        session['role'] = role

    await sio.emit("playerRole", role, to=sid)
    await sio.emit("roomState", room.get_room_state(), room=clean_id)
    await sio.emit("updateBoard", room.engine.get_fen(), to=sid)
    
    # Notify others if player reconnected
    if role in ['w', 'b']:
        await sio.emit("playerReconnected", {"role": role}, room=clean_id)

@sio.on("abortGame")
async def handle_abort(sid):
    async with sio.session(sid) as session:
        room_id = session.get('room_id')
        role = session.get('role')
        
    if not room_id or role not in ['w', 'b']:
        return
        
    room = manager.get_room(room_id)
    if room:
        await room.abort_game(role)
        await sio.emit("gameOver", room.get_room_state()['status'], room=room_id)

@sio.event
async def makeMove(sid, move_data):
    logger.info(f"DEBUG: makeMove from {sid}: {move_data}")
    async with sio.session(sid) as session:
        room_id = session.get('room_id')

    if not room_id:
        return
    room = manager.get_room(room_id)
    if not room or room.engine.is_game_over() or not room.is_player_turn(sid):
        if not room.is_player_turn(sid) and not room.engine.is_game_over():
            await sio.emit("invalidMove", "It's not your turn!", to=sid)
        return

    try:
        result = room.engine.make_move(move_data)
        if result is None:
            await sio.emit("invalidMove", "Invalid move!", to=sid)
            return

        await sio.emit("moveMade", {"move": result}, room=room_id)
        await sio.emit("updateBoard", room.engine.get_fen(), room=room_id)
        
        asyncio.create_task(room.save_to_db(move_data=result))

        status = room.engine.get_game_status()
        if status["is_over"]:
            await sio.emit("gameOver", status, room=room_id)

    except Exception as e:
        logger.error(f"Move error: {e}")
        await sio.emit("invalidMove", "Move failed.", to=sid)
        last_fen = room.engine.get_last_fen()
        if last_fen:
            room.engine.load_fen(last_fen)
            await sio.emit("updateBoard", last_fen, room=room_id)

@sio.on("stepHistory")
async def handle_history(sid, direction):
    async with sio.session(sid) as session:
        room_id = session.get('room_id')
    if room_id:
        room = manager.get_room(room_id)
        if room:
            new_fen = room.engine.step_history(direction)
            if new_fen:
                await sio.emit("updateBoard", new_fen, room=room_id)

@sio.on("chatMessage")
async def handle_chat(sid, data):
    """Handles chat messages with restrictions for guests."""
    async with sio.session(sid) as session:
        room_id = session.get('room_id')
        role = session.get('role')
        
    if not room_id:
        return
        
    content = data.get('content', '').strip()
    if not content:
        return
        
    is_auth = data.get('is_auth', False)
    user_id = data.get('user_id')
    guest_id = data.get('guest_id')
    author_name = data.get('author_name', 'Anonymous')
    
    # ─── GUEST RESTRICTIONS ───
    if not is_auth:
        if not guest_id:
            return
            
        # 1. Rate Limiting (20 seconds)
        now = time.time()
        last_time = guest_last_message.get(guest_id, 0)
        if now - last_time < 20:
            await sio.emit("chatError", "You are sending messages too fast. Wait 20 seconds.", to=sid)
            return
        guest_last_message[guest_id] = now
        
        # 2. Length Limit
        if len(content) > 100:
            content = content[:100] + "..."
            
        # 3. Link Filtering
        if re.search(r"http[s]?://|www\.", content, re.IGNORECASE):
            await sio.emit("chatError", "Links are not allowed for guests.", to=sid)
            return

    elif len(content) > 300: # Auth users limit
        content = content[:300] + "..."

    # ─── BROADCAST MESSAGE ───
    message_payload = {
        "author": author_name,
        "content": content,
        "isAuth": is_auth,
        "isGuest": not is_auth,
        "isSystem": False
    }
    await sio.emit("chatMessage", message_payload, room=room_id)
    
    # ─── PERSIST TO DATABASE ───
    try:
        from .core.supabase_client import supabase
        asyncio.create_task(_save_chat_async(room_id, user_id if is_auth else None, guest_id if not is_auth else None, content))
    except Exception as e:
        logger.error(f"Error persisting chat: {e}")

async def _save_chat_async(room_id, user_id, guest_id, content):
    """Background task to save chat to Supabase."""
    try:
        from .core.supabase_client import supabase
        supabase.table('messages').insert({
            'room_id': room_id,
            'user_id': user_id,
            'guest_id': guest_id,
            'content': content
        }).execute()
    except Exception as e:
        logger.error(f"Async DB Insert failed for chat: {e}")

# ─── Mount Socket.io app ───
socket_app = socketio.ASGIApp(sio, app)
app = socket_app
