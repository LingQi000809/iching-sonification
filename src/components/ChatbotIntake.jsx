import React, { useState } from "react";

export default function ChatbotIntake({ onFinished }) {
  const [step, setStep] = useState(0);
  const [question, setQuestion] = useState("");
  const [name, setName] = useState("");
  const [fade, setFade] = useState(true);
  const [showError, setShowError] = useState(false);

  const handleNext = () => {
    if (step == 2 && !question) {
      setShowError(true);
      return;
    }
    setShowError(false);
    fadeTransition(() => setStep((prev) => prev + 1));
  };

  const fadeTransition = (update) => {
    setFade(false);
    setTimeout(() => {
      update();
      setFade(true);
    }, 300);
  };

  const handleBack = () => {
    if (step === 0) return;
    fadeTransition(() => setStep((prev) => prev - 1));
  };

  const handleSubmit = () => {
    if (onFinished) onFinished(question);
  };

  const renderBotText = () => {
    switch (step) {
      case 0:
        return (
          <>
            Welcome to
            <br />
            the I-Ching sonification oracle.
          </>
        );
      case 2:
        return (
          <>
            What question do you have
            <br />
            to consult with I-Ching?
          </>
        );
      case 3:
        return (
          <>
            What is your name?
            <br />
            (Optional)
          </>
        );
      default:
        return "";
    }
  };

  const renderInput = () => {
    const inputClasses =
      "w-full p-3 rounded-2xl bg-white/20 backdrop-blur text-black shadow-inner border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-300";

    // 🔥 ORIGINAL button style restored
    const buttonClasses =
      "mt-10 p-3 px-5 rounded-2xl shadow-lg border-white/60 bg-black/40 text-white backdrop-blur hover:bg-black/70 transition cursor-pointer duration-300";

    switch (step) {
      case 0:
        return <button onClick={handleNext} className={buttonClasses}>Enter</button>;
      case 1:
        return <button onClick={handleNext} className={buttonClasses}>Next</button>;
      case 2:
        return (
          <div className="flex flex-col items-center w-[600px]">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className={inputClasses}
              placeholder="Type your question"
            />
            <div className={`mt-2 text-red-700 font-semibold ${showError ? "opacity-100" : "opacity-0"}`}>
              Please enter a question to consult with I-Ching.
            </div>
            <button onClick={handleNext} className={buttonClasses}>Next</button>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col items-center w-full">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClasses}
              placeholder="Your name"
            />
            <button onClick={handleSubmit} className={buttonClasses}>Start Casting</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col justify-between items-center h-screen w-screen relative">

      {/* Back Button */}
      {step > 0 && (
        <button
          onClick={handleBack}
          className="absolute top-6 left-6 p-2 px-4 rounded-xl border-white/60 bg-black/40 text-white backdrop-blur hover:bg-black/70 transition duration-300 font-serif text-sm"
        >
          ← Back
        </button>
      )}

      {/* INTRO PAGE (Step 1) — Restored original box style + scrollable */}
      {step === 1 && (
        <div
          className={`
            font-serif absolute top-1/2 left-1/2 max-w-4xl w-[90vw] max-h-[70vh]
            transform -translate-x-1/2 -translate-y-1/2
            backdrop-blur-md bg-amber-50/90 border border-amber-200/80
            p-8 rounded-2xl shadow-xl text-left
            overflow-y-auto transition-opacity duration-200
            ${fade ? "opacity-100" : "opacity-0"}
          `}
        >
          {/* Header */}
          <div className="mb-4 text-center">
            <div className="text-xs tracking-[0.2em] text-amber-700/80 uppercase">
              I-Ching · 易經
            </div>
            <h2 className="mt-2 text-l font-semibold text-amber-900">
              Introduction to the Oracle / 占辞引
            </h2>
          </div>

          {/* Restored typography and amber palette */}
          <div className="space-y-5 text-[15px] leading-relaxed text-amber-900/90">
            <p>
              We invite you into an immersive divination experience, where you
              are free and safe to consult the I-Ching / 易经 (Book of Changes). You
              are welcome to ask questions that hold deep personal fear, quiet
              uncertainty, or something as simple as what to have for lunch.
              Your reading will follow Wen Wang Fa / 文王法, a traditional coin-toss
              method. Both the casting process and the resulting interpretation
              will be sonified through generative music.
            </p>

            <p>
              The I-Ching, one of the Five Classics of Chinese philosophy / 五经,
              has guided reflection and decision-making for thousands of years.
              It has also inspired computer-music pioneers such as John Cage,
              whose chance-operation compositions were driven by I-Ching coin
              tosses mapped to musical parameters. As Cage once said: “If I ask
              the I Ching a question as though it were a book of wisdom, I say,
              ‘What do you have to say about this?’ and then I listen.” Yet his
              approach emphasized randomness rather than the interpretive depth
              the I-Ching itself provides.
            </p>

            <p>
              Our sonification seeks to honor both chance and meaning. During
              the casting phase, we follow the I-Ching principle that no single
              line should be interpreted until all six lines have formed. Hence,
              the accompanying sound is generated purely from randomized musical
              events drawn from a predefined space. Once the final hexagram
              emerges, we interpret it using the 64-Hexagram Chart, integrate it
              with your question, and generate musical guidance. Gemini produces
              an interpretation grounded in the text of the I-Ching, which is
              then transformed into musical parameters, including mood, genre,
              instrumentation, for real-time composition using the Lyria model.
            </p>

            <p>
              In the next pages, we will guide you step-by-step through how Wen
              Wang Fa / 文王法 works and how your hexagram unfolds.
            </p>
          </div>
        </div>
      )}

      {/* OTHER STEPS: Centered short text */}
      {step !== 1 && (
        <div
          className={`
            font-serif absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-10
            text-2xl text-black text-center transition-opacity duration-200
            ${fade ? "opacity-100" : "opacity-0"}
          `}
        >
          {renderBotText()}
        </div>
      )}

      {/* INPUT AREA */}
      <div
        className={`
          font-serif absolute bottom-10 left-1/2 transform -translate-x-1/2
          transition-opacity duration-200
          ${fade ? "opacity-100" : "opacity-0"}
        `}
      >
        {renderInput()}
      </div>
    </div>
  );
}
