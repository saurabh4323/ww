"use client";
import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

export default function Call() {
  const [userId, setUserId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState("");
  const [socket, setSocket] = useState(null);
  const [SimplePeer, setSimplePeer] = useState(null);
  const peerRef = useRef(null);
  const audioRef = useRef(null);

  // Load SimplePeer dynamically
  useEffect(() => {
    const loadSimplePeer = async () => {
      try {
        const peerModule = await import("simple-peer");
        // Handle both CommonJS and ES module exports
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

  // Check if getUserMedia is available
  const checkMediaSupport = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return false;
    }
    return true;
  };

  // Get user media with fallback
  const getUserMedia = async (constraints) => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } else if (navigator.getUserMedia) {
      // Fallback for older browsers
      return new Promise((resolve, reject) => {
        navigator.getUserMedia(constraints, resolve, reject);
      });
    } else if (navigator.webkitGetUserMedia) {
      // Webkit fallback
      return new Promise((resolve, reject) => {
        navigator.webkitGetUserMedia(constraints, resolve, reject);
      });
    } else if (navigator.mozGetUserMedia) {
      // Firefox fallback
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

    if (audioRef.current && audioRef.current.srcObject) {
      audioRef.current.srcObject.getTracks().forEach((track) => {
        track.stop();
        console.log("Stopped track:", track.kind);
      });
      audioRef.current.srcObject = null;
    }

    setIsCalling(false);
    setCallStatus("Call ended");

    if (socket && socket.connected && targetId) {
      socket.emit("end-call", { to: targetId });
    }
  };

  const handleAcceptCall = async (offer, from, socketInstance) => {
    if (!SimplePeer) {
      setCallStatus("WebRTC library not loaded");
      return;
    }

    if (!checkMediaSupport()) {
      setCallStatus("Microphone access not supported");
      return;
    }

    try {
      const stream = await getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      if (audioRef.current) {
        audioRef.current.srcObject = stream;
      }

      peerRef.current = new SimplePeer({
        initiator: false,
        trickle: false,
        stream,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
          ],
        },
      });

      console.log("Peer instance created for incoming call:", peerRef.current);

      peerRef.current.on("signal", (data) => {
        console.log("Signal event:", data.type);
        if (data.type === "answer") {
          socketInstance.emit("accept-call", { to: from, answer: data });
        } else if (data.candidate) {
          socketInstance.emit("ice-candidate", { to: from, candidate: data });
        }
      });

      peerRef.current.on("stream", (remoteStream) => {
        console.log("Remote stream received");
        if (audioRef.current) {
          audioRef.current.srcObject = remoteStream;
        }
        setCallStatus("Connected");
      });

      peerRef.current.on("connect", () => {
        console.log("Peer connected");
        setCallStatus("Connected");
      });

      peerRef.current.on("error", (err) => {
        console.error("Peer error:", err);
        setCallStatus("Call failed: " + err.message);
        endCall();
      });

      peerRef.current.on("close", () => {
        console.log("Peer connection closed");
        endCall();
      });

      // Signal the offer to establish connection
      peerRef.current.signal(offer);
      setCallStatus("Accepting call...");
    } catch (err) {
      console.error("Media error:", err);
      setCallStatus("Failed to access microphone: " + err.message);
      endCall();
    }
  };

  useEffect(() => {
    if (!userId) return;

    const socketInstance = io("https://anonymoluscall-1.onrender.com", {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      timeout: 20000,
    });
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Connected to Socket.IO server");
      socketInstance.emit("register", userId);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket.IO connection error:", err.message);
      setCallStatus("Failed to connect to server");
    });

    socketInstance.on("incoming-call", ({ from, offer }) => {
      setCallStatus(`Incoming call from ${from}`);
      if (window.confirm(`Accept call from ${from}?`)) {
        handleAcceptCall(offer, from, socketInstance);
      } else {
        socketInstance.emit("end-call", { to: from });
      }
    });

    socketInstance.on("call-accepted", ({ answer }) => {
      if (peerRef.current && typeof peerRef.current.signal === "function") {
        peerRef.current.signal(answer);
        setCallStatus("Connected");
      }
    });

    socketInstance.on("ice-candidate", ({ candidate }) => {
      if (peerRef.current && typeof peerRef.current.signal === "function") {
        peerRef.current.signal(candidate);
      }
    });

    socketInstance.on("call-ended", () => {
      endCall();
    });

    socketInstance.on("call-error", ({ message }) => {
      setCallStatus(message);
      endCall();
    });

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, SimplePeer]);

  const startCall = async () => {
    if (!userId || !targetId) {
      alert("Please enter both your ID and target ID");
      return;
    }

    if (!socket || !socket.connected) {
      setCallStatus("Server not connected");
      return;
    }

    if (!SimplePeer) {
      setCallStatus("WebRTC library not loaded");
      return;
    }

    // Check if running on HTTPS or localhost
    if (
      location.protocol !== "https:" &&
      location.hostname !== "localhost" &&
      location.hostname !== "127.0.0.1"
    ) {
      setCallStatus("HTTPS required for microphone access");
      alert(
        "This app requires HTTPS to access the microphone. Please use HTTPS or localhost."
      );
      return;
    }

    if (!checkMediaSupport()) {
      setCallStatus("Microphone access not supported");
      alert(
        "Your browser doesn't support microphone access. Please use a modern browser like Chrome, Firefox, or Safari."
      );
      return;
    }

    setIsCalling(true);
    setCallStatus("Requesting microphone access...");

    try {
      const stream = await getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setCallStatus("Calling...");

      // Set local audio stream
      if (audioRef.current) {
        audioRef.current.srcObject = stream;
      }

      peerRef.current = new SimplePeer({
        initiator: true,
        trickle: false,
        stream,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
          ],
        },
      });

      console.log("Peer instance created:", peerRef.current);

      peerRef.current.on("signal", (data) => {
        console.log("Signal event:", data.type);
        if (data.type === "offer") {
          socket.emit("call-user", { to: targetId, offer: data });
        } else if (data.candidate) {
          socket.emit("ice-candidate", { to: targetId, candidate: data });
        }
      });

      peerRef.current.on("stream", (remoteStream) => {
        console.log("Remote stream received");
        if (audioRef.current) {
          audioRef.current.srcObject = remoteStream;
        }
        setCallStatus("Connected");
      });

      peerRef.current.on("connect", () => {
        console.log("Peer connected");
        setCallStatus("Connected");
      });

      peerRef.current.on("error", (err) => {
        console.error("Peer error:", err);
        setCallStatus("Call failed: " + err.message);
        endCall();
      });

      peerRef.current.on("close", () => {
        console.log("Peer connection closed");
        endCall();
      });
    } catch (err) {
      console.error("Media error:", err);
      setCallStatus("Failed to access microphone: " + err.message);
      endCall();
    }
  };

  const getConnectionStatus = () => {
    if (!SimplePeer) return "Loading WebRTC library...";
    if (!checkMediaSupport())
      return "Microphone access not supported in this browser";
    if (
      location.protocol !== "https:" &&
      location.hostname !== "localhost" &&
      location.hostname !== "127.0.0.1"
    ) {
      return "HTTPS required for microphone access";
    }
    if (!socket) return "Initializing...";
    if (!socket.connected) return "Connecting to server...";
    if (!userId) return "Enter your ID to continue";
    return callStatus || "Ready";
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>Anonymous Voice Call</h1>

      <div style={{ marginBottom: "10px" }}>
        <label>Your ID: </label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="e.g., user_abc123"
          disabled={isCalling}
          style={{
            padding: "8px",
            marginLeft: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label>Call ID: </label>
        <input
          type="text"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          placeholder="e.g., user_bcd456"
          disabled={isCalling}
          style={{
            padding: "8px",
            marginLeft: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        {!isCalling ? (
          <button
            onClick={startCall}
            disabled={!userId || !targetId || !socket?.connected || !SimplePeer}
            style={{
              padding: "10px 20px",
              backgroundColor:
                !userId || !targetId || !socket?.connected || !SimplePeer
                  ? "#ccc"
                  : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor:
                !userId || !targetId || !socket?.connected || !SimplePeer
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Start Call
          </button>
        ) : (
          <button
            onClick={endCall}
            style={{
              padding: "10px 20px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            End Call
          </button>
        )}
      </div>

      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "#f8f9fa",
          borderRadius: "4px",
          border: "1px solid #dee2e6",
        }}
      >
        <p>
          <strong>Status:</strong> {getConnectionStatus()}
        </p>
        {socket?.connected && userId && (
          <p>
            <strong>Connected as:</strong> {userId}
          </p>
        )}
      </div>

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
