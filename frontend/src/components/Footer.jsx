import { Box, Flex, Text, VStack, HStack, Link, SimpleGrid } from '@chakra-ui/react';

export default function Footer() {
  return (
    <Box bg="surface-container-low" pt={16} pb={8} px={{ base: 8, md: 16 }} mt={20} id='contact'>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={12} mb={12}>
        <VStack align="start" spacing={4}>
          <Text fontWeight="bold" fontFamily="heading" color="on-surface">The Intellectual Canvas</Text>
          <Text fontSize="sm" color="on-surface" opacity={0.8} maxW="300px">
            A distilled environment for those who treat learning as a craft. Part of The Distilled Academy ecosystem.
          </Text>
        </VStack>
        <VStack align="start" spacing={4}>
          <Text fontWeight="bold" fontSize="sm" letterSpacing="widest" textTransform="uppercase">Platform</Text>
          <Link fontSize="sm" opacity={0.8} _hover={{ color: 'primary' }}>Classrooms</Link>
          <Link fontSize="sm" opacity={0.8} _hover={{ color: 'primary' }}>Shared Library</Link>
          <Link fontSize="sm" opacity={0.8} _hover={{ color: 'primary' }}>Whiteboards</Link>
        </VStack>
        <VStack align="start" spacing={4}>
          <Text fontWeight="bold" fontSize="sm" letterSpacing="widest" textTransform="uppercase">Company</Text>
          <Link fontSize="sm" opacity={0.8} _hover={{ color: 'primary' }}>Mission</Link>
          <Link fontSize="sm" opacity={0.8} _hover={{ color: 'primary' }}>Privacy Policy</Link>
          <Link fontSize="sm" opacity={0.8} _hover={{ color: 'primary' }}>Terms of Use</Link>
        </VStack>
      </SimpleGrid>
      
      <Flex borderTop="1px solid" borderColor="surface-container-lowest" pt={8} justify="space-between" align="center" direction={{ base: 'column', md: 'row' }}>
        <Text fontSize="xs" opacity={0.6}>© 2024 THE INTELLECTUAL CANVAS. ALL RIGHTS RESERVED.</Text>
        <HStack spacing={6} mt={{ base: 4, md: 0 }}>
          <Link fontSize="xs" fontWeight="bold" letterSpacing="widest" _hover={{ color: 'primary' }}>TWITTER</Link>
          <Link fontSize="xs" fontWeight="bold" letterSpacing="widest" _hover={{ color: 'primary' }}>LINKEDIN</Link>
          <Link fontSize="xs" fontWeight="bold" letterSpacing="widest" _hover={{ color: 'primary' }}>RESEARCHGATE</Link>
        </HStack>
      </Flex>
    </Box>
  );
}
