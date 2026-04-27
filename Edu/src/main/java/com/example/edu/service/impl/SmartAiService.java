package com.example.edu.service.impl;

import com.example.edu.config.GeminiConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;

@Slf4j
@Service
@RequiredArgsConstructor
public class SmartAiService {

    private final GeminiConfig geminiConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateWithFallback(String userMessage, String systemPrompt) {
        return generateWithFallback(userMessage, systemPrompt, null, null);
    }

    public String generateWithFallback(String userMessage, String systemPrompt, byte[] imageData, String mimeType) {
        int totalKeys = geminiConfig.getTotalKeys();
        Exception lastException = null;

        for (int attempt = 0; attempt < totalKeys; attempt++) {
            String apiKey = geminiConfig.getNextApiKey();
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="
                    + apiKey;

            try {
                // Build JSON Request using Jackson
                ObjectNode root = objectMapper.createObjectNode();
                ArrayNode contents = root.putArray("contents");
                ObjectNode content = contents.addObject();
                content.put("role", "user");
                ArrayNode parts = content.putArray("parts");

                parts.addObject().put("text", userMessage);

                if (imageData != null && imageData.length > 0 && mimeType != null) {
                    ObjectNode inlineData = parts.addObject().putObject("inline_data");
                    inlineData.put("mime_type", mimeType);
                    inlineData.put("data", Base64.getEncoder().encodeToString(imageData));
                }

                // System Instruction
                ObjectNode systemInstruction = root.putObject("system_instruction");
                ArrayNode systemParts = systemInstruction.putArray("parts");
                systemParts.addObject().put("text", systemPrompt);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                HttpEntity<String> request = new HttpEntity<>(root.toString(), headers);

                log.info("Calling Gemini API via RestTemplate with key index: {}", attempt);

                // Trả về String để tránh lỗi Jackson ObjectNode
                String responseString = restTemplate.postForObject(url, request, String.class);
                com.fasterxml.jackson.databind.JsonNode response = objectMapper.readTree(responseString);

                if (response != null && response.has("candidates")) {
                    return response.get("candidates").get(0).get("content").get("parts").get(0).get("text").asText();
                }

            } catch (Exception e) {
                lastException = e;
                log.warn("Gemini API call failed with key attempt {}: {}", attempt + 1, e.getMessage());
            }

        }

        log.error("All Gemini API keys failed. Last error: {}",
                lastException != null ? lastException.getMessage() : "Unknown");
        return "Xin lỗi, hệ thống AI hiện đang bận. Vui lòng thử lại sau.";
    }

    public String generateTitle(String userMessage) {
        String systemPrompt = "Bạn là một trợ lý AI. Dựa vào tin nhắn đầu tiên của người dùng, hãy tạo một tiêu đề siêu ngắn gọn (tối đa 5-6 từ) tóm tắt nội dung để làm tên đoạn chat. "
                +
                "Tuyệt đối chỉ trả về nội dung tiêu đề, không ngoặc kép, không giải thích, không thêm bất kỳ ký tự thừa nào.";
        String title = generateWithFallback(userMessage, systemPrompt);

        // Dọn dẹp kết quả phòng trường hợp AI vẫn trả về ngoặc kép hoặc khoảng trắng
        // thừa
        if (title != null) {
            title = title.replace("\"", "").trim();
            if (title.length() > 50) {
                title = title.substring(0, 50) + "...";
            }
        } else {
            title = "Cuộc trò chuyện mới";
        }

        return title;
    }
}
