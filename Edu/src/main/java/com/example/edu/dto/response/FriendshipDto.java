package com.example.edu.dto.response;

import com.example.edu.enums.FriendshipStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendshipDto {
    private Long id;
    private UserDto requester;
    private UserDto addressee;
    private FriendshipStatus status;
    private LocalDateTime createdAt;
}
