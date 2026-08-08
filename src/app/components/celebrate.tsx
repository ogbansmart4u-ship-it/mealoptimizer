import { toast } from "sonner";

// A small mascot-branded success toast for positive moments (meal logged, etc.).
// Keeps celebrations consistent and on-brand without a full-screen overlay.
export function celebrate(message: string, subMessage?: string) {
  toast.custom(
    () => (
      <div className="flex items-center gap-3 bg-white rounded-2xl shadow-lg border border-green-100 p-3 pr-4 w-[320px] max-w-[88vw]">
        <img
          src="/assets/mascot.png"
          alt=""
          aria-hidden="true"
          className="w-11 h-11 object-contain flex-shrink-0 drop-shadow-sm"
        />
        <div className="min-w-0">
          <div className="font-semibold text-gray-800 text-sm">{message}</div>
          {subMessage && <div className="text-xs text-gray-600">{subMessage}</div>}
        </div>
      </div>
    ),
    { duration: 3000 }
  );
}
