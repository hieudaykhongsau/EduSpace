import { useState, useEffect, useRef } from 'react';
import { Box, Flex, Heading, Text, Button, SimpleGrid, Badge, HStack } from '@chakra-ui/react';
import { Video, MessageSquare, Archive, Clock } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import eduVideo from '../assets/images/eduSpace.mp4';
import logoImg from '../assets/images/logo.png';

const TimeZone3DClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // 3D Transform Logic
  const x = useMotionValue(400);
  const y = useMotionValue(200);
  const rotateX = useTransform(y, [0, 400], [10, -10]);
  const rotateY = useTransform(x, [0, 400], [-10, 10]);

  function handleMouse(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  }

  return (
    <motion.div
      style={{ perspective: 1200, display: 'flex', justifyContent: 'center', width: '100%' }}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(400); y.set(200); }}
    >
      <motion.div
        style={{
          rotateX: rotateX,
          rotateY: rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        <Box
          bg="surface-container"
          border="1px solid"
          borderColor="surface-container-low"
          boxShadow="0 30px 60px -15px rgba(188, 187, 187, 0.1), 0 0 40px rgba(155, 81, 224, 0.1)"
          borderRadius="3xl"
          p={12}
          w={{ base: "100%", md: "800px" }}
          textAlign="center"
          position="relative"
          overflow="hidden"
        >
          <Box position="absolute" top="-50%" left="-50%" w="200%" h="200%" bg="radial-gradient(circle, rgba(26, 115, 232, 0.1) 0%, transparent 60%)" style={{ transform: "translateZ(-10px)" }} zIndex={-1} />

          <Flex justify="center" mb={4} style={{ transform: "translateZ(30px)" }}>
            <Box bg="primary" p={3} borderRadius="full" boxShadow="md">
              <Clock size={24} color="white" />
            </Box>
          </Flex>

          <Text fontSize="sm" fontWeight="bold" letterSpacing="widest" color="primary" mb={2} textTransform="uppercase" style={{ transform: "translateZ(40px)" }}>
            CODE BY LOGIC • VIBE BY SOUL
          </Text>
          <Heading fontSize="6xl" fontFamily="heading" color="on-surface" mb={2} style={{ transform: "translateZ(60px)", textShadow: "0px 10px 20px rgba(0,0,0,0.05)" }}>
            {timeStr}
          </Heading>
          <Text fontSize="lg" opacity={0.6} fontWeight="medium" style={{ transform: "translateZ(30px)" }}>
            {dateStr}
          </Text>
        </Box>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const options = {
      threshold: 0.5,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          video.play().catch(err => console.log("Autoplay blocked:", err));
        } else {
          video.pause();
        }
      });
    }, options);

    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Flex direction={{ base: 'column', md: 'row' }} align="center" px={{ base: 8, md: 16 }} py={20} gap={12}>
        <Box flex="1">
          <Badge bg="surface-bright" color="secondary" px={3} py={1} borderRadius="full" mb={6} fontSize="xs" letterSpacing="widest" textTransform="uppercase">
            ✨ Future of Focused Learning
          </Badge>
          <Heading as="h1" fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }} fontFamily="heading" mb={6} lineHeight="1.1">
            The Sanctuary for <br />
            <Text as="span" color="primary">Intellectual Focus.</Text>
          </Heading>
          <Text fontSize="lg" mb={8} opacity={0.8} maxW="500px">
            Distill complex ideas, host high-fidelity lectures, and foster deep connection. Experience the pedagogical interface designed for clarity, not noise.
          </Text>
          <HStack spacing={4}>
            <Button bg="primary" color="white" _hover={{ bg: 'primary-container' }} size="lg" borderRadius="md" px={8}>
              Enter the Classroom
            </Button>
            <Button variant="outline" bg="surface-container-low" color="on-surface" size="lg" borderRadius="md" px={8} _hover={{ bg: 'surface-container-highest' }}>
              View Curriculum
            </Button>
          </HStack>
        </Box>

        <Box flex="1" position="relative" w="full">
          <Box
            bg="surface-container-low"
            h="360px"
            borderRadius="3xl"
            overflow="hidden"
            position="relative"
            boxShadow="0 24px 48px -12px rgba(25, 28, 35, 0.2)"
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              controls
              loop
              playsInline
              poster={logoImg}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                cursor: 'pointer'
              }}
            >
              <source src={eduVideo} type="video/mp4" />
              Trình duyệt của bạn không hỗ trợ tag video.
            </video>

            <Box
              position="absolute"
              top={0} left={0} w="100%" h="100%"
              bg="linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.4))"
              pointerEvents="none"
            />
          </Box>
        </Box>
      </Flex>

      {/* Distilled Interaction Section */}
      <Box px={{ base: 8, md: 16 }} py={20} bg="surface-container-lowest">
        <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'end' }} mb={12} gap={6}>
          <Box>
            <Text fontSize="xs" fontWeight="bold" letterSpacing="widest" color="primary" mb={2}>CORE INFRASTRUCTURE</Text>
            <Heading size="2xl" fontFamily="heading">Distilled Interaction</Heading>
          </Box>
          <Text maxW="300px" fontSize="sm" opacity={0.8}>
            Every tool is curated to eliminate distraction and maximize cognitive retention.
          </Text>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          {/* Card 1 */}
          <Box
            bg="card-accent"
            borderRadius="2xl"
            p={8}
            minH="300px"
            boxShadow="xl"
          >
            <Box bg="whiteAlpha.200" w="fit-content" p={3} borderRadius="full" mb={16}>
              <Video size={24} color="#adc7ff" />
            </Box>
            <Heading size="lg" mb={3} color="white">
              The Stage
            </Heading>
            <Text fontSize="sm" color="whiteAlpha.800">
              Cinematic video conferencing with spatial audio and focus-locking algorithms.
            </Text>
          </Box>

          {/* Card 2 */}
          <Box bg="surface-container-low" borderRadius="2xl" p={8} position="relative" minH="300px">
            <Box bg="surface-container-lowest" w="fit-content" p={3} borderRadius="full" mb={16} boxShadow="sm">
              <MessageSquare size={24} color="#9b51e0" />
            </Box>
            <Heading size="lg" mb={3}>Thought Streams</Heading>
            <Text fontSize="sm" opacity={0.8}>Asynchronous messaging that categorizes thoughts by topic and urgency, preventing the 'infinite scroll' fatigue.</Text>
          </Box>

          {/* Card 3 */}
          <Box bg="primary" color="white" borderRadius="2xl" p={8} position="relative" minH="300px">
            <Box bg="rgba(255,255,255,0.2)" w="fit-content" p={3} borderRadius="full" mb={16}>
              <Archive size={24} />
            </Box>
            <Heading size="lg" mb={3}>The Archivist</Heading>
            <Text fontSize="sm" opacity={0.9} mb={8}>Our integrated AI records every session, distilling 2-hour lectures into 5-minute executive summaries and searchable indices.</Text>
            <Button bg="rgba(255,255,255,0.1)" color="white" _hover={{ bg: 'rgba(255,255,255,0.2)' }} w="full" borderRadius="md">
              Explore Insights
            </Button>
          </Box>
        </SimpleGrid>
      </Box>

      {/* 3D TimeZone Section */}
      <Box px={{ base: 8, md: 16 }} py={{ base: 12, md: 24 }} direction={{ base: 'column', md: 'row' }} align="center" gap={{ base: 12, md: 16 }}>
        <TimeZone3DClock />
      </Box>
    </Box>
  );
}
