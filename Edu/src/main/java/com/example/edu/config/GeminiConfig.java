package com.example.edu.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Configuration
public class GeminiConfig {

    @Value("${gemini.api.key1}")
    private String key1;

    @Value("${gemini.api.key2}")
    private String key2;

    @Value("${gemini.api.key3}")
    private String key3;

    private List<String> apiKeys;

    private final AtomicInteger keyIndex = new AtomicInteger(0);

    @PostConstruct
    public void init() {
        apiKeys = Arrays.asList(key1, key2, key3);
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    public String getNextApiKey() {
        if (apiKeys == null || apiKeys.isEmpty()) {
            throw new RuntimeException("No Gemini API keys configured");
        }
        int index = Math.abs(keyIndex.getAndIncrement() % apiKeys.size());
        return apiKeys.get(index);
    }

    public int getTotalKeys() {
        return apiKeys.size();
    }
}
