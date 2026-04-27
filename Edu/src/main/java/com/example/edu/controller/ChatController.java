package com.example.edu.controller;

import com.example.edu.dto.response.ChatResponse;
import com.example.edu.service.AiAssistant;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final AiAssistant eduBot;
    private final AiAssistant systemBot;

    public ChatController(@Qualifier("eduBot") AiAssistant eduBot,
            @Qualifier("systemBot") AiAssistant systemBot) {
        this.eduBot = eduBot;
        this.systemBot = systemBot;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ChatResponse> chat(
            @RequestParam("message") String message,
            @RequestParam(value = "type", defaultValue = "edu") String type,
            @RequestParam(value = "topic", defaultValue = "general") String topic,
            @RequestParam(value = "isNewChat", defaultValue = "false") boolean isNewChat,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        try {
            log.info("Chat request - type: {}, topic: {}, hasImage: {}", type, topic, image != null);

            AiAssistant bot = "system".equalsIgnoreCase(type) ? systemBot : eduBot;

            String reply;
            if (image != null && !image.isEmpty()) {
                byte[] imageData = image.getBytes();
                String mimeType = image.getContentType();
                reply = bot.chat(message, topic, imageData, mimeType);
            } else {
                reply = bot.chat(message, topic);
            }

            String title = isNewChat ? bot.generateTitle(message) : null;

            return ResponseEntity.ok(ChatResponse.builder()
                    .reply(reply)
                    .title(title)
                    .build());

        } catch (Exception e) {
            log.error("Chat error: ", e);
            return ResponseEntity.internalServerError()
                    .body(ChatResponse.builder()
                            .reply("Đã xảy ra lỗi khi kết nối với AI. Vui lòng thử lại sau.")
                            .build());
        }
    }
}
