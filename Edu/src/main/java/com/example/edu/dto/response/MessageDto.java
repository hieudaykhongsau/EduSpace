package com.example.edu.dto.response;

import com.example.edu.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {
    private Long id;
    private Long boxChatId;
    private Long senderId;
    private String senderName;
    private String senderAvatarUrl;
    private String content;
    private MessageType type;
    private LocalDateTime createdAt;
}
