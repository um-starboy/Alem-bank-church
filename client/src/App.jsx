import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeDashboard from "./pages/HomeDashboard";
import Ministries from "./pages/Ministries";
import Events from "./pages/Events";
import Profile from "./pages/Profile";
import LogoutButton from "./components/LogoutButton";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
        <nav className="flex justify-between items-center px-6 py-4 border-b border-slate-700 bg-black/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center text-3xl">
              🙏
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Alem Bank Church</h1>
              <p className="text-xs text-slate-500 -mt-1">አለም ባንክ ገነት ቤተ ክርስቲያን</p>
            </div>
          </div>
          <LogoutButton />
        </nav>

        <Routes>
          <Route path="/" element={<HomeDashboard />} />
          <Route path="/ministries" element={<Ministries />} />
          <Route path="/events" element={<Events />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
