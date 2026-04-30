import { useState } from 'react';
import {
  Box, Flex, Heading, Text, Button, Input, Textarea,
  VStack, HStack, SimpleGrid, Icon, useRadio, useRadioGroup,
  useColorModeValue, Spinner, useToast, FormControl, FormLabel,
  FormErrorMessage, Badge
} from '@chakra-ui/react';
import { Globe, Lock, Sparkles, Video, Users, Copy, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';

function RadioCard(props) {
  const { getInputProps, getRadioProps } = useRadio(props);
  const input = getInputProps();
  const checkbox = getRadioProps();

  return (
    <Box as="label" w="100%">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth="2px"
        borderRadius="xl"
        borderColor="surface-container-low"
        bg="surface-container-low"
        _checked={{ bg: 'surface-container-lowest', color: 'primary', borderColor: 'primary', boxShadow: 'sm' }}
        _hover={{ borderColor: input.checked ? 'primary' : 'gray.300' }}
        px={5} py={4} transition="all 0.2s" h="100%"
      >
        {props.children}
      </Box>
    </Box>
  );
}

export default function CreateRoom() {
  const navigate = useNavigate();
  const toast = useToast();

  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [password, setPassword] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('8');
  const [privacy, setPrivacy] = useState('Public');
  const [loading, setLoading] = useState(false);
  const [createdRoom, setCreatedRoom] = useState(null);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState({});

  const options = ['Public', 'Private'];
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'privacy', defaultValue: 'Public', onChange: setPrivacy,
  });
  const group = getRootProps();

  const validate = () => {
    const errs = {};
    if (!roomName.trim()) errs.roomName = 'Room name is required';
    if (roomName.trim().length > 60) errs.roomName = 'Max 60 characters';
    if (maxParticipants && (Number(maxParticipants) < 2 || Number(maxParticipants) > 8))
      errs.maxParticipants = 'Must be between 2 and 8';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post('/api/guest/room/create-room', {
        roomName: roomName.trim(),
        description: description.trim(),
        password: privacy === 'Private' ? password : null,
        maxParticipants: Number(maxParticipants) || 8,
        roomTye: privacy === 'Private' ? 'PRIVATE' : 'PUBLIC',
      });
      setCreatedRoom(res.data);
      toast({ title: 'Room created!', status: 'success', duration: 2000 });
    } catch (e) {
      toast({
        title: 'Failed to create room',
        description: e.response?.data?.message || e.message,
        status: 'error', duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(createdRoom.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cardBg = useColorModeValue('surface-container', 'surface-container');

  // ── Success State ──
  if (createdRoom) {
    return (
      <Flex direction="column" minH="calc(100vh - 72px)" align="center" justify="center"
        py={12} px={4} bg="surface">
        <Box bg={cardBg} p={10} borderRadius="3xl" boxShadow="xl" maxW="480px" w="full" textAlign="center">
          <Box bg="green.50" _dark={{ bg: 'green.900' }} p={4} borderRadius="full" display="inline-flex" mb={6}>
            <CheckCircle size={48} color="#22c55e" />
          </Box>
          <Heading size="lg" mb={2}>Room Created!</Heading>
          <Text color="gray.500" mb={8}>Share the room code with friends to invite them.</Text>

          <Box bg="surface-container-low" p={6} borderRadius="2xl" mb={6}>
            <Text fontSize="xs" color="gray.400" mb={2} textTransform="uppercase" fontWeight="bold">Room Code</Text>
            <Text fontSize="4xl" fontWeight="900" letterSpacing="widest" color="primary">
              {createdRoom.roomCode}
            </Text>
          </Box>

          <VStack spacing={2} mb={8} align="start" w="full">
            <HStack justify="space-between" w="full">
              <Text fontSize="sm" color="gray.500">Room Name</Text>
              <Text fontSize="sm" fontWeight="bold">{createdRoom.roomName}</Text>
            </HStack>
            <HStack justify="space-between" w="full">
              <Text fontSize="sm" color="gray.500">Max Participants</Text>
              <Badge colorScheme="blue">{maxParticipants} slots</Badge>
            </HStack>
            <HStack justify="space-between" w="full">
              <Text fontSize="sm" color="gray.500">Privacy</Text>
              <Badge colorScheme={privacy === 'Public' ? 'green' : 'purple'}>{privacy}</Badge>
            </HStack>
          </VStack>

          <HStack spacing={3}>
            <Button
              leftIcon={copied ? <CheckCircle size={16} /> : <Copy size={16} />}
              variant="outline" flex={1} borderRadius="xl"
              onClick={handleCopyCode}
              colorScheme={copied ? 'green' : 'gray'}
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
            <Button
              bg="primary" color="white" flex={1} borderRadius="xl"
              leftIcon={<Video size={16} />}
              _hover={{ opacity: 0.9 }}
              onClick={() => navigate(`/room/${createdRoom.roomCode}`)}
            >
              Enter Room
            </Button>
          </HStack>
          <Button variant="ghost" mt={4} size="sm" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </Box>
      </Flex>
    );
  }

  // ── Create Form ──
  return (
    <Flex direction="column" minH="calc(100vh - 72px)" py={12} px={{ base: 4, md: 8, lg: 16 }} bg="surface">
      <Flex direction={{ base: 'column', lg: 'row' }} gap={12} maxW="1100px" mx="auto" w="100%">

        {/* Left: Info */}
        <Box flex={{ base: '1', lg: '0.4' }} pt={4}>
          <Text fontSize="xs" fontWeight="bold" letterSpacing="widest" color="primary" textTransform="uppercase" mb={3}>
            Edu-Space
          </Text>
          <Heading as="h1" size="2xl" fontFamily="heading" mb={6} lineHeight="1.2">
            Create a <br />Study Room
          </Heading>
          <Text fontSize="md" color="on-surface" opacity={0.8} mb={10} maxW="380px" lineHeight="tall">
            Set up a focused video call room for your study group. Invite friends with a simple room code.
          </Text>

          <VStack align="start" spacing={4} mb={8}>
            {[
              { icon: Video, label: 'HD Video Calls', desc: 'Powered by WebRTC' },
              { icon: Users, label: 'Up to 50 Members', desc: 'Scalable for any group' },
              { icon: Lock, label: 'Private Rooms', desc: 'Password protected access' },
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
              Private rooms are hidden from the public feed and require a password. Perfect for closed study groups.
            </Text>
          </Box>
        </Box>

        {/* Right: Form */}
        <Box flex={{ base: '1', lg: '0.6' }}>
          <Box bg={cardBg} p={{ base: 6, md: 10 }} borderRadius="3xl" boxShadow="lg">
            <VStack spacing={7} align="stretch">

              {/* Room Name */}
              <FormControl isInvalid={!!errors.roomName}>
                <FormLabel fontSize="xs" fontWeight="bold" letterSpacing="widest" textTransform="uppercase" opacity={0.7}>
                  Room Name *
                </FormLabel>
                <Input
                  size="lg" placeholder="e.g., Calculus Study Group"
                  bg="surface-container-low" border="none"
                  _focus={{ ring: 2, ringColor: 'primary' }} borderRadius="xl"
                  value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                />
                <FormErrorMessage>{errors.roomName}</FormErrorMessage>
              </FormControl>

              {/* Description */}
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold" letterSpacing="widest" textTransform="uppercase" opacity={0.7}>
                  Description (optional)
                </FormLabel>
                <Textarea
                  placeholder="What will you study in this room?"
                  bg="surface-container-low" border="none"
                  _focus={{ ring: 2, ringColor: 'primary' }} borderRadius="xl"
                  minH="100px" resize="vertical"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </FormControl>

              {/* Max Participants */}
              <FormControl isInvalid={!!errors.maxParticipants}>
                <FormLabel fontSize="xs" fontWeight="bold" letterSpacing="widest" textTransform="uppercase" opacity={0.7}>
                  Max Participants
                </FormLabel>
                <Input
                  size="lg" type="number" min={2} max={50}
                  placeholder="Default: 10"
                  bg="surface-container-low" border="none"
                  _focus={{ ring: 2, ringColor: 'primary' }} borderRadius="xl"
                  value={maxParticipants}
                  onChange={e => setMaxParticipants(e.target.value)}
                />
                <FormErrorMessage>{errors.maxParticipants}</FormErrorMessage>
              </FormControl>

              {/* Privacy */}
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="bold" letterSpacing="widest" textTransform="uppercase" opacity={0.7}>
                  Privacy Setting
                </FormLabel>
                <SimpleGrid columns={2} spacing={4} {...group}>
                  {options.map(value => {
                    const radio = getRadioProps({ value });
                    const isPublic = value === 'Public';
                    const iconColor = privacy === value ? 'currentColor' : (isPublic ? '#1a73e8' : '#9b51e0');
                    return (
                      <RadioCard key={value} {...radio}>
                        <VStack align="start" spacing={2}>
                          <HStack>
                            {isPublic ? <Globe size={18} color={iconColor} /> : <Lock size={18} color={iconColor} />}
                            <Text fontWeight="bold" fontSize="sm">{value}</Text>
                          </HStack>
                          <Text fontSize="xs" opacity={0.75}>
                            {isPublic ? 'Anyone can join with the room code.' : 'Requires password to join.'}
                          </Text>
                        </VStack>
                      </RadioCard>
                    );
                  })}
                </SimpleGrid>
              </FormControl>

              {/* Password (if Private) */}
              {privacy === 'Private' && (
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold" letterSpacing="widest" textTransform="uppercase" opacity={0.7}>
                    Room Password
                  </FormLabel>
                  <Input
                    size="lg" type="password" placeholder="Set a password for this room"
                    bg="surface-container-low" border="none"
                    _focus={{ ring: 2, ringColor: 'primary' }} borderRadius="xl"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </FormControl>
              )}

              {/* Actions */}
              <Flex gap={4} pt={2} justify="flex-end">
                <Button variant="ghost" size="lg" px={8} onClick={() => navigate(-1)}>Cancel</Button>
                <Button
                  bg="primary" color="white" _hover={{ opacity: 0.9 }}
                  size="lg" px={10} borderRadius="xl" boxShadow="md"
                  leftIcon={loading ? <Spinner size="sm" /> : <Video size={18} />}
                  isLoading={loading}
                  onClick={handleCreate}
                >
                  Create Room
                </Button>
              </Flex>

            </VStack>
          </Box>
        </Box>

      </Flex>
    </Flex>
  );
}
