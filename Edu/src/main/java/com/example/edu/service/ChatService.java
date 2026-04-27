package com.example.edu.service;

import com.example.edu.dto.response.BoxChatDto;
import com.example.edu.dto.response.MessageDto;
import com.example.edu.dto.response.UserDto;
import com.example.edu.entity.User;
import com.example.edu.enums.MessageType;

import java.util.List;
import java.util.Set;

public interface ChatService {
    BoxChatDto getOrCreateOneToOneChat(User user, Long peerId);
    BoxChatDto createGroupChat(User creator, String chatName, Set<Long> memberIds);
    List<BoxChatDto> getUserBoxChats(User user);

    MessageDto sendMessage(User sender, Long boxChatId, String content, MessageType type);
    List<MessageDto> getChatHistory(User user, Long boxChatId);
    List<UserDto> searchUsers(String keyword);
}
