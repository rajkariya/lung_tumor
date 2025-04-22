import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();
  const NODE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/";

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Invalid email format");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${NODE_API_URL}/send-signup-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.success) {
        setOtpSent(true);
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError("Could not send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${NODE_API_URL}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
    console.log(data);
      if (data.success) {
        await createUserWithEmailAndPassword(auth, email, password);
        navigate("/");
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Signup Error:", error);
      setError("Failed to create account. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-bold text-gray-900">Create an Account</h2>
              <p className="mt-2 text-sm text-gray-600">Sign up to get started</p>
            </div>
            {otpSent ? (
              <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
                <div className="space-y-4 rounded-md">
                  <div>
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      name="otp"
                      type="text"
                      required
                      className="mt-1"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                </div>
                {error && <p className="text-red-500">{error}</p>}
                <Button type="submit" className="w-full">Verify OTP & Sign Up</Button>
              </form>
            ) : (
              <form className="mt-8 space-y-6" onSubmit={handleSignup}>
                <div className="space-y-4 rounded-md shadow-sm">
                  <div>
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="mt-1"
                      placeholder="doctor@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="mt-1"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      required
                      className="mt-1"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
                {error && <p className="text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending OTP..." : "Sign Up"}
                </Button>
              </form>
            )}
          </div>
        </div>
        <div className="w-full md:w-1/2 bg-gray-100 flex flex-col items-center justify-center p-8">
          <h1 className="text-4xl md:text-6xl font-bold text-center text-gray-800 mb-8 leading-tight">
            Join Lung Tumor Detection
          </h1>
          <p className="text-xl md:text-2xl text-center text-gray-600 max-w-md leading-relaxed">
            AI-powered platform for accurate lung tumor diagnosis
          </p>
        </div>
      </main>
    </div>
  );
};

export default Signup;
