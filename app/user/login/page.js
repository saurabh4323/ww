"use client";
import { useState, useEffect } from "react";
import axios from "axios";
// Navbar Component
function Navbar() {
  const [currentTime, setCurrentTime] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Navigation items array
  const navItems = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Profile", href: "/profile" },
    { name: "Register", href: "/register" },
  ];

  // Update current time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    };

    updateTime(); // Initial call
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 shadow-2xl border-b-4 border-orange-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo/Brand */}
          <div className="flex-shrink-0 flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-white rounded-full flex items-center justify-center mr-3 shadow-lg border-2 border-green-600">
              <span className="text-lg font-bold text-green-800">⭐</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wider">
                SENADRIVE
              </h1>
              <p className="text-orange-300 text-xs font-medium">
                Indian Army Portal
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  className="text-white hover:text-orange-300 hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-white/20"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Current Time & User Info - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-sm text-white/80 font-mono bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20">
              <span className="text-green-400 mr-2">🕐</span>
              {currentTime}
            </div>
            <div className="flex items-center space-x-2 text-xs text-white/60">
              <span>🇮🇳</span>
              <span>Service Before Self</span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-orange-300 focus:outline-none p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-4 space-y-2 bg-white/10 backdrop-blur-lg rounded-lg mt-2 border border-white/20">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  className="text-white hover:text-orange-300 hover:bg-white/10 block w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </button>
              ))}

              {/* Current Time - Mobile */}
              <div className="px-4 py-2">
                <div className="text-sm text-white/80 font-mono bg-white/10 px-4 py-2 rounded-lg inline-block backdrop-blur-sm border border-white/20">
                  <span className="text-green-400 mr-2">🕐</span>
                  {currentTime}
                </div>
              </div>

              {/* Mobile motto */}
              <div className="px-4 py-2">
                <div className="flex items-center justify-center space-x-2 text-xs text-white/60">
                  <span>🇮🇳</span>
                  <span>Service Before Self</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default function Login() {
  const [formData, setFormData] = useState({
    ServiceId: "",
    Password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", message: "" });
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validate = () => {
    let tempErrors = {};

    if (!formData.ServiceId.trim()) {
      tempErrors.ServiceId = "Service ID is required";
    }

    if (!formData.Password) {
      tempErrors.Password = "Password is required";
    } else if (formData.Password.length < 8) {
      tempErrors.Password = "Password must be at least 8 characters";
    }

    return tempErrors;
  };
  const handleSubmit = async () => {
    const formErrors = validate();
    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      setIsSubmitting(true);

      try {
        const response = await axios.post("/api/user/auth/login", {
          ServiceId: formData.ServiceId,
          Password: formData.Password,
        });

        if (response.data.success) {
          setSubmitMessage({
            type: "success",
            message: "Login successful! Redirecting to dashboard...",
          });

          // Reset form after successful login
          setTimeout(() => {
            setFormData({
              ServiceId: "",
              Password: "",
              rememberMe: false,
            });
          }, 1000);
        } else {
          setSubmitMessage({
            type: "error",
            message: response.data.message || "Login failed. Please try again.",
          });
        }
      } catch (error) {
        setSubmitMessage({
          type: "error",
          message: "Login failed. Please check your credentials and try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  const handleForgotPassword = async () => {
    if (!formData.ServiceId.trim()) {
      setErrors({ ServiceId: "Please enter your Service ID first" });
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitMessage({
        type: "success",
        message:
          "Password reset instructions sent to your registered mobile number and email.",
      });
      setShowForgotPassword(false);
    } catch (error) {
      setSubmitMessage({
        type: "error",
        message:
          "Unable to send reset instructions. Please contact IT support.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Navbar */}
      {/* <Navbar /> */}

      {/* Main Content */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-0 left-0 w-full h-full bg-repeat opacity-20"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E\")",
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center items-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-white rounded-full flex items-center justify-center mr-4 shadow-xl border-4 border-green-600">
                <span className="text-3xl font-bold text-green-800">⭐</span>
              </div>
              <div>
                <h1 className="text-5xl font-bold text-white tracking-wider">
                  SENADRIVE
                </h1>
                <p className="text-orange-300 font-semibold text-lg">
                  Indian Army Personnel Portal
                </p>
              </div>
            </div>
            <div className="flex justify-center space-x-8 text-sm text-blue-200">
              <span className="flex items-center">
                <span className="text-orange-400 mr-1">🇮🇳</span> Service Before
                Self
              </span>
              <span className="flex items-center">
                <span className="text-green-400 mr-1">⚔️</span> Honor & Duty
              </span>
              <span className="flex items-center">
                <span className="text-white mr-1">🛡️</span> Nation First
              </span>
            </div>
          </div>

          {/* Main Form */}
          <div className="max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-8 py-6 border-b-4 border-orange-500">
                <h2 className="text-3xl font-bold text-white text-center mb-2">
                  Welcome Back
                </h2>
                <p className="text-blue-100 text-center">
                  Sign in to access your SenaDrive account
                </p>
              </div>

              <div className="p-8">
                {submitMessage.message && (
                  <div
                    className={`mb-6 p-4 rounded-lg border-l-4 ${
                      submitMessage.type === "success"
                        ? "bg-green-900/50 border-green-400 text-green-100"
                        : "bg-red-900/50 border-red-400 text-red-100"
                    }`}
                  >
                    {submitMessage.message}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Service ID */}
                  <div>
                    <label
                      htmlFor="ServiceId"
                      className="block text-sm font-semibold text-white mb-2"
                    >
                      Service ID <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="ServiceId"
                      name="ServiceId"
                      value={formData.ServiceId}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg bg-white/10 border-2 ${
                        errors.ServiceId ? "border-red-400" : "border-white/20"
                      } text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent backdrop-blur-sm`}
                      placeholder="Enter your service ID"
                    />
                    {errors.ServiceId && (
                      <p className="mt-2 text-sm text-red-300">
                        {errors.ServiceId}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="Password"
                      className="block text-sm font-semibold text-white mb-2"
                    >
                      Password <span className="text-orange-400">*</span>
                    </label>
                    <input
                      type="password"
                      id="Password"
                      name="Password"
                      value={formData.Password}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg bg-white/10 border-2 ${
                        errors.Password ? "border-red-400" : "border-white/20"
                      } text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent backdrop-blur-sm`}
                      placeholder="Enter your password"
                    />
                    {errors.Password && (
                      <p className="mt-2 text-sm text-red-300">
                        {errors.Password}
                      </p>
                    )}
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-white/30 rounded"
                      />
                      <label
                        htmlFor="rememberMe"
                        className="ml-2 text-sm text-white"
                      >
                        Remember me
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-orange-400 hover:text-orange-300 font-semibold"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Forgot Password Section */}
                  {showForgotPassword && (
                    <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-400/30">
                      <h3 className="text-white font-semibold mb-2">
                        Reset Password
                      </h3>
                      <p className="text-white/80 text-sm mb-3">
                        Enter your Service ID and we'll send reset instructions
                        to your registered contact details.
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleForgotPassword}
                          disabled={isSubmitting}
                          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
                        >
                          Send Reset Link
                        </button>
                        <button
                          onClick={() => setShowForgotPassword(false)}
                          className="px-4 py-2 text-white/80 hover:text-white transition duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-lg shadow-xl transform transition duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Signing In...
                        </>
                      ) : (
                        <>
                          <span className="mr-2">🔐</span>
                          Sign In to SenaDrive
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-white/20 text-center">
                  <p className="text-white/80 mb-4">
                    Don't have an account?{" "}
                    <button className="text-orange-400 hover:text-orange-300 font-semibold underline">
                      Create Account
                    </button>
                  </p>
                  <div className="flex justify-center items-center space-x-4 text-xs text-white/60">
                    <span>🔒 Secure Login</span>
                    <span>•</span>
                    <span>🇮🇳 Made for Indian Army</span>
                    <span>•</span>
                    <span>✅ Verified Platform</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Security Notice */}
          <div className="max-w-md mx-auto mt-8">
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start">
                <span className="text-yellow-400 mr-3 mt-1">⚠️</span>
                <div>
                  <h4 className="text-yellow-300 font-semibold text-sm mb-1">
                    Security Notice
                  </h4>
                  <p className="text-yellow-100/80 text-xs">
                    For security reasons, you will be automatically logged out
                    after 30 minutes of inactivity. Never share your login
                    credentials with anyone.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Banner */}
          <div className="mt-12 text-center">
            <p className="text-white/60 text-sm mb-2">
              Proudly serving the Indian Army digital ecosystem
            </p>
            <div className="flex justify-center space-x-2 text-2xl">
              <span>🇮🇳</span>
              <span>⭐</span>
              <span>🛡️</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
