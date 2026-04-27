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
public class CommunityPostDto {
    private Long id;
    private UserDto author;
    private String authorName;
    private String authorAvatarUrl;
    private String content;
    private String mediaUrl;
    private int likeCount;
    private int commentCount;
    private boolean liked;         // alias: isLikedByCurrentUser
    private boolean isLikedByCurrentUser;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
