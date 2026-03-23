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

@app.get("/api/room-exists/{room_id}")
async def room_exists(room_id: str):
    exists = room_id in manager._rooms
    return {"exists": exists}


# ═══════════════════════════════════════════════════════════════
# Socket.io Events
# ═══════════════════════════════════════════════════════════════

@sio.event
async def connect(sid, environ):
    logger.info(f"DEBUG: Socket connect attempt: {sid}")

@sio.event
async def disconnect(sid):
    room_id = manager.remove_player_from_all(sid)
    logger.info(f"DEBUG: Socket disconnected: {sid} from room {room_id}")
    if room_id:
        room = manager.get_room(room_id)
        if room:
            await sio.emit("roomState", room.get_room_state(), room=room_id)

@sio.on("joinRoom")
async def handle_join(sid, room_id, name=None):
    logger.info(f"DEBUG: handle_join called for sid={sid}, room_id={room_id}, name={name}")
    
    if not room_id:
        return

    # Handle Next.js potential params object
    clean_room_id = room_id
    if isinstance(room_id, dict):
        clean_room_id = room_id.get('id') or room_id.get('roomId')
    
    clean_room_id = str(clean_room_id)
    
    # Forcefully clean up this SID from all rooms first to prevent double-occupancy
    # and stale registrations on the same SID.
    manager.remove_player_from_all(sid)

    await sio.enter_room(sid, clean_room_id)
    room = manager.get_or_create_room(clean_room_id)

    # Assign role and store name (defaults to Guest in manager if missing)
    role = room.add_player(sid, name)
    logger.info(f"DEBUG: Joined sid {sid} to {clean_room_id} as {role} (player: {name or 'Guest'})")

    async with sio.session(sid) as session:
        session['room_id'] = clean_room_id
        session['role'] = role

    # Emit role to the connecting client
    await sio.emit("playerRole", role, to=sid)
    if role == "spectator":
        await sio.emit("spectatorRole", to=sid)

    # Broadcast updated room state (names/roles) to everyone in the room
    await sio.emit("roomState", room.get_room_state(), room=clean_room_id)

    # Send current board state
    await sio.emit("updateBoard", room.engine.get_fen(), to=sid)

@sio.event
async def makeMove(sid, move_data):
    logger.info(f"DEBUG: makeMove from {sid}: {move_data}")
    async with sio.session(sid) as session:
        room_id = session.get('room_id')

    if not room_id:
        return
    
    room = manager.get_room(room_id)
    if not room:
        return

    # (Fix) Block moves if the game is already over
    if room.engine.is_game_over():
        logger.info(f"DEBUG: Move rejected - game is already over.")
        return

    if not room.is_player_turn(sid):
        await sio.emit("invalidMove", "It's not your turn!", to=sid)
        return

    try:
        result = room.engine.make_move(move_data)
        if result is None:
            await sio.emit("invalidMove", "Invalid move!", to=sid)
            return

        # Broadcast move result
        await sio.emit("moveMade", {"move": result}, room=room_id)
        await sio.emit("updateBoard", room.engine.get_fen(), room=room_id)

        # (Fix) If move finished the game, emit gameOver
        status = room.engine.get_game_status()
        if status["is_over"]:
            logger.info(f"DEBUG: Game Over emitted for {room_id}: {status}")
            await sio.emit("gameOver", status, room=room_id)

    except Exception as e:
        logger.error(f"DEBUG: Move error: {e}")
        await sio.emit("invalidMove", "Move failed.", to=sid)
        # Rollback
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

# ─── Mount Socket.io app ───
socket_app = socketio.ASGIApp(sio, app)
app = socket_app
