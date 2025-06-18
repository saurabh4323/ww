"use client";
import { useState } from "react";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    ServiceId: "",
    rank: "",
    gender: "",
    number: "",
    Password: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validate = () => {
    let tempErrors = {};

    if (!formData.name.trim()) {
      tempErrors.name = "Name is required";
    } else if (formData.name.length < 3) {
      tempErrors.name = "Name must be at least 3 characters";
    } else if (formData.name.length > 50) {
      tempErrors.name = "Name must not exceed 50 characters";
    }

    if (!formData.Password) {
      tempErrors.Password = "Password is required";
    } else if (formData.Password.length < 8) {
      tempErrors.Password = "Password must be at least 8 characters";
    }

    if (!formData.number) {
      tempErrors.number = "Contact number is required";
    } else if (!/^\d{10}$/.test(formData.number)) {
      tempErrors.number = "Please enter a valid 10-digit mobile number";
    }

    if (!formData.ServiceId.trim()) {
      tempErrors.ServiceId = "Service ID is required";
    }

    if (!formData.rank) {
      tempErrors.rank = "Rank selection is required";
    }

    return tempErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validate();
    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      setIsSubmitting(true);

      try {
        const response = await fetch("/api/user/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        // Simulate a successful registration
        setSubmitMessage({
          type: "success",
          message: "Registration successful! Redirecting to login...",
        });

        // Reset form
        setFormData({
          name: "",
          ServiceId: "",
          rank: "",
          gender: "",
          number: "",
          Password: "",
        });
      } catch (error) {
        setSubmitMessage({
          type: "error",
          message: "Registration failed. Please try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const ranks = [
    "Lieutenant",
    "Captain",
    "Major",
    "Lieutenant Colonel",
    "Colonel",
    "Brigadier",
    "Major General",
    "Lieutenant General",
    "General",
    "Sepoy",
    "Lance Naik",
    "Naik",
    "Havildar",
    "Company Havildar Major",
    "Battalion Havildar Major",
    "Company Quarter Master Havildar",
    "Battalion Quarter Master Havildar",
    "Subedar",
    "Subedar Major",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute top-0 left-0 w-full h-full bg-repeat opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-white rounded-full flex items-center justify-center mr-4 shadow-xl border-4 border-green-600">
              <span className="text-2xl font-bold text-green-800">⭐</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white tracking-wider">
                SENADRIVE
              </h1>
              <p className="text-orange-300 font-semibold">
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
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-8 py-6 border-b-4 border-orange-500">
              <h2 className="text-3xl font-bold text-white text-center mb-2">
                Create Your Account
              </h2>
              <p className="text-blue-100 text-center">
                Join the SenaDrive family - Secure • Reliable • Professional
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

              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-semibold text-white mb-2"
                      >
                        Full Name <span className="text-orange-400">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg bg-white/10 border-2 ${
                          errors.name ? "border-red-400" : "border-white/20"
                        } text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent backdrop-blur-sm`}
                        placeholder="Enter your full name"
                      />
                      {errors.name && (
                        <p className="mt-2 text-sm text-red-300">
                          {errors.name}
                        </p>
                      )}
                    </div>

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
                          errors.ServiceId
                            ? "border-red-400"
                            : "border-white/20"
                        } text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent backdrop-blur-sm`}
                        placeholder="Enter your service ID"
                      />
                      {errors.ServiceId && (
                        <p className="mt-2 text-sm text-red-300">
                          {errors.ServiceId}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Rank */}
                    <div>
                      <label
                        htmlFor="rank"
                        className="block text-sm font-semibold text-white mb-2"
                      >
                        Rank <span className="text-orange-400">*</span>
                      </label>
                      <select
                        id="rank"
                        name="rank"
                        value={formData.rank}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg bg-white/10 border-2 ${
                          errors.rank ? "border-red-400" : "border-white/20"
                        } text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent backdrop-blur-sm`}
                      >
                        <option value="" className="bg-slate-800">
                          Select your rank
                        </option>
                        {ranks.map((rank) => (
                          <option
                            key={rank}
                            value={rank}
                            className="bg-slate-800"
                          >
                            {rank}
                          </option>
                        ))}
                      </select>
                      {errors.rank && (
                        <p className="mt-2 text-sm text-red-300">
                          {errors.rank}
                        </p>
                      )}
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label
                        htmlFor="number"
                        className="block text-sm font-semibold text-white mb-2"
                      >
                        Mobile Number <span className="text-orange-400">*</span>
                      </label>
                      <input
                        type="tel"
                        id="number"
                        name="number"
                        value={formData.number}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg bg-white/10 border-2 ${
                          errors.number ? "border-red-400" : "border-white/20"
                        } text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent backdrop-blur-sm`}
                        placeholder="Enter 10-digit mobile number"
                      />
                      {errors.number && (
                        <p className="mt-2 text-sm text-red-300">
                          {errors.number}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-3">
                      Gender
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {["male", "female", "other"].map((genderOption) => (
                        <div key={genderOption} className="flex items-center">
                          <input
                            type="radio"
                            id={genderOption}
                            name="gender"
                            value={genderOption}
                            onChange={handleChange}
                            checked={formData.gender === genderOption}
                            className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-white/30"
                          />
                          <label
                            htmlFor={genderOption}
                            className="ml-2 text-sm text-white capitalize cursor-pointer"
                          >
                            {genderOption}
                          </label>
                        </div>
                      ))}
                    </div>
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
                      placeholder="Create a strong password"
                    />
                    {errors.Password && (
                      <p className="mt-2 text-sm text-red-300">
                        {errors.Password}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
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
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <span className="mr-2">🛡️</span>
                          Create SenaDrive Account
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-white/20 text-center">
                <p className="text-white/80 mb-4">
                  Already have an account?{" "}
                  <button
                    className="text-orange-400 hover:text-orange-300 font-semibold underline"
                    onClick={() => (window.location.href = "/user/login")}
                  >
                    Sign In
                  </button>
                </p>
                <div className="flex justify-center items-center space-x-4 text-xs text-white/60">
                  <span>🔒 Secure Registration</span>
                  <span>•</span>
                  <span>🇮🇳 Made for Indian Army</span>
                  <span>•</span>
                  <span>✅ Verified Platform</span>
                </div>
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
  );
}
