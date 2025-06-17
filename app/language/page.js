"use client";
import { useState, useEffect, useRef } from "react";

export default function MandarinSpeechToText() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recorderRef = useRef(null);
  const whisperPipelineRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Inline SVG icons (unchanged from original)
  const Mic = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" x2="12" y1="19" y2="22"></line>
    </svg>
  );

  const MicOff = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="2" x2="22" y1="2" y2="22"></line>
      <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"></path>
      <path d="M5 10v2a7 7 0 0 0 12 0"></path>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
      <line x1="12" x2="12" y1="19" y2="22"></line>
    </svg>
  );

  const Volume2 = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      <path d="M19.07 4.93a10 10 0 1 1 0 14.14"></path>
    </svg>
  );

  const Copy = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );

  const Trash2 = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );

  const Check = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );

  const Loader = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
    </svg>
  );

  useEffect(() => {
    console.log("Starting useEffect for MandarinSpeechToText component...");

    // Check for Web Audio API support
    if (!window.AudioContext && !window.webkitAudioContext) {
      console.error("Web Audio API not supported.");
      setError("Web Audio API is not supported in this browser.");
      setIsSupported(false);
      setIsLoading(false);
      return;
    }
    console.log("Web Audio API is supported.");

    // Check for microphone support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("Microphone access not supported.");
      setError("Microphone access is not supported in this browser.");
      setIsSupported(false);
      setIsLoading(false);
      return;
    }
    console.log("Microphone access is supported.");

    // Check for WebGPU support
    if (!navigator.gpu) {
      console.error("WebGPU not supported.");
      setError(
        "WebGPU is not supported in this browser. Please use Chrome or Edge."
      );
      setIsSupported(false);
      setIsLoading(false);
      return;
    }
    console.log("WebGPU is supported.");

    // Load whisper-web
    async function initWhisper() {
      console.log("Starting initWhisper function...");
      try {
        // Dynamically load whisper-web
        console.log("Loading whisper-web script...");
        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/npm/whisper-web@0.0.4/dist/whisper.js";
        script.async = true;
        document.head.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = () => {
            console.log("whisper-web script loaded successfully.");
            resolve();
          };
          script.onerror = () => {
            console.error("Failed to load whisper-web script.");
            reject(new Error("Failed to load whisper-web script"));
          };
        });

        // Wait for window.Whisper to be available
        let attempts = 0;
        const maxAttempts = 100;
        while (!window.Whisper && attempts < maxAttempts) {
          console.log(
            `Attempt ${
              attempts + 1
            }/${maxAttempts}: Waiting for window.Whisper...`
          );
          await new Promise((resolve) => setTimeout(resolve, 200));
          attempts++;
        }
        if (!window.Whisper) {
          throw new Error("Whisper library not loaded after maximum attempts");
        }
        console.log("Whisper library loaded successfully.");

        // Initialize Whisper pipeline
        console.log("Initializing Whisper pipeline...");
        const pipeline = await window.Whisper.create({
          model: "tiny", // Small model suitable for Mandarin
          modelPath: "/models/whisper-tiny/", // Local path for offline use
          language: "zh", // Mandarin Chinese
        });
        whisperPipelineRef.current = pipeline;
        console.log("Whisper pipeline initialized successfully.");

        setIsSupported(true);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to initialize Whisper:", err.message);
        setError(
          `Failed to initialize speech recognition: ${err.message}. Ensure model files are in /public/models/whisper-tiny/.`
        );
        setIsSupported(false);
        setIsLoading(false);
      }
    }

    console.log("Calling initWhisper...");
    initWhisper();

    return () => {
      console.log("Cleaning up on component unmount...");
      cleanup();
    };
  }, []);

  const cleanup = () => {
    console.log("Starting cleanup...");
    if (recorderRef.current) {
      console.log("Stopping media recorder...");
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      console.log("Closing audio context...");
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      console.log("Stopping media stream tracks...");
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (whisperPipelineRef.current) {
      console.log("Releasing Whisper pipeline...");
      try {
        whisperPipelineRef.current.free();
      } catch (err) {
        console.error("Error freeing Whisper pipeline:", err);
      }
      whisperPipelineRef.current = null;
    }
    audioChunksRef.current = [];
    console.log("Cleanup completed.");
  };

  const toggleRecording = async () => {
    console.log("Toggling recording...");
    if (!isSupported || !whisperPipelineRef.current) {
      console.error("Speech recognition not available.");
      setError("Speech recognition not available.");
      return;
    }

    if (!isRecording) {
      console.log("Starting recording...");
      try {
        setError("");
        audioChunksRef.current = [];

        console.log("Requesting microphone access...");
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000,
          },
        });
        mediaStreamRef.current = stream;
        console.log("Microphone access granted.");

        console.log("Creating AudioContext...");
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext({ sampleRate: 16000 });
        audioContextRef.current = audioContext;

        if (audioContext.state === "suspended") {
          console.log("Resuming AudioContext...");
          await audioContext.resume();
        }
        console.log("AudioContext state:", audioContext.state);

        console.log("Setting up MediaRecorder...");
        const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
        recorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          console.log("Recording data available...");
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = async () => {
          console.log("Recorder stopped, processing audio...");
          if (audioChunksRef.current.length > 0) {
            try {
              const audioBlob = new Blob(audioChunksRef.current, {
                type: "audio/webm",
              });
              const arrayBuffer = await audioBlob.arrayBuffer();
              const audioBuffer = await audioContext.decodeAudioData(
                arrayBuffer
              );

              console.log("Transcribing audio with Whisper...");
              const result = await whisperPipelineRef.current.transcribe(
                audioBuffer
              );
              if (result.text && result.text.trim()) {
                console.log("Transcription result:", result.text.trim());
                setTranscript(
                  (prev) => prev + (prev ? " " : "") + result.text.trim()
                );
              }
            } catch (err) {
              console.error("Error transcribing audio:", err);
              setError("Failed to transcribe audio.");
            }
          }
          audioChunksRef.current = [];
        };

        console.log("Starting MediaRecorder...");
        recorder.start(1000); // Collect data every second for interim results
        setIsRecording(true);
        console.log("Recording started successfully.");
      } catch (err) {
        console.error("Failed to start recording:", err);
        setError(
          "Failed to start recording. Please ensure microphone access is allowed."
        );
        cleanup();
      }
    } else {
      console.log("Stopping recording...");
      stopRecording();
    }
  };

  const stopRecording = () => {
    console.log("Stopping recording...");
    if (recorderRef.current) {
      recorderRef.current.stop();
    }
    cleanup();
    setIsRecording(false);
    setInterimTranscript("");
    console.log("Recording stopped successfully.");
  };

  const clearTranscript = () => {
    console.log("Clearing transcript...");
    setTranscript("");
    setInterimTranscript("");
    console.log("Transcript cleared.");
  };

  const copyTranscript = async () => {
    console.log("Copying transcript...");
    if (!transcript) {
      console.log("No transcript to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(transcript);
      setCopySuccess(true);
      console.log("Transcript copied successfully.");
      setTimeout(() => {
        setCopySuccess(false);
        console.log("Copy success state reset.");
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setError("Failed to copy transcript.");
    }
  };

  const speakText = () => {
    console.log("Speaking transcript...");
    if (!transcript) {
      console.log("No transcript to speak.");
      setError("No transcript available to read.");
      return;
    }

    if (!("speechSynthesis" in window)) {
      console.error("Text-to-speech not supported.");
      setError("Text-to-speech is not supported in this browser.");
      return;
    }

    console.log("Cancelling any ongoing speech...");
    speechSynthesis.cancel();

    console.log("Creating SpeechSynthesisUtterance...");
    const utterance = new SpeechSynthesisUtterance(transcript);
    utterance.lang = "zh-CN";
    utterance.rate = 0.8;
    utterance.pitch = 1;

    console.log("Speaking transcript...");
    speechSynthesis.speak(utterance);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="mb-4">
            <Loader />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Loading Speech Recognition
          </h2>
          <p className="text-gray-600">
            Initializing Whisper model for Mandarin Chinese...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This may take a moment on first load
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Offline Mandarin Speech to Text
            </h1>
            <p className="text-gray-600">
              Real-time offline Chinese speech recognition using Whisper
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-center mb-6">
            <button
              onClick={toggleRecording}
              disabled={!isSupported}
              className={`
                flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-lg
                transition-all duration-200 transform hover:scale-105 active:scale-95
                ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600 text-white shadow-lg"
                    : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                }
              `}
            >
              {isRecording ? (
                <>
                  <MicOff />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic />
                  Start Recording
                </>
              )}
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 min-h-[200px] mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-700">
                Transcription
              </h3>
              <div className="flex gap-2">
                {transcript && (
                  <>
                    <button
                      onClick={speakText}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-md hover:bg-gray-200"
                      title="Read aloud"
                    >
                      <Volume2 />
                    </button>
                    <button
                      onClick={copyTranscript}
                      className={`p-2 transition-colors rounded-md hover:bg-gray-200 ${
                        copySuccess
                          ? "text-green-600"
                          : "text-gray-600 hover:text-green-600"
                      }`}
                      title="Copy text"
                    >
                      {copySuccess ? <Check /> : <Copy />}
                    </button>
                    <button
                      onClick={clearTranscript}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors rounded-md hover:bg-gray-200"
                      title="Clear text"
                    >
                      <Trash2 />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="text-gray-800 leading-relaxed">
              {transcript && (
                <div className="mb-2">
                  <span className="font-medium">{transcript}</span>
                </div>
              )}
              {interimTranscript && (
                <div className="text-gray-500 italic">{interimTranscript}</div>
              )}
              {!transcript && !interimTranscript && (
                <p className="text-gray-500 text-center py-8">
                  {isRecording
                    ? "Listening... Please start speaking in Mandarin"
                    : "Click the record button and start speaking in Mandarin"}
                </p>
              )}
            </div>
          </div>

          {isRecording && (
            <div className="flex items-center justify-center gap-2 text-red-600">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Recording...</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">
            Setup Instructions:
          </h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              This app loads the Whisper tiny model for Mandarin Chinese from:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Local:{" "}
                <code className="bg-gray-100 px-1 rounded">
                  /models/whisper-tiny/
                </code>
              </li>
            </ul>
            <p className="text-xs mt-2">
              <strong>Note:</strong> For offline usage, ensure the model files
              are placed in your public/models/whisper-tiny/ folder. The model
              will be cached after the first load.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="font-semibold text-gray-700 mb-2">How to use:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Ensure microphone access is allowed in your browser</li>
            <li>• Use Chrome or Edge for WebGPU support</li>
            <li>• Speak clearly in Mandarin Chinese for best results</li>
            <li>• Click the button to start/stop recording</li>
            <li>• Works offline after initial model download</li>
            <li>
              • Use the action buttons to copy, clear, or read the transcript
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
