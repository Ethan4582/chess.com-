from typing import Dict, Optional, List, Any
import logging
from .engine import ChessEngine
from .core.supabase_client import supabase

logger = logging.getLogger(__name__)

class GameRoom:
    """Enhanced GameRoom with Supabase Persistence."""

    def __init__(self, room_id: str, initial_fen: Optional[str] = None):
        self._room_id: str = room_id
        self._engine: ChessEngine = ChessEngine()
        if initial_fen:
            self._engine.load_fen(initial_fen)
            
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
            'status': self._engine.get_game_status()
        }

    async def save_to_db(self, move_data: Optional[Dict] = None):
        """Persists the current board state and move to Supabase."""
        try:
            # 1. Update the Room (Current FEN)
            supabase.table('rooms').update({
                'fen': self._engine.get_fen(),
                'status': 'playing' if not self._engine.is_game_over() else 'finished',
                'updated_at': 'now()'
            }).eq('id', self._room_id).execute()

            # 2. Log the Move (if provided)
            if move_data:
                # We can refine this to track which player ID made the move in the future
                supabase.table('moves').insert({
                    'room_id': self._room_id,
                    'move_notation': move_data.get('san', 'unknown'),
                    'fen_after': self._engine.get_fen()
                }).execute()

        except Exception as e:
            logger.error(f"Failed to sync room {self._room_id} to Supabase: {e}")

    def add_player(self, socket_id: str, name: str = "Guest") -> str:
        if 'white' in self._players and self._players['white']['sid'] == socket_id:
            return 'w'
        if 'black' in self._players and self._players['black']['sid'] == socket_id:
            return 'b'

        if 'white' not in self._players:
            self._players['white'] = {'sid': socket_id, 'name': name or "Guest"}
            return 'w'
        elif 'black' not in self._players:
            self._players['black'] = {'sid': socket_id, 'name': name or "Guest"}
            return 'b'
        else:
            if socket_id not in self._spectators:
                self._spectators.append(socket_id)
            return 'spectator'

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

    async def get_or_create_room(self, room_id: str) -> Optional[GameRoom]:
        """Fetch from Supabase first if not in memory."""
        if room_id in self._rooms:
            return self._rooms[room_id]

        # 🔍 CHECK SUPABASE FOR EXISTING GAME
        try:
            response = supabase.table('rooms').select('*').eq('id', room_id).execute()
            if response.data and len(response.data) > 0:
                room_data = response.data[0]
                new_room = GameRoom(room_id, initial_fen=room_data.get('fen'))
                self._rooms[room_id] = new_room
                logger.info(f"Restored room {room_id} from Supabase.")
                return new_room
            else:
                logger.warning(f"Room {room_id} not found in Supabase. Creating temporary local room.")
                new_room = GameRoom(room_id)
                self._rooms[room_id] = new_room
                return new_room
        except Exception as e:
            logger.error(f"Error fetching room {room_id} from Supabase: {e}")
            return None

    def get_room(self, room_id: str) -> Optional[GameRoom]:
        return self._rooms.get(room_id)

    def remove_player_from_all(self, socket_id: str) -> Optional[str]:
        for room_id, room in self._rooms.items():
            is_white = 'white' in room._players and room._players['white']['sid'] == socket_id
            is_black = 'black' in room._players and room._players['black']['sid'] == socket_id
            is_spectator = socket_id in room._spectators
            
            if is_white or is_black or is_spectator:
                room.remove_player(socket_id)
                return room_id
        return None
