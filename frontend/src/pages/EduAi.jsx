import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Flex, VStack, HStack, Text, Button, Input, IconButton, Icon,
  Avatar, Heading, useColorModeValue, Spinner, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,
  SimpleGrid, Tabs, TabList, Tab, TabPanels, TabPanel, Badge, Textarea
} from '@chakra-ui/react';
import {
  Plus, MessageSquare, Send, Paperclip, Image as ImageIcon,
  Bot, BookOpen, Globe, Atom, Calculator, FlaskConical,
  Languages, Music, Code, Lightbulb, ChevronRight, Trash2, Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axiosConfig';

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const EDU_SUBJECTS = [
  { label: 'Toán học', icon: Calculator, color: 'blue.500' },
  { label: 'Vật lý', icon: Atom, color: 'purple.500' },
  { label: 'Hóa học', icon: FlaskConical, color: 'green.500' },
  { label: 'Văn học', icon: BookOpen, color: 'orange.500' },
  { label: 'Lập trình', icon: Code, color: 'teal.500' },
  { label: 'Tiếng Anh', icon: Languages, color: 'red.500' },
  { label: 'Lịch sử', icon: Globe, color: 'yellow.500' },
  { label: 'Âm nhạc', icon: Music, color: 'pink.500' },
  { label: 'Khác', icon: Lightbulb, color: 'gray.500' },
];

// ─── Topic Selector Modal ─────────────────────────────────────────────────────
function TopicModal({ isOpen, onClose, onSelect }) {
  const [customTopic, setCustomTopic] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handleSelect = (label) => {
    if (label === 'Khác') {
      setShowCustom(true);
    } else {
      onSelect(label);
      onClose();
    }
  };

  const handleCustomConfirm = () => {
    if (customTopic.trim()) {
      onSelect(customTopic.trim());
      setCustomTopic('');
      setShowCustom(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="2xl" mx={4}>
        <ModalHeader>
          <HStack>
            <Box bg="primary" p={2} borderRadius="lg" color="white">
              <BookOpen size={20} />
            </Box>
            <Text>Chọn Môn Học / Chủ Đề</Text>
          </HStack>
        </ModalHeader>
        <ModalBody pb={6}>
          {!showCustom ? (
            <>
              <Text fontSize="sm" color="gray.500" mb={4}>
                Chọn môn học để AI tập trung hỗ trợ đúng chuyên môn của bạn.
              </Text>
              <SimpleGrid columns={3} spacing={3}>
                {EDU_SUBJECTS.map(({ label, icon: SubIcon, color }) => (
                  <Button
                    key={label}
                    variant="outline"
                    h="auto"
                    py={4}
                    flexDirection="column"
                    gap={2}
                    borderRadius="xl"
                    _hover={{ borderColor: 'primary', bg: 'blue.50', _dark: { bg: 'blue.900' } }}
                    onClick={() => handleSelect(label)}
                  >
                    <Icon as={SubIcon} size={22} color={color} />
                    <Text fontSize="xs" fontWeight="600">{label}</Text>
                  </Button>
                ))}
              </SimpleGrid>
            </>
          ) : (
            <VStack spacing={4}>
              <Text fontSize="sm" color="gray.500">Nhập tên môn học / chủ đề của bạn:</Text>
              <Input
                placeholder="Vd: Triết học, Kinh tế vi mô..."
                value={customTopic}
                onChange={e => setCustomTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCustomConfirm()}
                autoFocus
                size="lg"
                borderRadius="xl"
              />
              <HStack w="full">
                <Button variant="ghost" onClick={() => setShowCustom(false)} flex={1}>Quay lại</Button>
                <Button bg="primary" color="white" onClick={handleCustomConfirm} flex={1} isDisabled={!customTopic.trim()}>
                  Bắt đầu
                </Button>
              </HStack>
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function ChatMessage({ msg, user, isSystemBot }) {
  const aiBg = useColorModeValue('surface-container-low', 'surface-container-low');
  const userBg = useColorModeValue('primary', 'primary');

  if (msg.isAi) {
    return (
      <Flex w="full" gap={3} mb={5} align="flex-end">
        <Avatar
          size="sm"
          icon={<Icon as={isSystemBot ? Bot : MessageSquare} fontSize="1.1rem" />}
          bg={isSystemBot ? 'teal.500' : 'purple.500'} color="white"
          flexShrink={0}
        />
        <Box maxW="75%" bg={aiBg} p={4} borderRadius="2xl" borderBottomLeftRadius="sm" boxShadow="sm">
          {msg.isLoading ? (
            <HStack>
              <Spinner size="xs" />
              <Text fontSize="sm" color="gray.500">Đang soạn câu trả lời...</Text>
            </HStack>
          ) : (
            <Text fontSize="sm" lineHeight="tall" whiteSpace="pre-wrap">{msg.text}</Text>
          )}
        </Box>
      </Flex>
    );
  }

  return (
    <Flex w="full" gap={3} mb={5} justify="flex-end" align="flex-end">
      <Box maxW="75%" bg={userBg} color="white" p={4} borderRadius="2xl" borderBottomRightRadius="sm">
        <Text fontSize="sm" lineHeight="tall">{msg.text}</Text>
      </Box>
      <Avatar
        size="sm"
        src={user?.avatarUrl || undefined}
        name={user?.fullName || user?.username}
        getInitials={getInitials}
        bg="primary" color="white"
        flexShrink={0}
      />
    </Flex>
  );
}

// ─── Support Bot Panel ────────────────────────────────────────────────────────
function SystemBotPanel({ user }) {
  const [messages, setMessages] = useState([
    {
      id: 1, isAi: true,
      text: `Xin chào! Tôi là EduSpace Support Bot 🤖\n\nTôi có thể giúp bạn:\n• Hướng dẫn sử dụng các tính năng của EduSpace\n• Giải đáp thắc mắc về tài khoản & phòng học\n• Thông tin về nền tảng Edu-Space\n\nBạn cần hỗ trợ gì?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const quickQs = [
    'Cách tạo phòng học?',
    'Phòng tối đa bao nhiêu người?',
    'Cách dùng Edu AI?',
    'Liên hệ hỗ trợ?',
  ];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMsg = async (text) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    setInput('');

    const userMsg = { id: Date.now(), isAi: false, text: msg };
    const loadingMsg = { id: Date.now() + 1, isAi: true, text: '', isLoading: true };
    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append('message', msg);
      fd.append('type', 'system');
      fd.append('topic', 'system');
      fd.append('isNewChat', 'false');
      const res = await api.post('/api/chat', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const reply = res.data?.reply || 'Tôi không thể trả lời câu hỏi này.';
      setMessages(prev => [...prev.filter(m => !m.isLoading), { id: Date.now() + 2, isAi: true, text: reply }]);
    } catch {
      setMessages(prev => [...prev.filter(m => !m.isLoading), { id: Date.now() + 2, isAi: true, text: 'Đã xảy ra lỗi. Vui lòng thử lại.' }]);
    } finally {
      setLoading(false);
    }
  };

  const bgLevel1 = useColorModeValue('surface', 'surface');
  const bgLevel3 = useColorModeValue('surface-container', 'surface-container');

  return (
    <Flex flex={1} direction="column" bg={bgLevel1}>
      {/* Header */}
      <Flex p={4} borderBottom="1px solid" borderColor="surface-container-high" align="center" gap={3} >
        <Avatar size="sm" icon={<Bot size={18} />} bg="teal.500" color="white" />
        <VStack align="start" spacing={0}>
          <Text fontWeight="bold" fontSize="sm">EduSpace Support Bot</Text>
          <HStack spacing={1}>
            <Box w={2} h={2} bg="green.400" borderRadius="full" />
            <Text fontSize="xs" color="green.500">Online 24/7</Text>
          </HStack>
        </VStack>
        <Badge ml="auto" colorScheme="teal" borderRadius="full" px={3}>System</Badge>
      </Flex>

      {/* Messages */}
      <Box flex={1} p={5} overflowY="auto" display="flex" flexDirection="column">
        {messages.map(msg => (
          <ChatMessage key={msg.id} msg={msg} user={user} isSystemBot />
        ))}
        <div ref={endRef} />
      </Box>

      {/* Quick Questions */}
      <Box px={5} pb={2}>
        <HStack spacing={2} flexWrap="wrap">
          {quickQs.map(q => (
            <Button
              key={q} size="xs" variant="outline" borderRadius="full"
              onClick={() => sendMsg(q)}
              _hover={{ bg: 'teal.50', borderColor: 'teal.400' }}
            >
              {q}
            </Button>
          ))}
        </HStack>
      </Box>

      {/* Input */}
      <Box p={4}>
        <Flex bg={bgLevel3} p={2} borderRadius="2xl" align="center">
          <Input
            variant="unstyled" placeholder="Hỏi về EduSpace..." px={3}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMsg()}
          />
          <IconButton
            icon={<Send size={16} />} bg="teal.500" color="white"
            aria-label="Send" borderRadius="xl" size="sm"
            isLoading={loading}
            onClick={() => sendMsg()}
          />
        </Flex>
      </Box>
    </Flex>
  );
}

// ─── Edu AI Chat Panel ────────────────────────────────────────────────────────
function EduChatPanel({ session, onSend, isLoading, user }) {
  const [input, setInput] = useState('');
  const endRef = useRef(null);
  const bgLevel3 = useColorModeValue('surface-container', 'surface-container');
  const mainBg = useColorModeValue('surface', 'surface');

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  const handleSend = (text) => {
    const msg = text || input;
    if (!msg.trim() || isLoading) return;
    setInput('');
    onSend(msg);
  };

  const suggestions = ['Giải bài tập', 'Giải thích khái niệm', 'Luyện đề thi', 'Tóm tắt lý thuyết'];

  return (
    <Flex flex={1} direction="column" bg={mainBg}>
      {/* Header */}
      <Flex p={4} borderBottom="1px solid" borderColor="surface-container-high" align="center" gap={3}>
        <Avatar size="sm" icon={<MessageSquare size={18} />} bg="purple.500" color="white" />
        <VStack align="start" spacing={0}>
          <Text fontWeight="bold" fontSize="sm">{session?.title || 'New Chat'}</Text>
          <Text fontSize="xs" color="purple.500">Chủ đề: {session?.topic || 'Chung'}</Text>
        </VStack>
      </Flex>

      {/* Messages */}
      <Box flex={1} p={6} overflowY="auto" display="flex" flexDirection="column">
        {(!session?.messages || session.messages.length === 0) && (
          <>
            <ChatMessage
              msg={{ id: 0, isAi: true, text: `Xin chào${user?.fullName ? ' ' + user.fullName : ''}! Tôi là Edu AI, chuyên gia về **${session?.topic || 'học tập'}**.\n\nHôm nay bạn muốn học gì?` }}
              user={user}
            />
            <Flex gap={2} flexWrap="wrap" ml={12} mb={4}>
              {suggestions.map(s => (
                <Button key={s} size="xs" variant="outline" borderRadius="full"
                  onClick={() => handleSend(s)}
                  _hover={{ borderColor: 'purple.400', bg: 'purple.50', _dark: { bg: 'purple.900' } }}>
                  {s}
                </Button>
              ))}
            </Flex>
          </>
        )}
        {session?.messages?.map(msg => (
          <ChatMessage key={msg.id} msg={msg} user={user} />
        ))}
        <div ref={endRef} />
      </Box>

      {/* Input */}
      <Box p={5} pt={0} maxW="5xl" w="full" mx="auto">
        <Flex
          bg="surface" p={2} borderRadius="2xl" boxShadow="lg"
          border="1px solid" borderColor="surface-container-highest" align="center"
        >
          <HStack spacing={1} pl={1} color="outline">
            <IconButton icon={<Paperclip size={18} />} variant="ghost" aria-label="Attach"
              _hover={{ color: 'primary' }} borderRadius="full" size="sm" />
            <IconButton icon={<ImageIcon size={18} />} variant="ghost" aria-label="Image"
              _hover={{ color: 'primary' }} borderRadius="full" size="sm" />
          </HStack>
          <Input
            variant="unstyled" placeholder={`Hỏi về ${session?.topic || 'bài học'}...`}
            px={3} py={2} fontSize="sm"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            isDisabled={isLoading}
          />
          <IconButton
            icon={<Send size={18} />} bg="primary" color="white"
            aria-label="Send" borderRadius="xl"
            _hover={{ bg: 'primary-container' }}
            onClick={handleSend}
            isLoading={isLoading}
            isDisabled={!input.trim()}
          />
        </Flex>
        <Text textAlign="center" fontSize="10px" color="gray.400" mt={2}>
          Powered by Gemini · Verify important information
        </Text>
      </Box>
    </Flex>
  );
}

// ─── Main EduAi Page ──────────────────────────────────────────────────────────
export default function EduAi() {
  const sidebarBg = useColorModeValue('surface-container', 'surface-container');
  const { user } = useAuth();
  const { isOpen: isTopicOpen, onOpen: openTopic, onClose: closeTopic } = useDisclosure();

  const [eduSessions, setEduSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0=EduAI, 1=SystemBot

  const activeSession = eduSessions.find(s => s.id === activeSessionId);

  const handleNewChat = () => {
    openTopic();
  };

  const handleTopicSelect = (topic) => {
    const newId = Date.now();
    const session = { id: newId, title: `${topic} - Chat mới`, topic, messages: [] };
    setEduSessions(prev => [session, ...prev]);
    setActiveSessionId(newId);
    setActiveTab(0);
  };

  const handleSend = async (text) => {
    if (!text.trim() || isLoading || !activeSession) return;

    const userMsg = { id: Date.now(), isAi: false, text };
    const loadingMsg = { id: Date.now() + 1, isAi: true, text: '', isLoading: true };

    setEduSessions(prev => prev.map(s =>
      s.id === activeSessionId
        ? { ...s, messages: [...s.messages, userMsg, loadingMsg] }
        : s
    ));
    setIsLoading(true);

    try {
      const fd = new FormData();
      fd.append('message', text);
      fd.append('type', 'edu');
      fd.append('topic', activeSession.topic || 'general');
      fd.append('isNewChat', activeSession.messages.length === 0 ? 'true' : 'false');
      const res = await api.post('/api/chat', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const reply = res.data?.reply || 'Xin lỗi, không thể kết nối AI.';
      const title = res.data?.title;

      setEduSessions(prev => prev.map(s => {
        if (s.id !== activeSessionId) return s;
        const msgs = s.messages.filter(m => !m.isLoading);
        return {
          ...s,
          title: title || s.title,
          messages: [...msgs, { id: Date.now() + 2, isAi: true, text: reply }]
        };
      }));
    } catch {
      setEduSessions(prev => prev.map(s => {
        if (s.id !== activeSessionId) return s;
        const msgs = s.messages.filter(m => !m.isLoading);
        return { ...s, messages: [...msgs, { id: Date.now() + 2, isAi: true, text: 'Đã xảy ra lỗi, vui lòng thử lại.' }] };
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = (id) => {
    setEduSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) setActiveSessionId(null);
  };

  return (
    <Flex h="calc(100vh - 73px)" overflow="hidden">
      {/* Topic Modal */}
      <TopicModal isOpen={isTopicOpen} onClose={closeTopic} onSelect={handleTopicSelect} />

      {/* Left Sidebar */}
      <Box w="300px" bg={sidebarBg} borderRightWidth="1px" borderColor="surface-container-high"
        p={4} display="flex" flexDirection="column" h="full" marginTop="10px">

        <Tabs index={activeTab} onChange={setActiveTab} mb={4} colorScheme="purple" size="sm">
          <TabList>
            <Tab flex={1} fontSize="xs" fontWeight="600">
              <HStack spacing={1}><MessageSquare size={14} /><Text>Edu AI</Text></HStack>
            </Tab>
            <Tab flex={1} fontSize="xs" fontWeight="600">
              <HStack spacing={1}><Bot size={14} /><Text>Support</Text></HStack>
            </Tab>
          </TabList>
        </Tabs>

        {activeTab === 0 && (
          <>
            <Button
              w="full" bg="primary" color="white" size="md"
              leftIcon={<Plus size={16} />} mb={4} borderRadius="xl"
              _hover={{ opacity: 0.9, transform: 'translateY(-1px)' }}
              transition="all 0.2s"
              onClick={handleNewChat}
            >
              New Chat
            </Button>

            <VStack align="stretch" spacing={1} flex={1} overflowY="auto">
              <Text fontSize="10px" fontWeight="bold" color="gray.400" px={2} mb={1} textTransform="uppercase">
                Lịch sử
              </Text>
              {eduSessions.length === 0 ? (
                <Text fontSize="xs" color="gray.400" textAlign="center" mt={4} px={2}>
                  Bấm "New Chat" để bắt đầu học!
                </Text>
              ) : (
                eduSessions.map(s => (
                  <Flex
                    key={s.id}
                    align="center" gap={2} px={3} py={2} borderRadius="xl"
                    bg={s.id === activeSessionId ? 'primary' : 'transparent'}
                    color={s.id === activeSessionId ? 'white' : 'on-surface'}
                    cursor="pointer"
                    _hover={{ bg: s.id === activeSessionId ? 'primary' : 'surface-container-high' }}
                    onClick={() => { setActiveSessionId(s.id); setActiveTab(0); }}
                    role="group"
                  >
                    <Icon as={MessageSquare} size={14} flexShrink={0} />
                    <Text fontSize="xs" isTruncated flex={1}>{s.title}</Text>
                    <IconButton
                      icon={<Trash2 size={12} />}
                      size="xs" variant="ghost"
                      aria-label="Delete"
                      opacity={0}
                      _groupHover={{ opacity: 1 }}
                      color={s.id === activeSessionId ? 'white' : 'gray.400'}
                      onClick={e => { e.stopPropagation(); handleDeleteSession(s.id); }}
                    />
                  </Flex>
                ))
              )}
            </VStack>
          </>
        )}

        {activeTab === 1 && (
          <VStack align="start" spacing={3} px={2} pt={2}>
            <HStack>
              <Avatar size="xs" icon={<Bot size={14} />} bg="teal.500" color="white" />
              <Text fontSize="sm" fontWeight="bold">Support Bot</Text>
              <Box w={2} h={2} bg="green.400" borderRadius="full" />
            </HStack>
            <Text fontSize="xs" color="gray.500">
              Trợ lý hỗ trợ 24/7, sẵn sàng giải đáp mọi thắc mắc về nền tảng EduSpace.
            </Text>
            <Box bg="teal.50" _dark={{ bg: 'teal.900' }} p={3} borderRadius="xl" w="full">
              <Text fontSize="xs" fontWeight="bold" color="teal.600" mb={1}>Có thể hỏi:</Text>
              {['Tính năng nền tảng', 'Hướng dẫn sử dụng', 'Thông tin phòng học'].map(t => (
                <HStack key={t} spacing={1} mb={1}>
                  <ChevronRight size={10} color="teal" />
                  <Text fontSize="xs" color="teal.700" _dark={{ color: 'teal.200' }}>{t}</Text>
                </HStack>
              ))}
            </Box>
          </VStack>
        )}
      </Box>

      {/* Main Panel */}
      {activeTab === 1 ? (
        <SystemBotPanel user={user} />
      ) : activeSession ? (
        <EduChatPanel
          session={activeSession}
          onSend={handleSend}
          isLoading={isLoading}
          user={user}
        />
      ) : (
        /* Welcome Screen */
        <Flex flex={1} direction="column" align="center" justify="center" gap={6} p={8}>
          <Avatar size="xl" icon={<MessageSquare size={32} />} bg="purple.500" color="white" />
          <VStack spacing={2}>
            <Heading size="lg">Edu AI Assistant</Heading>
            <Text color="gray.500" textAlign="center" maxW="400px">
              Chọn môn học và bắt đầu học cùng AI. Mỗi phiên chat được tối ưu theo chủ đề bạn chọn.
            </Text>
          </VStack>
          <Button bg="primary" color="white" size="lg" leftIcon={<Plus />}
            borderRadius="xl" px={10} onClick={handleNewChat}
            _hover={{ opacity: 0.9, transform: 'translateY(-2px)' }} transition="all 0.2s">
            Bắt đầu Chat mới
          </Button>
          <SimpleGrid columns={3} spacing={3} maxW="400px">
            {EDU_SUBJECTS.slice(0, 6).map(({ label, icon: SubIcon, color }) => (
              <Button key={label} variant="outline" size="sm" borderRadius="xl"
                leftIcon={<Icon as={SubIcon} color={color} />}
                _hover={{ borderColor: 'primary' }}
                onClick={() => handleTopicSelect(label)}>
                {label}
              </Button>
            ))}
          </SimpleGrid>
        </Flex>
      )}
    </Flex>
  );
}
