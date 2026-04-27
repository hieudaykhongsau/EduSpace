package com.example.edu.service;

public interface AiAssistant {
    String chat(String message, String topic);
    String chat(String message, String topic, byte[] imageData, String mimeType);
    String generateTitle(String message);
}
