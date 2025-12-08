export default function TooltipButton({ text }) {
  return (
    <div className="absolute top-4 right-4 z-50 group">
      {/* The button */}
      <div
        className="w-8 h-8 flex items-center justify-center
        backdrop-blur-md shadow-md 
        z-50 px-4 py-2 rounded-full border border-white/60 bg-black/40 text-white text-xl font-semibold font-serif
        hover:bg-black/70 transition cursor-pointer"
      >
        ?
      </div>

      {/* The tooltip */}
      <div
        className="absolute right-0 mt-2 w-[500px]
        opacity-0 group-hover:opacity-100
        pointer-events-none 
        transition-opacity duration-300
        bg-white/70 backdrop-blur-md shadow-2xl drop-shadow-2xl rounded-xl 
        p-4 text-sm leading-relaxed text-black/80 font-serif"
      >
        {text}
      </div>
    </div>
  );
}