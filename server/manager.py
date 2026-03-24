from typing import Dict, Optional, List, Any
import logging
import asyncio
from .engine import ChessEngine
from .core.supabase_client import supabase

logger = logging.getLogger(__name__)

class GameRoom:
    """Hybrid GameRoom: High-speed in-memory state with async Supabase persistence and ELO tracking."""

    def __init__(self, room_id: str, initial_data: Optional[Dict] = None):
        self._room_id: str = room_id
        self._engine: ChessEngine = ChessEngine()
        
        # Load persistent data if available
        self._white_user_id: Optional[str] = None
        self._black_user_id: Optional[str] = None
        
        if initial_data:
            self._engine.load_fen(initial_data.get('fen', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'))
            self._white_user_id = initial_data.get('white_player_id')
            self._black_user_id = initial_data.get('black_player_id')
            
        self._players: Dict[str, Dict[str, Any]] = {}  # {'white': {'sid': sid, 'name': name, 'user_id': uid}, ...}
        self._spectators: List[str] = []
        
        # Forced Game Over State (Abort/Disconnect)
        self._forced_over: bool = False
        self._forced_winner: Optional[str] = None
        self._forced_reason: Optional[str] = None
        
        # Disconnect Timers
        self._disconnect_tasks: Dict[str, asyncio.Task] = {}

    @property
    def room_id(self) -> str:
        return self._room_id

    @property
    def engine(self) -> ChessEngine:
        return self._engine

    def get_room_state(self) -> Dict:
        status = self._engine.get_game_status()
        if self._forced_over:
            status = {
                'is_over': True,
                'winner': self._forced_winner,
                'reason': self._forced_reason
            }

        return {
            'white': self._players.get('white', {}).get('name'),
            'black': self._players.get('black', {}).get('name'),
            'count': len(self._players),
            'status': status,
            'player_ids': {
                'white': self._white_user_id,
                'black': self._black_user_id
            }
        }

    async def save_to_db(self, move_data: Optional[Dict] = None):
        """Async persistence with ELO awarding on game completion."""
        try:
            current_fen = self._engine.get_fen()
            
            # Check if game is over (either engine or forced)
            status = self.get_room_state()['status']
            is_over = status['is_over']
            winner_role = status['winner']

            winner_id = None
            if winner_role == 'w': winner_id = self._white_user_id
            if winner_role == 'b': winner_id = self._black_user_id

            # 1. Update the Room State
            supabase.table('rooms').update({
                'fen': current_fen,
                'status': 'finished' if is_over else 'playing',
                'winner_id': winner_id,
                'updated_at': 'now()'
            }).eq('id', self._room_id).execute()

            # 2. Log History
            if move_data:
                supabase.table('moves').insert({
                    'room_id': self._room_id,
                    'move_notation': move_data.get('san', 'unknown'),
                    'fen_after': current_fen
                }).execute()

            # 🏆 3. AWARD ELO POINTS
            if is_over:
                await self._handle_game_over_points(winner_role)

        except Exception as e:
            logger.error(f"Supabase Sync Error: {e}")

    async def abort_game(self, aborter_role: str):
        """Forces game over and awards points to the OTHER player."""
        if self._engine.is_game_over() or self._forced_over:
            return
            
        self._forced_over = True
        self._forced_winner = 'b' if aborter_role == 'w' else 'w'
        self._forced_reason = 'Game aborted by opponent'
        await self.save_to_db()
        logger.info(f"🚩 Game Aborted in Room {self._room_id} by {aborter_role}")

    async def handle_disconnect_timeout(self, disconnected_role: str, io_emit_callback):
        """Starts a 30s timer. If player doesn't reconnect, opponent wins."""
        if self._engine.is_game_over() or self._forced_over:
            return

        # Cancel existing task if any
        if disconnected_role in self._disconnect_tasks:
            self._disconnect_tasks[disconnected_role].cancel()

        logger.info(f"⏳ Disconnect detected for {disconnected_role} in {self._room_id}. Starting 60s timer.")
        
        async def timer():
            await asyncio.sleep(60) # Give them 60 seconds
            # If still not in self._players, force win
            if disconnected_role not in self._players:
                self._forced_over = True
                self._forced_winner = 'b' if disconnected_role == 'w' else 'w'
                self._forced_reason = 'Opponent disconnected'
                await self.save_to_db()
                await io_emit_callback("gameOver", self.get_room_state()['status'])
                logger.info(f"⏰ Timeout reached for {disconnected_role} in {self._room_id}. Awarding win.")

        self._disconnect_tasks[disconnected_role] = asyncio.create_task(timer())

    def cancel_disconnect_timer(self, role: str):
        if role in self._disconnect_tasks:
            self._disconnect_tasks[role].cancel()
            del self._disconnect_tasks[role]
            logger.info(f"✅ Reconnect detected for {role} in {self._room_id}. Timer cancelled.")

    async def _handle_game_over_points(self, winner_role: Optional[str]):
        """Calculates and updates ELO and stats for both players."""
        logger.info(f"🏁 Game Over Logic Started for Room {self._room_id}. Winner Role: {winner_role}")
        
        # PREVENT DOUBLE UPDATES: Check if rooms table already has 'finished' and winner_id
        # Actually, if we are here, we are calling it from save_to_db.
        # We should ensure this function only runs once by marking it as processed in memory if needed.
        if hasattr(self, '_elo_awarded') and self._elo_awarded:
            return
        self._elo_awarded = True

        try:
            # Handle Draw Case
            if winner_role is None:
                if self._white_user_id:
                    supabase.rpc('increment_draw', {'user_id': self._white_user_id}).execute()
                if self._black_user_id:
                    supabase.rpc('increment_draw', {'user_id': self._black_user_id}).execute()
                return

            winner_id = self._white_user_id if winner_role == 'w' else self._black_user_id
            loser_id = self._black_user_id if winner_role == 'w' else self._white_user_id

            if winner_id:
                supabase.rpc('increment_win', {'user_id': winner_id}).execute()
                supabase.rpc('increment_points', {'user_id': winner_id, 'amount': 25}).execute()

            if loser_id:
                supabase.rpc('increment_loss', {'user_id': loser_id}).execute()
                supabase.rpc('increment_points', {'user_id': loser_id, 'amount': -15}).execute()
                
        except Exception as e:
            logger.error(f"❌ Failed to update stats: {e}")

    def add_player(self, socket_id: str, name: str = "Guest", user_id: Optional[str] = None) -> str:
        # Re-joining logic
        role = None
        if 'white' in self._players and (self._players['white']['sid'] == socket_id or (user_id and self._white_user_id == user_id)):
            role = 'w'
        elif 'black' in self._players and (self._players['black']['sid'] == socket_id or (user_id and self._black_user_id == user_id)):
            role = 'b'

        if role:
            self._players['white' if role == 'w' else 'black'] = {'sid': socket_id, 'name': name or "Guest"}
            self.cancel_disconnect_timer(role) # Cancel timer if they were disconnected
            return role

        # Assign slots
        if not user_id:
            if socket_id not in self._spectators:
                self._spectators.append(socket_id)
            return 'spectator'

        if not self._white_user_id or self._white_user_id == user_id:
            self._white_user_id = user_id
            self._players['white'] = {'sid': socket_id, 'name': name or "Guest"}
            asyncio.create_task(self._sync_player_id('white_player_id', user_id))
            return 'w'
        elif not self._black_user_id or self._black_user_id == user_id:
            self._black_user_id = user_id
            self._players['black'] = {'sid': socket_id, 'name': name or "Guest"}
            asyncio.create_task(self._sync_player_id('black_player_id', user_id))
            return 'b'
        else:
            if socket_id not in self._spectators:
                self._spectators.append(socket_id)
            return 'spectator'

    async def _sync_player_id(self, column: str, user_id: str):
        try:
            supabase.table('rooms').update({column: user_id}).eq('id', self._room_id).execute()
        except Exception as e:
            logger.error(f"Failed to sync {column}: {e}")

    def remove_player(self, socket_id: str):
        if 'white' in self._players and self._players['white']['sid'] == socket_id:
            del self._players['white']
        elif 'black' in self._players and self._players['black']['sid'] == socket_id:
            del self._players['black']
        elif socket_id in self._spectators:
            self._spectators.remove(socket_id)

    def is_player_turn(self, socket_id: str) -> bool:
        turn = self._engine.get_fen().split()[1] # 'w' or 'b'
        role = 'white' if turn == 'w' else 'black'
        return self._players.get(role, {}).get('sid') == socket_id

class GameManager:
    def __init__(self):
        self._rooms: Dict[str, GameRoom] = {}

    async def rehydrate_active_rooms(self):
        try:
            response = supabase.table('rooms').select('*').in_('status', ['waiting', 'playing']).execute()
            if response.data:
                for data in response.data:
                    rid = data['id']
                    if rid not in self._rooms:
                        self._rooms[rid] = GameRoom(rid, initial_data=data)
        except Exception as e:
            logger.info(f"Hydration Error: {e}")

    async def get_or_create_room(self, room_id: str) -> Optional[GameRoom]:
        if room_id in self._rooms:
            return self._rooms[room_id]
        try:
            response = supabase.table('rooms').select('*').eq('id', room_id).execute()
            if response.data:
                room_data = response.data[0]
                new_room = GameRoom(room_id, initial_data=room_data)
                self._rooms[room_id] = new_room
                return new_room
            return None
        except Exception as e:
            logger.error(f"Rehydration Error: {e}")
            return None

    def get_room(self, room_id: str) -> Optional[GameRoom]:
        return self._rooms.get(room_id)

    def remove_player_from_all(self, socket_id: str) -> tuple[Optional[str], Optional[str]]:
        for room_id, room in self._rooms.items():
            is_white = 'white' in room._players and room._players['white']['sid'] == socket_id
            is_black = 'black' in room._players and room._players['black']['sid'] == socket_id
            
            role = None
            if is_white: role = 'w'
            elif is_black: role = 'b'
            elif socket_id in room._spectators: role = 'spectator'
                
            if role:
                room.remove_player(socket_id)
                return room_id, role
        return None, None
