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

export default function RandomCall() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callStatus, setCallStatus] = useState(
    "Loading required components..."
  );
  const [onlineCount, setOnlineCount] = useState(0);
  const [serverStats, setServerStats] = useState(null);
  const [socket, setSocket] = useState(null);
  const [SimplePeer, setSimplePeer] = useState(null);
  const [currentStream, setCurrentStream] = useState(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Use refs to track the current state values
  const isSearchingRef = useRef(false);
  const isInitializedRef = useRef(false);
  const SimplePeerRef = useRef(null);
  const currentStreamRef = useRef(null);

  const peerRef = useRef(null);
  const audioRef = useRef(null);
  const userId = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);

  // Update refs when state changes
  useEffect(() => {
    isSearchingRef.current = isSearching;
  }, [isSearching]);

  useEffect(() => {
    isInitializedRef.current = isInitialized;
  }, [isInitialized]);

  useEffect(() => {
    SimplePeerRef.current = SimplePeer;
  }, [SimplePeer]);

  useEffect(() => {
    currentStreamRef.current = currentStream;
  }, [currentStream]);

  // Load SimplePeer and Socket.IO
  useEffect(() => {
    const loadLibraries = async () => {
      try {
        // Load SimplePeer
        const peerModule = await import("simple-peer");
        const PeerConstructor = peerModule.default || peerModule;
        setSimplePeer(() => PeerConstructor);
        console.log("SimplePeer loaded successfully");

        // Load Socket.IO
        const ioModule = await import("socket.io-client");
        const io = ioModule.default || ioModule.io;

        // Initialize socket connection
        const socketInstance = initializeSocket(io);
        setSocket(socketInstance);

        // Mark initialization as complete
        setIsInitialized(true);
        setCallStatus("Click Find Someone to start");
      } catch (error) {
        console.error("Failed to load libraries:", error);
        setCallStatus("Failed to load required components. Please refresh.");
      }
    };

    loadLibraries();
  }, []);

  const initializeSocket = (io) => {
    const socketInstance = io("http://localhost:10000", {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: true,
      upgrade: true,
      rememberUpgrade: false,
    });

    socketInstance.on("connect", () => {
      console.log("Connected to server with ID:", socketInstance.id);
      setCallStatus("Connected to server. Click Find Someone to start");
      setConnectionAttempts(0);

      // Start heartbeat
      heartbeatIntervalRef.current = setInterval(() => {
        if (socketInstance.connected) {
          socketInstance.emit("heartbeat");
        }
      }, 20000);
    });

    socketInstance.on(
      "connect-info",
      ({ userId: serverUserId, onlineCount, serverTime }) => {
        userId.current = serverUserId;
        setOnlineCount(onlineCount);
        console.log(
          `Received connect-info: userId=${serverUserId}, serverTime=${serverTime}`
        );
      }
    );

    socketInstance.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setConnectionAttempts((prev) => prev + 1);

      if (connectionAttempts < 5) {
        setCallStatus(
          `Connection failed. Retrying... ${connectionAttempts + 1}/5`
        );

        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("Retrying connection...");
          socketInstance.connect();
        }, 2000 * (connectionAttempts + 1));
      } else {
        setCallStatus("Failed to connect to server. Please refresh the page.");
      }
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Disconnected from server:", reason);
      setCallStatus("Disconnected from server. Reconnecting...");
      if (isInCall || isConnecting) {
        endCall();
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    });

    socketInstance.on("reconnect", (attemptNumber) => {
      console.log("Reconnected to server after", attemptNumber, "attempts");
      setCallStatus("Reconnected to server. Click Find Someone to start");
      setConnectionAttempts(0);
    });

    socketInstance.on("online-count", (count) => {
      setOnlineCount(count);
    });

    socketInstance.on("server-stats", (stats) => {
      setServerStats(stats);
      console.log("Server stats:", stats);
    });

    socketInstance.on("server-shutdown", ({ message, timestamp }) => {
      console.log("Server shutdown:", message, timestamp);
      setCallStatus(message);
      endCall();
      if (socketInstance.connected) {
        socketInstance.disconnect();
      }
    });

    socketInstance.on("waiting-for-match", () => {
      setCallStatus("Looking for someone to talk to...");
      setIsSearching(true);
    });

    socketInstance.on("match-found", ({ partnerId, initiator }) => {
      console.log(
        "Match found with partner:",
        partnerId,
        "Initiator:",
        initiator
      );

      // Use refs to get current values instead of state
      const currentlySearching = isSearchingRef.current;
      const currentlyInitialized = isInitializedRef.current;
      const currentSimplePeer = SimplePeerRef.current;
      const currentStreamValue = currentStreamRef.current;

      console.log("Match readiness check:", {
        currentlySearching,
        currentlyInitialized,
        currentSimplePeer: !!currentSimplePeer,
        currentStreamValue: !!currentStreamValue,
      });

      // Only handle match if we  re actively searching and have all required components
      if (
        currentlySearching &&
        currentlyInitialized &&
        currentSimplePeer &&
        currentStreamValue
      ) {
        console.log("Handling match - all conditions met");
        setCallStatus("Found someone! Connecting...");
        setIsSearching(false);
        handleMatchFound(partnerId, initiator, socketInstance);
      } else {
        console.log("Cannot handle match - not ready or not searching");

        // If we  re not actively searching, reject the match
        if (!currentlySearching) {
          console.log("Rejecting match - not actively searching");
          socketInstance.emit("end-call");
          return;
        }

        // If we  re searching but not ready, send not-ready signal
        console.log("Sending not-ready signal to server");
        socketInstance.emit("not-ready");
      }
    });

    socketInstance.on("webrtc-offer", ({ from, offer }) => {
      if (peerRef.current && typeof peerRef.current.signal === "function") {
        try {
          peerRef.current.signal(offer);
        } catch (err) {
          console.error("Error handling WebRTC offer:", err);
        }
      }
    });

    socketInstance.on("webrtc-answer", ({ from, answer }) => {
      if (peerRef.current && typeof peerRef.current.signal === "function") {
        try {
          peerRef.current.signal(answer);
        } catch (err) {
          console.error("Error handling WebRTC answer:", err);
        }
      }
    });

    socketInstance.on("ice-candidate", ({ from, candidate }) => {
      if (peerRef.current && typeof peerRef.current.signal === "function") {
        try {
          peerRef.current.signal(candidate);
        } catch (err) {
          console.error("Error handling ICE candidate:", err);
        }
      }
    });

    socketInstance.on("call-ended", () => {
      console.log("Call ended by server");
      endCall();
    });

    socketInstance.on("heartbeat-ack", () => {
      console.log("Heartbeat acknowledged");
    });

    return socketInstance;
  };

  const getUserMedia = async (constraints) => {
    try {
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
    } catch (error) {
      console.error("getUserMedia error:", error);
      throw error;
    }
  };

  const endCall = () => {
    console.log("Ending call");

    if (peerRef.current) {
      try {
        if (typeof peerRef.current.destroy === "function") {
          peerRef.current.destroy();
        }
      } catch (err) {
        console.error("Error destroying peer:", err);
      }
      peerRef.current = null;
    }

    if (currentStream) {
      currentStream.getTracks().forEach((track) => {
        try {
          track.stop();
          console.log("Stopped track:", track.kind);
        } catch (err) {
          console.error("Error stopping track:", err);
        }
      });
      setCurrentStream(null);
    }

    if (audioRef.current && audioRef.current.srcObject) {
      audioRef.current.srcObject = null;
    }

    setIsInCall(false);
    setIsConnecting(false);
    setIsSearching(false);
    setIsMuted(false);
    setCallStatus("Call ended. Click Find Someone to start again");

    if (socket && socket.connected) {
      socket.emit("end-call");
    }
  };

  const handleMatchFound = async (partnerId, isInitiator, socketInstance) => {
    const currentSimplePeer = SimplePeerRef.current;
    const currentStreamValue = currentStreamRef.current;

    if (
      !currentSimplePeer ||
      !currentStreamValue ||
      !socketInstance.connected
    ) {
      console.error(
        "WebRTC not ready: SimplePeer, currentStream, or socket missing"
      );
      setCallStatus("Error: WebRTC not ready. Try again.");
      setIsSearching(false);
      if (socketInstance.connected) {
        socketInstance.emit("end-call");
      }
      return;
    }

    try {
      const peerConfig = {
        initiator: isInitiator,
        trickle: false,
        stream: currentStreamValue,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
            { urls: "stun:stun3.l.google.com:19302" },
            { urls: "stun:stun4.l.google.com:19302" },
          ],
        },
      };

      peerRef.current = new currentSimplePeer(peerConfig);

      peerRef.current.on("signal", (data) => {
        try {
          if (data.type === "offer") {
            socketInstance.emit("webrtc-offer", { offer: data });
          } else if (data.type === "answer") {
            socketInstance.emit("webrtc-answer", { answer: data });
          } else if (data.candidate) {
            socketInstance.emit("ice-candidate", { candidate: data });
          }
        } catch (err) {
          console.error("Error emitting signal:", err);
        }
      });

      peerRef.current.on("stream", (remoteStream) => {
        console.log("Remote stream received:", remoteStream);
        console.log("Remote audio tracks:", remoteStream.getAudioTracks());

        if (remoteStream.getAudioTracks().length === 0) {
          console.error("No audio tracks in remote stream");
          setCallStatus("Connected, but no audio received. Try again.");
          return;
        }

        if (audioRef.current) {
          audioRef.current.srcObject = remoteStream;
          audioRef.current.muted = false; // Ensure remote audio is not muted
          audioRef.current.play().catch((err) => {
            console.error("Error playing remote audio:", err);
            setCallStatus(
              "Error playing audio. Please check browser settings."
            );
          });
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

      setTimeout(() => {
        if (isConnecting && !isInCall) {
          console.log("Connection timeout");
          setCallStatus("Connection timed out. Try again.");
          endCall();
        }
      }, 30000);
    } catch (err) {
      console.error("Error creating peer:", err);
      setCallStatus("Failed to connect. Try again.");
      endCall();
    }
  };

  const findRandomPerson = async () => {
    if (!isInitialized || !SimplePeer || !socket || !socket.connected) {
      setCallStatus("Application is not ready. Please wait or refresh...");
      console.error("Cannot find random person: initialization incomplete", {
        isInitialized,
        SimplePeer: !!SimplePeer,
        socket: !!socket,
        socketConnected: socket?.connected,
      });
      return;
    }

    setIsSearching(true);
    setIsConnecting(true);
    setCallStatus("Getting microphone access...");

    try {
      const stream = await getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      // Log stream details
      console.log("Local stream acquired:", stream);
      console.log("Audio tracks:", stream.getAudioTracks());

      if (stream.getAudioTracks().length === 0) {
        throw new Error("No audio tracks found in stream");
      }

      setCurrentStream(stream);
      if (audioRef.current) {
        audioRef.current.srcObject = stream;
        audioRef.current.muted = true; // Mute local audio to prevent feedback
      }

      setTimeout(() => {
        setCallStatus("Finding someone to talk to...");
        socket.emit("find-random");
      }, 100);
    } catch (err) {
      console.error("Media error:", err);
      let errorMessage = "Failed to access microphone. ";
      if (err.name === "NotAllowedError") {
        errorMessage += "Please allow microphone access and try again.";
      } else if (err.name === "NotFoundError") {
        errorMessage += "No microphone found. Please connect a microphone.";
      } else if (err.name === "NotReadableError") {
        errorMessage += "Microphone is being used by another application.";
      } else {
        errorMessage += `Please check your microphone settings. Error: ${err.message}`;
      }
      setCallStatus(errorMessage);
      setIsConnecting(false);
      setIsSearching(false);
      return;
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
    }, 1000);
  };

  const cancelSearch = () => {
    console.log("Canceling search");
    setIsSearching(false);
    setIsConnecting(false);
    setCallStatus("Search cancelled. Click Find Someone to try again.");

    // Clean up stream
    if (currentStream) {
      currentStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (err) {
          console.error("Error stopping track:", err);
        }
      });
      setCurrentStream(null);
    }

    if (socket && socket.connected) {
      socket.emit("end-call");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      endCall();
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

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
              {isInCall ? "You  re connected!" : "Talk to strangers"}
            </h2>

            <p className="text-lg text-gray-200 mb-6">{callStatus}</p>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              {!isInCall && !isConnecting && (
                <button
                  onClick={findRandomPerson}
                  disabled={
                    !isInitialized ||
                    !socket ||
                    !socket.connected ||
                    !SimplePeer
                  }
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center space-x-2 transform transition hover:scale-105 shadow-lg"
                >
                  <Phone className="w-5 h-5" />
                  <span>Find Someone</span>
                </button>
              )}

              {isConnecting && (
                <button
                  onClick={cancelSearch}
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
              <span>Use Next if conversation isn t working</span>
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
