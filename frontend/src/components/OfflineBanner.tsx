import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const isOnline = false;

  if (isOnline) return null;

  return (
    <div className="w-full bg-offline-banner text-surface text-xs text-center py-2">
     <WifiOff size={14} className="inline-block mr-2 opacity-80" color="var(--surface)"/>
      <span>Offline Mode - Changes will sync when connection is restored</span>
    </div>
  );
}
