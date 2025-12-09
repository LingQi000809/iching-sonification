export default function TooltipButton({ text }) {
  return (
    <div className="absolute top-4 right-4 z-50 group">
      {/* Small floating button */}
      <div
        className="w-8 h-8 flex items-center justify-center
        backdrop-blur-md shadow-md 
        rounded-full border border-white/60 bg-black/40 text-white text-xl font-semibold font-serif
        hover:bg-black/70 transition cursor-pointer"
      >
        ?
      </div>

      {/* Fullscreen overlay */}
      <div
        className="
          fixed inset-0
          bg-black/40 backdrop-blur-sm
          opacity-0 group-hover:opacity-100 
          pointer-events-none group-hover:pointer-events-auto
          transition-opacity duration-300
          flex items-center justify-center
          z-40
        "
      >
        {/* Tooltip content window */}
        <div
          className="
            w-[95vw] h-[90vh]
            bg-white/90 backdrop-blur-md
            rounded-2xl shadow-2xl border border-white/40
            overflow-auto p-6
          "
        >
          {text}
        </div>
      </div>
    </div>
  );
}
