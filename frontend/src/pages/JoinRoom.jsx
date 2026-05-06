import { useState } from 'react';
import {
  Box, Flex, Heading, Text, Button, Input, VStack, HStack,
  useColorModeValue, Spinner, useToast, FormControl, FormLabel,
  FormErrorMessage
} from '@chakra-ui/react';
import { Lock, Sparkles, Video, Users, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';

export default function JoinRoom() {
  const navigate = useNavigate();
  const toast = useToast();

  const [roomCode, setRoomCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!roomCode.trim()) errs.roomCode = 'Room code is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleJoin = async () => {
    if (loading) return;
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/api/guest/room/join', {
        roomCode: roomCode.trim(),
        password: password ? password : null,
      });
      toast({ title: 'Joined successfully!', status: 'success', duration: 2000 });
      navigate(`/room/${roomCode.trim()}`);
    } catch (e) {
      toast({
        title: 'Failed to join room',
        description: e.response?.data?.message || e.message,
        status: 'error', duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const cardBg = useColorModeValue('surface-container', 'surface-container');

  return (
    <Flex direction="column" minH="calc(100vh - 72px)" py={12} px={{ base: 4, md: 8, lg: 16 }} bg="surface">
      <Flex direction={{ base: 'column', lg: 'row' }} gap={12} maxW="1100px" mx="auto" w="100%" align="center">

        {/* Left: Info */}
        <Box flex={{ base: '1', lg: '0.4' }} pt={4}>
          <Text fontSize="xs" fontWeight="bold" letterSpacing="widest" color="primary" textTransform="uppercase" mb={3}>
            Edu-Space
          </Text>
          <Heading as="h1" size="2xl" fontFamily="heading" mb={6} lineHeight="1.2">
            Join a <br />Study Room
          </Heading>
          <Text fontSize="md" color="on-surface" opacity={0.8} mb={10} maxW="380px" lineHeight="tall">
            Enter the room code to connect with your study group. If the room is private, you will also need the password.
          </Text>

          <VStack align="start" spacing={4} mb={8}>
            {[
              { icon: Video, label: 'Instant Connect', desc: 'Join with high quality video' },
              { icon: Users, label: 'Collaborative', desc: 'Study together in real-time' },
              { icon: Lock, label: 'Secure Access', desc: 'Private rooms are protected' },
            ].map(({ icon: I, label, desc }) => (
              <HStack key={label} spacing={3}>
                <Box bg="primary" p={2} borderRadius="lg" color="white"><I size={18} /></Box>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold" fontSize="sm">{label}</Text>
                  <Text fontSize="xs" color="gray.500">{desc}</Text>
                </VStack>
              </HStack>
            ))}
          </VStack>

          <Box bg="surface-container-low" p={5} borderRadius="xl" maxW="380px">
            <HStack mb={2}><Sparkles size={18} color="#9b51e0" /><Text fontWeight="bold" fontSize="sm">Tips</Text></HStack>
            <Text fontSize="xs" opacity={0.8}>
              Make sure your camera and microphone are ready before joining the room!
            </Text>
          </Box>
        </Box>

        {/* Right: Form */}
        <Box flex={{ base: '1', lg: '0.6' }} w="full">
          <Box bg={cardBg} p={{ base: 6, md: 10 }} borderRadius="3xl" boxShadow="lg">
            <VStack spacing={7} align="stretch">

              {/* Room Code */}
              <FormControl isInvalid={!!errors.roomCode}>
                <FormLabel fontSize="xs" fontWeight="bold" letterSpacing="widest" textTransform="uppercase" opacity={0.7}>
                  Room Code *
                </FormLabel>
                <Input
                  size="lg" placeholder="e.g., A1B2C3D4"
                  bg="surface-container-low" border="none"
                  textTransform="uppercase"
                  _focus={{ ring: 2, ringColor: 'primary' }} borderRadius="xl"
                  value={roomCode}
                  onChange={e => setRoomCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleJoin()}
                />
                <FormErrorMessage>{errors.roomCode}</FormErrorMessage>
              </FormControl>

              {/* Password */}
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold" letterSpacing="widest" textTransform="uppercase" opacity={0.7}>
                  Password (if private)
                </FormLabel>
                <Input
                  size="lg" type="password" placeholder="Enter room password"
                  bg="surface-container-low" border="none"
                  _focus={{ ring: 2, ringColor: 'primary' }} borderRadius="xl"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleJoin()}
                />
              </FormControl>

              {/* Actions */}
              <Flex gap={4} pt={4} justify="flex-end">
                <Button variant="ghost" size="lg" px={8} onClick={() => navigate(-1)}>Cancel</Button>
                <Button
                  bg="primary" color="white" _hover={{ opacity: 0.9 }}
                  size="lg" px={10} borderRadius="xl" boxShadow="md"
                  leftIcon={loading ? <Spinner size="sm" /> : <LogIn size={18} />}
                  isLoading={loading}
                  onClick={handleJoin}
                >
                  Join Room
                </Button>
              </Flex>

            </VStack>
          </Box>
        </Box>

      </Flex>
    </Flex>
  );
}
