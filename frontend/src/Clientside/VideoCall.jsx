import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Maximize,
  Minimize,
} from "lucide-react";

const CallContainer = styled.div`
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 9999;
  display: flex;
  flex-direction: column;
`;

const VideoGrid = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: ${(p) => (p.$fullscreen ? "1fr" : "1fr 1fr")};
  gap: 10px;
  padding: 10px;
  position: relative;
  height: calc(100vh - 96px);
  min-height: 400px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    height: calc(100vh - 96px);
  }
`;

const VideoBox = styled.div`
  position: relative;
  background: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  height: 100%;
  width: 100%;

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const LocalVideoBox = styled(VideoBox)`
  ${(p) =>
    p.$pip
      ? `
    position: absolute;
    bottom: 80px;
    right: 20px;
    width: 280px;
    height: 210px;
    min-height: 210px;
    z-index: 10;
    border: 3px solid #4f46e5;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  `
      : `
    min-height: 300px;
  `}

  video {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    display: block !important;
  }
`;

const Label = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.9);
`;

const ControlButton = styled.button`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: ${(p) => (p.$active ? "#4f46e5" : "#374151")};
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.1);
    background: ${(p) => (p.$danger ? "#ef4444" : "#4f46e5")};
  }

  ${(p) =>
    p.$danger &&
    `
    background: #ef4444;
  `}
`;

const StatusMessage = styled.div`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 24px;
  border-radius: 999px;
  font-weight: 700;
  z-index: 100;
`;

const VideoCall = ({
  appointmentId,
  userRole,
  userName,
  onEnd,
  isInitiator,
  socket: existingSocket,
}) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [peerConnectionReady, setPeerConnectionReady] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(
    isInitiator ? "Calling..." : "Connecting...",
  );

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const initialized = useRef(false);
  const socketRef = useRef(null);
  const acceptedRef = useRef(false);
  const userJoinedRef = useRef(false);
  const offerSentRef = useRef(false);

  const configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  useEffect(() => {
    if (initialized.current) {
      console.log("[VideoCall] Already initialized, skipping media setup");
      return;
    }

    initialized.current = true;
    console.log("[VideoCall] Initializing for the first time");
    initializeCall();

    return () => {
      console.log("[VideoCall] Cleanup on unmount");
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Define cleanup and handleEndCall before the listener setup effect
  const cleanup = React.useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    // Remove socket listeners - socket is managed by parent component, don't disconnect
    const socketToClean = socketRef.current;
    if (socketToClean) {
      socketToClean.off("call-accepted");
      socketToClean.off("offer");
      socketToClean.off("answer");
      socketToClean.off("ice-candidate");
      socketToClean.off("user-joined");
    }
    // reset synchronization refs so future mounts start fresh
    acceptedRef.current = false;
    userJoinedRef.current = false;
    offerSentRef.current = false;
    setPeerConnectionReady(false);
  }, [localStream]);

  const handleEndCall = React.useCallback(() => {
    cleanup();
    if (onEnd) onEnd();
  }, [cleanup, onEnd]);

  // Separate effect to ensure listeners are always set up
  useEffect(() => {
    if (!socketRef.current || !peerConnection.current) {
      console.log("[VideoCall] Waiting for socket and peer connection");
      return;
    }

    const newSocket = socketRef.current;
    console.log("[VideoCall] Setting up socket listeners for offer/answer/ICE");

    // Ensure clean listener setup - remove old ones first
    newSocket.off("call-accepted");
    newSocket.off("call-declined");
    newSocket.off("user-joined");
    newSocket.off("offer");
    newSocket.off("answer");
    newSocket.off("ice-candidate");
    newSocket.off("user-left");

    // Helper to create and send offer once
    const createAndSendOffer = async () => {
      if (offerSentRef.current) return;
      if (!peerConnection.current) {
        console.warn("[VideoCall] PeerConnection not ready yet");
        return;
      }
      try {
        console.log("[VideoCall] Creating offer (synchronized)");
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        console.log("[VideoCall] Offer created and set as local description");
        console.log("[VideoCall] Sending offer to room:", appointmentId);
        newSocket.emit("offer", { appointmentId, offer });
        offerSentRef.current = true;
        console.log("[VideoCall] Offer emitted");
      } catch (err) {
        console.error("[VideoCall] Error creating/sending offer:", err);
      }
    };

    // Listen for call acceptance
    newSocket.on("call-accepted", async () => {
      console.log("Call accepted by other party");
      setConnectionStatus("Call accepted, connecting...");
      acceptedRef.current = true;
      if (userJoinedRef.current) {
        await createAndSendOffer();
      }
    });

    // Listen for call decline
    newSocket.on("call-declined", () => {
      console.log("Call declined by other party");
      setConnectionStatus("Call declined");
      setTimeout(() => handleEndCall(), 2000);
    });

    // Listen for user joined
    newSocket.on("user-joined", async ({ userId }) => {
      console.log("User joined:", userId);
      setConnectionStatus("User joined, waiting for connection...");
      userJoinedRef.current = true;
      if (acceptedRef.current && isInitiator) {
        await createAndSendOffer();
      }
    });

    // Listen for offer
    newSocket.on("offer", async ({ offer }) => {
      console.log("[VideoCall] Received offer, creating answer");
      try {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(offer),
        );
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        console.log("[VideoCall] Sending answer");
        newSocket.emit("answer", { appointmentId, answer });
      } catch (err) {
        console.error("[VideoCall] Error handling offer:", err);
      }
    });

    // Listen for answer
    newSocket.on("answer", async ({ answer }) => {
      console.log("[VideoCall] Received answer");
      try {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(answer),
        );
        console.log("[VideoCall] Answer set, waiting for ICE candidates");
      } catch (err) {
        console.error("[VideoCall] Error handling answer:", err);
      }
    });

    // Listen for ICE candidates
    newSocket.on("ice-candidate", async ({ candidate }) => {
      try {
        if (candidate) {
          console.log("[VideoCall] Adding ICE candidate");
          await peerConnection.current.addIceCandidate(
            new RTCIceCandidate(candidate),
          );
        }
      } catch (err) {
        console.error("[VideoCall] Error adding ICE candidate:", err);
      }
    });

    // Listen for user left
    newSocket.on("user-left", () => {
      setConnectionStatus("Other party disconnected");
      setTimeout(() => handleEndCall(), 2000);
    });

    return () => {
      // Cleanup listeners when socket changes or component unmounts
      newSocket.off("call-accepted");
      newSocket.off("call-declined");
      newSocket.off("user-joined");
      newSocket.off("offer");
      newSocket.off("answer");
      newSocket.off("ice-candidate");
      newSocket.off("user-left");
    };
  }, [isInitiator, appointmentId, peerConnectionReady, handleEndCall]);

  const initializeCall = async () => {
    try {
      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Use existing socket from MyAppointments or DoctorPanel
      const socketToUse = existingSocket || socketRef.current;
      if (!socketToUse) {
        throw new Error("No socket available - socket must be passed as prop");
      }

      console.log("[VideoCall] Using socket:", socketToUse.id);
      socketRef.current = socketToUse;

      // Join the appointment room (isolated by appointmentId)
      console.log(
        "[VideoCall] Joining room:",
        appointmentId,
        "as",
        userRole,
        userName,
      );
      socketToUse.emit("join-room", { appointmentId, userRole, userName });

      // If initiator, send call notification to the other person
      if (isInitiator) {
        console.log(
          "[VideoCall] Initiating call to appointment:",
          appointmentId,
        );
        socketToUse.emit("initiate-call", {
          appointmentId,
          callerRole: userRole,
          callerName: userName,
        });
        console.log("[VideoCall] Call initiation sent");
      } else {
        console.log("[VideoCall] Not initiator, waiting for connection");
      }

      // Setup peer connection (listeners will be set up in separate effect)
      peerConnection.current = new RTCPeerConnection(configuration);

      // Add local stream tracks to peer connection
      stream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, stream);
      });

      // Signal that peer connection is ready for listener setup
      setPeerConnectionReady(true);

      // Handle incoming remote stream
      peerConnection.current.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
        setConnectionStatus("Connected");
      };

      // Handle ICE candidates
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("[VideoCall] Sending ICE candidate");
          socketToUse.emit("ice-candidate", {
            appointmentId,
            candidate: event.candidate,
          });
        }
      };

      // Monitor connection state
      peerConnection.current.onconnectionstatechange = () => {
        const state = peerConnection.current.connectionState;
        if (state === "connected") {
          setConnectionStatus("Connected");
        } else if (state === "disconnected" || state === "failed") {
          setConnectionStatus("Connection lost");
        }
      };
    } catch (error) {
      console.error("Failed to initialize call:", error);
      setConnectionStatus("Failed to access camera/microphone");
      alert(
        "Could not access camera or microphone. Please check permissions and try again.",
      );
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setVideoEnabled(videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setAudioEnabled(audioTrack.enabled);
    }
  };

  return (
    <CallContainer>
      <StatusMessage>{connectionStatus}</StatusMessage>

      <VideoGrid $fullscreen={isFullscreen}>
        {!isFullscreen && (
          <VideoBox>
            <video ref={remoteVideoRef} autoPlay playsInline />
            <Label>
              {remoteStream
                ? "Other Participant"
                : "Waiting for participant..."}
            </Label>
          </VideoBox>
        )}

        <LocalVideoBox $pip={isFullscreen}>
          <video ref={localVideoRef} autoPlay playsInline muted />
          <Label>You ({userName})</Label>
        </LocalVideoBox>

        {isFullscreen && remoteStream && (
          <VideoBox style={{ gridColumn: "1 / -1" }}>
            <video ref={remoteVideoRef} autoPlay playsInline />
            <Label>Other Participant</Label>
          </VideoBox>
        )}
      </VideoGrid>

      <Controls>
        <ControlButton $active={videoEnabled} onClick={toggleVideo}>
          {videoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
        </ControlButton>

        <ControlButton $active={audioEnabled} onClick={toggleAudio}>
          {audioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
        </ControlButton>

        <ControlButton onClick={() => setIsFullscreen(!isFullscreen)}>
          {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
        </ControlButton>

        <ControlButton $danger onClick={handleEndCall}>
          <PhoneOff size={24} />
        </ControlButton>
      </Controls>
    </CallContainer>
  );
};

export default VideoCall;
