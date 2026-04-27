package com.example.edu.controller;

import com.example.edu.dto.request.SignalMessage;
import com.example.edu.dto.response.PeerInfo;
import com.example.edu.entity.User;
import com.example.edu.security.SecurityUtil;
import com.example.edu.service.RoomSessionManager;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.util.Set;

@Controller
@RequiredArgsConstructor
public class SignalingController {

    private final SimpMessageSendingOperations messagingTemplate;
    private final RoomSessionManager roomSessionManager;

    @MessageMapping("/signal/join/{roomCode}")
    public void joinRoom(@DestinationVariable String roomCode, SimpMessageHeaderAccessor headerAccessor, Authentication authentication) {
        String sessionId = headerAccessor.getSessionId();

        if (authentication == null) return;

        User user = SecurityUtil.getCurrentUser();
        if(user == null) {
            user = (User) authentication.getPrincipal();
        }

        // Lưu thông tin kèm theo principalName để gửi Direct Message
        PeerInfo peer = PeerInfo.builder()
                .userId(user.getId())
                .principalName(authentication.getName())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .sessionId(sessionId) // Vẫn lưu sessionId cho việc quản lý disconnect
                .build();

        roomSessionManager.addPeer(roomCode, peer);

        // Phát loa: Thông báo cho TẤT CẢ mọi người trong room biết có người MỚI (chỉ phát sự kiện join)
        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/peer-joined", peer);

        // Gửi đích danh: Dùng convertAndSendToUser bằng khóa authentication.getName()
        // để gửi duy nhất cho người vừa join danh sách phòng.
        Set<PeerInfo> existingPeers = roomSessionManager.getPeersInRoom(roomCode);
        messagingTemplate.convertAndSendToUser(
                authentication.getName(),
                "/queue/room/" + roomCode + "/existing-peers",
                existingPeers
        );
    }

    @MessageMapping("/signal/offer/{roomCode}")
    public void sendOffer(@DestinationVariable String roomCode, @Payload SignalMessage message) {
        sendToTarget(roomCode, "offer", message);
    }

    @MessageMapping("/signal/answer/{roomCode}")
    public void sendAnswer(@DestinationVariable String roomCode, @Payload SignalMessage message) {
        sendToTarget(roomCode, "answer", message);
    }

    @MessageMapping("/signal/ice-candidate/{roomCode}")
    public void sendIceCandidate(@DestinationVariable String roomCode, @Payload SignalMessage message) {
        sendToTarget(roomCode, "ice-candidate", message);
    }

    /**
     * Gửi tin nhắn đích danh (Private) đến một Peer cụ thể
     */
    private void sendToTarget(String roomCode, String type, SignalMessage message) {
        if (message.getTargetId() != null) {
            // Frontend cần truyền targetId (chính là principalName lấy từ danh sách peer)
            messagingTemplate.convertAndSendToUser(
                message.getTargetId(),
                "/queue/room/" + roomCode + "/" + type,
                message
            );
        }
    }
}
