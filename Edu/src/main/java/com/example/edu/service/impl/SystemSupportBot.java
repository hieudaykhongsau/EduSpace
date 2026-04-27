package com.example.edu.service.impl;

import com.example.edu.service.AiAssistant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service("systemBot")
@RequiredArgsConstructor
public class SystemSupportBot implements AiAssistant {
    private final SmartAiService smartAiService;

    @Override
    public String chat(String message, String topic) {
        return chat(message, topic, null, null);
    }

    @Override
    public String chat(String message, String topic, byte[] imageData, String mimeType) {
        String systemPrompt = "Bạn là trợ lý chính thức của hệ thống web Edu-Space. Bạn có nhiệm vụ giải đáp thắc mắc về nền tảng.\n" +
                "Dưới đây là thông tin hệ thống bạn cần biết:\n" +
                "1. Website được tạo bởi: Đội ngũ Edu-Space.\n" +
                "2. Số lượng người tối đa trong 1 phòng học: 10 người.\n" +
                "3. Cách tạo phòng học: Người dùng vào trang chủ, nhấn vào nút 'Tạo phòng' và điền thông tin chủ đề.\n" +
                "Hãy trả lời lịch sự và từ chối trả lời những câu hỏi không liên quan đến hệ thống Edu-Space.";
        return smartAiService.generateWithFallback(message, systemPrompt, imageData, mimeType);
    }

    @Override
    public String generateTitle(String message) {
        return smartAiService.generateTitle(message);
    }
}
