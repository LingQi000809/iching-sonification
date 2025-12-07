import React, { useState } from "react";

export default function ChatbotIntake({ onFinished }) {
  const [step, setStep] = useState(0);
  const [question, setQuestion] = useState("");
  const [name, setName] = useState("");
  const [fade, setFade] = useState(true);
  const [showError, setShowError] = useState(false);

  const handleNext = () => {
    if (step == 1 && !question) {
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
    console.log({
      question: question,
      name,
    });
    if (onFinished) {
      onFinished(question);
    }
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
      case 1:
        return (
          <>
            What question do you have
            <br />
            to consult with I-Ching?
          </>
        );
      case 2:
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
    const buttonClasses =
      "mt-10 p-3 px-5 rounded-2xl shadow-lg bg-white/30 backdrop-blur text-black hover:bg-white/50 transition duration-300";

    switch (step) {
      case 0:
        return (
          <button onClick={handleNext} className={buttonClasses}>
            Enter
          </button>
        );
      case 1:
        return (
          <div className="flex flex-col items-center w-[600px]">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className={inputClasses}
              placeholder="Type your question"
            />
            <div className={`mt-2 text-red-700 font-semibold ${showError?'opacity-100':'opacity-0'}`}>
              Please enter a question to consult with I-Ching.
            </div>
            <button
              onClick={() => handleNext()}
              className={buttonClasses}
            >
              Next
            </button>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col items-center w-full">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClasses}
              placeholder="Your name"
            />
            <div className={`mt-2 text-red-700 font-semibold opacity-0`}>
              Name is optional.
            </div>
            <button onClick={handleSubmit} className={buttonClasses}>
              Start Casting
            </button>
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
          className="absolute top-6 left-6 p-2 px-4 rounded-xl bg-white/20 backdrop-blur text-black shadow cursor-pointer hover:bg-white/40 transition duration-300 font-serif">
          ← Back
        </button>
      )}

      {/* Bot text */}
      <div
        className={`font-serif absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-10 text-2xl text-black text-center z-20 transition-opacity duration-200 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {renderBotText()}
      </div>

      {/* Input area */}
      <div
        className={`font-serif absolute bottom-10 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 z-20 transition-opacity duration-200 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {renderInput()}
      </div>
    </div>
  );
}
