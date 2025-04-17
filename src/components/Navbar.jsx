import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { getAuth, signOut } from "firebase/auth";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const linkClass = (path) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      location.pathname === path
        ? "bg-gray-100 text-gray-900"
        : "text-gray-500 hover:text-gray-900"
    }`;

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-800">
            Lung Tumor Detection
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className={linkClass("/dashboard")}>
              Home
            </Link>
            <Link to="/patients" className={linkClass("/patients")}>
              Patients
            </Link>
            <Link to="/analyze" className={linkClass("/analyze")}>
              Analyze
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-800 transition"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
