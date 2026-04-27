package com.example.edu.dto.request;

import com.example.edu.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SendMessageRequest {
    private Long boxChatId;
    private String content;
    private MessageType type;
}
