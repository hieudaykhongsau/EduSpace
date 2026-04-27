package com.example.edu.service.impl;

import com.example.edu.service.AiAssistant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service("eduBot")
@RequiredArgsConstructor
public class EducationBot implements AiAssistant {
    private final SmartAiService smartAiService;

    @Override
    public String chat(String message, String topic) {
        return chat(message, topic, null, null);
    }

    @Override
    public String chat(String message, String topic, byte[] imageData, String mimeType) {
        String systemPrompt = "Bạn là một giảng viên chuyên gia, chỉ chuyên sâu về môn học/chủ đề: " + topic + ".\n" +
                "Nhiệm vụ của bạn là giải thích khái niệm, trả lời câu hỏi và giải bài tập một cách rõ ràng, khoa học.\n" +
                "Nếu có hình ảnh, hãy phân tích kỹ nội dung trong ảnh để giải đáp.\n" +
                "QUY TẮC QUAN TRỌNG NHẤT: Bạn KHÔNG ĐƯỢC trả lời bất kỳ câu hỏi nào KHÔNG LIÊN QUAN đến " + topic + ".\n" +
                "Nếu người dùng hỏi ngoài lề, hãy lịch sự từ chối và nhắc nhở họ rằng bạn chỉ hỗ trợ chuyên môn về " + topic + ".";
        return smartAiService.generateWithFallback(message, systemPrompt, imageData, mimeType);
    }

    @Override
    public String generateTitle(String message) {
        return smartAiService.generateTitle(message);
    }
}
