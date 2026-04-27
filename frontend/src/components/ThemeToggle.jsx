import { Button, useColorMode } from '@chakra-ui/react';
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  
  return (
    <Button 
      onClick={toggleColorMode} 
      bg="surface-container-lowest"
      color="primary"
      boxShadow="0 12px 32px -4px rgba(25, 28, 35, 0.06)"
      _hover={{ bg: "surface-container-low" }}
      borderRadius="50px"
      px={3}
      py={3}
    >
      {colorMode === 'light' ? <Moon />: <Sun />}
    </Button>
  );
}
