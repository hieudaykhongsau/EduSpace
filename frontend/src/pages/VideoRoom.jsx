import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box, Flex, Grid, Text, IconButton, HStack, VStack, Avatar,
  Badge, Tooltip, useToast, Spinner, Heading, Button
} from '@chakra-ui/react';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, Users,
  MessageSquare, Copy, CheckCircle, Settings
} from 'lucide-react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axiosConfig';

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun.cloudflare.com:3478" },
    {
      urls: "stun:stun.relay.metered.ca:80",
    },
    {
      urls: "turn:global.relay.metered.ca:80",
      username: "c0ef8a87f7de91c23329b691",
      credential: "pgmtblHHjlJbJAjK",
    },
    {
      urls: "turn:global.relay.metered.ca:80?transport=tcp",
      username: "c0ef8a87f7de91c23329b691",
      credential: "pgmtblHHjlJbJAjK",
    },
    {
      urls: "turn:global.relay.metered.ca:443",
      username: "c0ef8a87f7de91c23329b691",
      credential: "pgmtblHHjlJbJAjK",
    },
    {
      urls: "turns:global.relay.metered.ca:443?transport=tcp",
      username: "c0ef8a87f7de91c23329b691",
      credential: "pgmtblHHjlJbJAjK",
    },
  ],
  iceCandidatePoolSize: 10
};

const WS_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') + '/ws';

const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

// ─── Remote Peer Video ──────────────────────────────────────────────────────
function RemoteVideo({ stream, peer, isCamOn = true }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      // Đảm bảo video play khi nhận stream mới
      videoRef.current.play().catch(() => { });
    }
  }, [stream]);

  // Kiểm tra stream có video track enabled không
  const hasActiveVideo = stream && stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled;
  const showVideo = isCamOn && hasActiveVideo;

  return (
    <Box position="relative" bg="#1a1b1e" borderRadius="xl" overflow="hidden" aspectRatio="16/9">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)',
          display: showVideo ? 'block' : 'none'
        }}
      />
      {!showVideo && (
        <Flex position="absolute" top={0} left={0} w="full" h="full" align="center" justify="center" direction="column" gap={3} bg="#1a1b1e">
          <Avatar size="xl" name={peer?.fullName} getInitials={getInitials} src={peer?.avatarUrl} bg="purple.600" color="white" />
          <Text color="gray.300" fontSize="sm">{peer?.fullName || 'Peer'}</Text>
        </Flex>
      )}
      <Box position="absolute" bottom={3} left={3}>
        <Badge bg="blackAlpha.700" color="white" px={2} py={1} borderRadius="md" fontSize="xs">
          {peer?.fullName || 'Peer'}
        </Badge>
      </Box>
    </Box>
  );
}

// ─── Main VideoRoom ──────────────────────────────────────────────────────────
export default function VideoRoom() {
  const { roomCode: paramRoomCode } = useParams();
  const [searchParams] = useSearchParams();
  const roomCode = paramRoomCode || searchParams.get('code');

  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  // Media refs
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  // STOMP client ref
  const stompClientRef = useRef(null);
  const myPrincipalRef = useRef(null);

  // Peer connections: Map<principalName, RTCPeerConnection>
  const peerConnectionsRef = useRef({});
  // Remote streams: Map<principalName, MediaStream>
  const [remoteStreams, setRemoteStreams] = useState({}); // { principalName: { stream, peer } }
  // Remote peers info
  const peersInfoRef = useRef({});
  // ICE candidate queue
  const iceCandidateQueueRef = useRef({});

  // UI state
  const [remoteCamStates, setRemoteCamStates] = useState({});
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const isCamOnRef = useRef(true);
  const [isLoading, setIsLoading] = useState(true);
  const [roomInfo, setRoomInfo] = useState(null);
  const [copied, setCopied] = useState(false);
  const [participants, setParticipants] = useState([]);

  // ── Step 1: Get local media ─────────────────────────────────────────────────
  const initLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // Những thông số mở rộng dưới đây sẽ giúp lọc tạp âm tốt hơn trên một số trình duyệt
          advanced: [{ googEchoCancellation: true, googNoiseSuppression: true, googHighpassFilter: true }]
        }
      });
      localStreamRef.current = stream;
      // Không gán trực tiếp ở đây vì video ref có thể chưa mount
      return stream;
    } catch (err) {
      toast({ title: 'Camera/Mic access denied', description: err.message, status: 'error' });
      throw err;
    }
  };

  // Hiệu ứng để gán stream vào video element khi nó xuất hiện trong DOM
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current && !isLoading) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [isLoading, isCamOn]); // Chạy lại khi hết loading hoặc khi bật/tắt cam

  // ── Step 2: Create peer connection for a remote peer ────────────────────────
  const createPeerConnection = useCallback((targetPrincipal, peerInfo) => {
    // Nếu đã có connection, đóng cái cũ và tạo mới để tránh stale state
    if (peerConnectionsRef.current[targetPrincipal]) {
      peerConnectionsRef.current[targetPrincipal].close();
      delete peerConnectionsRef.current[targetPrincipal];
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle remote tracks
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        setRemoteStreams(prev => ({
          ...prev,
          [targetPrincipal]: { stream: remoteStream, peer: peerInfo }
        }));
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && stompClientRef.current?.connected) {
        stompClientRef.current.publish({
          destination: `/app/signal/ice-candidate/${roomCode}`,
          body: JSON.stringify({
            type: 'ice-candidate',
            senderId: myPrincipalRef.current,
            targetId: targetPrincipal,
            roomCode,
            payload: event.candidate
          })
        });
      }
    };

    // ICE connection state — xử lý restart khi failed
    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'failed') {
        pc.restartIce();
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed') {
        // Xóa peer và tạo lại offer
        pc.close();
        delete peerConnectionsRef.current[targetPrincipal];
        setRemoteStreams(prev => {
          const next = { ...prev };
          delete next[targetPrincipal];
          return next;
        });
      }
    };

    peerConnectionsRef.current[targetPrincipal] = pc;
    return pc;
  }, [roomCode]);

  // ── Step 3: Initiate offer to a peer ────────────────────
  const createOffer = useCallback(async (targetPrincipal, peerInfo) => {
    const pc = createPeerConnection(targetPrincipal, peerInfo);
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      stompClientRef.current?.publish({
        destination: `/app/signal/offer/${roomCode}`,
        body: JSON.stringify({
          type: 'offer',
          senderId: myPrincipalRef.current,
          targetId: targetPrincipal,
          roomCode,
          payload: offer
        })
      });
    } catch (err) {
      console.error('Error creating offer:', err);
    }
  }, [createPeerConnection, roomCode]);

  // ── Step 4: Handle incoming offer ────────────────
  const handleOffer = useCallback(async (message) => {
    const { senderId, payload } = message;
    const peerInfo = peersInfoRef.current[senderId] || { principalName: senderId };
    const pc = createPeerConnection(senderId, peerInfo);

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(payload));

      // Process any queued ICE candidates
      if (iceCandidateQueueRef.current[senderId]) {
        for (const candidate of iceCandidateQueueRef.current[senderId]) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error('Error adding queued ICE candidate (offer):', e);
          }
        }
        iceCandidateQueueRef.current[senderId] = [];
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      stompClientRef.current?.publish({
        destination: `/app/signal/answer/${roomCode}`,
        body: JSON.stringify({
          type: 'answer',
          senderId: myPrincipalRef.current,
          targetId: senderId,
          roomCode,
          payload: answer
        })
      });
    } catch (err) {
      console.error('Error handling offer:', err);
    }
  }, [createPeerConnection, roomCode]);

  // ── Step 5: Handle incoming answer ───────────────
  const handleAnswer = useCallback(async (message) => {
    const { senderId, payload } = message;
    const pc = peerConnectionsRef.current[senderId];
    if (pc) {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(payload));

        // Process any queued ICE candidates
        if (iceCandidateQueueRef.current[senderId]) {
          for (const candidate of iceCandidateQueueRef.current[senderId]) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
              console.error('Error adding queued ICE candidate (answer):', e);
            }
          }
          iceCandidateQueueRef.current[senderId] = [];
        }
      } catch (err) {
        console.error('Error handling answer:', err);
      }
    }
  }, []);

  // ── Step 6: Handle ICE candidate ─────────────
  const handleIceCandidate = useCallback(async (message) => {
    const { senderId, payload } = message;
    const pc = peerConnectionsRef.current[senderId];
    if (payload) {
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(payload));
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      } else {
        if (!iceCandidateQueueRef.current[senderId]) {
          iceCandidateQueueRef.current[senderId] = [];
        }
        iceCandidateQueueRef.current[senderId].push(payload);
      }
    }
  }, []);

  // ── Main init ─────────
  useEffect(() => {
    if (!roomCode || !user) return;

    let stompClient;
    let isCleanedUp = false;

    // Hàm dọn dẹp tất cả peer connections (dùng khi reconnect hoặc unmount)
    const cleanupAllPeers = () => {
      Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
      peerConnectionsRef.current = {};
      iceCandidateQueueRef.current = {};
      peersInfoRef.current = {};
      setRemoteStreams({});
      setParticipants([]);
      setRemoteCamStates({});
    };

    const init = async () => {
      setIsLoading(true);

      // Fetch room info
      try {
        const res = await api.get(`/api/guest/room/${roomCode}`);
        setRoomInfo(res.data);
      } catch (err) {
        toast({ title: 'Room not found', status: 'error' });
        navigate('/');
        return;
      }

      // Get local media
      try {
        await initLocalStream();
      } catch {
        // User denied — continue without media
      }

      // Connect STOMP
      const token = localStorage.getItem('jwtToken');
      stompClient = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        onConnect: (frame) => {
          if (isCleanedUp) return;

          // Khi reconnect, dọn dẹp peer connections cũ đã stale
          cleanupAllPeers();

          // Subscribe: existing peers list (sent only to me when I join)
          stompClient.subscribe(
            `/user/queue/room/${roomCode}/existing-peers`,
            (msg) => {
              const existingPeers = JSON.parse(msg.body);

              // TÌM principalName CỦA CHÍNH MÌNH từ danh sách backend trả về
              // Backend dùng authentication.getName() = email (do Guest.getUsername() trả về email)
              // Nên ta không hardcode user.username nữa, mà lấy đúng giá trị backend dùng.
              const myPeer = existingPeers.find(p => p.userId === user.userId);
              if (myPeer) {
                myPrincipalRef.current = myPeer.principalName;
              } else {
                // Fallback: dùng email vì Guest.getUsername() trả về email
                myPrincipalRef.current = user.email;
              }

              console.log('My principalName:', myPrincipalRef.current);
              console.log('Existing peers:', existingPeers);

              existingPeers.forEach(peer => {
                if (peer.principalName !== myPrincipalRef.current) {
                  peersInfoRef.current[peer.principalName] = peer;
                  setParticipants(prev => [...prev.filter(p => p.principalName !== peer.principalName), peer]);
                  createOffer(peer.principalName, peer);
                }
              });
            }
          );

          // Subscribe: new peer joined (broadcast)
          stompClient.subscribe(
            `/topic/room/${roomCode}/peer-joined`,
            (msg) => {
              const peer = JSON.parse(msg.body);
              if (peer.principalName !== myPrincipalRef.current) {
                peersInfoRef.current[peer.principalName] = peer;
                setParticipants(prev => [...prev.filter(p => p.principalName !== peer.principalName), peer]);
                toast({ title: `${peer.fullName || 'Someone'} joined`, status: 'info', duration: 2000 });

                // Trả lời trạng thái camera hiện tại của mình cho người mới vào
                stompClient.publish({
                  destination: `/topic/room/${roomCode}/cam-state`,
                  body: JSON.stringify({ principalName: myPrincipalRef.current, isCamOn: isCamOnRef.current })
                });
              }
            }
          );

          // Subscribe: cam state updates
          stompClient.subscribe(`/topic/room/${roomCode}/cam-state`, (msg) => {
            const { principalName, isCamOn: remoteCamState } = JSON.parse(msg.body);
            if (principalName !== myPrincipalRef.current) {
              setRemoteCamStates(prev => ({ ...prev, [principalName]: remoteCamState }));
            }
          });

          // Subscribe: peer left
          stompClient.subscribe(
            `/topic/room/${roomCode}/peer-left`,
            (msg) => {
              const leftUserId = JSON.parse(msg.body);
              setParticipants(prev => prev.filter(p => p.userId !== leftUserId));
              // Clean up pc
              const targetPrincipal = Object.keys(peersInfoRef.current)
                .find(k => peersInfoRef.current[k].userId === leftUserId);
              if (targetPrincipal) {
                const leftUserName = peersInfoRef.current[targetPrincipal].fullName || peersInfoRef.current[targetPrincipal].principalName || 'Someone';
                toast({ title: `${leftUserName} left the room`, status: 'info', duration: 2000 });

                peerConnectionsRef.current[targetPrincipal]?.close();
                delete peerConnectionsRef.current[targetPrincipal];
                delete peersInfoRef.current[targetPrincipal];
                setRemoteStreams(prev => {
                  const next = { ...prev };
                  delete next[targetPrincipal];
                  return next;
                });
                setRemoteCamStates(prev => {
                  const next = { ...prev };
                  delete next[targetPrincipal];
                  return next;
                });
              }
            }
          );

          // Subscribe: incoming WebRTC signals
          stompClient.subscribe(`/user/queue/room/${roomCode}/offer`, (msg) => {
            handleOffer(JSON.parse(msg.body));
          });
          stompClient.subscribe(`/user/queue/room/${roomCode}/answer`, (msg) => {
            handleAnswer(JSON.parse(msg.body));
          });
          stompClient.subscribe(`/user/queue/room/${roomCode}/ice-candidate`, (msg) => {
            handleIceCandidate(JSON.parse(msg.body));
          });

          // Join the room (signal)
          stompClient.publish({ destination: `/app/signal/join/${roomCode}`, body: '{}' });
          setIsLoading(false);
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame);
          toast({ title: 'Connection error', description: 'Attempting to reconnect...', status: 'error', duration: 3000 });
        },
        onWebSocketClose: () => {
          console.log('WebSocket closed, will attempt reconnect...');
        }
      });

      stompClient.activate();
      stompClientRef.current = stompClient;
    };

    init();

    return () => {
      // Cleanup on unmount
      isCleanedUp = true;
      stompClient?.deactivate();
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      cleanupAllPeers();
    };
  }, [roomCode, user]);

  // ── Controls ─────────────────────────────────────────────────────────────────
  const toggleMic = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  };

  const toggleCam = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCamOn(videoTrack.enabled);
      isCamOnRef.current = videoTrack.enabled;

      // Bắn trạng thái cam cho mọi người trong phòng
      stompClientRef.current?.publish({
        destination: `/topic/room/${roomCode}/cam-state`,
        body: JSON.stringify({ principalName: myPrincipalRef.current, isCamOn: videoTrack.enabled })
      });
    }
  };

  const handleLeave = async () => {
    try {
      await api.post(`/api/guest/room/${roomCode}/leave`);
    } catch { /* ignore */ }
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    stompClientRef.current?.deactivate();
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    navigate('/');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const remotePeersList = Object.entries(remoteStreams);
  const totalPeers = 1 + remotePeersList.length; // self + remote

  // Grid layout
  const gridCols = totalPeers === 1 ? 1 : totalPeers <= 4 ? 2 : 3;

  return (
    <Box bg="#0f1012" minH="100vh" display="flex" flexDirection="column" color="white">
      {/* Header */}
      <Flex
        px={6} py={3} bg="rgba(0,0,0,0.5)" backdropFilter="blur(10px)"
        align="center" justify="space-between" borderBottom="1px solid rgba(255,255,255,0.1)"
      >
        <HStack spacing={4}>
          <Heading size="sm" color="white">{roomInfo?.roomName || 'Study Room'}</Heading>
          <Badge colorScheme="green" variant="subtle" fontSize="xs">
            {isLoading ? 'Connecting...' : 'Live'}
          </Badge>
        </HStack>

        <HStack spacing={3}>
          <HStack spacing={1} bg="whiteAlpha.100" px={3} py={1} borderRadius="full">
            <Users size={14} />
            <Text fontSize="xs">{totalPeers} {totalPeers === 1 ? 'person' : 'people'}</Text>
          </HStack>
          <Tooltip label={copied ? 'Copied!' : 'Copy Room Code'}>
            <Button
              size="xs" leftIcon={copied ? <CheckCircle size={12} /> : <Copy size={12} />}
              variant="outline" colorScheme={copied ? 'green' : 'whiteAlpha'}
              color="white" borderColor="whiteAlpha.400"
              onClick={copyCode}
            >
              {roomCode}
            </Button>
          </Tooltip>
        </HStack>
      </Flex>

      {/* Main content */}
      {isLoading ? (
        <Flex flex={1} align="center" justify="center" direction="column" gap={4}>
          <Spinner size="xl" color="purple.400" thickness="3px" />
          <Text color="gray.400">Connecting to room...</Text>
        </Flex>
      ) : (
        <Box flex={1} p={4} overflow="auto">
          <Grid
            templateColumns={`repeat(${gridCols}, 1fr)`}
            gap={4}
            maxW={totalPeers === 1 ? '800px' : '100%'}
            mx="auto"
          >
            {/* Local video */}
            <Box position="relative" bg="#1a1b1e" borderRadius="xl" overflow="hidden" aspectRatio="16/9"
              outline={isCamOn ? '2px solid' : 'none'} outlineColor="purple.400">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  transform: 'scaleX(-1)',
                  display: isCamOn ? 'block' : 'none'
                }}
              />
              {!isCamOn && (
                <Flex h="full" align="center" justify="center" direction="column" gap={3}>
                  <Avatar
                    size="xl"
                    src={user?.avatarUrl || undefined}
                    name={user?.fullName}
                    getInitials={getInitials}
                    bg="purple.600" color="white"
                  />
                  <Text color="gray.300" fontSize="sm">Camera off</Text>
                </Flex>
              )}
              <Box position="absolute" bottom={3} left={3}>
                <HStack spacing={1}>
                  <Badge bg="purple.600" color="white" px={2} py={1} borderRadius="md" fontSize="xs">
                    You
                  </Badge>
                  {!isMicOn && <Badge bg="red.600" color="white" px={1} borderRadius="md" fontSize="xs">🔇</Badge>}
                </HStack>
              </Box>
            </Box>

            {/* Remote videos */}
            {remotePeersList.map(([principal, { stream, peer }]) => (
              <RemoteVideo key={principal} stream={stream} peer={peer} isCamOn={remoteCamStates[principal] ?? true} />
            ))}
          </Grid>

          {/* Empty state — waiting for others */}
          {remotePeersList.length === 0 && !isLoading && (
            <Flex justify="center" mt={8}>
              <VStack spacing={2} bg="whiteAlpha.50" px={8} py={6} borderRadius="xl">
                <Users size={32} color="#9b59b6" />
                <Text color="gray.400">Waiting for others to join...</Text>
                <Text fontSize="xs" color="gray.500">Share the room code: <b style={{ color: '#a78bfa' }}>{roomCode}</b></Text>
              </VStack>
            </Flex>
          )}
        </Box>
      )}

      {/* Controls Bar */}
      <Flex
        justify="center" align="center" py={5}
        bg="rgba(0,0,0,0.7)" backdropFilter="blur(10px)"
        borderTop="1px solid rgba(255,255,255,0.08)"
        gap={4}
      >
        <Tooltip label={isMicOn ? 'Mute Mic' : 'Unmute Mic'}>
          <IconButton
            icon={isMicOn ? <Mic size={22} /> : <MicOff size={22} />}
            isRound size="lg"
            bg={isMicOn ? 'whiteAlpha.200' : 'red.500'}
            color="white"
            _hover={{ bg: isMicOn ? 'whiteAlpha.300' : 'red.600' }}
            onClick={toggleMic}
            aria-label="Toggle mic"
          />
        </Tooltip>
        <Tooltip label={isCamOn ? 'Turn off Camera' : 'Turn on Camera'}>
          <IconButton
            icon={isCamOn ? <Video size={22} /> : <VideoOff size={22} />}
            isRound size="lg"
            bg={isCamOn ? 'whiteAlpha.200' : 'red.500'}
            color="white"
            _hover={{ bg: isCamOn ? 'whiteAlpha.300' : 'red.600' }}
            onClick={toggleCam}
            aria-label="Toggle camera"
          />
        </Tooltip>
        <Tooltip label="Leave Room">
          <IconButton
            icon={<PhoneOff size={22} />}
            isRound size="lg"
            bg="red.500"
            color="white"
            _hover={{ bg: 'red.600', transform: 'scale(1.05)' }}
            onClick={handleLeave}
            aria-label="Leave room"
          />
        </Tooltip>
      </Flex>
    </Box>
  );
}
