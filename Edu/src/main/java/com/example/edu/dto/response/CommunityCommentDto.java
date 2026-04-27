package com.example.edu.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityCommentDto {
    private Long id;
    private Long postId;
    private UserDto author;
    private String authorAvatarUrl;
    private String content;
    private LocalDateTime createdAt;
}
