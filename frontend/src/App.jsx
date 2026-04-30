import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Navbar from './components/NavBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Auth from './pages/Auth';
import CreateRoom from './pages/CreateRoom';
import JoinRoom from './pages/JoinRoom';
import VideoRoom from './pages/VideoRoom';
import { ResetPassword } from './pages/ResetPassword';
import Instructions from './pages/Instructions';
import ScrollToTop from './utils/ScrollToTop';
import EduAi from './pages/EduAi';
import Community from './pages/Community';
import Messenger from './pages/Messenger';
import ProtectedRoute from './components/ProtectedRoute';

function StudyArea() {
  return (
    <Box p={8} bg="surface-container-low" minH="calc(100vh - 72px)">
      <h1>Study Area</h1>
    </Box>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={
          <Box minH="100vh" bg="surface" color="on-surface" transition="all 0.2s" display="flex" flexDirection="column">
            <Navbar />
            <Box flex="1">
              <Outlet />
            </Box>
            <Footer />
          </Box>
        }>
          <Route path="/" element={<Home />} />
          <Route path="/study" element={<StudyArea />} />
          <Route path="/create-room" element={<ProtectedRoute><CreateRoom /></ProtectedRoute>} />
          <Route path="/join-room" element={<ProtectedRoute><JoinRoom /></ProtectedRoute>} />
          <Route path="/instructions" element={<Instructions />} />
        </Route>

        <Route element={
          <Box h="100vh" bg="surface" color="on-surface" transition="all 0.2s" display="flex" flexDirection="column" overflow="hidden">
            <Navbar />
            <Box flex="1" overflow="hidden">
              <Outlet />
            </Box>
          </Box>
        }>
          <Route path="/edu-ai" element={<EduAi />} />
          <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
          <Route path="/messenger" element={<ProtectedRoute><Messenger /></ProtectedRoute>} />
        </Route>

        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/room/:roomCode" element={<ProtectedRoute><VideoRoom /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
