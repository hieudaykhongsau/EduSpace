import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Flex, VStack, HStack, Text, Button, Input, IconButton, Icon,
  Avatar, Heading, useColorModeValue, InputGroup, InputLeftElement,
  Spinner, Textarea, useToast
} from '@chakra-ui/react';
import {
  Home, MessageCircle, MoreHorizontal, ThumbsUp, MessageSquare,
  Share2, LogOut, Image as ImageIcon, Paperclip, BarChart2, Search, UserPlus, Send, X
} from 'lucide-react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import communityService from '../services/communityService';
import messengerService from '../services/messengerService';
import friendService from '../services/friendService';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const SidebarItem = ({ icon, text, active, to, onClick }) => {
  const bgActive = useColorModeValue('primary-container', 'primary-container');
  const colorActive = useColorModeValue('primary', 'primary');
  const hoverBg = useColorModeValue('surface-container-high', 'surface-container-high');

  return (
    <Button
      as={to ? RouterLink : 'button'}
      to={to}
      onClick={onClick}
      variant="ghost"
      w="full"
      justifyContent="flex-start"
      leftIcon={<Icon as={icon} size={20} />}
      bg={active ? bgActive : 'transparent'}
      color={active ? colorActive : 'on-surface'}
      _hover={{ bg: active ? bgActive : hoverBg }}
      fontWeight={active ? '700' : '500'}
      px={4} py={6} borderRadius="xl"
    >
      <Text fontSize="md">{text}</Text>
    </Button>
  );
};

const Post = ({ post, onLike, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const toast = useToast();

  const handleToggleComments = async () => {
    setShowComments(prev => !prev);
    if (!showComments && comments.length === 0) {
      try {
        setLoadingComments(true);
        const data = await communityService.getComments(post.id);
        setComments(data);
      } catch (e) {
        // no-op
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    try {
      const newComment = await communityService.addComment(post.id, commentText);
      setComments(prev => [...prev, newComment]);
      setCommentText('');
    } catch (e) {
      toast({ title: 'Failed to post comment', status: 'error', duration: 2000 });
    }
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();

    if (diff <= 0) return 'vừa xong';

    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'vừa xong';
    if (mins < 60) return `${mins}m trước`;

    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h trước`;

    return `${Math.floor(hrs / 24)}d trước`;
  };

  const cardBg = useColorModeValue('surface', 'surface');

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/community#post-${post.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'EduSpace Post',
          text: 'Check out this post on EduSpace!',
          url: shareUrl,
        });
        // Success silently or show toast
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          fallbackCopy(shareUrl);
        }
      }
    } else {
      fallbackCopy(shareUrl);
    }
  };

  const fallbackCopy = (url) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        toast({ title: 'Đã chép liên kết!', status: 'success', duration: 2000 });
      }).catch(err => {
        toast({ title: 'Lỗi khi chép liên kết', status: 'error', duration: 2000 });
      });
    } else {
      // Fallback cho HTTP / trình duyệt cũ
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast({ title: 'Đã chép liên kết!', status: 'success', duration: 2000 });
      } catch (err) {
        toast({ title: 'Lỗi khi chép liên kết', status: 'error', duration: 2000 });
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <Box id={`post-${post.id}`} bg={cardBg} p={5} borderRadius="2xl" mb={6} boxShadow="sm" border="1px solid" borderColor="surface-container-low">
      <Flex justify="space-between" align="center" mb={4}>
        <HStack spacing={3}>
          <Avatar
            size="sm"
            src={post.authorAvatarUrl || post.author?.avatarUrl || undefined}
            name={post.authorName || post.author?.fullName}
            getInitials={getInitials}
            bg="primary" color="white"
          />
          <VStack align="start" spacing={0}>
            <Text fontWeight="bold" fontSize="sm">{post.authorName || post.author?.fullName}</Text>
            <Text fontSize="xs" color="outline">{timeAgo(post.createdAt)}</Text>
          </VStack>
        </HStack>
        <IconButton icon={<MoreHorizontal size={20} />} variant="ghost" size="sm" aria-label="More" borderRadius="full" />
      </Flex>

      <Text fontSize="md" mb={4}>{post.content}</Text>

      {post.mediaUrl && (
        <Box w="full" borderRadius="xl" mb={4} overflow="hidden">
          <img src={post.mediaUrl} alt="Post media" style={{ width: '100%', objectFit: 'cover', maxHeight: 300 }} />
        </Box>
      )}

      <HStack spacing={6} color="outline">
        <Button
          variant="ghost" size="sm"
          leftIcon={<ThumbsUp size={18} />}
          _hover={{ color: 'primary', bg: 'primary-container' }}
          borderRadius="full"
          onClick={() => onLike(post.id)}
          color={(post.liked || post.isLikedByCurrentUser) ? 'primary' : 'outline'}
          fontWeight={(post.liked || post.isLikedByCurrentUser) ? 'bold' : 'normal'}
        >
          {post.likeCount || 0}
        </Button>
        <Button
          variant="ghost" size="sm"
          leftIcon={<MessageSquare size={18} />}
          _hover={{ color: 'primary', bg: 'primary-container' }}
          borderRadius="full"
          onClick={handleToggleComments}
        >
          {post.commentCount || 0}
        </Button>
        <IconButton
          icon={<Share2 size={18} />} variant="ghost" size="sm"
          aria-label="Share" ml="auto" borderRadius="full"
          _hover={{ color: 'primary', bg: 'primary-container' }}
          onClick={handleShare}
        />
      </HStack>

      {showComments && (
        <Box mt={4} pt={4} borderTop="1px solid" borderColor="surface-container-low">
          {loadingComments ? (
            <Spinner size="sm" />
          ) : (
            <VStack align="stretch" spacing={3} mb={3}>
              {comments.map(c => (
                <HStack key={c.id} align="start" spacing={2}>
                  <Avatar
                    size="xs"
                    src={c.authorAvatarUrl || c.author?.avatarUrl || undefined}
                    name={c.authorName || c.author?.fullName}
                    getInitials={getInitials}
                    bg="primary" color="white"
                  />
                  <Box bg="surface-container-low" px={3} py={2} borderRadius="xl" flex={1}>
                    <Text fontWeight="bold" fontSize="xs">{c.authorName || c.author?.fullName || 'Anonymous'}</Text>
                    <Text fontSize="sm">{c.content}</Text>
                  </Box>
                </HStack>
              ))}
            </VStack>
          )}
          <HStack>
            <Input
              size="sm" borderRadius="full" placeholder="Write a comment..."
              value={commentText} onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendComment()}
            />
            <IconButton size="sm" icon={<Send size={14} />} borderRadius="full" bg="primary" color="white" onClick={handleSendComment} />
          </HStack>
        </Box>
      )}
    </Box>
  );
};

export default function Community() {
  const sidebarBg = useColorModeValue('surface-container', 'surface-container');
  const mainBg = useColorModeValue('surface-container-low', 'surface-container-low');
  const cardBg = useColorModeValue('surface', 'surface');

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [posts, setPosts] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [postContent, setPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const fileInputRef = useRef(null);
  const [cooldown, setCooldown] = useState(0);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [requestedUsers, setRequestedUsers] = useState(new Set()); // To track users we sent requests to

  // Fetch suggested users
  useEffect(() => {
    const fetchSuggested = async () => {
      try {
        const results = await messengerService.searchUsers('');
        setSuggestedUsers(results.filter(u => u.id !== user?.userId).slice(0, 5));
      } catch (e) {
        // no-op
      }
    };
    if (user?.userId) fetchSuggested();
  }, [user?.userId]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (searchKeyword.trim().length > 0) {
        setIsSearching(true);
        try {
          const results = await messengerService.searchUsers(searchKeyword);
          // Optional: filter out current user
          setSearchResults(results.filter(u => u.id !== user?.userId));
        } catch (e) {
          // no-op
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchKeyword, user?.userId]);

  const handleAddFriend = async (targetUserId) => {
    try {
      await friendService.sendRequest(targetUserId);
      toast({ title: 'Đã gửi lời mời kết bạn!', status: 'success', duration: 2000 });
      setRequestedUsers(prev => new Set(prev).add(targetUserId));
    } catch (e) {
      toast({ title: 'Có lỗi xảy ra hoặc đã gửi lời mời rồi', status: 'error', duration: 2000 });
    }
  };

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const data = await communityService.getFeed();
        setPosts(data);
      } catch (e) {
        toast({ title: 'Failed to load feed', status: 'error', duration: 2000 });
      } finally {
        setLoadingFeed(false);
      }
    };
    fetchFeed();
  }, []);

  // WebSocket for real-time community updates
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const socket = new SockJS(`${baseUrl}/ws`);

    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        // console.log(str);
      },
      onConnect: () => {
        client.subscribe('/topic/community', (msg) => {
          const update = JSON.parse(msg.body);

          if (update.type === 'NEW_POST') {
            // Add new post to top (if it's not from current user who already added it)
            setPosts(prev => {
              if (prev.some(p => p.id === update.data.id)) return prev;
              return [update.data, ...prev];
            });
          }
          else if (update.type === 'LIKE_UPDATE') {
            setPosts(prev => prev.map(p =>
              p.id === update.postId ? { ...p, likeCount: update.likeCount } : p
            ));
          }
          else if (update.type === 'COMMENT_UPDATE') {
            setPosts(prev => prev.map(p =>
              p.id === update.postId ? { ...p, commentCount: update.commentCount } : p
            ));
            // Trigger comment refresh for specific post if comments are open
            // This is handled by each individual Post component below if we wanted, 
            // but for now updating the count is the main goal.
          }
        });
      }
    });

    client.activate();
    return () => {
      client.deactivate();
    };
  }, []);

  const handlePost = async () => {
    if (!postContent.trim() && !selectedFile) return;
    if (cooldown > 0) {
      toast({ title: `Vui lòng chờ ${cooldown} giây`, status: 'warning', duration: 2000 });
      return;
    }
    setPosting(true);
    try {
      const newPost = await communityService.createPost(postContent, imageBase64);
      setPosts(prev => [newPost, ...prev]);
      setPostContent('');
      setSelectedFile(null);
      setImageBase64(null);
      toast({ title: 'Đã đăng bài!', status: 'success', duration: 1500 });
      // Start cooldown timer
      setCooldown(30);
      const timer = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data || 'Failed to create post';
      toast({ title: typeof msg === 'string' ? msg : 'Failed to create post', status: 'error', duration: 3000 });
    } finally {
      setPosting(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        toast({ title: 'Chỉ hỗ trợ đăng ảnh!', status: 'error', duration: 2000 });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setImageBase64(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLike = async (postId) => {
    try {
      await communityService.toggleLike(postId);
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, liked: !p.liked, likeCount: p.liked ? p.likeCount - 1 : p.likeCount + 1 }
          : p
      ));
    } catch (e) {
      // no-op
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <Flex h="calc(100vh - 73px)" bg={mainBg}>
      {/* Left Sidebar */}
      <Box w="280px" bg={sidebarBg} borderRightWidth="1px" borderColor="surface-container-high" p={6} display={{ base: 'none', lg: 'flex' }} flexDirection="column">
        {/* User Info */}
        {user && (
          <HStack spacing={3} mb={8} p={3} bg="surface" borderRadius="xl">
            <Avatar
              size="sm"
              src={user.avatarUrl || undefined}
              name={user.fullName || user.username}
              getInitials={getInitials}
              bg="primary" color="white"
            />
            <VStack align="start" spacing={0} flex={1} minW={0}>
              <Text fontWeight="bold" fontSize="sm" isTruncated>{user.fullName || user.username}</Text>
              <Text fontSize="xs" color="outline" isTruncated>{user.email}</Text>
            </VStack>
          </HStack>
        )}

        <VStack align="stretch" spacing={2} mb={8}>
          <SidebarItem icon={Home} text="Home Feed" active to="/community" />
          <SidebarItem icon={MessageCircle} text="Messenger" to="/messenger" />
        </VStack>

        <Box mt="auto" mb={4}>
          <Button
            w="full" bg="red.400" color="white" size="lg" borderRadius="xl"
            _hover={{ bg: 'red.600', transform: 'translateY(-2px)' }}
            transition="all 0.2s" boxShadow="md"
            onClick={handleLogout}
          >
            <LogOut style={{ marginInline: '5px' }} />
            Logout
          </Button>
        </Box>
      </Box>

      {/* Main Feed */}
      <Box flex={1} overflowY="auto" px={{ base: 4, md: 8 }} py={8} sx={{ '&::-webkit-scrollbar': { width: '0' } }}>
        <Box maxW="2xl" mx="auto">
          {/* Create Post Box */}
          <Box bg={cardBg} p={5} borderRadius="2xl" mb={8} boxShadow="sm" border="1px solid" borderColor="surface-container-low">
            <HStack spacing={4} mb={4} align="start">
              <Avatar
                size="sm" mt={1}
                src={user?.avatarUrl || undefined}
                name={user?.fullName}
                getInitials={getInitials}
                bg="primary" color="white"
              />
              <Textarea
                variant="unstyled"
                placeholder="Share your academic progress or ask a question..."
                fontSize="md"
                resize="none"
                rows={2}
                value={postContent}
                onChange={e => setPostContent(e.target.value)}
              />
            </HStack>

            {/* Image Preview */}
            {selectedFile && (
              <Box mb={4} position="relative" display="inline-block">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  style={{ maxHeight: '150px', borderRadius: '8px' }}
                />
                <IconButton
                  icon={<X size={14} />}
                  size="xs"
                  position="absolute"
                  top="-2"
                  right="-2"
                  borderRadius="full"
                  bg="red.500"
                  color="white"
                  _hover={{ bg: 'red.600' }}
                  onClick={removeSelectedFile}
                  aria-label="Remove file"
                />
              </Box>
            )}

            <Flex justify="space-between" align="center" pt={3} borderTop="1px solid" borderColor="surface-container-highest">
              <HStack spacing={2}>
                <Input
                  type="file"
                  ref={fileInputRef}
                  display="none"
                  onChange={handleFileChange}
                />
                <Button size="sm" variant="ghost" leftIcon={<ImageIcon size={16} color="#3b82f6" />} borderRadius="full" onClick={() => { fileInputRef.current.accept = "image/*"; fileInputRef.current.click(); }}>Media</Button>
              </HStack>
              <Button
                colorScheme="blue" bg="primary" color="white"
                size="sm" borderRadius="full" px={6}
                isLoading={posting}
                isDisabled={(!postContent.trim() && !selectedFile) || cooldown > 0}
                onClick={handlePost}
              >
                {cooldown > 0 ? `Wait ${cooldown}s` : 'Post'}
              </Button>
            </Flex>
          </Box>

          {/* Feed Posts */}
          {loadingFeed ? (
            <Flex justify="center" mt={8}><Spinner size="xl" color="primary" /></Flex>
          ) : posts.length === 0 ? (
            <Text textAlign="center" color="outline" mt={8}>No posts yet. Be the first!</Text>
          ) : (
            posts.map(post => (
              <Post key={post.id} post={post} onLike={handleLike} />
            ))
          )}
        </Box>
      </Box>

      {/* Right Sidebar - Find Friends */}
      <Box
        w="320px"
        bg={sidebarBg}
        borderLeftWidth="1px"
        borderColor="surface-container-high"
        p={6}
        overflowY="auto"
        display={{ base: 'none', xl: 'block' }}
      >
        <Heading size="md" mb={6} color="on-surface">Find Friends</Heading>
        <HStack bg="surface" p={2} borderRadius="xl" mb={6} border="1px solid" borderColor="surface-container-highest">
          <Icon as={Search} color="outline" ml={2} size={18} />
          <Input
            variant="unstyled"
            placeholder="Search users..."
            size="sm"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </HStack>
        <VStack align="stretch" spacing={5}>
          <Text fontSize="xs" fontWeight="bold" color="outline" letterSpacing="wider">SUGGESTED FOR YOU</Text>
          {isSearching ? (
            <Flex justify="center"><Spinner size="sm" color="primary" /></Flex>
          ) : searchKeyword.trim().length > 0 ? (
            searchResults.length > 0 ? (
              searchResults.map(result => (
                <HStack key={result.id} justify="space-between" align="center">
                  <HStack spacing={3}>
                    <Avatar size="sm" src={result.avatarUrl} name={result.fullName || result.username} getInitials={getInitials} bg="primary" color="white" />
                    <VStack align="start" spacing={0} maxW="120px">
                      <Text fontSize="sm" fontWeight="bold" isTruncated w="full">{result.fullName || result.username}</Text>
                    </VStack>
                  </HStack>
                  <IconButton 
                    icon={<UserPlus size={16} />} 
                    size="sm" 
                    variant="ghost" 
                    color="primary" 
                    borderRadius="full" 
                    aria-label="Add Friend" 
                    isDisabled={requestedUsers.has(result.id)}
                    onClick={() => handleAddFriend(result.id)}
                  />
                </HStack>
              ))
            ) : (
              <Text fontSize="sm" color="outline" textAlign="center">Không tìm thấy ai</Text>
            )
          ) : suggestedUsers.length > 0 ? (
            suggestedUsers.map(result => (
              <HStack key={result.id} justify="space-between" align="center">
                <HStack spacing={3}>
                  <Avatar size="sm" src={result.avatarUrl} name={result.fullName || result.username} getInitials={getInitials} bg="primary" color="white" />
                  <VStack align="start" spacing={0} maxW="120px">
                    <Text fontSize="sm" fontWeight="bold" isTruncated w="full">{result.fullName || result.username}</Text>
                  </VStack>
                </HStack>
                <IconButton 
                  icon={<UserPlus size={16} />} 
                  size="sm" 
                  variant="ghost" 
                  color="primary" 
                  borderRadius="full" 
                  aria-label="Add Friend" 
                  isDisabled={requestedUsers.has(result.id)}
                  onClick={() => handleAddFriend(result.id)}
                />
              </HStack>
            ))
          ) : (
            <Text fontSize="sm" color="outline" textAlign="center">Chưa có gợi ý</Text>
          )}
        </VStack>
      </Box>
    </Flex>
  );
}
