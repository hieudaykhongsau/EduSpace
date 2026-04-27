import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Box,
  HStack,
  IconButton
} from '@chakra-ui/react';
import { Camera, X, Check } from 'lucide-react';

const PhotoCaptureModal = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Lỗi khi mở camera chụp ảnh:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      // Lật ngược ảnh để giống soi gương
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedImage(dataUrl);
      stopCamera(); // Dừng camera sau khi chụp
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="2xl">
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent bg="surface-container" color="white">
        <ModalHeader>Chụp ảnh</ModalHeader>
        <ModalBody display="flex" justifyContent="center">
          <Box position="relative" w="100%" maxW="600px" borderRadius="md" overflow="hidden" bg="black">
            {!capturedImage ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                style={{ width: '100%', transform: 'scaleX(-1)' }}
              />
            ) : (
              <img src={capturedImage} alt="Captured" style={{ width: '100%' }} />
            )}
            {/* Ẩn canvas dùng để vẽ ảnh */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </Box>
        </ModalBody>
        <ModalFooter justifyContent="center">
          {!capturedImage ? (
            <IconButton 
              icon={<Camera size={24} />} 
              isRound 
              colorScheme="blue" 
              size="lg" 
              onClick={takePhoto} 
            />
          ) : (
            <HStack spacing={4}>
              <Button leftIcon={<X />} colorScheme="red" variant="outline" onClick={retakePhoto}>
                Chụp lại
              </Button>
              <Button leftIcon={<Check />} colorScheme="green" onClick={handleConfirm}>
                Gửi ảnh
              </Button>
            </HStack>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PhotoCaptureModal;
