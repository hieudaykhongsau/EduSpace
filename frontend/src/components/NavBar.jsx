import { useState, useRef, useEffect } from 'react';
import {
  Box, Flex, Heading, Button, Link, HStack, Image, Avatar, Text, Divider,
  Menu, MenuButton, MenuList, MenuItem, MenuDivider, Badge, VStack,
  Popover, PopoverTrigger, PopoverContent, PopoverBody, PopoverHeader, PopoverArrow,
  IconButton, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Bell, LogOut, User, Settings, MessageCircle, Check, Menu as MenuIcon } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import logoImg from '../assets/images/logo.png';
import { useAuth } from '../contexts/AuthContext';
import notificationService from '../services/notificationService';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  if (!dateStr.endsWith('Z')) dateStr += 'Z';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

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

  // Fetch notifications on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchNotifications = async () => {
      try {
        const [notifs, count] = await Promise.all([
          notificationService.getNotifications(),
          notificationService.getUnreadCount()
        ]);
        setNotifications(notifs);
        setUnreadCount(count);
      } catch (e) {
        // no-op
      }
    };
    fetchNotifications();
  }, [isAuthenticated]);

  // WebSocket for real-time notifications
  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('jwtToken');
    if (!token) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const socket = new SockJS(`${baseUrl}/ws`);

    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: () => {},
      onConnect: () => {
        client.subscribe('/user/queue/notifications', (msg) => {
          const newNotif = JSON.parse(msg.body);
          setNotifications(prev => [newNotif, ...prev]);
          setUnreadCount(prev => prev + 1);
        });
      },
      onStompError: () => {}
    });

    client.activate();
    return () => { client.deactivate(); };
  }, [isAuthenticated]);

  const handleMarkAsRead = async (notifId) => {
    try {
      await notificationService.markAsRead(notifId);
      setNotifications(prev =>
        prev.map(n => n.id === notifId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) { /* no-op */ }
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
      <HStack spacing={4}>
        <IconButton 
          display={{ base: 'flex', md: 'none' }} 
          icon={<MenuIcon size={20} />} 
          variant="ghost" 
          onClick={onOpen} 
          aria-label="Open Menu" 
        />
        <HStack spacing={4} as={RouterLink} to="/" _hover={{ textDecoration: 'none' }} onClick={(e) => handleSmartNavigate(e, '/')}>
          <Box boxSize="65px" borderRadius="full" overflow="hidden" border="1px solid" borderColor="primary" display={{ base: 'none', sm: 'block' }}>
            <Image src={logoImg} alt="Edu Space Logo" objectFit="cover" width="100%" height="100%" fallbackSrc="https://via.placeholder.com/50" />
          </Box>
          <Heading as="h1" size="md" color="primary" letterSpacing="tight">EDU - SPACE</Heading>
        </HStack>
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
            <Popover placement="bottom-end">
              <PopoverTrigger>
                <Box position="relative" cursor="pointer" color="on-surface" _hover={{ color: 'primary' }}>
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <Badge
                      position="absolute" top="-6px" right="-8px"
                      colorScheme="red" borderRadius="full" fontSize="2xs"
                      minW="18px" h="18px" display="flex" alignItems="center" justifyContent="center"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Box>
              </PopoverTrigger>
              <PopoverContent w="360px" maxH="400px" zIndex={300} boxShadow="xl" borderRadius="xl">
                <PopoverArrow />
                <PopoverHeader fontWeight="bold" fontSize="md" borderBottom="1px solid" borderColor="surface-container-high" px={4} py={3}>
                  <Flex justify="space-between" align="center">
                    <Text>Notifications</Text>
                    {unreadCount > 0 && (
                      <Badge colorScheme="red" borderRadius="full" fontSize="xs">{unreadCount} new</Badge>
                    )}
                  </Flex>
                </PopoverHeader>
                <PopoverBody p={0} overflowY="auto" maxH="340px">
                  {notifications.length === 0 ? (
                    <Text p={6} textAlign="center" color="outline" fontSize="sm">No notifications yet</Text>
                  ) : (
                    <VStack spacing={0} align="stretch">
                      {notifications.slice(0, 20).map(notif => (
                        <Flex
                          key={notif.id}
                          p={3} px={4}
                          bg={notif.read ? 'transparent' : 'primary-container'}
                          _hover={{ bg: 'surface-container' }}
                          cursor="pointer"
                          align="center"
                          justify="space-between"
                          borderBottom="1px solid"
                          borderColor="surface-container-low"
                          onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                        >
                          <HStack spacing={3} flex={1}>
                            <Box w="8px" h="8px" borderRadius="full" bg={notif.read ? 'transparent' : 'primary'} flexShrink={0} />
                            <VStack align="start" spacing={0} flex={1}>
                              <Text fontSize="sm" fontWeight={notif.read ? 'normal' : 'bold'} noOfLines={2}>
                                {notif.content}
                              </Text>
                              <Text fontSize="xs" color="outline">{timeAgo(notif.createdAt)}</Text>
                            </VStack>
                          </HStack>
                          {!notif.read && (
                            <Box ml={2} flexShrink={0} color="primary" _hover={{ opacity: 0.7 }}>
                              <Check size={14} />
                            </Box>
                          )}
                        </Flex>
                      ))}
                    </VStack>
                  )}
                </PopoverBody>
              </PopoverContent>
            </Popover>

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

      {/* Mobile Menu Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="surface">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor="surface-container-low">Menu</DrawerHeader>
          <DrawerBody py={4}>
            <VStack align="stretch" spacing={4}>
              <Link as={RouterLink} to="/" color="on-surface" fontSize="18px" onClick={() => { handleSmartNavigate({ preventDefault: () => {} }, '/'); onClose(); }}>Home</Link>
              <Link as={RouterLink} to="/instructions" color="on-surface" fontSize="18px" onClick={onClose}>Instruction</Link>
              <Link as={RouterLink} to="/edu-ai" color="on-surface" fontSize="18px" onClick={onClose}>Edu-AI</Link>
              <Link as={RouterLink} to="/community" color="on-surface" fontSize="18px" onClick={onClose}>Community</Link>
              <Divider my={2} borderColor="surface-container-high" />
              <Button as={RouterLink} to="/join-room" bg="primary" color="white" onClick={onClose}>Join Room</Button>
              <Button as={RouterLink} to="/create-room" variant="outline" colorScheme="blue" onClick={onClose}>Create Room</Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}
