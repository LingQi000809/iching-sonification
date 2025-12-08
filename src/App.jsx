import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import IntakePage from "./pages/IntakePage";
import CastingPage from "./pages/CastingPage";
import InterpretationPage from "./pages/InterpretationPage";
import "./styles/global.css";
import { IchingProvider } from "./context/IchingContext";
import CastingSoundEngine from "./components/CastingSoundEngine";

export default function App() {
  return (
    <IchingProvider>
      {/* Global casting sound engine: stays mounted across all routes */}
      <CastingSoundEngine />

      <Router>
        <Routes>
          {/* Intake stage */}
          <Route path="/" element={<IntakePage />} />
          {/* Casting stage */}
          <Route path="/casting" element={<CastingPage />} />
          {/* Interpretation / Lyria stage */}
          <Route path="/interpretation" element={<InterpretationPage />} />
        </Routes>
      </Router>
    </IchingProvider>
  );
}
