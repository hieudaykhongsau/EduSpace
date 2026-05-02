import React, { useState, useEffect } from 'react';
import {
  Box, Flex, VStack, HStack, Text, Input, Button, Avatar, Heading,
  useColorModeValue, Spinner, useToast, Tabs, TabList, TabPanels,
  Tab, TabPanel, Badge, IconButton, Divider
} from '@chakra-ui/react';
import { User, UserCheck, UserX, Clock, Save, Mail, AtSign, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import friendService from '../services/friendService';

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function Profile() {
  const cardBg = useColorModeValue('surface', 'surface');
  const mainBg = useColorModeValue('surface-container-low', 'surface-container-low');
  const inputBg = useColorModeValue('surface-container', 'surface-container');

  const { user } = useAuth();
  const toast = useToast();

  // Profile state
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);

  // Friend requests state
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loadingReceived, setLoadingReceived] = useState(true);
  const [loadingSent, setLoadingSent] = useState(true);
  const [processingIds, setProcessingIds] = useState(new Set());

  // Friends list state
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
    }
  }, [user]);

  useEffect(() => {
    fetchReceivedRequests();
    fetchSentRequests();
    fetchFriends();
  }, []);

  const fetchReceivedRequests = async () => {
    try {
      const data = await friendService.getPendingRequests();
      setReceivedRequests(data);
    } catch (e) { /* no-op */ }
    finally { setLoadingReceived(false); }
  };

  const fetchSentRequests = async () => {
    try {
      const data = await friendService.getSentRequests();
      setSentRequests(data);
    } catch (e) { /* no-op */ }
    finally { setLoadingSent(false); }
  };

  const fetchFriends = async () => {
    try {
      const data = await friendService.getFriends();
      setFriends(data);
    } catch (e) { /* no-op */ }
    finally { setLoadingFriends(false); }
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast({ title: 'Tên không được để trống', status: 'warning', duration: 2000 });
      return;
    }
    setSaving(true);
    try {
      await authService.updateProfile(fullName);
      toast({ title: 'Đã cập nhật thành công!', status: 'success', duration: 2000 });
    } catch (e) {
      toast({ title: 'Lỗi khi cập nhật', status: 'error', duration: 2000 });
    } finally {
      setSaving(false);
    }
  };

  const handleAccept = async (requesterId) => {
    setProcessingIds(prev => new Set(prev).add(requesterId));
    try {
      await friendService.acceptRequest(requesterId);
      toast({ title: 'Đã chấp nhận lời mời!', status: 'success', duration: 2000 });
      setReceivedRequests(prev => prev.filter(r => r.requester.id !== requesterId));
      fetchFriends();
    } catch (e) {
      toast({ title: 'Có lỗi xảy ra', status: 'error', duration: 2000 });
    } finally {
      setProcessingIds(prev => { const next = new Set(prev); next.delete(requesterId); return next; });
    }
  };

  const handleDecline = async (requesterId) => {
    setProcessingIds(prev => new Set(prev).add(requesterId));
    try {
      await friendService.declineRequest(requesterId);
      toast({ title: 'Đã từ chối lời mời', status: 'info', duration: 2000 });
      setReceivedRequests(prev => prev.filter(r => r.requester.id !== requesterId));
    } catch (e) {
      toast({ title: 'Có lỗi xảy ra', status: 'error', duration: 2000 });
    } finally {
      setProcessingIds(prev => { const next = new Set(prev); next.delete(requesterId); return next; });
    }
  };

  const handleCancelSent = async (addresseeId) => {
    setProcessingIds(prev => new Set(prev).add(addresseeId));
    try {
      await friendService.declineRequest(addresseeId);
      toast({ title: 'Đã hủy lời mời', status: 'info', duration: 2000 });
      setSentRequests(prev => prev.filter(r => r.addressee.id !== addresseeId));
    } catch (e) {
      toast({ title: 'Có lỗi xảy ra', status: 'error', duration: 2000 });
    } finally {
      setProcessingIds(prev => { const next = new Set(prev); next.delete(addresseeId); return next; });
    }
  };

  const handleUnfriend = async (friendId) => {
    setProcessingIds(prev => new Set(prev).add(friendId));
    try {
      await friendService.unfriend(friendId);
      toast({ title: 'Đã hủy kết bạn', status: 'info', duration: 2000 });
      setFriends(prev => prev.filter(f => f.id !== friendId));
    } catch (e) {
      toast({ title: 'Có lỗi xảy ra', status: 'error', duration: 2000 });
    } finally {
      setProcessingIds(prev => { const next = new Set(prev); next.delete(friendId); return next; });
    }
  };

  return (
    <Flex minH="calc(100vh - 73px)" bg={mainBg} justify="center" py={10} px={4}>
      <Box w="full" maxW="3xl">
        {/* Profile Header */}
        <Box bg={cardBg} borderRadius="2xl" p={8} mb={6} boxShadow="sm" border="1px solid" borderColor="surface-container-low" textAlign="center">
          <Avatar
            size="2xl"
            src={user?.avatarUrl || undefined}
            name={user?.fullName || user?.username}
            getInitials={getInitials}
            bg="primary" color="white"
            mb={4}
            boxShadow="lg"
          />
          <Heading size="lg" mb={1}>{user?.fullName || user?.username}</Heading>
          <Text fontSize="sm" color="outline">@{user?.username}</Text>
          <HStack justify="center" mt={3} spacing={4}>
            <Badge colorScheme="blue" borderRadius="full" px={3} py={1} fontSize="xs">
              <HStack spacing={1}><Shield size={12} /> <Text>{user?.role || 'GUEST'}</Text></HStack>
            </Badge>
            <Badge colorScheme="green" borderRadius="full" px={3} py={1} fontSize="xs">
              <HStack spacing={1}><UserCheck size={12} /> <Text>{friends.length} Friends</Text></HStack>
            </Badge>
          </HStack>
        </Box>

        {/* Tabs */}
        <Box bg={cardBg} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="surface-container-low" overflow="hidden">
          <Tabs variant="enclosed" colorScheme="blue">
            <TabList overflowX="auto" overflowY="hidden" borderBottom="1px solid" borderColor="surface-container-high" px={4} pt={2} sx={{ '&::-webkit-scrollbar': { display: 'none' } }}>
              <Tab
                _selected={{ color: 'primary', borderColor: 'primary', borderBottom: '2px solid', fontWeight: 'bold' }}
                borderRadius="lg lg 0 0" px={6}
              >
                <HStack spacing={2}><User size={16} /> <Text>Personal Info</Text></HStack>
              </Tab>
              <Tab
                _selected={{ color: 'primary', borderColor: 'primary', borderBottom: '2px solid', fontWeight: 'bold' }}
                borderRadius="lg lg 0 0" px={6}
              >
                <HStack spacing={2}>
                  <UserCheck size={16} />
                  <Text>Friend Requests</Text>
                  {receivedRequests.length > 0 && (
                    <Badge colorScheme="red" borderRadius="full" fontSize="xs">{receivedRequests.length}</Badge>
                  )}
                </HStack>
              </Tab>
              <Tab
                _selected={{ color: 'primary', borderColor: 'primary', borderBottom: '2px solid', fontWeight: 'bold' }}
                borderRadius="lg lg 0 0" px={6}
              >
                <HStack spacing={2}><UserCheck size={16} /><Text>My Friends</Text></HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Tab 1: Personal Info */}
              <TabPanel p={8}>
                <VStack spacing={6} align="stretch">
                  <Box>
                    <HStack mb={2} color="outline"><AtSign size={14} /><Text fontSize="sm" fontWeight="600">Username</Text></HStack>
                    <Input value={user?.username || ''} isReadOnly bg={inputBg} borderRadius="xl" size="lg" variant="filled" opacity={0.7} cursor="not-allowed" />
                  </Box>
                  <Box>
                    <HStack mb={2} color="outline"><Mail size={14} /><Text fontSize="sm" fontWeight="600">Email</Text></HStack>
                    <Input value={user?.email || ''} isReadOnly bg={inputBg} borderRadius="xl" size="lg" variant="filled" opacity={0.7} cursor="not-allowed" />
                  </Box>
                  <Box>
                    <HStack mb={2} color="primary"><User size={14} /><Text fontSize="sm" fontWeight="600">Full Name</Text></HStack>
                    <Input
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      bg={inputBg}
                      borderRadius="xl"
                      size="lg"
                      variant="filled"
                      placeholder="Enter your full name"
                      _focus={{ borderColor: 'primary', bg: inputBg }}
                    />
                  </Box>
                  <Button
                    leftIcon={<Save size={16} />}
                    bg="primary" color="white"
                    _hover={{ opacity: 0.9, transform: 'translateY(-1px)' }}
                    transition="all 0.2s"
                    borderRadius="xl" size="lg"
                    isLoading={saving}
                    onClick={handleSaveProfile}
                    alignSelf="flex-end"
                    px={8}
                  >
                    Save Changes
                  </Button>
                </VStack>
              </TabPanel>

              {/* Tab 2: Friend Requests */}
              <TabPanel p={8}>
                {/* Received */}
                <Box mb={8}>
                  <Heading size="sm" mb={4} color="on-surface">
                    <HStack spacing={2}><Clock size={16} /><Text>Received Requests</Text></HStack>
                  </Heading>
                  {loadingReceived ? (
                    <Flex justify="center" py={4}><Spinner color="primary" /></Flex>
                  ) : receivedRequests.length === 0 ? (
                    <Text fontSize="sm" color="outline" textAlign="center" py={4}>Không có lời mời nào</Text>
                  ) : (
                    <VStack spacing={3} align="stretch">
                      {receivedRequests.map(req => (
                        <HStack key={req.id} bg={inputBg} p={4} borderRadius="xl" justify="space-between" align="center">
                          <HStack spacing={3}>
                            <Avatar size="sm" src={req.requester.avatarUrl} name={req.requester.fullName} getInitials={getInitials} bg="primary" color="white" />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="bold" fontSize="sm">{req.requester.fullName || 'Unknown'}</Text>
                              <Text fontSize="xs" color="outline">{timeAgo(req.createdAt)}</Text>
                            </VStack>
                          </HStack>
                          <HStack spacing={2}>
                            <Button
                              size="sm" bg="primary" color="white" borderRadius="full"
                              _hover={{ opacity: 0.9 }}
                              leftIcon={<UserCheck size={14} />}
                              isLoading={processingIds.has(req.requester.id)}
                              onClick={() => handleAccept(req.requester.id)}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm" variant="outline" borderRadius="full"
                              colorScheme="red"
                              leftIcon={<UserX size={14} />}
                              isLoading={processingIds.has(req.requester.id)}
                              onClick={() => handleDecline(req.requester.id)}
                            >
                              Decline
                            </Button>
                          </HStack>
                        </HStack>
                      ))}
                    </VStack>
                  )}
                </Box>

                <Divider mb={6} />

                {/* Sent */}
                <Box>
                  <Heading size="sm" mb={4} color="on-surface">
                    <HStack spacing={2}><Clock size={16} /><Text>Sent Requests</Text></HStack>
                  </Heading>
                  {loadingSent ? (
                    <Flex justify="center" py={4}><Spinner color="primary" /></Flex>
                  ) : sentRequests.length === 0 ? (
                    <Text fontSize="sm" color="outline" textAlign="center" py={4}>Bạn chưa gửi lời mời nào</Text>
                  ) : (
                    <VStack spacing={3} align="stretch">
                      {sentRequests.map(req => (
                        <HStack key={req.id} bg={inputBg} p={4} borderRadius="xl" justify="space-between" align="center">
                          <HStack spacing={3}>
                            <Avatar size="sm" src={req.addressee.avatarUrl} name={req.addressee.fullName} getInitials={getInitials} bg="primary" color="white" />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="bold" fontSize="sm">{req.addressee.fullName || 'Unknown'}</Text>
                              <HStack spacing={1}>
                                <Badge colorScheme="yellow" borderRadius="full" fontSize="2xs">Pending</Badge>
                                <Text fontSize="xs" color="outline">{timeAgo(req.createdAt)}</Text>
                              </HStack>
                            </VStack>
                          </HStack>
                          <Button
                            size="sm" variant="outline" borderRadius="full"
                            colorScheme="red"
                            leftIcon={<UserX size={14} />}
                            isLoading={processingIds.has(req.addressee.id)}
                            onClick={() => handleCancelSent(req.addressee.id)}
                          >
                            Cancel
                          </Button>
                        </HStack>
                      ))}
                    </VStack>
                  )}
                </Box>
              </TabPanel>

              {/* Tab 3: My Friends */}
              <TabPanel p={8}>
                <Heading size="sm" mb={4} color="on-surface">
                  <HStack spacing={2}><UserCheck size={16} /><Text>Friends ({friends.length})</Text></HStack>
                </Heading>
                {loadingFriends ? (
                  <Flex justify="center" py={4}><Spinner color="primary" /></Flex>
                ) : friends.length === 0 ? (
                  <Text fontSize="sm" color="outline" textAlign="center" py={4}>Bạn chưa có bạn bè nào</Text>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {friends.map(friend => (
                      <HStack key={friend.id} bg={inputBg} p={4} borderRadius="xl" justify="space-between" align="center">
                        <HStack spacing={3}>
                          <Avatar size="sm" src={friend.avatarUrl} name={friend.fullName} getInitials={getInitials} bg="primary" color="white" />
                          <Text fontWeight="bold" fontSize="sm">{friend.fullName || 'Unknown'}</Text>
                        </HStack>
                        <Button
                          size="sm" variant="outline" borderRadius="full"
                          colorScheme="red"
                          leftIcon={<UserX size={14} />}
                          isLoading={processingIds.has(friend.id)}
                          onClick={() => handleUnfriend(friend.id)}
                        >
                          Unfriend
                        </Button>
                      </HStack>
                    ))}
                  </VStack>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
    </Flex>
  );
}
