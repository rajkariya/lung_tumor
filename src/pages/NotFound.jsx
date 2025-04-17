import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(3);

  useEffect(() => {
    const countdown = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
      navigate("/dashboard");
    }, 3000);

    return () => {
      clearInterval(countdown);
      clearTimeout(redirect);
    };
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center p-6 bg-white rounded-xl shadow-md max-w-md">
        <h1 className="text-5xl font-bold text-red-500 mb-4">404</h1>
        <p className="text-xl font-semibold text-gray-700 mb-2">Page Not Found</p>
        <p className="text-gray-500 mb-6">
          You'll be redirected to the <span className="font-medium text-gray-700">Dashboard</span> in{" "}
          <span className="font-bold text-gray-800">{seconds}</span> second{seconds !== 1 && "s"}...
        </p>
        <Link
          to="/dashboard"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Go to Dashboard Now
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
