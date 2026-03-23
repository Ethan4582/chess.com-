import chess
from typing import List, Optional


class ChessEngine:
    """Exact Python equivalent of the chess.js instance in app.js.
    
    Original app.js data structure per room:
        games[roomId] = {
            chess,                          // Chess instance
            players: {},                    // {white: socketId, black: socketId}
            history: [chess.fen()],          // array of FEN strings
            historyIndex: undefined          // lazy-initialized on first stepHistory
        }
    """

    def __init__(self):
        self._board = chess.Board()
        self._history: List[str] = [self._board.fen()]
        # historyIndex is lazy — original: if (typeof game.historyIndex !== "number")
        self._history_index: Optional[int] = None

    def get_fen(self) -> str:
        """Mirrors: game.chess.fen()"""
        return self._board.fen()

    def turn(self) -> str:
        """Mirrors: chess.turn() which returns 'w' or 'b'"""
        return 'w' if self._board.turn == chess.WHITE else 'b'

    def make_move(self, move_dict: dict) -> Optional[dict]:
        """Mirrors: const res = chess.move(move)
        
        Original chess.js .move() accepts {from, to, promotion} and:
        - Returns the move result object on success (with from, to, san, color, piece, etc.)
        - Returns null on failure
        - Throws on truly invalid input
        
        We replicate this behavior exactly.
        """
        try:
            from_sq = move_dict.get("from", "")
            to_sq = move_dict.get("to", "")
            promotion = move_dict.get("promotion", "q")

            # Build UCI string
            uci_str = f"{from_sq}{to_sq}"

            # Only append promotion if this is actually a pawn promotion
            from_square = chess.parse_square(from_sq)
            piece = self._board.piece_at(from_square)
            to_square = chess.parse_square(to_sq)
            to_rank = chess.square_rank(to_square)

            is_promotion = (
                piece is not None and
                piece.piece_type == chess.PAWN and
                (to_rank == 7 or to_rank == 0)
            )

            if is_promotion and promotion:
                uci_str += promotion.lower()

            move = chess.Move.from_uci(uci_str)

            if move in self._board.legal_moves:
                # Push the move
                san = self._board.san(move)
                self._board.push(move)

                # Save FEN to history — mirrors: game.history.push(chess.fen())
                self._history.append(self._board.fen())

                # Return result object similar to chess.js move result
                return {
                    "from": from_sq,
                    "to": to_sq,
                    "promotion": promotion if is_promotion else None,
                    "san": san,
                    "color": 'b' if self._board.turn == chess.WHITE else 'w',  # color of player who moved
                }
            else:
                # Mirrors: if (!res) return socket.emit("invalidMove", "Invalid move!")
                return None

        except (ValueError, IndexError, Exception):
            # Mirrors the catch block in app.js
            return None

    def load_fen(self, fen: str):
        """Mirrors: chess.load(fen)"""
        self._board.set_fen(fen)

    def get_history(self) -> List[str]:
        return self._history

    def get_last_fen(self) -> Optional[str]:
        """Get the last FEN in history for rollback.
        Mirrors: game.history[game.history.length - 1]
        """
        if self._history:
            return self._history[-1]
        return None

    def is_game_over(self) -> bool:
        """Mirrors: chess.game_over()"""
        return self._board.is_game_over()

    def get_game_status(self) -> dict:
        """Returns the current state of the game: checkmate, draw, win, etc."""
        res = {
            "is_over": self._board.is_game_over(),
            "winner": None,
            "reason": None
        }

        if self._board.is_checkmate():
            res["reason"] = "checkmate"
            res["winner"] = 'w' if self._board.turn == chess.BLACK else 'b'
        elif self._board.is_stalemate():
            res["reason"] = "stalemate"
        elif self._board.is_insufficient_material():
            res["reason"] = "insufficient_material"
        elif self._board.is_fivefold_repetition() or self._board.can_claim_threefold_repetition():
            res["reason"] = "repetition"
        
        return res

    def step_history(self, direction: str) -> Optional[str]:
        """Mirrors original stepHistory handler exactly:
        
        if (typeof game.historyIndex !== "number") {
            game.historyIndex = game.history.length - 1;
        }
        if (direction === "back" && game.historyIndex > 0) {
            game.historyIndex--;
        } else if (direction === "forward" && game.historyIndex < game.history.length - 1) {
            game.historyIndex++;
        }
        const fen = game.history[game.historyIndex];
        if (fen) {
            game.chess.load(fen);
            io.to(roomId).emit("updateBoard", fen);
        }
        """
        # Lazy init — exact copy of original
        if self._history_index is None:
            self._history_index = len(self._history) - 1

        if direction == "back" and self._history_index > 0:
            self._history_index -= 1
        elif direction == "forward" and self._history_index < len(self._history) - 1:
            self._history_index += 1
        else:
            return None

        fen = self._history[self._history_index]
        if fen:
            self._board.set_fen(fen)
            return fen

        return None
