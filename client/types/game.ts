export type PlayerRole = 'w' | 'b' | 'spectator' | null;

export interface GameStatus {
  is_over: boolean;
  winner: string | null;
  reason: string | null;
}

export interface RoomState {
  white: string | null;
  black: string | null;
  white_elo?: number;
  black_elo?: number;
  count: number;
  status?: GameStatus;
  disconnect_data?: {
    role: string;
    start_time: number;
  } | null;
}

export interface ChatMessage {
  author: string;
  content: string;
  isAuth: boolean;
  isGuest: boolean;
  isSystem: boolean;
}
