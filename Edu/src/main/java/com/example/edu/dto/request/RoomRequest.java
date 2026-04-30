package com.example.edu.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
@AllArgsConstructor
public class RoomRequest {
        @NotBlank(message = "Room name is required")
        private String roomName;
        private String description;
        private String password;
        private com.example.edu.enums.RoomProvider roomTye;
        private Integer maxParticipants;
}
