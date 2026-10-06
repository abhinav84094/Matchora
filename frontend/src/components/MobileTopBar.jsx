import { Menu } from "lucide-react";
import InstallButton from "./InstallButton.jsx";

export default function MobileTopBar({ onOpenMenu }) {
  return (
    <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 bg-white border-b border-neutral-100 px-4 py-3">
      <button
        onClick={onOpenMenu}
        aria-label="Open menu"
        className="text-neutral-500 hover:text-neutral-700 focus-ring rounded-lg p-1.5 -ml-1.5"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">M</span>
        </div>
        <span className="font-semibold text-sm">Matchora</span>
        <div>
          <InstallButton />
        </div>
      </div>
    </header>
  );
}
