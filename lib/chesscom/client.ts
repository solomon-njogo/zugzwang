/**
 * client for the chess.com API
 * @returns the client for the chess.com API
 */

import axios from "axios";
import { BASE_URL, USER_URL, GAMES_ARCHIVE_URL } from "./urls";
import type { Game, GamesMonth, User } from "./types";

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    "User-Agent": "Zugzwang/0.1 (local prototype)",
  },
});

export const getUser = async (): Promise<User> => {
  const response = await client.get<User>(USER_URL);
  return response.data;
};

export const getGames = async (): Promise<GamesMonth> => {
  const archives = await client.get<{ archives: string[] }>(GAMES_ARCHIVE_URL);
  const archiveUrl = archives.data.archives.at(-1);

  if (!archiveUrl) {
    return { archiveUrl: "", games: [] };
  }

  const response = await client.get<{ games: Game[] }>(archiveUrl);
  const games = [...response.data.games].sort((a, b) => b.end_time - a.end_time);

  return { archiveUrl, games };
};
