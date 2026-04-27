import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Flex, VStack, HStack, Text, Input, IconButton, Icon,
  Avatar, Heading, useColorModeValue, Badge, Divider, Spinner, useToast
} from '@chakra-ui/react';
import { Search, Edit, Video, Phone, Info, Plus, Image as ImageIcon, Paperclip, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import messengerService from '../services/messengerService';

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const timeLabel = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString();
};

const ChatItem = ({ chat, active, onClick, currentUserId }) => {
  const bgActive = useColorModeValue('surface', 'surface');
  const otherUser = chat.members?.find(m => m.userId !== currentUserId);
  const displayName = chat.isGroup ? chat.chatName : (otherUser?.fullName || otherUser?.username || 'Unknown');
  const avatarUrl = chat.isGroup ? null : otherUser?.avatarUrl;
  const lastMsg = chat.lastMessage;

  return (
    <Box
      p={3} borderRadius="xl"
      bg={active ? bgActive : 'transparent'}
      boxShadow={active ? 'sm' : 'none'}
      cursor="pointer" onClick={onClick} mb={1}
      border={active ? '1px solid' : '1px solid transparent'}
      borderColor={active ? 'primary' : 'transparent'}
      _hover={{ bg: active ? bgActive : 'surface-container' }}
    >
      <Flex justify="space-between" align="center" mb={1}>
        <HStack>
          <Avatar
            size="sm"
            src={avatarUrl || undefined}
            name={displayName}
            getInitials={getInitials}
            bg={chat.isGroup ? 'purple.500' : 'primary'} color="white"
          />
          <Text fontWeight="bold" fontSize="sm" isTruncated maxW="120px">{displayName}</Text>
        </HStack>
        <Text fontSize="xs" color="outline">{lastMsg ? timeLabel(lastMsg.createdAt) : ''}</Text>
      </Flex>
      <Text fontSize="sm" color="outline" isTruncated>
        {lastMsg ? lastMsg.content : 'No messages yet'}
      </Text>
    </Box>
  );
};

const MessageBubble = ({ msg, isMe, showAvatar }) => {
  const userBg = useColorModeValue('primary', 'primary');
  const otherBg = useColorModeValue('surface-container-low', 'surface-container-low');

  return (
    <Flex w="full" gap={3} mb={4} justify={isMe ? 'flex-end' : 'flex-start'} align="flex-end">
      {!isMe && showAvatar && (
        <Avatar size="xs" name={msg.senderName} getInitials={getInitials} bg="primary" color="white" />
      )}
      {!isMe && !showAvatar && <Box w="24px" />}
      <Box
        maxW="70%" bg={isMe ? userBg : otherBg}
        color={isMe ? 'white' : 'on-surface'}
        p={3} px={4} borderRadius="2xl"
        borderBottomRightRadius={isMe ? 'sm' : '2xl'}
        borderBottomLeftRadius={isMe ? '2xl' : 'sm'}
      >
        {!isMe && showAvatar && <Text fontSize="xs" fontWeight="bold" mb={1}>{msg.senderName}</Text>}
        {msg.type === 'IMAGE' ? (
          <img src={msg.content} alt="image" style={{ maxWidth: 200, borderRadius: 8 }} />
        ) : (
          <Text fontSize="sm">{msg.content}</Text>
        )}
      </Box>
    </Flex>
  );
};

export default function Messenger() {
  const bgLevel1 = useColorModeValue('surface-container-lowest', 'surface-container-lowest');
  const bgLevel2 = useColorModeValue('surface-container-low', 'surface-container-low');
  const bgLevel3 = useColorModeValue('surface-container', 'surface-container');

  const { user } = useAuth();
  const toast = useToast();
  const messagesEndRef = useRef(null);

  const [boxChats, setBoxChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  // Load box chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const data = await messengerService.getUserBoxChats();
        setBoxChats(data);
        if (data.length > 0) setActiveChat(data[0]);
      } catch (e) {
        toast({ title: 'Failed to load chats', status: 'error', duration: 2000 });
      } finally {
        setLoadingChats(false);
      }
    };
    fetchChats();
  }, []);

  // Load messages when active chat changes
  useEffect(() => {
    if (!activeChat) return;
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const data = await messengerService.getChatHistory(activeChat.id);
        setMessages(data);
      } catch (e) {
        toast({ title: 'Failed to load messages', status: 'error', duration: 2000 });
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [activeChat]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim() || !activeChat) return;
    setSending(true);
    try {
      const sent = await messengerService.sendMessage(activeChat.id, messageText);
      setMessages(prev => [...prev, sent]);
      setMessageText('');
    } catch (e) {
      toast({ title: 'Failed to send message', status: 'error', duration: 2000 });
    } finally {
      setSending(false);
    }
  };

  const otherUser = activeChat?.members?.find(m => m.userId !== user?.userId);
  const chatDisplayName = activeChat?.isGroup
    ? activeChat?.chatName
    : (otherUser?.fullName || otherUser?.username || 'Chat');

  return (
    <Flex h="calc(100vh - 73px)" bg={bgLevel1}>
      {/* Conversations List */}
      <Flex w="320px" bg={bgLevel2} direction="column" borderRight="1px solid" borderColor="surface-container-high">
        <Flex p={4} justify="space-between" align="center">
          <Heading size="md">Messages</Heading>
          <IconButton icon={<Edit size={18} />} variant="ghost" size="sm" aria-label="New Message" borderRadius="full" />
        </Flex>
        <Box px={4} mb={4}>
          <HStack bg={bgLevel3} p={2} borderRadius="xl">
            <Icon as={Search} color="outline" ml={2} size={18} />
            <Input variant="unstyled" placeholder="Search conversations..." size="sm" />
          </HStack>
        </Box>
        <Box flex={1} overflowY="auto" px={3}>
          {loadingChats ? (
            <Flex justify="center" mt={4}><Spinner /></Flex>
          ) : boxChats.length === 0 ? (
            <Text p={4} color="outline" textAlign="center" fontSize="sm">No conversations yet</Text>
          ) : (
            boxChats.map(chat => (
              <ChatItem
                key={chat.id} chat={chat}
                active={activeChat?.id === chat.id}
                onClick={() => setActiveChat(chat)}
                currentUserId={user?.userId}
              />
            ))
          )}
        </Box>
      </Flex>

      {/* Main Chat Window */}
      {activeChat ? (
        <Flex flex={1} direction="column" bg={bgLevel1}>
          {/* Chat Header */}
          <Flex p={4} borderBottom="1px solid" borderColor="surface-container-high" justify="space-between" align="center">
            <HStack spacing={3}>
              <Avatar
                size="sm"
                src={otherUser?.avatarUrl || undefined}
                name={chatDisplayName}
                getInitials={getInitials}
                bg="primary" color="white"
              />
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold">{chatDisplayName}</Text>
              </VStack>
            </HStack>
            <HStack spacing={2} color="outline">
              <IconButton icon={<Video size={20} />} variant="ghost" aria-label="Video Call" borderRadius="full" />
              <IconButton icon={<Phone size={20} />} variant="ghost" aria-label="Voice Call" borderRadius="full" />
              <IconButton icon={<Info size={20} />} variant="ghost" aria-label="Information" borderRadius="full" />
            </HStack>
          </Flex>

          {/* Messages */}
          <Box flex={1} p={6} overflowY="auto" display="flex" flexDirection="column">
            {loadingMessages ? (
              <Flex justify="center" mt={4}><Spinner /></Flex>
            ) : messages.length === 0 ? (
              <Text color="outline" textAlign="center" mt={8} fontSize="sm">
                Say hi to start the conversation!
              </Text>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.senderId === user?.userId;
                const prevMsg = messages[idx - 1];
                const showAvatar = !isMe && (idx === 0 || prevMsg?.senderId !== msg.senderId);
                return (
                  <MessageBubble key={msg.id} msg={msg} isMe={isMe} showAvatar={showAvatar} />
                );
              })
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Chat Input */}
          <Box p={4} mb={2}>
            <Flex bg={bgLevel3} p={2} borderRadius="2xl" align="center">
              <HStack spacing={1}>
                <IconButton icon={<Plus size={20} />} variant="ghost" color="primary" aria-label="Add" borderRadius="full" />
                <IconButton icon={<ImageIcon size={20} />} variant="ghost" color="primary" aria-label="Image" borderRadius="full" />
                <IconButton icon={<Paperclip size={20} />} variant="ghost" color="primary" aria-label="Attachment" borderRadius="full" />
              </HStack>
              <Input
                variant="unstyled" placeholder="Type a message..." px={4}
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <IconButton
                icon={<Send size={18} />} colorScheme="blue" bg="primary" color="white"
                aria-label="Send" borderRadius="xl" isLoading={sending}
                onClick={handleSend}
              />
            </Flex>
          </Box>
        </Flex>
      ) : (
        <Flex flex={1} align="center" justify="center" direction="column" gap={4}>
          <Text color="outline" fontSize="lg">Select a conversation</Text>
        </Flex>
      )}
    </Flex>
  );
}
