package com.example.edu.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private Long userId; // alias for id
    private String username;
    private String fullName;
    private String email;
    private String avatarUrl;
    private String role;

    public static UserDto fromEntity(com.example.edu.entity.User user) {
        if (user == null) return null;
        return UserDto.builder()
                .id(user.getId())
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().name())
                .build();
    }
}

