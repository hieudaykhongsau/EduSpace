import { Box, Flex, Heading, Text, Button, Input, VStack, HStack, InputGroup, InputLeftElement, Link as ChakraLink, Image } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, GraduationCap } from 'lucide-react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import logoImg from '../assets/images/logo.png';
import testimonialImg from '../assets/images/image.png';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const AuthLogo = () => (
    <HStack spacing={3} mb={6} align="center">
        <Box
            boxSize="50px"
            borderRadius="full"
            overflow="hidden"
            border="1px solid"
            borderColor="primary"
        >
            <Image
                src={logoImg}

                alt="StudySync AI Logo"
                objectFit="cover"
                width="100%"
                height="100%"
                fallbackSrc="https://via.placeholder.com/50"
            />
        </Box>
        <Heading size="md" color="white" letterSpacing="tight" fontFamily="heading">Edu Space</Heading>
    </HStack>
);

const FormLogo = () => (
    <HStack spacing={3} mb={6} align="center">
        <Box bg="primary" p={2} borderRadius="xl" boxShadow="md">
            <GraduationCap size={24} color="white" />
        </Box>
        <Heading size="md" color="on-surface" letterSpacing="tight" fontFamily="heading">Edu Space</Heading>
    </HStack>
);

export const ResetPassword = () => {
    const navigate = useNavigate();

    return (
        <Flex minH="100vh" align="center" justify="center" bg="surface" p={4} overflow="hidden">

            <Box
                position="relative"
                w={{ base: "100%", md: "850px" }}
                maxW="100%"
                h={{ base: "auto", md: "500px" }}
                bg="surface-container"
                borderRadius="3xl"
                boxShadow="2xl"
                overflow="hidden"
            >
                <Flex h="100%" direction={{ base: "column", md: "row" }}>
                    {/* Left Side: Visuals */}
                    <Box
                        flex={1}
                        position="relative"
                        backgroundImage="url('https://openmagazine.net/wp-content/uploads/2019/11/8-ngon-ngu-lap-trinh-phan-mem.png')"
                        backgroundSize="cover"
                        backgroundPosition="center"
                        display={{ base: "none", md: "block" }}
                    >
                        {/* Overlay */}
                        <Box position="absolute" top={0} left={0} w="100%" h="100%" bg="rgba(81, 134, 192, 0.85)" />

                        <Flex position="relative" zIndex={1} h="100%" direction="column" align="center" justify="center" p={12} textAlign="center">
                            <Box alignSelf="flex-start" position="absolute" top={6} left={6}>
                                <AuthLogo />
                            </Box>

                            <Heading size="lg" mb={6} color="white" fontFamily="heading" lineHeight="tight">
                                Recover Your <br /> Sanctuary Access
                            </Heading>
                            <Text mb={8} fontSize="md" opacity={0.9} lineHeight="tall" color="white">
                                Your focus is our priority. Let's get you back to your digital classroom where every detail is designed for deep learning.
                            </Text>

                            {/* Quote Card */}
                            <Box
                                bg="rgba(255, 255, 255, 0.1)"
                                backdropFilter="blur(10px)"
                                p={4}
                                borderRadius="2xl"
                                border="1px solid rgba(255, 255, 255, 0.2)"
                                position="absolute"
                                bottom={8}
                                left={8}
                                right={8}
                            >
                                <HStack spacing={3}>
                                    <Box boxSize="40px" borderRadius="full" overflow="hidden" bg="whiteAlpha.300">
                                        <img src={testimonialImg} alt="Testimonial" />
                                    </Box>
                                    <VStack align="start" spacing={0}>
                                        <Text color="white" fontSize="xs" fontWeight="bold">Ready to resume?</Text>
                                        <Text color="whiteAlpha.800" fontSize="xs" fontStyle="italic">"The best social platform I've ever used."</Text>
                                    </VStack>
                                </HStack>
                            </Box>
                        </Flex>
                    </Box>

                    {/* Right Side: Form */}
                    <Box flex={1} p={{ base: 8, md: 12 }} marginTop="20px">
                        <VStack spacing={6} h="100%" justify="center" align="stretch">
                            <Box display={{ base: "block", md: "none" }} mb={4}>
                                <FormLogo />
                            </Box>

                            <Box>
                                <Heading size="lg" color="on-surface" mb={2} fontFamily="heading" textAlign="center">Forgot Password?</Heading>
                                <Text fontSize="sm" color="on-surface" opacity={0.6} lineHeight="tall" textAlign="center">
                                    Enter your email address and we'll send you instructions to reset your password.
                                </Text>
                            </Box>

                            <VStack spacing={4} marginTop="10px">
                                <Box alignSelf="stretch">
                                    <Text fontSize="xs" fontWeight="bold" letterSpacing="widest" mb={2} textTransform="uppercase" opacity={0.7}>
                                        Email Address
                                    </Text>
                                    <InputGroup size="lg">
                                        <InputLeftElement pointerEvents="none">
                                            <Mail size={20} color="gray" />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="name@university.edu"
                                            bg="surface-container-low"
                                            border="none"
                                            borderRadius="xl"
                                            _focus={{ ring: 2, ringColor: "primary" }}
                                        />
                                    </InputGroup>
                                </Box>

                                <Button
                                    w="80%"
                                    size="lg"
                                    bg="primary"
                                    color="white"
                                    _hover={{ bg: 'primary-container', transform: 'translateY(-2px)', boxShadow: 'lg' }}
                                    _active={{ transform: 'translateY(0)' }}
                                    borderRadius="xl"
                                    boxShadow="md"
                                    transition="all 0.2s"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    Send Reset Link
                                </Button>
                            </VStack>
                            <Button
                                as={RouterLink}
                                to="/auth"
                                variant="ghost"
                                gap={2}
                                color="on-surface"
                                _hover={{ bg: "surface-container-high", color: "primary", transform: "translateX(-4px)" }}
                                transition="all 0.5s"
                            >
                                <ArrowLeft size={14} /> Back to Login
                            </Button>

                            <Flex mt="auto" pt={4} justify="center" gap={2} display={{ base: "none", md: "flex" }}>
                                <Text fontSize="10px" color="gray.500" letterSpacing="widest" textTransform="uppercase">Edu Space Sanctuary</Text>
                                <Text fontSize="10px" color="gray.500">•</Text>
                                <Text fontSize="10px" color="gray.500" letterSpacing="widest" textTransform="uppercase">Protected Access</Text>
                            </Flex>
                        </VStack>
                    </Box>
                </Flex>
            </Box>
        </Flex>
    );
};