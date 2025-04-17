import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Patients from "./pages/Patients";
import Analyze from "./pages/Analyze";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/analyze" element={<Analyze/>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
} 