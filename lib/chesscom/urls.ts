/**
 * urls for the chess.com API
 * @returns the urls for the chess.com API
*/

import { settings } from "../store/settings";

// base url for the chess.com API
const BASE_URL = "https://api.chess.com/pub";

// url for the user endpoint
const USER_URL = `${BASE_URL}/player/${settings.username}`;

// url for the games endpoint
const GAMES_URL = `${BASE_URL}/player/${settings.username}/games`;

// url for the games archive endpoint
const GAMES_ARCHIVE_URL = `${BASE_URL}/player/${settings.username}/games/archives`;

export { BASE_URL, USER_URL, GAMES_URL, GAMES_ARCHIVE_URL };