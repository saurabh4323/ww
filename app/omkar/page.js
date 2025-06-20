"use client";
import { useState, useEffect, useRef } from "react";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Users,
  Volume2,
  Loader2,
} from "lucide-react";
import io from "socket.io-client"; // Add socket.io-client import

export default function RandomCall() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callStatus, setCallStatus] = useState("Click 'Find Someone' to start");
  const [onlineCount, setOnlineCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [SimplePeer, setSimplePeer] = useState(null);
  const [currentStream, setCurrentStream] = useState(null);
  const peerRef = useRef(null);
  const audioRef = useRef(null);
  const userId = useRef(Math.random().toString(36).substr(2, 9));

  // Load SimplePeer dynamically
  useEffect(() => {
    const loadSimplePeer = async () => {
      try {
        const peerModule = await import("simple-peer");
        const PeerConstructor = peerModule.default || peerModule;
        setSimplePeer(() => PeerConstructor);
        console.log("SimplePeer loaded successfully");
      } catch (error) {
        console.error("Failed to load SimplePeer:", error);
        setCallStatus("Failed to load WebRTC library");
      }
    };

    loadSimplePeer();
  }, []);

  // Real getUserMedia implementation
  const getUserMedia = async (constraints) => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } else if (navigator.getUserMedia) {
      return new Promise((resolve, reject) => {
        navigator.getUserMedia(constraints, resolve, reject);
      });
    } else if (navigator.webkitGetUserMedia) {
      return new Promise((resolve, reject) => {
        navigator.webkitGetUserMedia(constraints, resolve, reject);
      });
    } else if (navigator.mozGetUserMedia) {
      return new Promise((resolve, reject) => {
        navigator.mozGetUserMedia(constraints, resolve, reject);
      });
    } else {
      throw new Error("getUserMedia is not supported in this browser");
    }
  };

  const endCall = () => {
    console.log("Ending call");

    if (peerRef.current && typeof peerRef.current.destroy === "function") {
      try {
        peerRef.current.destroy();
      } catch (err) {
        console.error("Error destroying peer:", err);
      }
    }
    peerRef.current = null;

    if (currentStream) {
      currentStream.getTracks().forEach((track) => {
        track.stop();
        console.log("Stopped track:", track.kind);
      });
      setCurrentStream(null);
    }

    if (audioRef.current && audioRef.current.srcObject) {
      audioRef.current.srcObject = null;
    }

    setIsInCall(false);
    setIsConnecting(false);
    setIsMuted(false);
    setCallStatus("Call ended. Click 'Find Someone' to start again");

    if (socket && socket.connected) {
      socket.emit("end-call");
    }
  };

  const handleMatchFound = async (partnerId, isInitiator, socketInstance) => {
    if (!SimplePeer || !currentStream) {
      setCallStatus("Error: WebRTC not ready");
      return;
    }

    try {
      peerRef.current = new SimplePeer({
        initiator: isInitiator,
        trickle: false,
        stream: currentStream,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
          ],
        },
      });

      peerRef.current.on("signal", (data) => {
        if (data.type === "offer") {
          socketInstance.emit("webrtc-offer", { offer: data });
        } else if (data.type === "answer") {
          socketInstance.emit("webrtc-answer", { answer: data });
        } else if (data.candidate) {
          socketInstance.emit("ice-candidate", { candidate: data });
        }
      });

      peerRef.current.on("stream", (remoteStream) => {
        console.log("Remote stream received");
        if (audioRef.current) {
          audioRef.current.srcObject = remoteStream;
        }
        setIsConnecting(false);
        setIsInCall(true);
        setCallStatus("Connected! Say hello 👋");
      });

      peerRef.current.on("connect", () => {
        console.log("Peer connected");
        setIsConnecting(false);
        setIsInCall(true);
        setCallStatus("Connected! Say hello 👋");
      });

      peerRef.current.on("error", (err) => {
        console.error("Peer error:", err);
        setCallStatus("Connection failed. Try again.");
        endCall();
      });

      peerRef.current.on("close", () => {
        console.log("Peer connection closed");
        endCall();
      });
    } catch (err) {
      console.error("Error creating peer:", err);
      setCallStatus("Failed to connect. Try again.");
      setIsConnecting(false);
    }
  };

  const findRandomPerson = async () => {
    if (!SimplePeer) {
      setCallStatus("Loading...");
      return;
    }

    if (!socket || !socket.connected) {
      setCallStatus("Not connected to server");
      return;
    }

    setIsConnecting(true);
    setCallStatus("Getting microphone access...");

    try {
      const stream = await getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setCurrentStream(stream);
      if (audioRef.current) {
        audioRef.current.srcObject = stream;
      }

      setCallStatus("Finding someone to talk to...");
      socket.emit("find-random");
    } catch (err) {
      console.error("Media error:", err);
      setCallStatus(
        "Failed to access microphone. Please allow microphone access."
      );
      setIsConnecting(false);
    }
  };

  const toggleMute = () => {
    if (currentStream) {
      currentStream.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const skipToNext = () => {
    endCall();
    setTimeout(() => {
      findRandomPerson();
    }, 500);
  };

  // Socket connection setup
  useEffect(() => {
    const socketInstance = io("https://anonymoluscall-1.onrender.com", {
      // Update to match server port
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Connected to server");
      setCallStatus("Connected to server. Click 'Find Someone' to start");
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setCallStatus("Failed to connect to server");
    });

    socketInstance.on("online-count", (count) => {
      setOnlineCount(count);
    });

    socketInstance.on("waiting-for-match", () => {
      setCallStatus("Looking for someone to talk to...");
    });

    socketInstance.on("match-found", ({ partnerId, initiator }) => {
      setCallStatus("Found someone! Connecting...");
      handleMatchFound(partnerId, initiator, socketInstance);
    });

    socketInstance.on("webrtc-offer", ({ from, offer }) => {
      if (peerRef.current && typeof peerRef.current.signal === "function") {
        peerRef.current.signal(offer);
      }
    });

    socketInstance.on("webrtc-answer", ({ from, answer }) => {
      if (peerRef.current && typeof peerRef.current.signal === "function") {
        peerRef.current.signal(answer);
      }
    });

    socketInstance.on("ice-candidate", ({ from, candidate }) => {
      if (peerRef.current && typeof peerRef.current.signal === "function") {
        peerRef.current.signal(candidate);
      }
    });

    socketInstance.on("call-ended", () => {
      endCall();
    });

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [SimplePeer]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold">VoiceChat</h1>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-green-400">
              {onlineCount.toLocaleString()}
            </span>
            <span className="text-gray-300">online</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Status Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              {isConnecting ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : isInCall ? (
                <Volume2 className="w-8 h-8 text-white animate-pulse" />
              ) : (
                <Phone className="w-8 h-8" />
              )}
            </div>

            <h2 className="text-2xl font-bold mb-4">
              {isInCall ? "You're connected!" : "Talk to strangers"}
            </h2>

            <p className="text-lg text-gray-200 mb-6">{callStatus}</p>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              {!isInCall && !isConnecting && (
                <button
                  onClick={findRandomPerson}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center space-x-2 transform transition hover:scale-105 shadow-lg"
                >
                  <Phone className="w-5 h-5" />
                  <span>Find Someone</span>
                </button>
              )}

              {isConnecting && (
                <button
                  onClick={() => {
                    setIsConnecting(false);
                    setCallStatus("Click 'Find Someone' to start");
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center space-x-2 transform transition hover:scale-105"
                >
                  <PhoneOff className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
              )}

              {isInCall && (
                <>
                  <button
                    onClick={toggleMute}
                    className={`${
                      isMuted
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-gray-600 hover:bg-gray-700"
                    } text-white px-6 py-3 rounded-full font-semibold flex items-center space-x-2 transform transition hover:scale-105`}
                  >
                    {isMuted ? (
                      <MicOff className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                    <span>{isMuted ? "Unmute" : "Mute"}</span>
                  </button>

                  <button
                    onClick={skipToNext}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-semibold flex items-center space-x-2 transform transition hover:scale-105"
                  >
                    <span>Next</span>
                  </button>

                  <button
                    onClick={endCall}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-semibold flex items-center space-x-2 transform transition hover:scale-105"
                  >
                    <PhoneOff className="w-5 h-5" />
                    <span>End</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tips Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-center">
            💡 Tips for great conversations
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div className="flex items-start space-x-2">
              <span className="text-green-400">•</span>
              <span>Be respectful and kind to others</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-400">•</span>
              <span>Ask interesting questions</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-purple-400">•</span>
              <span>Share your hobbies and interests</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-pink-400">•</span>
              <span>Use 'Next' if conversation isn't working</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        autoPlay
        playsInline
        controls={false}
        style={{ display: "none" }}
      />
    </div>
  );
}
