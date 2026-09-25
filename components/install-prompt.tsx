"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "zugzwang-install-dismissed";

export function InstallPrompt() {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(true);
  const [ios, setIos] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const isStandalone =
      media.matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;

    setStandalone(isStandalone);
    setIos(
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
    );
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (standalone || installed || dismissed) return null;

  async function install() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    setPromptEvent(null);
    if (choice.outcome === "accepted") setInstalled(true);
  }

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  return (
    <div className="flex shrink-0 justify-center px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4">
      <div className="flex w-full max-w-xl flex-col gap-3 rounded-2xl border border-black/10 bg-white p-3 shadow-lg dark:border-white/10 dark:bg-zinc-950 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            Install ZugZwang
          </p>
          <p className="mt-0.5 text-sm leading-5 text-zinc-600 dark:text-zinc-400">
            {ios
              ? "Tap Share, then Add to Home Screen."
              : promptEvent
                ? "Add it to your home screen or desktop and open it like an app."
                : "Use the install icon in the address bar, or your browser menu, to add it to your device."}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full px-4 text-sm font-medium text-zinc-600 transition-colors hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/10 sm:flex-none"
          >
            Not now
          </button>
          {promptEvent ? (
            <button
              type="button"
              onClick={install}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 sm:flex-none"
            >
              Install
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
