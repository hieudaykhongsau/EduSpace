import { useState, useRef } from 'react';
import {
  Box, Flex, Heading, Button, Link, HStack, Image, Avatar, Text,
  Menu, MenuButton, MenuList, MenuItem, MenuDivider, AvatarBadge
} from '@chakra-ui/react';
import { replace, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Bell, LogOut, User, Settings, MessageCircle } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import logoImg from '../assets/images/logo.png';
import { useAuth } from '../contexts/AuthContext';

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isCurrentPath = (path) => location.pathname === path;

  const handleSmartNavigate = (e, path) => {
    if (isCurrentPath(path)) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <Flex
      as="nav"
      p={4}
      px={{ base: 4, md: 8 }}
      justify="space-between"
      align="center"
      bg="surface-container"
      position="sticky"
      top={0}
      zIndex={100}
      boxShadow="sm"
      borderBottom="1px solid"
      borderColor="surface-container-low"
    >
      <HStack spacing={4} as={RouterLink} to="/" _hover={{ textDecoration: 'none' }} onClick={(e) => handleSmartNavigate(e, '/')}>
        <Box boxSize="65px" borderRadius="full" overflow="hidden" border="1px solid" borderColor="primary">
          <Image src={logoImg} alt="Edu Space Logo" objectFit="cover" width="100%" height="100%" fallbackSrc="https://via.placeholder.com/50" />
        </Box>
        <Heading as="h1" size="md" color="primary" letterSpacing="tight">EDU - SPACE</Heading>
      </HStack>

      <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
        <Link as={RouterLink} to="/" color="on-surface" fontSize="16px" _hover={{ color: 'primary' }} onClick={(e) => handleSmartNavigate(e, '/')}>Home</Link>
        <Link as={RouterLink} to="/instructions" color="on-surface" fontSize="16px" _hover={{ color: 'primary' }}>Instruction</Link>
        <Link as={RouterLink} to="/edu-ai" color="on-surface" fontSize="16px" _hover={{ color: 'primary' }}>Edu-AI</Link>
        <Link as={RouterLink} to="/community" color="on-surface" fontSize="16px" _hover={{ color: 'primary' }}>Community</Link>
      </HStack>

      <HStack spacing={4}>
        <Button as={RouterLink} to="/join-room" bg="primary" color="white" _hover={{ bg: 'primary-container' }} size="sm" borderRadius="md" display={{ base: 'none', md: 'inline-flex' }}>
          Join Room
        </Button>
        <Button as={RouterLink} to="/create-room" bg="primary" color="white" _hover={{ bg: 'primary-container' }} size="sm" borderRadius="md" display={{ base: 'none', md: 'inline-flex' }}>
          Create Room
        </Button>
        <ThemeToggle />

        {isAuthenticated ? (
          <HStack spacing={3}>
            {/* Bell notification */}
            <Box cursor="pointer" color="on-surface" _hover={{ color: 'primary' }}>
              <Bell size={20} />
            </Box>

            {/* Profile Dropdown Menu */}
            <Menu>
              <MenuButton>
                <Avatar
                  size="sm"
                  src={user?.avatarUrl || undefined}
                  name={user?.fullName || user?.username}
                  getInitials={getInitials}
                  cursor="pointer"
                  bg="primary"
                  color="white"
                >
                </Avatar>
              </MenuButton>
              <MenuList zIndex={200} minW="200px">
                <Box px={4} py={3}>
                  <Text fontWeight="bold" fontSize="sm">{user?.fullName || user?.username}</Text>
                  <Text fontSize="xs" color="gray.500">{user?.email}</Text>
                </Box>
                <MenuDivider />
                <MenuItem icon={<User size={16} />} as={RouterLink} to="/profile">
                  Profile
                </MenuItem>
                <MenuItem icon={<MessageCircle size={16} />} as={RouterLink} to="/messenger">
                  Messages
                </MenuItem>
                <MenuItem icon={<Settings size={16} />}>
                  Settings
                </MenuItem>
                <MenuDivider />
                <MenuItem icon={<LogOut size={16} />} color="red.500" onClick={handleLogout}>
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        ) : (
          <HStack spacing={2}>
            <Button as={RouterLink} to="/auth" variant="ghost" size="sm" display="flex" gap={2}>
              <LogIn size={16} /> Sign In
            </Button>
            <Button as={RouterLink} to="/auth?mode=signup" variant="outline" size="sm" display={{ base: 'none', md: 'flex' }} gap={2}>
              <UserPlus size={16} /> Sign Up
            </Button>
          </HStack>
        )}
      </HStack>
    </Flex>
  );
}
