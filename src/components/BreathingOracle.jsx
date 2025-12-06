import React, { useRef, useEffect, useState } from "react";

// Helper functions
function lerpColor(a, b, t) {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t
  };
}

function rgbToCss(c) {
  return `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;
}

function randomColor() {
  return {
    r: 200 + Math.random() * 55,
    g: 180 + Math.random() * 75,
    b: 150 + Math.random() * 105
  };
}

/**
 * BreathingOracle
 * Props:
 *   - size: size of the oracle circle
 *   - opacity: opacity of the gradient circle
 *   - maskOpacity: opacity of the white mask overlay
 *   - className: additional classes to pass
 */
export default function BreathingOracle({ size = 300, opacity = 0.5, maskOpacity = 0.5, className = "" }) {
  const color1 = useRef(randomColor());
  const color2 = useRef(randomColor());
  const targetColor1 = useRef(randomColor());
  const targetColor2 = useRef(randomColor());

  const [, setTick] = useState(0); // triggers re-render

  useEffect(() => {
    let lastTime = performance.now();

    function animate(time) {
      const delta = time - lastTime;
      lastTime = time;
      const t = Math.min(delta / 5000, 1);

      color1.current = lerpColor(color1.current, targetColor1.current, t);
      color2.current = lerpColor(color2.current, targetColor2.current, t);

      setTick(tick => tick + 1);

      if (Math.abs(color1.current.r - targetColor1.current.r) < 1) targetColor1.current = randomColor();
      if (Math.abs(color2.current.r - targetColor2.current.r) < 1) targetColor2.current = randomColor();

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, []);

  const gradientStyle = {
    background: `linear-gradient(135deg, ${rgbToCss(color1.current)}, ${rgbToCss(color2.current)})`,
    width: size,
    height: size,
    borderRadius: "100%",
    transition: "background 1s linear",
    opacity,
    filter: "blur(7px)", // <-- increase the number to make edges softer
  };

  return (
    <div className={`absolute inset-0 flex items-center justify-center z-0 ${className}`}>
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-50 via-amber-100 to-red-100"></div>

      {/* Gradient Oracle */}
      <div style={gradientStyle} className="animate-breathe-scale"></div>
      
      {/* Chinese Ink Painting Decorations */}
      <div className="absolute -bottom-10 -left-20 z-10 opacity-35">
        <img src="public/transparent-ink2.png" alt="Decoration1" className="object-contain" />
      </div>
      <div className="absolute top-0 right-0 z-10 opacity-10 transform scale-x-[-1]">
        <img src="public/transparent-ink1.png" alt="Decoration1" className="object-contain" />
      </div>

      {/* Fullscreen white mask */}
      <div className={`absolute inset-0 bg-white`} style={{ opacity: maskOpacity, backdropFilter: "blur(4px)" }}></div>
    </div>
  );
}
