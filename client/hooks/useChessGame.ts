import { useState, useEffect, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import { getSocket } from '@/lib/socket';
import { PlayerRole, RoomState, GameStatus, ChatMessage } from '@/types/game';
import confetti from 'canvas-confetti';

export function useChessGame(roomId: string, playerName: string, session: any, addToast: (msg: string) => void) {
  const socket = getSocket();
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [role, setRole] = useState<PlayerRole>(null);
  const [roomState, setRoomState] = useState<RoomState>({ white: null, black: null, count: 0 });
  const [isConnected, setIsConnected] = useState(false);
  const [gameOver, setGameOver] = useState<GameStatus | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [disconnectTimer, setDisconnectTimer] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ba9eff', '#6366f1', '#ffffff']
    });
  }, []);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const onConnect = () => {
      setIsConnected(true);
      socket.emit('joinRoom', roomId, playerName, session?.user?.id || null);
    };

    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    if (socket.connected) onConnect();

    socket.on('playerRole', (r: string) => setRole(r as PlayerRole));
    socket.on('roomState', (state: RoomState) => {
      setRoomState(state);
      if (state.status?.is_over && !gameOver) setGameOver(state.status);
    });
    socket.on('gameOver', (status: GameStatus) => {
      setGameOver(status);
      setDisconnectTimer(null);
    });
    socket.on('updateBoard', (newFen: string) => setFen(newFen));
    socket.on('invalidMove', (msg: string) => addToast(msg));
    socket.on('chatMessage', (msg: ChatMessage) => setMessages((prev) => [...prev.slice(-49), msg]));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('playerRole');
      socket.off('roomState');
      socket.off('gameOver');
      socket.off('updateBoard');
      socket.off('invalidMove');
      socket.off('chatMessage');
    };
  }, [socket, roomId, playerName, session, gameOver, addToast]);

  useEffect(() => {
    const data = roomState.disconnect_data;
    if (!data || gameOver) {
      setDisconnectTimer(null);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const updateTimer = () => {
      const now = Date.now() / 1000;
      const elapsed = now - data.start_time;
      const remaining = Math.max(0, Math.floor(60 - elapsed));
      setDisconnectTimer(remaining > 0 ? remaining : null);
      if (remaining <= 0 && timerRef.current) clearInterval(timerRef.current);
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [roomState.disconnect_data, gameOver]);

  useEffect(() => {
    const pRole = role === 'w' ? 'w' : 'b';
    if (gameOver && gameOver.winner === pRole) fireConfetti();
  }, [gameOver, role, fireConfetti]);

  const handleMove = useCallback((move: { from: string; to: string; promotion: string }) => {
    if (role === 'spectator' || !role || gameOver) return;
    try {
      const chess = new Chess(fen);
      const result = chess.move(move);
      if (result) {
        setFen(chess.fen());
        socket.emit('makeMove', move);
      }
    } catch (e) {
      addToast('Invalid move');
    }
  }, [socket, role, gameOver, fen, addToast]);

  return {
    fen, role, roomState, isConnected, gameOver, messages, disconnectTimer, handleMove, setGameOver, setFen
  };
}
