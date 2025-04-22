// // import { useState } from "react";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import {
// //   InputOTP,
// //   InputOTPGroup,
// //   InputOTPSlot,
// //   InputOTPSeparator
// // } from "@/components/ui/input-otp"

// // import { Link } from "react-router-dom";

// // const Login = () => {
// //   const [email, setEmail] = useState("");
// //   const [password, setPassword] = useState("");
// //   const [otp, setOtp] = useState("");
// //   const [otpSent, setOtpSent] = useState(false);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState("");

// //   const handleLogin = async (e) => {
// //     e.preventDefault();
// //     setError("");

// //     if (password !== "admin") {
// //       setError("Invalid password. Please try again.");
// //       return;
// //     }

// //     try {
// //       setLoading(true);
// //       const response = await fetch("http://localhost:3000/send-otp", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify({ email,password }),
// //       });

// //       const data = await response.json();

// //       if (data.success) {
// //         setOtpSent(true);
// //       } else {
// //         setError("Failed to send OTP. Please try again.");
// //       }
// //     } catch (error) {
// //       console.error("Error:", error);
// //       setError("Failed to connect to the server.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleVerifyOTP = async (e) => {
// //     e.preventDefault();
// //     setError("");

// //     try {
// //       const response = await fetch("http://localhost:3000/verify-otp", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify({ email, otp }),
// //       });

// //       const data = await response.json();

// //       if (data.success) {
// //         window.location.href = "/home";
// //       } else {
// //         setError("Invalid OTP. Please try again.");
// //       }
// //     } catch (error) {
// //       console.error("Error:", error);
// //       setError("Failed to connect to the server.");
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen flex flex-col">
// //       <main className="flex-grow flex flex-col md:flex-row">
// //         {/* Left side - Login Form */}
// //         <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
// //           <div className="w-full max-w-md space-y-8">
// //             <div className="text-center">
// //               <h2 className="mt-6 text-3xl font-bold text-gray-900">
// //                 Welcome Back
// //               </h2>
// //               <p className="mt-2 text-sm text-gray-600">
// //                 Please sign in to your account
// //               </p>
// //             </div>

// //             {otpSent ? (
// //               <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
// //                 <div className="space-y-4 rounded-md">
// //                   <div>
// //                     <Label htmlFor="otp">Enter OTP</Label>
// //                     <InputOTP 
// //                       maxLength={6}
// //                       required
// //                       value={otp}
// //                       onChange={setOtp}
// //                       pattern={"^[0-9]*$"}
// //                     >
// //                       <InputOTPGroup>
// //                         <InputOTPSlot index={0} />
// //                         <InputOTPSlot index={1} />
// //                         <InputOTPSlot index={2} />
// //                       </InputOTPGroup>
// //                         <InputOTPSeparator />
// //                         <InputOTPGroup>
// //                         <InputOTPSlot index={3} />
// //                         <InputOTPSlot index={4} />
// //                         <InputOTPSlot index={5} />
// //                       </InputOTPGroup>
// //                       </InputOTP>
// //                   </div>
// //                 </div>
// //                 {error && <p className="text-red-500">{error}</p>}
// //                 <Button type="submit" className="w-full">
// //                   Verify OTP
// //                 </Button>
// //               </form>
// //             ) : (
// //               <form className="mt-8 space-y-6" onSubmit={handleLogin}>
// //                 <div className="space-y-4 rounded-md shadow-sm">
// //                   <div>
// //                     <Label htmlFor="email">Email address</Label>
// //                     <Input
// //                       id="email"
// //                       name="email"
// //                       type="email"
// //                       autoComplete="email"
// //                       required
// //                       className="mt-1"
// //                       placeholder="doctor@example.com"
// //                       value={email}
// //                       onChange={(e) => setEmail(e.target.value)}
// //                     />
// //                   </div>
// //                   <div>
// //                     <Label htmlFor="password">Password</Label>
// //                     <Input
// //                       id="password"
// //                       name="password"
// //                       type="password"
// //                       autoComplete="current-password"
// //                       required
// //                       className="mt-1"
// //                       placeholder="••••••••"
// //                       value={password}
// //                       onChange={(e) => setPassword(e.target.value)}
// //                     />
// //                   </div>
// //                 </div>

// //                 {error && <p className="text-red-500">{error}</p>}

// //                 <Button type="submit" className="w-full" disabled={loading}>
// //                   {loading ? "Sending OTP..." : "Send OTP"}
// //                 </Button>
// //               </form>
// //             )}
// //           </div>
// //         </div>

// //         {/* Right side - Website Title and Logo */}
// //         <div className="w-full md:w-1/2 bg-gray-100 flex flex-col items-center justify-center p-8">
// //           <h1 className="text-4xl md:text-6xl font-bold text-center text-gray-800 mb-8 leading-tight">
// //             Lung Tumor Detection
// //           </h1>
// //           <p className="text-xl md:text-2xl text-center text-gray-600 max-w-md leading-relaxed">
// //             Advanced AI-powered platform for early and accurate lung tumor
// //             diagnosis
// //           </p>
// //         </div>
// //       </main>
// //     </div>
// //   );
// // };

// // export default Login;

import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();
  const NODE_API_URL = import.meta.env.VITE_API_URL ;
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      const response = await fetch(`${NODE_API_URL}/send-otp`, {
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
      setError("Invalid email or password. Please try again.");
      console.error("Login Error:", error);
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

      if (data.success) {
        navigate("/dashboard");
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to connect to the server.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex flex-col md:flex-row">
        {/* Left side - Login Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome Back</h2>
              <p className="mt-2 text-sm text-gray-600">Please sign in to your account</p>
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
                <Button type="submit" className="w-full">Verify OTP</Button>
              </form>
            ) : (
              <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                <div className="space-y-4 rounded-md shadow-sm">
                  <div>
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
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
                      autoComplete="current-password"
                      required
                      className="mt-1"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                {error && <p className="text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            )}
          </div>
        </div>
        {/* Right side - Website Title and Logo */}
        <div className="w-full md:w-1/2 bg-gray-100 flex flex-col items-center justify-center p-8">
          <h1 className="text-4xl md:text-6xl font-bold text-center text-gray-800 mb-8 leading-tight">
            Lung Tumor Detection
          </h1>
          <p className="text-xl md:text-2xl text-center text-gray-600 max-w-md leading-relaxed">
            Advanced AI-powered platform for early and accurate lung tumor diagnosis
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Link, useNavigate } from "react-router-dom";

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState("");
//   const [otpSent, setOtpSent] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [resendCooldown, setResendCooldown] = useState(0);
//   const navigate = useNavigate();

//   const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

//   const handleSendOTP = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       const response = await fetch(`${API_URL}/send-otp`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email }),
//       });

//       const data = await response.json();
//       if (data.success) {
//         setOtpSent(true);
//         setResendCooldown(30); // 30-second cooldown for resend
//         const countdown = setInterval(() => {
//           setResendCooldown((prev) => {
//             if (prev <= 1) {
//               clearInterval(countdown);
//               return 0;
//             }
//             return prev - 1;
//           });
//         }, 1000);
//       } else {
//         setError(data.errors ? data.errors[0].msg : "Failed to send OTP. Please try again.");
//       }
//     } catch (error) {
//       setError("Failed to connect to the server. Please try again.");
//       console.error("Send OTP Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerifyOTP = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       const response = await fetch(`${API_URL}/verify-otp`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email, otp }),
//       });

//       const data = await response.json();
//       if (data.success) {
//         navigate("/dashboard");
//       } else {
//         setError(data.error || "Invalid OTP. Please try again.");
//       }
//     } catch (error) {
//       setError("Failed to connect to the server. Please try again.");
//       console.error("Verify OTP Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResendOTP = async () => {
//     if (resendCooldown > 0) return;
//     await handleSendOTP({ preventDefault: () => {} });
//   };

//   return (
//     <div className="min-h-screen flex flex-col">
//       <main className="flex-grow flex flex-col md:flex-row">
//         {/* Left side - Login Form */}
//         <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
//           <div className="w-full max-w-md space-y-8">
//             <div className="text-center">
//               <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome Back</h2>
//               <p className="mt-2 text-sm text-gray-600">Please sign in to your account</p>
//             </div>
//             {otpSent ? (
//               <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
//                 <div className="space-y-4 rounded-md">
//                   <div>
//                     <Label htmlFor="otp">Enter OTP</Label>
//                     <Input
//                       id="otp"
//                       name="otp"
//                       type="text"
//                       required
//                       maxLength={6}
//                       className="mt-1"
//                       placeholder="Enter 6-digit OTP"
//                       value={otp}
//                       onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
//                     />
//                   </div>
//                 </div>
//                 {error && <p className="text-red-500 text-sm">{error}</p>}
//                 <Button type="submit" className="w-full" disabled={loading}>
//                   {loading ? "Verifying..." : "Verify OTP"}
//                 </Button>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   className="w-full mt-2"
//                   onClick={handleResendOTP}
//                   disabled={resendCooldown > 0 || loading}
//                 >
//                   {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
//                 </Button>
//               </form>
//             ) : (
//               <form className="mt-8 space-y-6" onSubmit={handleSendOTP}>
//                 <div className="space-y-4 rounded-md shadow-sm">
//                   <div>
//                     <Label htmlFor="email">Email address</Label>
//                     <Input
//                       id="email"
//                       name="email"
//                       type="email"
//                       autoComplete="email"
//                       required
//                       className="mt-1"
//                       placeholder="doctor@example.com"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                     />
//                   </div>
//                 </div>
//                 {error && <p className="text-red-500 text-sm">{error}</p>}
//                 <Button type="submit" className="w-full" disabled={loading}>
//                   {loading ? "Sending OTP..." : "Send OTP"}
//                 </Button>
//               </form>
//             )}
//             <div className="text-center">
//               <p className="mt-2 text-sm text-gray-600">
//                 Don't have an account?{" "}
//                 <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
//                   Sign up
//                 </Link>
//               </p>
//             </div>
//           </div>
//         </div>
//         {/* Right side - Website Title and Logo */}
//         <div className="w-full md:w-1/2 bg-gray-100 flex flex-col items-center justify-center p-8">
//           <h1 className="text-4xl md:text-6xl font-bold text-center text-gray-800 mb-8 leading-tight">
//             Lung Tumor Detection
//           </h1>
//           <p className="text-xl md:text-2xl text-center text-gray-600 max-w-md leading-relaxed">
//             Advanced AI-powered platform for early and accurate lung tumor diagnosis
//           </p>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Login;