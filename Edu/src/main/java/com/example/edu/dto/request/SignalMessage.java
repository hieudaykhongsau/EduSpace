package com.example.edu.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignalMessage {
    private String type;       // e.g. "offer", "answer", "ice-candidate"
    private String senderId;   // principalName của người gửi
    private String targetId;   // principalName của người nhận (null = broadcast)
    private String roomCode;
    private Object payload;    // SDP data hoặc ICE candidate 
}
