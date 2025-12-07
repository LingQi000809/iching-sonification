import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import IntakePage from "./pages/IntakePage";
import CastingPage from "./pages/CastingPage";
import InterpretationPage from "./pages/InterpretationPage";
import "./styles/global.css";
import { IchingProvider } from "./context/IchingContext";

export default function App() {
  return (
    <IchingProvider>
      <Router>
        <Routes>
          {/* Intake stage */}
          <Route path="/" element={<IntakePage />} />
          {/* Placeholder pages for later stages */}
          <Route path="/casting" element={<CastingPage />} />
          <Route path="/interpretation" element={<InterpretationPage />} />
        </Routes>
      </Router>
    </IchingProvider>
  );
}