import { extendTheme } from '@chakra-ui/react'

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const semanticTokens = {
  colors: {
    'surface': {
      default: '#f4f6f8',
      _dark: '#0f1115', // Đen sâu hơn nhưng không phải đen tuyền
    },
    'surface-container': {
      default: '#ffffff',
      _dark: '#1a1d23', // Màu card ở mode tối
    },
    'surface-container-low': {
      default: '#e9ecef',
      _dark: '#252932', // Màu nền nhẹ cho các section
    },
    'surface-container-lowest': {
      default: '#ffffff',
      _dark: '#0a0c10',
    },
    'on-surface': {
      default: '#191c23',
      _dark: '#e2e8f0', // Chữ trắng xanh nhẹ, đỡ mỏi mắt
    },
    'primary': {
      default: '#005bbf',
      _dark: '#60a5fa', // Xanh dương sáng hơn cho Dark Mode
    },
    'secondary': {
      default: '#9b51e0',
      _dark: '#c4b5fd', // Tím pastel
    },
    // Sửa lỗi thẻ "The Stage" bằng cách dùng token này
    'card-accent': {
      default: '#2d3038', // Dark cho light mode
      _dark: '#334155', // Slate trung tính cho dark mode
    }
  }
}

const styles = {
  global: (props) => ({
    html: {
      scrollBehavior: 'smooth',
    },
    body: {
      bg: props.colorMode === 'dark' ? 'surface' : 'surface',
      color: props.colorMode === 'dark' ? 'on-surface' : 'on-surface',
      transition: 'background-color 0.2s',
    },
  }),
}

const fonts = {
  heading: `'Manrope', sans-serif`,
  body: `'Inter', sans-serif`,
}

const theme = extendTheme({ config, semanticTokens, styles, fonts })
export default theme