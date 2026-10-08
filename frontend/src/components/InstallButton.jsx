
import { Download } from "lucide-react";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

export default function InstallButton() {
  const { canInstall, promptInstall } = useInstallPrompt();

  if (!canInstall) return null;

  return (
    <button
      type="button"
      onClick={promptInstall}
      aria-label="Install Matchora app"
      className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-200 px-3 py-2 text-sm font-medium text-violet-600 transition-colors hover:bg-violet-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
    >
      <Download size={15} />
      Install App
    </button>
  );
}
