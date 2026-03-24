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
            
        self._players: Dict[str, Dict[str, str]] = {}  # {'white': {'sid': sid, 'name': name}, ...}
        self._spectators: List[str] = []

    @property
    def room_id(self) -> str:
        return self._room_id

    @property
    def engine(self) -> ChessEngine:
        return self._engine

    def get_room_state(self) -> Dict:
        return {
            'white': self._players.get('white', {}).get('name'),
            'black': self._players.get('black', {}).get('name'),
            'count': len(self._players),
            'status': self._engine.get_game_status(),
            'player_ids': {
                'white': self._white_user_id,
                'black': self._black_user_id
            }
        }

    async def save_to_db(self, move_data: Optional[Dict] = None):
        """Async persistence with ELO awarding on game completion."""
        try:
            current_fen = self._engine.get_fen()
            is_over = self._engine.is_game_over()
            status = self._engine.get_game_status()
            
            # Identify winner if game is over
            winner_role = status.get('winner') if is_over else None
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

    async def _handle_game_over_points(self, winner_role: Optional[str]):
        """Calculates and updates ELO and stats for both players."""
        logger.info(f"🏁 Game Over Logic Started for Room {self._room_id}. Winner Role: {winner_role}")
        
        try:
            # Handle Draw Case
            if winner_role is None:
                logger.info(f"🤝 Draw detected. Attempting to update stats for {self._white_user_id} and {self._black_user_id}")
                if self._white_user_id:
                    res = supabase.rpc('increment_draw', {'user_id': self._white_user_id}).execute()
                    logger.info(f"White Draw RPC Response: {res.data if hasattr(res, 'data') else res}")
                if self._black_user_id:
                    res = supabase.rpc('increment_draw', {'user_id': self._black_user_id}).execute()
                    logger.info(f"Black Draw RPC Response: {res.data if hasattr(res, 'data') else res}")
                return

            winner_id = self._white_user_id if winner_role == 'w' else self._black_user_id
            loser_id = self._black_user_id if winner_role == 'w' else self._white_user_id

            logger.info(f"🏆 Winner: {winner_id}, Loser: {loser_id}")

            if winner_id:
                res_w = supabase.rpc('increment_win', {'user_id': winner_id}).execute()
                res_p = supabase.rpc('increment_points', {'user_id': winner_id, 'amount': 25}).execute()
                logger.info(f"Winner Update Result: {res_w.data if hasattr(res_w, 'data') else res_w}")

            if loser_id:
                res_l = supabase.rpc('increment_loss', {'user_id': loser_id}).execute()
                res_pl = supabase.rpc('increment_points', {'user_id': loser_id, 'amount': -15}).execute()
                logger.info(f"Loser Update Result: {res_l.data if hasattr(res_l, 'data') else res_l}")
                
        except Exception as e:
            logger.error(f"❌ CRITICAL: Failed to update stats in Supabase: {e}")

    def add_player(self, socket_id: str, name: str = "Guest", user_id: Optional[str] = None) -> str:
        # 1. Re-joining logic
        if 'white' in self._players and (self._players['white']['sid'] == socket_id or (user_id and self._white_user_id == user_id)):
            self._players['white'] = {'sid': socket_id, 'name': name or "Guest"}
            return 'w'
        if 'black' in self._players and (self._players['black']['sid'] == socket_id or (user_id and self._black_user_id == user_id)):
            self._players['black'] = {'sid': socket_id, 'name': name or "Guest"}
            return 'b'

        # 2. Prevent unauthenticated slots
        if not user_id:
            if socket_id not in self._spectators:
                self._spectators.append(socket_id)
            return 'spectator'

        # 3. Assign slots
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
        """Startup rehydration for memory consistency."""
        try:
            response = supabase.table('rooms').select('*').in_('status', ['waiting', 'playing']).execute()
            if response.data:
                for data in response.data:
                    rid = data['id']
                    if rid not in self._rooms:
                        self._rooms[rid] = GameRoom(rid, initial_data=data)
                logger.info(f"🔄 Memory Hydrated: Loaded {len(response.data)} active sessions.")
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
