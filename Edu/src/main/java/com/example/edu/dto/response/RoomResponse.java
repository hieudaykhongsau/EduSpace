package com.example.edu.dto.response;

import com.example.edu.enums.RoomStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RoomResponse {
    private Long id;
    private String roomName;
    private String description;
    private String roomCode; // Mã để người khác nhập vào Join
    private boolean isPrivate; // Private, Public
    private RoomStatus roomStatus; // e.g., "ACTIVE"
    private LocalDateTime createdAt;

    private String hostName;
    private int memberCount;
}
