import { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Flex, Heading, Text, Button, Input, VStack, HStack, InputGroup, InputLeftElement, Link as ChakraLink, Image } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, GraduationCap, Phone, CheckCircle, XCircle } from 'lucide-react';
import { useLocation, Link as RouterLink, useNavigate } from 'react-router-dom';
import logoImg from '../assets/images/logo.png';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AuthLogo = () => (
  <HStack spacing={3} mb={4} align="center">
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
    <Heading size="md" color="on-surface" letterSpacing="tight" fontFamily="heading">Edu Space</Heading>
  </HStack>
);

const LoginForm = ({ setIsSignUp }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleToggle = () => setShowPassword(!showPassword);

  const handleSubmit = async () => {
    if (!emailOrUsername || !password) {
      setError('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      setError('');
      await login(emailOrUsername, password);
      // Redirect to the page user tried to access, or home
      const redirectTo = location.state?.from || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack spacing={4} w="100%" h="100%" justify="center" py={2}>
      <AuthLogo />
      <Heading size="lg" color="on-surface" mb={1} fontFamily="heading">Sign in to EduSpace</Heading>
      <HStack spacing={4} mb={1}>
        <Button
          variant="outline" borderRadius="50px" w="full" h="40px" p={0}
          borderColor="surface-container-low" border="1px solid #ccc"
          _hover={{ bg: 'surface' }}
          onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/oauth2/authorization/google`}
        >
          <GoogleIcon />
        </Button>
      </HStack>
      <Text fontSize="xs" color="on-surface" opacity={0.6}>or use your email account</Text>

      {error && <Text color="red.500" fontSize="sm">{error}</Text>}

      <InputGroup size="md" w="100%">
        <InputLeftElement pointerEvents="none"><Mail size={16} color="gray" /></InputLeftElement>
        <Input placeholder="Email or Username" value={emailOrUsername} onChange={(e) => setEmailOrUsername(e.target.value)} bg="surface" border="none" borderRadius="md" _focus={{ ring: 1, ringColor: "primary" }} />
      </InputGroup>

      <InputGroup size="md" w="100%">
        <InputLeftElement pointerEvents="none"><Lock size={16} color="gray" /></InputLeftElement>
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          bg="surface"
          border="none"
          borderRadius="md"
          _focus={{ ring: 1, ringColor: "primary" }}
        />
        <Box
          as="button"
          onClick={handleToggle}
          position="absolute"
          right="12px"
          top="50%"
          transform="translateY(-50%)"
          zIndex={2}
          color="gray.500"
          _hover={{ color: "primary" }}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </Box>
      </InputGroup>
      <Flex w="100%" justify="space-between" align="center" px={1}>
        <Button
          as={RouterLink}
          to="/"
          variant="link"
          size="xs"
          color="on-surface"
          opacity={0.6}
          leftIcon={<ArrowLeft size={12} />}
          _hover={{ opacity: 1, color: "primary", textDecoration: "none" }}
        >
          Back to Home
        </Button>

        <ChakraLink
          as={RouterLink}
          to="/reset-password"
          fontSize="xs"
          color="primary"
          fontWeight="medium"
        >
          Forgot password?
        </ChakraLink>
      </Flex>

      <Button onClick={handleSubmit} isLoading={isLoading} w="80%" size="md" bg="primary" color="white" _hover={{ bg: 'primary-container', transform: 'translateY(-1px)' }} _active={{ transform: 'translateY(0)' }} borderRadius="full" boxShadow="sm">
        SIGN IN
      </Button>

      <Button display={{ base: "block", md: "none" }} variant="link" size="sm" onClick={() => setIsSignUp(true)} color="primary">
        Don't have an account? Sign Up
      </Button>
    </VStack>
  )
};

// Inline validation hint component
const FieldHint = ({ text, isError }) => (
  <Text fontSize="10px" color={isError ? 'red.400' : 'green.400'} px={1} mt={-2} mb={-1} w="100%" textAlign="left">
    {isError ? <XCircle size={10} style={{ display: 'inline', marginRight: 4 }} /> : <CheckCircle size={10} style={{ display: 'inline', marginRight: 4 }} />}
    {text}
  </Text>
);

const SignupForm = ({ setIsSignUp }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  // Field-level validation states
  const [fieldErrors, setFieldErrors] = useState({});
  const [fieldSuccess, setFieldSuccess] = useState({});
  const debounceTimers = useRef({});

  const handleToggle = () => setShowPassword(!showPassword);

  // --- Validators ---
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_REGEX = /^(0|\+84)[0-9]{9}$/;
  const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
  const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;

  const validateField = useCallback((field, value) => {
    const newErrors = { ...fieldErrors };
    const newSuccess = { ...fieldSuccess };
    delete newErrors[field];
    delete newSuccess[field];

    if (!value) { setFieldErrors(newErrors); setFieldSuccess(newSuccess); return; }

    switch (field) {
      case 'username':
        if (value.length < 3) { newErrors.username = 'Username must be at least 3 characters'; }
        else if (value.length > 50) { newErrors.username = 'Username must be at most 50 characters'; }
        else if (!USERNAME_REGEX.test(value)) { newErrors.username = 'No spaces or special chars (except _)'; }
        else {
          // Debounced uniqueness check
          clearTimeout(debounceTimers.current.username);
          debounceTimers.current.username = setTimeout(async () => {
            try {
              const exists = await authService.checkUsername(value);
              setFieldErrors(prev => { const n = { ...prev }; if (exists) n.username = 'Username is already taken'; else delete n.username; return n; });
              setFieldSuccess(prev => { const n = { ...prev }; if (!exists) n.username = 'Username is available'; else delete n.username; return n; });
            } catch { /* ignore network errors */ }
          }, 500);
          setFieldErrors(newErrors); setFieldSuccess(newSuccess); return;
        }
        break;
      case 'email':
        if (!EMAIL_REGEX.test(value)) { newErrors.email = 'Invalid email format'; }
        else {
          clearTimeout(debounceTimers.current.email);
          debounceTimers.current.email = setTimeout(async () => {
            try {
              const exists = await authService.checkEmail(value);
              setFieldErrors(prev => { const n = { ...prev }; if (exists) n.email = 'Email is already registered'; else delete n.email; return n; });
              setFieldSuccess(prev => { const n = { ...prev }; if (!exists) n.email = 'Email is available'; else delete n.email; return n; });
            } catch { /* ignore */ }
          }, 500);
          setFieldErrors(newErrors); setFieldSuccess(newSuccess); return;
        }
        break;
      case 'password':
        if (value.length < 8) { newErrors.password = 'At least 8 characters'; }
        else if (!PASSWORD_REGEX.test(value)) { newErrors.password = 'Need uppercase, lowercase, number & special char'; }
        else { newSuccess.password = 'Strong password'; }
        break;
      case 'phone':
        if (value && !PHONE_REGEX.test(value)) { newErrors.phone = 'Invalid phone (e.g. 0912345678)'; }
        else if (value) { newSuccess.phone = 'Valid phone number'; }
        break;
    }
    setFieldErrors(newErrors);
    setFieldSuccess(newSuccess);
  }, [fieldErrors, fieldSuccess]);

  const handleChange = (field, value, setter) => {
    setter(value);
    validateField(field, value);
  };

  const handleSubmit = async () => {
    // Final check
    if (!fullName || !username || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }
    if (Object.keys(fieldErrors).length > 0) {
      setError('Please fix the errors above before submitting');
      return;
    }
    setIsLoading(true);
    try {
      setError('');
      await register({ fullName, username, email, password, phone: phone || undefined });
      setIsSignUp(false);
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = 'Signup failed.';
      if (errorData) {
        if (typeof errorData === 'object' && !errorData.message) {
          // Extract first error from validation map
          const firstErrorKey = Object.keys(errorData)[0];
          if (firstErrorKey) {
            errorMessage = errorData[firstErrorKey];
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack spacing={2} w="100%" h="100%" justify="center" py={2} overflowY="auto">
      <AuthLogo />
      <Heading size="lg" color="on-surface" mb={1} fontFamily="heading">Create Account</Heading>
      <HStack spacing={4}>
        <Button
          variant="outline" borderRadius="50px" w="full" h="40px" p={0}
          borderColor="surface-container-low" border="1px solid #ccc"
          _hover={{ bg: 'surface' }}
          onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/oauth2/authorization/google`}
        >
          <GoogleIcon />
        </Button>
      </HStack>
      <Text fontSize="10px" color="on-surface" opacity={0.6}>or use your email for registration</Text>

      {error && <Text color="red.500" fontSize="xs" textAlign="center">{error}</Text>}

      <HStack spacing={2} w="100%" marginBottom="8px">
        <InputGroup size="sm" w="50%">
          <InputLeftElement pointerEvents="none"><User size={14} color="gray" /></InputLeftElement>
          <Input placeholder="Full Name *" value={fullName} onChange={(e) => setFullName(e.target.value)} bg="surface" border="none" borderRadius="md" _focus={{ ring: 1, ringColor: "primary" }} />
        </InputGroup>
        <InputGroup size="sm" w="50%">
          <InputLeftElement pointerEvents="none"><User size={14} color="gray" /></InputLeftElement>
          <Input placeholder="Username *" value={username} onChange={(e) => handleChange('username', e.target.value, setUsername)} bg="surface" border="none" borderRadius="md" _focus={{ ring: 1, ringColor: "primary" }} />
        </InputGroup>
      </HStack>
      {fieldErrors.username && <FieldHint text={fieldErrors.username} isError />}
      {fieldSuccess.username && <FieldHint text={fieldSuccess.username} />}

      <HStack spacing={2} w="100%" marginBottom="8px">
        <InputGroup size="sm" w="50%">
          <InputLeftElement pointerEvents="none"><Mail size={14} color="gray" /></InputLeftElement>
          <Input placeholder="Email *" value={email} onChange={(e) => handleChange('email', e.target.value, setEmail)} bg="surface" border="none" borderRadius="md" _focus={{ ring: 1, ringColor: "primary" }} />
        </InputGroup>
        <InputGroup size="sm" w="50%">
          <InputLeftElement pointerEvents="none"><Phone size={14} color="gray" /></InputLeftElement>
          <Input placeholder="Phone (optional)" value={phone} onChange={(e) => handleChange('phone', e.target.value, setPhone)} bg="surface" border="none" borderRadius="md" _focus={{ ring: 1, ringColor: "primary" }} />
        </InputGroup>
      </HStack>
      <HStack spacing={2} w="100%">
        <Box w="50%">
          {fieldErrors.email && <FieldHint text={fieldErrors.email} isError />}
          {fieldSuccess.email && <FieldHint text={fieldSuccess.email} />}
        </Box>
        <Box w="50%">
          {fieldErrors.phone && <FieldHint text={fieldErrors.phone} isError />}
          {fieldSuccess.phone && <FieldHint text={fieldSuccess.phone} />}
        </Box>
      </HStack>

      <InputGroup size="sm" w="100%" marginBottom="8px">
        <InputLeftElement pointerEvents="none"><Lock size={14} color="gray" /></InputLeftElement>
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Password *"
          value={password}
          onChange={(e) => handleChange('password', e.target.value, setPassword)}
          bg="surface"
          border="none"
          borderRadius="md"
          _focus={{ ring: 1, ringColor: "primary" }}
        />
        <Box
          as="button"
          onClick={handleToggle}
          position="absolute"
          right="12px"
          top="50%"
          transform="translateY(-50%)"
          zIndex={2}
          color="gray.500"
          _hover={{ color: "primary" }}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </Box>
      </InputGroup>
      {fieldErrors.password && <FieldHint text={fieldErrors.password} isError />}
      {fieldSuccess.password && <FieldHint text={fieldSuccess.password} />}

      <Flex w="100%" justify="space-between" align="center" px={1} marginBottom="8px">
        <Button
          as={RouterLink}
          to="/"
          variant="link"
          size="xs"
          color="on-surface"
          opacity={0.6}
          leftIcon={<ArrowLeft size={12} />}
          _hover={{ opacity: 1, color: "primary", textDecoration: "none" }}
        >
          Back to Home
        </Button>
        <ChakraLink
          onClick={() => setIsSignUp(false)}
          fontSize="xs"
          color="primary"
          fontWeight="medium"
          cursor="pointer"
        >
          Already have an account?
        </ChakraLink>
      </Flex>
      <Button onClick={handleSubmit} isLoading={isLoading} isDisabled={Object.keys(fieldErrors).length > 0} w="80%" size="sm" bg="primary" color="white" _hover={{ bg: 'primary-container', transform: 'translateY(-1px)' }} _active={{ transform: 'translateY(0)' }} borderRadius="full" boxShadow="sm">
        SIGN UP
      </Button>
    </VStack>
  )
};

const Overlay = ({ isSignUp, setIsSignUp }) => (
  <Box
    position="relative" w="100%" h="100%"
    backgroundImage="url('https://openmagazine.net/wp-content/uploads/2019/11/8-ngon-ngu-lap-trinh-phan-mem.png')"
    backgroundSize="cover"
    backgroundPosition="center"
  >
    {/* Dark Overlay for better contrast */}
    <Box position="absolute" top={0} left={0} w="100%" h="100%" bg="rgba(81, 134, 192, 0.85)" />

    <Box position="relative" zIndex={1} h="100%">
      <AnimatePresence mode="wait">
        {isSignUp ? (
          <MotionFlex
            key="overlay-signup"
            direction="column" align="center" justify="center" h="100%" p={10} textAlign="center"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}
          >
            <Heading size="2xl" mb={6} color="white" fontFamily="heading">Welcome Back!</Heading>
            <Text mb={8} fontSize="lg" opacity={0.9} lineHeight="tall" color="white">
              To keep connected with us please login with your personal info
            </Text>
            <Button variant="outline" color="white" borderColor="white" _hover={{ bg: 'rgba(255,255,255,0.1)' }} onClick={() => setIsSignUp(false)} borderRadius="full" px={12} size="lg">
              SIGN IN
            </Button>
          </MotionFlex>
        ) : (
          <MotionFlex
            key="overlay-login"
            direction="column" align="center" justify="center" h="100%" p={10} textAlign="center"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
          >
            <Heading size="2xl" mb={6} color="white" fontFamily="heading">Welcome Back!</Heading>
            <Text mb={8} fontSize="lg" opacity={0.9} lineHeight="tall" color="white">
              Enter your personal details and start your journey with us
            </Text>

            <Button variant="outline" color="white" borderColor="white" _hover={{ bg: 'rgba(255,255,255,0.1)' }} onClick={() => setIsSignUp(true)} borderRadius="full" px={12} size="lg">
              SIGN UP
            </Button>
          </MotionFlex>
        )}
      </AnimatePresence>
    </Box>
  </Box>
);

export default function Auth() {
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setIsSignUp(params.get('mode') === 'signup');
  }, [location]);

  return (
    <Flex minH="100vh" align="center" justify="center" bg="surface" p={4} overflow="hidden">

      <Box
        position="relative"
        w={{ base: "100%", md: "850px" }}
        maxW="100%"
        h={{ base: "auto", md: "540px" }}
        bg="surface-container"
        borderRadius="3xl"
        boxShadow="2xl"
        overflow="hidden"
      >
        {/* Mobile View */}
        <Box display={{ base: "block", md: "none" }} w="100%" p={6}>
          <AnimatePresence mode="wait">
            {isSignUp ? (
              <MotionBox key="mobile-signup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <SignupForm setIsSignUp={setIsSignUp} />
              </MotionBox>
            ) : (
              <MotionBox key="mobile-login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LoginForm setIsSignUp={setIsSignUp} />
              </MotionBox>
            )}
          </AnimatePresence>
        </Box>

        {/* Desktop View */}
        <Box display={{ base: "none", md: "block" }} w="100%" h="100%">
          <MotionBox
            position="absolute"
            top="0"
            left="0"
            w="50%"
            h="100%"
            bg="surface-container"
            px={10} // Giảm padding để form gọn hơn
            py={4}
            initial={false}
            animate={{ x: isSignUp ? "100%" : "0%" }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            zIndex={2}
          >
            <AnimatePresence mode="wait">
              {isSignUp ? (
                <MotionBox key="signup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} h="100%">
                  <SignupForm setIsSignUp={setIsSignUp} />
                </MotionBox>
              ) : (
                <MotionBox key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} h="100%">
                  <LoginForm setIsSignUp={setIsSignUp} />
                </MotionBox>
              )}
            </AnimatePresence>
          </MotionBox>

          <MotionBox
            position="absolute"
            top="0"
            left="50%"
            w="50%"
            h="100%"
            bg="primary"
            zIndex={3}
            initial={false}
            animate={{ x: isSignUp ? "-100%" : "0%" }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
            overflow="hidden"
          >
            <Overlay isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
          </MotionBox>
        </Box>
      </Box>
    </Flex>
  );
}
