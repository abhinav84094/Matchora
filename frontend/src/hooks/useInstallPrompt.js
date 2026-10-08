
import { useSyncExternalStore } from "react";

// Shared across every InstallButton instance.
let deferredPrompt = null;
let isInstalled = false;
let isPrompting = false;

const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return Boolean(deferredPrompt) && !isInstalled && !isPrompting;
}

function getServerSnapshot() {
  return false;
}

function handleBeforeInstallPrompt(event) {
  event.preventDefault();

  if (isInstalled) return;

  deferredPrompt = event;
  notify();
}

function handleAppInstalled() {
  isInstalled = true;
  deferredPrompt = null;
  notify();
}

// Register once, when this module is first imported.
if (typeof window !== "undefined") {
  isInstalled =
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true;

  window.addEventListener(
    "beforeinstallprompt",
    handleBeforeInstallPrompt
  );

  window.addEventListener("appinstalled", handleAppInstalled);
}

async function promptInstall() {
  if (!deferredPrompt || isInstalled || isPrompting) {
    return;
  }

  const event = deferredPrompt;

  // The event can only be used once.
  deferredPrompt = null;
  isPrompting = true;
  notify();

  try {
    await event.prompt();
    const choice = await event.userChoice;

    if (choice?.outcome === "accepted") {
      // appinstalled will confirm installation.
      // Do not mark installed merely because the prompt was accepted.
    }

    return choice;
  } catch (error) {
    console.error("PWA installation prompt failed:", error);
  } finally {
    isPrompting = false;
    notify();
  }
}

export function useInstallPrompt() {
  const canInstall = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return {
    canInstall,
    promptInstall,
  };
}
