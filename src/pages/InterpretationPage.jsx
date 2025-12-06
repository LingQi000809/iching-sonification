import React from "react";
import BreathingOracle from "../components/BreathingOracle";

export default function InterpretationPage() {
  return (
    <div className="relative w-screen h-screen overflow-hidden font-serif text-black">
          <BreathingOracle size={400} opacity={0.5} maskOpacity={0.5} />
    
          <div className="font-serif absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-5 text-2xl text-black text-center z-20">
            Interpretation Page (coming soon)
          </div>
        </div>
  );
}