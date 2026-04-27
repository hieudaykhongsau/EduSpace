package com.example.edu.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PeerInfo {
    private Long userId;
    private String principalName; // Dùng làm khóa đích danh cho sendToUser
    private String fullName;
    private String avatarUrl;
    private String sessionId; // Vẫn giữ lại nếu cần track session nội bộ
}
