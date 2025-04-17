import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import NotFound from "./pages/NotFound";
import PatientList from "./pages/PatientList";
import Home from "./pages/Analyze";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";
import Signup from "./pages/signup";
import { ToastProvider } from "./components/ui/use-toast";
import Analyze from "./pages/Analyze";
import Dashboard from "./pages/Dashboard";

const firebaseConfig = {
  apiKey: "AIzaSyBoaTcoAGPoHY_duC9AaZjCiyPk4E8glHY",
  authDomain: "ibm-project-25e26.firebaseapp.com",
  projectId: "ibm-project-25e26",
  storageBucket: "gs://ibm-project-25e26.firebasestorage.app",
  messagingSenderId: "807054638688",
  appId: "1:807054638688:web:7195d7a9e0f4163d1d4d05",
  databaseURL:"https://ibm-project-25e26-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const ProtectedRoute = ({ element }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading...</p>;
  return user ? element : <Navigate to="/" />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
    errorElement: <NotFound />,
  },
  {
    path: "/login",
    element:<Login/>,
  },
  {
    path: "/patients",
    element: <ProtectedRoute element={<PatientList />} />,
  },
  {
    path: "/home",
    element: <ProtectedRoute element={<Home />} />,
  },
  {
    path: "/signup",
    element:<Signup></Signup>
  },
  {
    path:"/analyze",
    element:<Analyze></Analyze>
  },

  {
    path:"/dashboard",
    element:<Dashboard></Dashboard>
  }
]);

createRoot(document.getElementById("root")).render(
  <ToastProvider>
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
  </ToastProvider>
);
