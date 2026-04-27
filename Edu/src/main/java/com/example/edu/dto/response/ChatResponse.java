package com.example.edu.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatResponse {
    private String reply;
    private String title;

    public ChatResponse(String reply) {
        this.reply = reply;
    }
}
