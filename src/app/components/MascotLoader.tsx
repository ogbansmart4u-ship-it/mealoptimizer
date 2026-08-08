// MascotLoader — compact "Avo is on it" loading indicator for dialogs, popups
// and full-screen loading states. A small bobbing mascot with an optional label.

interface MascotLoaderProps {
  label?: string;
  /** Mascot width/height in pixels. Defaults to 72. */
  size?: number;
  className?: string;
}

export default function MascotLoader({
  label = "Loading...",
  size = 72,
  className = "",
}: MascotLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-8 text-center ${className}`}>
      <style>{`
        @keyframes avoBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      `}</style>
      <img
        src="/assets/mascot.png"
        alt=""
        aria-hidden="true"
        style={{ width: size, height: size, animation: "avoBob 0.8s ease-in-out infinite" }}
        className="object-contain drop-shadow-sm"
      />
      {label && <p className="text-sm text-[#1f7a8c] font-medium">{label}</p>}
    </div>
  );
}
