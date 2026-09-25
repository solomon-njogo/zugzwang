interface User {
  "@id": string;
  player_id: number;
  url: string;
  name?: string;
  username: string;
  followers: number;
  country: string;
  last_online: number;
  joined: number;
  status: string;
  is_streamer: boolean;
  verified: boolean;
  league?: string;
  avatar?: string;
}

interface GamePlayer {
  rating: number;
  result: string;
  "@id": string;
  username: string;
  uuid: string;
}

interface Game {
  url: string;
  time_control: string;
  end_time: number;
  rated: boolean;
  uuid: string;
  fen: string;
  time_class: string;
  rules: string;
  white: GamePlayer;
  black: GamePlayer;
  eco?: string;
}

interface GamesMonth {
  archiveUrl: string;
  games: Game[];
}

export type { User, Game, GamePlayer, GamesMonth };
