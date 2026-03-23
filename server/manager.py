from typing import Dict, Optional, List
from .engine import ChessEngine


class GameRoom:
    """Exact Python equivalent of games[roomId] in app.js, with added player name handling.
    
    games[roomId] = {
        chess,                      // ChessEngine
        players: { white: {sid, name}, black: {sid, name} },
        history: [chess.fen()]      // managed inside ChessEngine
    }
    """

    def __init__(self, room_id: str):
        self._room_id: str = room_id
        self._engine: ChessEngine = ChessEngine()
        self._players: Dict[str, Dict[str, str]] = {}  # {'white': {'sid': sid, 'name': name}, ...}
        self._spectators: List[str] = []

    @property
    def room_id(self) -> str:
        return self._room_id

    @property
    def engine(self) -> ChessEngine:
        return self._engine

    @property
    def players(self) -> Dict[str, Dict[str, str]]:
        return self._players

    @property
    def players_count(self) -> int:
        return len(self._players)

    def get_room_state(self) -> Dict:
        """Returns the current names and roles for UI syncing."""
        state = {
            'white': self._players.get('white', {}).get('name'),
            'black': self._players.get('black', {}).get('name'),
            'count': len(self._players),
            'status': self._engine.get_game_status()
        }
        return state

    def add_player(self, socket_id: str, name: str = "Guest") -> str:
        """Assign role and name. Default to Guest if missing. 
        Checks for existing sid to prevent double-joining.
        """
        # (1) Check if already a player
        if 'white' in self._players and self._players['white']['sid'] == socket_id:
            return 'w'
        if 'black' in self._players and self._players['black']['sid'] == socket_id:
            return 'b'

        # (2) Assign new role
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
        turn = self._engine.turn()
        if turn == 'w':
            return self._players.get('white', {}).get('sid') == socket_id
        else:
            return self._players.get('black', {}).get('sid') == socket_id


class GameManager:
    def __init__(self):
        self._rooms: Dict[str, GameRoom] = {}

    def get_or_create_room(self, room_id: str) -> GameRoom:
        if room_id not in self._rooms:
            self._rooms[room_id] = GameRoom(room_id)
        return self._rooms[room_id]

    def get_room(self, room_id: str) -> Optional[GameRoom]:
        return self._rooms.get(room_id)

    def remove_player_from_all(self, socket_id: str) -> Optional[str]:
        for room_id, room in self._rooms.items():
            is_white = 'white' in room.players and room.players['white']['sid'] == socket_id
            is_black = 'black' in room.players and room.players['black']['sid'] == socket_id
            is_spectator = socket_id in room._spectators
            
            if is_white or is_black or is_spectator:
                room.remove_player(socket_id)
                return room_id
        return None
