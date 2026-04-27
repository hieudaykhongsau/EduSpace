package com.example.edu.service.impl;

import com.example.edu.dto.response.BoxChatDto;
import com.example.edu.dto.response.MessageDto;
import com.example.edu.dto.response.UserDto;
import com.example.edu.entity.BoxChat;
import com.example.edu.entity.Message;
import com.example.edu.entity.User;
import com.example.edu.enums.MessageType;
import com.example.edu.enums.NotificationType;
import com.example.edu.repository.BoxChatRepository;
import com.example.edu.repository.MessageRepository;
import com.example.edu.repository.UserRepository;
import com.example.edu.service.ChatService;
import com.example.edu.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final BoxChatRepository boxChatRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final SimpMessageSendingOperations messagingTemplate;

    @Override
    public BoxChatDto getOrCreateOneToOneChat(User user, Long peerId) {
        if (user.getId().equals(peerId)) {
            throw new RuntimeException("Cannot chat with yourself");
        }

        User peer = userRepository.findById(peerId)
                .orElseThrow(() -> new RuntimeException("Peer not found"));

        List<BoxChat> userChats = boxChatRepository.findByMembersContaining(user);
        Optional<BoxChat> existingChat = userChats.stream()
                .filter(chat -> !chat.isGroup() && chat.getMembers().contains(peer))
                .findFirst();

        BoxChat boxChat;
        if (existingChat.isPresent()) {
            boxChat = existingChat.get();
        } else {
            Set<User> members = new HashSet<>();
            members.add(user);
            members.add(peer);

            boxChat = BoxChat.builder()
                    .isGroup(false)
                    .members(members)
                    .build();
            boxChat = boxChatRepository.save(boxChat);
        }

        return mapToDto(boxChat);
    }

    @Override
    public BoxChatDto createGroupChat(User creator, String chatName, Set<Long> memberIds) {
        Set<User> members = new HashSet<>();
        members.add(creator);

        for (Long id : memberIds) {
            userRepository.findById(id).ifPresent(members::add);
        }

        if (members.size() < 3) {
            throw new RuntimeException("Group chat must have at least 3 members");
        }

        BoxChat boxChat = BoxChat.builder()
                .isGroup(true)
                .chatName(chatName)
                .members(members)
                .build();

        boxChat = boxChatRepository.save(boxChat);
        return mapToDto(boxChat);
    }

    @Override
    public List<BoxChatDto> getUserBoxChats(User user) {
        return boxChatRepository.findByMembersContaining(user).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public MessageDto sendMessage(User sender, Long boxChatId, String content, MessageType type) {
        BoxChat boxChat = boxChatRepository.findById(boxChatId)
                .orElseThrow(() -> new RuntimeException("BoxChat not found"));

        if (!boxChat.getMembers().contains(sender)) {
            throw new RuntimeException("Sender is not a member of this chat");
        }

        Message message = Message.builder()
                .boxChat(boxChat)
                .sender(sender)
                .content(content)
                .type(type)
                .build();

        message = messageRepository.save(message);

        MessageDto messageDto = mapMessageToDto(message);

        // Notify other members
        for (User member : boxChat.getMembers()) {
            if (!member.getId().equals(sender.getId())) {
                // Send WebSocket Realtime Message
                messagingTemplate.convertAndSendToUser(
                        member.getUsername(),
                        "/queue/messages",
                        messageDto);

                // Also send a notification if they are not actively viewing the chat (optional,
                // but requested)
                // if it's a message, notify
                notificationService.sendNotification(member, sender, NotificationType.MESSAGE,
                        "Tin nhắn mới từ " + sender.getFullName());
            }
        }

        return messageDto;
    }

    @Override
    public List<MessageDto> getChatHistory(User user, Long boxChatId) {
        BoxChat boxChat = boxChatRepository.findById(boxChatId)
                .orElseThrow(() -> new RuntimeException("BoxChat not found"));

        if (!boxChat.getMembers().contains(user)) {
            throw new RuntimeException("Not a member of this chat");
        }

        return messageRepository.findByBoxChatOrderByCreatedAtAsc(boxChat).stream()
                .map(this::mapMessageToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDto> searchUsers(String keyword) {
        return userRepository.findByFullNameContainingIgnoreCaseOrUsernameContainingIgnoreCase(keyword, keyword)
                .stream()
                .map(u -> UserDto.builder()
                        .id(u.getId())
                        .username(u.getUsername())
                        .fullName(u.getFullName())
                        .avatarUrl(u.getAvatarUrl())
                        .build())
                .collect(Collectors.toList());
    }

    private BoxChatDto mapToDto(BoxChat boxChat) {
        return BoxChatDto.builder()
                .id(boxChat.getId())
                .chatName(boxChat.getChatName())
                .isGroup(boxChat.isGroup())
                .createdAt(boxChat.getCreatedAt())
                .updatedAt(boxChat.getUpdatedAt())
                .members(boxChat.getMembers().stream()
                        .map(u -> UserDto.builder()
                                .id(u.getId())
                                .fullName(u.getFullName())
                                .avatarUrl(u.getAvatarUrl())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    private MessageDto mapMessageToDto(Message message) {
        return MessageDto.builder()
                .id(message.getId())
                .boxChatId(message.getBoxChat().getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getFullName())
                .content(message.getContent())
                .type(message.getType())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
