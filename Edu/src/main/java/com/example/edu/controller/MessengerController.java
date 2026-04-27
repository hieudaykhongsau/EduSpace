package com.example.edu.controller;

import com.example.edu.dto.request.GroupChatRequest;
import com.example.edu.dto.request.SendMessageRequest;
import com.example.edu.dto.response.BoxChatDto;
import com.example.edu.dto.response.MessageDto;
import com.example.edu.entity.User;
import com.example.edu.enums.MessageType;
import com.example.edu.security.SecurityUtil;
import com.example.edu.service.ChatService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class MessengerController {

    private final ChatService chatService;

    // --- REST Endpoints ---

    @GetMapping("/box")
    public ResponseEntity<List<BoxChatDto>> getUserBoxChats() {
        User user = SecurityUtil.getCurrentUser();
        return ResponseEntity.ok(chatService.getUserBoxChats(user));
    }

    @PostMapping("/box/1on1/{peerId}")
    public ResponseEntity<BoxChatDto> getOrCreateOneToOneChat(@PathVariable Long peerId) {
        User user = SecurityUtil.getCurrentUser();
        return ResponseEntity.ok(chatService.getOrCreateOneToOneChat(user, peerId));
    }

    @PostMapping("/box/group")
    public ResponseEntity<BoxChatDto> createGroupChat(@RequestBody GroupChatRequest request) {
        User user = SecurityUtil.getCurrentUser();
        return ResponseEntity.ok(chatService.createGroupChat(user, request.getChatName(), request.getMemberIds()));
    }

    @GetMapping("/box/{boxId}/messages")
    public ResponseEntity<List<MessageDto>> getChatHistory(@PathVariable Long boxId) {
        User user = SecurityUtil.getCurrentUser();
        return ResponseEntity.ok(chatService.getChatHistory(user, boxId));
    }

    @PostMapping("/box/{boxId}/messages")
    public ResponseEntity<MessageDto> sendMessageRest(@PathVariable Long boxId, @RequestBody SendMessageRequest request) {
        User user = SecurityUtil.getCurrentUser();
        request.setBoxChatId(boxId);
        MessageDto msg = chatService.sendMessage(user, boxId, request.getContent(), request.getType());
        return ResponseEntity.ok(msg);
    }

    @GetMapping("/users/search")
    public ResponseEntity<List<com.example.edu.dto.response.UserDto>> searchUsers(@RequestParam String keyword) {
        return ResponseEntity.ok(chatService.searchUsers(keyword));
    }

    // --- WebSocket Endpoints ---

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload SendMessageRequest request, Authentication authentication) {
        User sender = (User) authentication.getPrincipal();
        chatService.sendMessage(sender, request.getBoxChatId(), request.getContent(), request.getType());
    }
}
