import { useState } from 'react';
import {
  Box, Flex, Heading, Text, Button, VStack, HStack, Icon,
  SimpleGrid, Badge, Accordion, AccordionItem, AccordionButton,
  AccordionPanel, AccordionIcon, useColorModeValue, Container,
  Image,
} from '@chakra-ui/react';
import {
  Rocket, Plus, Users, MessageSquare, HelpCircle, Download,
  Settings, Bell, Sparkles, Layout,
} from 'lucide-react';
import qrCodeImage from '../assets/images/qr.png';

const SidebarItem = ({ icon, label, active, onClick }) => {
  const activeBg = useColorModeValue('primary-container', 'rgba(26, 115, 232, 0.2)');
  const activeColor = 'primary';

  return (
    <HStack
      w="100%" p={3} borderRadius="lg" cursor="pointer"
      bg={active ? activeBg : 'transparent'}
      color={active ? activeColor : 'on-surface'}
      transition="all 0.2s"
      _hover={{ bg: activeBg, color: activeColor }}
      onClick={onClick}
    >
      <Icon as={icon} size={18} />
      <Text fontSize="sm" fontWeight={active ? "bold" : "medium"}>{label}</Text>
    </HStack>
  );
};

export default function Instructions() {
  const [activeSection, setActiveSection] = useState('start');
  const cardBg = useColorModeValue('white', 'surface-container-low');
  const borderColor = useColorModeValue('gray.100', 'surface-container-high');

  const scrollToSection = (id) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Box minH="100vh" bg="surface">
      <Container maxW="1200px" py={12}>
        <Flex direction={{ base: 'column', md: 'row' }} gap={12}>
          {/* Sidebar */}
          <Box w={{ base: '100%', md: '250px' }} position={{ md: 'sticky' }} top="100px" h="fit-content">
            <VStack align="start" spacing={1} mb={8}>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={4} letterSpacing="widest">GUIDE CENTER</Text>
              <SidebarItem icon={Rocket} label="Bắt đầu" active={activeSection === 'start'} onClick={() => scrollToSection('start')} />
              <SidebarItem icon={Plus} label="Tạo phòng học" active={activeSection === 'create'} onClick={() => scrollToSection('create')} />
              <SidebarItem icon={Users} label="Tham gia lớp học" active={activeSection === 'join'} onClick={() => scrollToSection('join')} />
              <SidebarItem icon={Sparkles} label="Sử dụng Chatbot AI" active={activeSection === 'ai'} onClick={() => scrollToSection('ai')} />
              <SidebarItem icon={HelpCircle} label="Câu hỏi thường gặp" active={activeSection === 'faq'} onClick={() => scrollToSection('faq')} />
            </VStack>

            <Button
              w="100%" leftIcon={<Download size={16} />} variant="outline" borderColor="primary" color="primary"
              _hover={{ bg: 'primary', color: 'white' }} borderRadius="xl" size="lg"
            >
              Download PDF
            </Button>
          </Box>

          {/* Main Content */}
          <Box flex={1}>
            <VStack align="start" spacing={12} w="100%">
              {/* Header */}
              <Box id="start">
                <Heading size="2xl" mb={4} fontFamily="heading">Hướng dẫn sử dụng</Heading>
                <Text fontSize="lg" color="on-surface" opacity={0.7} maxW="600px">
                  Chào mừng bạn đến với Edu Space — không gian học tập tối giản được thiết kế để tối ưu hóa sự tập trung và tương tác.
                </Text>
              </Box>

              {/* Section 1: Start */}
              <Box w="100%">
                <HStack spacing={4} mb={8}>
                  <Flex bg="primary" color="white" w="36px" h="36px" borderRadius="full" align="center" justify="center" fontWeight="bold">1</Flex>
                  <Heading size="lg">Bắt đầu hành trình</Heading>
                </HStack>

                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
                  <Box bg={cardBg} p={8} borderRadius="2xl" border="1px solid" borderColor={borderColor} gridColumn={{ lg: "span 2" }}>
                    <Heading size="md" mb={3}>Thiết lập tài khoản</Heading>
                    <Text fontSize="sm" opacity={0.7} mb={6}>
                      Edu Space hỗ trợ đăng nhập một chạm qua Google hoặc Microsoft. Sau khi đăng nhập, bạn có thể tùy chỉnh không gian làm việc của mình ngay lập tức.
                    </Text>
                    <Box bg="surface-container-lowest" borderRadius="xl" h="200px" overflow="hidden">
                      <Image
                        src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                        alt="Login setup" objectFit="cover" w="100%" h="100%"
                      />
                    </Box>
                  </Box>

                  <Box bg="surface-container-low" p={6} borderRadius="2xl" border="1px solid" borderColor={borderColor}>
                    <Flex bg="primary" color="white" p={2} borderRadius="lg" w="fit-content" mb={4}>
                      <Settings size={20} />
                    </Flex>
                    <Heading size="sm" mb={2}>Cấu hình Avatar</Heading>
                    <Text fontSize="xs" opacity={0.7}>Chọn hình ảnh đại diện chuyên nghiệp để bắt đầu kết nối.</Text>
                  </Box>

                  <Box bg="rgba(155, 81, 224, 0.05)" p={6} borderRadius="2xl" border="1px solid" borderColor="rgba(155, 81, 224, 0.2)">
                    <Flex bg="#9b51e0" color="white" p={2} borderRadius="lg" w="fit-content" mb={4}>
                      <Bell size={20} />
                    </Flex>
                    <Heading size="sm" mb={2} color="#9b51e0">Bật Thông Báo</Heading>
                    <Text fontSize="xs" opacity={0.7}>Đừng bỏ lỡ các buổi học trực tuyến quan trọng từ giáo viên.</Text>
                  </Box>
                </SimpleGrid>
              </Box>

              {/* Section 2: Create */}
              <Box w="100%" id="create">
                <HStack spacing={4} mb={8}>
                  <Flex bg="primary" color="white" w="36px" h="36px" borderRadius="full" align="center" justify="center" fontWeight="bold">2</Flex>
                  <Heading size="lg">Tạo phòng học mới</Heading>
                </HStack>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={12} align="center">
                  <VStack align="start" spacing={4}>
                    <Badge colorScheme="blue" borderRadius="md" px={3}>BƯỚC 1</Badge>
                    <Heading size="md">Truy cập Dashboard</Heading>
                    <Text fontSize="sm" opacity={0.7} textAlign="left">
                      Tại màn hình chính, nhấn vào nút <Text as="span" fontWeight="bold" color="primary">+ Tạo Lớp Học</Text> ở góc phải phía trên. Đây là trung tâm điều khiển của bạn.
                    </Text>
                  </VStack>
                  <Box bg={cardBg} borderRadius="2xl" overflow="hidden" boxShadow="xl">
                    <Image src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Dashboard" />
                  </Box>

                  <Box bg="surface-container-low" borderRadius="2xl" p={8} h="250px" w="100%" display="flex" flexDirection="column" justify="center">
                    <HStack spacing={2} mb={4}>
                      <Box bg="blue.400" w="12px" h="12px" borderRadius="full" />
                      <Box bg="purple.400" w="12px" h="12px" borderRadius="full" />
                      <Box bg="green.400" w="12px" h="12px" borderRadius="full" />
                    </HStack>
                    <Box bg="surface" h="40px" borderRadius="md" mb={4} />
                    <Box bg="surface" h="100px" borderRadius="md" />
                  </Box>
                  <VStack align="start" spacing={4}>
                    <Badge colorScheme="purple" borderRadius="md" px={3}>BƯỚC 2</Badge>
                    <Heading size="md">Thiết lập thông tin</Heading>
                    <Text fontSize="sm" opacity={0.7} textAlign="left">
                      Nhập tên lớp, mô tả và chọn chủ đề màu sắc. Hệ thống sẽ tự động tạo một mã mời (Invite Code) duy nhất cho lớp học của bạn.
                    </Text>
                  </VStack>
                </SimpleGrid>
              </Box>

              {/* Section 3: AI */}
              <Box w="100%" id="ai">
                <Box bg="card-accent" color="white" p={10} borderRadius="3xl" boxShadow="2xl" position="relative" overflow="hidden">
                  <Box position="absolute" top="-10%" right="-5%" w="300px" h="300px" bg="whiteAlpha.100" borderRadius="full" filter="blur(60px)" />

                  <HStack spacing={4} mb={10}>
                    <Flex bg="whiteAlpha.200" color="white" w="36px" h="36px" borderRadius="full" align="center" justify="center" fontWeight="bold">3</Flex>
                    <Heading size="lg">Sử dụng Chatbot AI</Heading>
                  </HStack>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={12}>
                    <VStack align="start" spacing={8}>
                      <Box>
                        <Heading size="md" mb={2}>Trợ lý học tập 24/7</Heading>
                        <Text fontSize="sm" opacity={0.8}>Edu AI luôn sẵn sàng hỗ trợ bạn vượt qua mọi rào cản kiến thức.</Text>
                      </Box>

                      <VStack align="start" spacing={6}>
                        <HStack spacing={4}>
                          <Icon as={MessageSquare} color="blue.200" />
                          <Box>
                            <Text fontWeight="bold" fontSize="sm">Hỏi đáp kiến thức</Text>
                            <Text fontSize="xs" opacity={0.7}>Đặt câu hỏi trực tiếp vào khung chat để nhận lời giải thích chi tiết.</Text>
                          </Box>
                        </HStack>
                        <HStack spacing={4}>
                          <Icon as={Layout} color="purple.200" />
                          <Box>
                            <Text fontWeight="bold" fontSize="sm">Tóm tắt nội dung</Text>
                            <Text fontSize="xs" opacity={0.7}>Yêu cầu AI tóm tắt tài liệu PDF hoặc video bài giảng dài.</Text>
                          </Box>
                        </HStack>
                        <HStack spacing={4}>
                          <Icon as={Sparkles} color="green.200" />
                          <Box>
                            <Text fontWeight="bold" fontSize="sm">Dịch thuật tức thì</Text>
                            <Text fontSize="xs" opacity={0.7}>Chuyển đổi ngôn ngữ tài liệu ngay trong giao diện học tập.</Text>
                          </Box>
                        </HStack>
                      </VStack>
                    </VStack>

                    <Box bg="whiteAlpha.100" borderRadius="2xl" p={4} backdropFilter="blur(10px)" border="1px solid" borderColor="whiteAlpha.200">
                      <VStack align="stretch" spacing={4}>
                        <HStack>
                          <Box bg="primary" p={1} borderRadius="md"><Sparkles size={14} /></Box>
                          <Text fontSize="xs" fontWeight="bold">Edu AI Assistant</Text>
                        </HStack>
                        <Box bg="whiteAlpha.200" p={3} borderRadius="xl" borderBottomLeftRadius={0}>
                          <Text fontSize="xs">Chào bạn! Tôi có thể giúp gì cho bài học hôm nay?</Text>
                        </Box>
                        <Box bg="primary" p={3} borderRadius="xl" borderBottomRightRadius={0} alignSelf="flex-end">
                          <Text fontSize="xs">Hãy tóm tắt cho tôi chương 3 về Kinh tế học Vĩ mô.</Text>
                        </Box>
                        <Box bg="whiteAlpha.100" h="4px" w="40%" borderRadius="full" />
                      </VStack>
                    </Box>
                  </SimpleGrid>
                </Box>
              </Box>

              {/* Section 4: FAQ */}
              <Box w="100%" id="faq">
                <Heading size="lg" mb={8}>Câu hỏi thường gặp</Heading>
                <Accordion allowMultiple>
                  <AccordionItem border="none" mb={4}>
                    <AccordionButton bg="surface-container-low" p={6} borderRadius="xl" _hover={{ bg: 'surface-container-high' }}>
                      <Box flex="1" textAlign="left" fontWeight="bold">Tôi có thể donate cho bạn không?</Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4} pt={4} opacity={0.7}>
                      Có, thoải mái bạn ơi, QR ngay dưới cùng nhé. Mãi Yêu:)))
                    </AccordionPanel>
                  </AccordionItem>

                  <AccordionItem border="none" mb={4}>
                    <AccordionButton bg="surface-container-low" p={6} borderRadius="xl" _hover={{ bg: 'surface-container-high' }}>
                      <Box flex="1" textAlign="left" fontWeight="bold">Số lượng học viên tối đa trong một phòng là bao nhiêu?</Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4} pt={4} opacity={0.7}>
                      Hiện tại, mỗi phòng có thể chứa tới 10 học viên cùng lúc với chất lượng video và âm thanh ổn định nhất.
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </Box>

              <Box
                w="70%"
                bg="surface-container-lowest"
                p={12}
                borderRadius="3xl"
                textAlign="center"
                border="1px solid"
                borderColor="primary"
                boxShadow="0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 0 20px rgba(66, 153, 225, 0.15)"
                transition="all 0.3s ease"
                _hover={{
                  transform: "translateY(-5px)",
                  boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.2), 0 0 30px rgba(66, 153, 225, 0.3)"
                }}
                alignSelf="center"
              >
                <Heading size="lg" mb={2} color="primary">Tấm lòng vàng của các bạn</Heading>
                <Text opacity={0.7} mb={8} fontWeight="medium">
                  Sẽ là động lực to lớn để tôi tiếp tục phát triển dự án. Xin cảm ơn!
                </Text>

                <Box display="flex" justifyContent="center" position="relative">
                  <Box
                    p={1}
                    bg="white"
                    borderRadius="2xl"
                    boxShadow="lg"
                  >
                    <Image
                      src={qrCodeImage}
                      alt="QR"
                      w="400px"
                      h="350px"
                      objectFit="cover"
                      borderRadius="xl"
                    />
                  </Box>
                </Box>
              </Box>
            </VStack>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
