import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  HStack,
  VStack,
  Box,
  Text,
  IconButton
} from '@chakra-ui/react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Camera } from 'lucide-react';

const VideoCallModal = ({ isOpen, onClose, peerName }) => {
  const localVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [mics, setMics] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [selectedMic, setSelectedMic] = useState('');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);

  useEffect(() => {
    if (isOpen) {
      getDevices();
    } else {
      stopMedia();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && (selectedCamera || selectedMic)) {
      startMedia();
    }
  }, [selectedCamera, selectedMic]);

  const getDevices = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(t => t.stop()); // Tắt liền, chỉ để lấy quyền

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput' && d.deviceId !== 'default');
      const audioDevices = devices.filter(d => d.kind === 'audioinput' && d.deviceId !== 'default');

      setCameras(videoDevices);
      setMics(audioDevices);

      if (videoDevices.length > 0) setSelectedCamera(videoDevices[0].deviceId);
      if (audioDevices.length > 0) setSelectedMic(audioDevices[0].deviceId);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách thiết bị', err);
    }
  };

  const startMedia = async () => {
    stopMedia(); // Dừng stream cũ

    const constraints = {
      video: selectedCamera ? { deviceId: { exact: selectedCamera }, width: 1280, height: 720 } : true,
      audio: selectedMic ? { deviceId: { exact: selectedMic }, echoCancellation: true } : true
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Lỗi khi mở camera/mic', err);
    }
  };

  const stopMedia = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const toggleCam = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCamOn(videoTrack.enabled);
      }
    }
  };

  const handleEndCall = () => {
    stopMedia();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleEndCall} size="4xl" isCentered>
      <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(10px)" />
      <ModalContent bg="#202124" color="white" borderRadius="xl" overflow="hidden">
        <ModalHeader bg="rgba(0,0,0,0.5)">
          Cuộc gọi Video với {peerName || 'Ai đó'}
        </ModalHeader>
        <ModalBody p={0} position="relative" display="flex" justifyContent="center" bg="black">
          
          <Box position="relative" w="100%" maxW="960px" aspectRatio="16/9" bg="black">
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: isCamOn ? 'block' : 'none' }}
            />
            {!isCamOn && (
              <Flex position="absolute" top="0" left="0" w="100%" h="100%" align="center" justify="center" bg="#2a2b2e">
                <Text fontSize="xl" color="#9aa0a6">Camera đang tắt</Text>
              </Flex>
            )}
          </Box>

          {/* Thanh Điều Khiển */}
          <HStack 
            position="absolute" 
            bottom="20px" 
            bg="rgba(60, 64, 67, 0.8)" 
            backdropFilter="blur(10px)"
            borderRadius="full"
            px={6}
            py={3}
            spacing={4}
          >
            <IconButton 
              icon={isMicOn ? <Mic /> : <MicOff />} 
              isRound 
              colorScheme={isMicOn ? 'blue' : 'red'}
              variant={isMicOn ? 'solid' : 'solid'}
              onClick={toggleMic}
            />
            <IconButton 
              icon={isCamOn ? <Video /> : <VideoOff />} 
              isRound 
              colorScheme={isCamOn ? 'blue' : 'red'}
              onClick={toggleCam}
            />
            
            <Select w="150px" size="sm" bg="blackAlpha.600" border="none" color="white" value={selectedCamera} onChange={(e) => setSelectedCamera(e.target.value)}>
              {cameras.map(c => <option key={c.deviceId} value={c.deviceId} style={{ color: 'black' }}>{c.label || 'Camera'}</option>)}
            </Select>

            <Select w="150px" size="sm" bg="blackAlpha.600" border="none" color="white" value={selectedMic} onChange={(e) => setSelectedMic(e.target.value)}>
              {mics.map(m => <option key={m.deviceId} value={m.deviceId} style={{ color: 'black' }}>{m.label || 'Microphone'}</option>)}
            </Select>

            <IconButton 
              icon={<PhoneOff />} 
              isRound 
              colorScheme="red"
              size="lg"
              onClick={handleEndCall}
            />
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default VideoCallModal;
