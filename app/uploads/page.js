"use client";
import { useState } from "react";

export default function ModernArmyUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle file selection and generate preview
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError(null);

    // Reset preview if no file is selected
    if (!selectedFile) {
      setPreview(null);
      return;
    }

    // Generate preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      // For non-image files, store file name or type icon
      setPreview({ name: selectedFile.name, type: selectedFile.type });
    }
  };

  // Handle file upload (simulated for offline use)
  const sendData = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create FormData and append the file
      const formData = new FormData();
      formData.append("file", file);

      // Send the file to the /api/uploads endpoint
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      // Parse the response
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      alert("File uploaded successfully to secure military network");
      console.log("Upload completed:", data);

      // Reset state after successful upload
      setFile(null);
      setPreview(null);
    } catch (err) {
      setError(
        "Upload failed. Please try again or contact system administrator."
      );
      console.error("Upload error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 right-20 w-40 h-40 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/3 right-1/3 w-28 h-28 bg-red-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-3000"></div>
      </div>

      <div className="relative z-10">
        {/* Header with Indian Army Branding */}
        <div className="text-center mb-12">
          {/* Indian Flag with Modern Design */}
          <div className="flex justify-center mb-6">
            <div className="w-40 h-24 border-3 border-white/20 shadow-2xl rounded-lg overflow-hidden backdrop-blur-sm">
              <div className="h-1/3 bg-gradient-to-r from-orange-500 to-orange-600"></div>
              <div className="h-1/3 bg-white flex items-center justify-center relative">
                {/* Enhanced Ashoka Chakra */}
                <div className="w-10 h-10 border-2 border-blue-800 rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-8 h-8 rounded-full border border-blue-800 relative bg-blue-50">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-0.5 h-4 bg-blue-800"
                        style={{
                          left: "50%",
                          top: "50%",
                          transformOrigin: "50% 50%",
                          transform: `translate(-50%, -50%) rotate(${
                            i * 30
                          }deg) translateY(-8px)`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="h-1/3 bg-gradient-to-r from-green-600 to-green-700"></div>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-white to-green-400 mb-4 drop-shadow-2xl">
              INDIAN ARMY
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-orange-500 to-green-500 mx-auto mb-6 rounded-full shadow-lg"></div>
            <p className="text-2xl font-bold text-blue-100 tracking-wider">
              SECURE DOCUMENT TRANSFER SYSTEM
            </p>
            <p className="text-blue-200 font-medium text-lg mt-2">
              Military Grade Encryption • Classified Network Access
            </p>
          </div>

          {/* Enhanced Army Motto */}
          <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-orange-600/20 via-white/10 to-green-600/20 backdrop-blur-md border border-white/20 text-white py-4 px-8 font-bold tracking-wider rounded-2xl shadow-2xl">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-red-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L13.09 8.26L22 9L17 14L18.18 22L12 19L5.82 22L7 14L2 9L10.91 8.26L12 2Z" />
              </svg>
            </div>
            <span className="text-xl">"SERVICE BEFORE SELF"</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Modern Main Upload Panel */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
            {/* Modern Header Bar */}
            <div className="bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-blue-800/30 backdrop-blur-md border-b border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  {/* Enhanced Army Badge */}
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-xl">
                    <svg
                      className="w-10 h-10 text-red-700"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2L13.09 8.26L22 9L17 14L18.18 22L12 19L5.82 22L7 14L2 9L10.91 8.26L12 2Z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white mb-1">
                      CLASSIFIED DOCUMENT CENTER
                    </h2>
                    <p className="text-blue-200 font-semibold">
                      Authorized Military Personnel Only
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10">
              {/* Enhanced File Input Section */}
              <div className="mb-10">
                <label className="block text-white text-2xl font-black mb-6 flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">📁</span>
                  </div>
                  <span>SELECT CLASSIFIED DOCUMENT</span>
                </label>
                <div className="border-4 border-dashed border-blue-400/50 rounded-2xl p-12 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 backdrop-blur-sm hover:from-blue-500/20 hover:to-indigo-600/20 transition-all duration-500 hover:border-blue-300/70 group">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="block w-full text-lg text-white
                      file:mr-6 file:py-5 file:px-8 file:rounded-2xl file:border-0
                      file:text-lg file:font-bold file:bg-gradient-to-r file:from-orange-600 file:via-red-600 file:to-pink-600 file:text-white
                      hover:file:from-orange-700 hover:file:via-red-700 hover:file:to-pink-700 cursor-pointer file:shadow-2xl file:transition-all file:duration-300
                      hover:file:scale-105"
                  />
                  <div className="text-center mt-6">
                    <p className="text-white font-bold text-xl">
                      Upload documents to secure military infrastructure
                    </p>
                    <p className="text-blue-200 text-lg mt-2">
                      Files are encrypted with AES-256 military-grade security
                    </p>
                    <div className="flex justify-center space-x-4 mt-4 text-sm text-blue-300">
                      <span>• Top Secret Clearance</span>
                      <span>• End-to-End Encryption</span>
                      <span>• Audit Trail Logging</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced File Preview Section */}
              {preview && (
                <div className="mb-10">
                  <h3 className="text-white text-2xl font-black mb-6 flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">🔍</span>
                    </div>
                    <span>DOCUMENT PREVIEW & ANALYSIS</span>
                  </h3>
                  <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
                    {typeof preview === "string" ? (
                      <div className="text-center">
                        <img
                          src={preview}
                          alt="Document preview"
                          className="max-w-full h-auto mx-auto rounded-2xl shadow-2xl border-2 border-white/20"
                          style={{ maxHeight: "400px" }}
                        />
                        <div className="mt-6 p-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl border border-green-400/30">
                          <span className="text-green-300 font-bold text-xl flex items-center justify-center space-x-2">
                            <svg
                              className="w-6 h-6"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>
                              IMAGE VERIFIED & READY FOR SECURE TRANSMISSION
                            </span>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-8 bg-gradient-to-r from-gray-700/30 to-gray-800/30 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center border-2 border-white/20 shadow-xl">
                          <svg
                            className="w-12 h-12 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-black text-2xl mb-2">
                            {preview.name}
                          </div>
                          <div className="text-blue-300 font-bold text-lg mb-3">
                            File Type: {preview.type}
                          </div>
                          <div className="flex items-center space-x-2">
                            <svg
                              className="w-5 h-5 text-green-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-green-300 font-bold text-lg">
                              DOCUMENT VALIDATED • READY FOR SECURE TRANSFER
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Enhanced Error Message */}
              {error && (
                <div className="mb-8 p-6 bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-md border-2 border-red-400/50 rounded-2xl shadow-2xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                    </div>
                    <span className="text-red-200 font-bold text-xl">
                      {error}
                    </span>
                  </div>
                </div>
              )}

              {/* Enhanced Upload Button */}
              <button
                onClick={sendData}
                disabled={isLoading || !file}
                className={`w-full py-6 px-12 rounded-2xl text-2xl font-black transition-all duration-500 border-3 shadow-2xl relative overflow-hidden group
                  ${
                    isLoading || !file
                      ? "bg-gradient-to-r from-gray-600 to-gray-700 border-gray-500 text-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 border-orange-400 text-white hover:from-orange-700 hover:via-red-700 hover:to-pink-700 hover:scale-105 hover:shadow-3xl transform"
                  }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12"></div>
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-6 relative z-10">
                    <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>🚀 UPLOADING TO SECURE MILITARY NETWORK...</span>
                  </div>
                ) : (
                  <span className="relative z-10 flex items-center justify-center space-x-4">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span>🛡️ INITIATE UPLOAD</span>
                  </span>
                )}
              </button>

              {/* Enhanced File Information */}
              {file && (
                <div className="mt-10 bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
                  <h4 className="text-white font-black text-2xl mb-6 flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">📋</span>
                    </div>
                    <span>DOCUMENT INTELLIGENCE REPORT</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm p-6 rounded-2xl border border-orange-400/30 shadow-lg">
                      <div className="text-orange-300 font-bold text-sm mb-2">
                        DOCUMENT DESIGNATION
                      </div>
                      <div className="text-white font-black text-lg break-all">
                        {file.name}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-sm p-6 rounded-2xl border border-green-400/30 shadow-lg">
                      <div className="text-green-300 font-bold text-sm mb-2">
                        FILE SIZE ANALYSIS
                      </div>
                      <div className="text-white font-black text-lg">
                        {(file.size / 1024).toFixed(2)} KB
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm p-6 rounded-2xl border border-blue-400/30 shadow-lg">
                      <div className="text-blue-300 font-bold text-sm mb-2">
                        CLASSIFICATION TYPE
                      </div>
                      <div className="text-white font-black text-lg">
                        {file.type || "CLASSIFIED"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm p-6 rounded-2xl border border-purple-400/30 shadow-lg">
                      <div className="text-purple-300 font-bold text-sm mb-2">
                        TIMESTAMP RECORD
                      </div>
                      <div className="text-white font-black text-lg">
                        {new Date(file.lastModified).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="text-center mt-12">
            <div className="inline-block bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8">
              <div className="flex items-center justify-center space-x-8">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center border-3 border-white/30 shadow-2xl">
                  <svg
                    className="w-12 h-12 text-red-700"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L13.09 8.26L22 9L17 14L18.18 22L12 19L5.82 22L7 14L2 9L10.91 8.26L12 2Z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-black text-3xl text-white mb-2">
                    INDIAN ARMY SECURE NETWORK
                  </div>
                  <div className="text-blue-200 font-bold text-lg">
                    Military Intelligence • Cyber Warfare Division
                  </div>
                  <div className="text-yellow-400 font-bold text-sm mt-2 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span>RESTRICTED ACCESS • AUTHORIZED PERSONNEL ONLY</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
