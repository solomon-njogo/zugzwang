import { getGames, getUser } from "@/lib/chesscom/client";
import type { Game, User } from "@/lib/chesscom/types";
import { settings } from "@/lib/store/settings";

export const dynamic = "force-dynamic";

const DRAW_RESULTS = new Set([
  "agreed",
  "repetition",
  "stalemate",
  "insufficient",
  "50move",
  "timevsinsufficient",
]);

export default async function Home() {
  try {
    const [user, month] = await Promise.all([getUser(), getGames()]);
    return <Prototype user={user} games={month.games} archiveUrl={month.archiveUrl} />;
  } catch {
    return (
      <main className="min-h-full bg-[#16130f] px-4 py-10 font-sans text-[#f4efe6]">
        <p className="mx-auto max-w-3xl text-sm text-[#e7c07a]">
          Couldn&apos;t load Chess.com data for {settings.username}.
        </p>
      </main>
    );
  }
}

function Prototype({
  user,
  games,
  archiveUrl,
}: {
  user: User;
  games: Game[];
  archiveUrl: string;
}) {
  const record = games.reduce(
    (totals, game) => {
      totals[outcome(owner(game).result)] += 1;
      return totals;
    },
    { win: 0, loss: 0, draw: 0 },
  );

  return (
    <main className="min-h-full bg-[#16130f] px-4 py-6 font-sans text-[#f4efe6] sm:px-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="flex flex-col gap-1">
          <p className="text-xs tracking-[0.18em] text-[#a89880] uppercase">Zugzwang</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {user.name || user.username}
          </h1>
        </header>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
          <div className="flex items-start gap-4">
            <Avatar user={user} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={user.url}
                  className="truncate text-lg font-medium underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
                >
                  @{user.username}
                </a>
                {user.league ? (
                  <span className="rounded-full bg-[#e7c07a]/15 px-2 py-0.5 text-xs text-[#e7c07a]">
                    {user.league}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-[#cbbba6]">
                {countryCode(user.country)} · {user.followers} followers · joined{" "}
                {formatDate(user.joined)}
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-medium">{monthLabel(archiveUrl)}</h2>
              <p className="text-sm text-[#cbbba6]">
                {games.length} games · {record.win}W {record.loss}L {record.draw}D
              </p>
            </div>
          </div>

          {games.length === 0 ? (
            <p className="rounded-2xl border border-white/10 px-4 py-8 text-sm text-[#cbbba6]">
              No games in the latest archive month.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {games.map((game) => (
                <GameRow key={game.uuid} game={game} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function Avatar({ user }: { user: User }) {
  const letter = (user.name || user.username).slice(0, 1).toUpperCase();

  if (user.avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatar}
        alt=""
        className="size-14 shrink-0 rounded-full object-cover sm:size-16"
      />
    );
  }

  return (
    <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#e7c07a] text-xl font-semibold text-[#16130f] sm:size-16">
      {letter}
    </div>
  );
}

function GameRow({ game }: { game: Game }) {
  const me = owner(game);
  const them = me.username.toLowerCase() === game.white.username.toLowerCase() ? game.black : game.white;
  const result = outcome(me.result);
  const playedWhite = me.username.toLowerCase() === game.white.username.toLowerCase();

  return (
    <li>
      <a
        href={game.url}
        className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 transition-colors hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none sm:flex-row sm:items-center sm:gap-4 sm:px-4"
      >
        <span
          className={`w-14 shrink-0 text-sm font-semibold uppercase ${
            result === "win"
              ? "text-emerald-300"
              : result === "draw"
                ? "text-amber-200"
                : "text-rose-300"
          }`}
        >
          {result}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">
            <span
              className={`mr-2 inline-block size-2.5 rounded-sm align-middle ring-1 ring-[#f4efe6]/70 ${
                playedWhite ? "bg-[#f4efe6]" : "bg-[#16130f]"
              }`}
              aria-hidden
            />
            {playedWhite ? "White" : "Black"} vs {them.username}
          </p>
          <p className="truncate text-sm text-[#cbbba6]">{openingName(game.eco)}</p>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm text-[#cbbba6] sm:block sm:text-right">
          <p>
            {me.rating}–{them.rating} · {game.time_class} · {formatTimeControl(game.time_control)}
          </p>
          <p>{formatDate(game.end_time, true)}</p>
        </div>
      </a>
    </li>
  );
}

function owner(game: Game) {
  const username = settings.username.toLowerCase();
  return game.white.username.toLowerCase() === username ? game.white : game.black;
}

function outcome(result: string): "win" | "draw" | "loss" {
  if (result === "win") return "win";
  if (DRAW_RESULTS.has(result)) return "draw";
  return "loss";
}

function countryCode(url: string) {
  return url.split("/").pop() ?? "";
}

function openingName(eco?: string) {
  if (!eco) return "Opening unknown";
  const slug = decodeURIComponent(eco.split("/").pop() ?? "");
  return slug.replace(/-/g, " ");
}

function formatTimeControl(timeControl: string) {
  if (timeControl.includes("/")) return "daily";
  const [base, increment] = timeControl.split("+");
  const seconds = Number(base);
  if (!Number.isFinite(seconds)) return timeControl;
  const label = seconds % 60 === 0 ? `${seconds / 60} min` : `${seconds}s`;
  return increment ? `${label} + ${increment}` : label;
}

function monthLabel(archiveUrl: string) {
  const match = archiveUrl.match(/(\d{4})\/(\d{2})$/);
  if (!match) return "Recent games";
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(
    new Date(Number(match[1]), Number(match[2]) - 1, 1),
  );
}

function formatDate(unix: number, withTime = false) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(new Date(unix * 1000));
}
