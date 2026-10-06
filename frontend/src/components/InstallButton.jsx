import { Download } from "lucide-react";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

export default function InstallButton() {
  const { canInstall, promptInstall } = useInstallPrompt();

  if (!canInstall) return null; // hides itself if not installable (already installed, iOS, etc.)

  return (
    <button
      onClick={promptInstall}
      aria-label="Install Matchora app"
      className="flex items-center gap-2 text-s font-medium text-violet-600 border border-violet-200 rounded-full px-2.5 py-1 hover:bg-violet-50 focus-ring"
    >
      <Download size={12} />
      Install App
    </button>
  );
}