package com.example.edu.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoxChatDto {
    private Long id;
    private String chatName;
    private boolean isGroup;
    private List<UserDto> members;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
