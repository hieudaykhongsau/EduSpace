package com.example.edu.controller;

import com.example.edu.entity.Notification;
import com.example.edu.entity.User;
import com.example.edu.security.SecurityUtil;
import com.example.edu.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getNotifications() {
        User user = SecurityUtil.getCurrentUser();
        List<Map<String, Object>> dtos = notificationService.getUserNotifications(user).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount() {
        User user = SecurityUtil.getCurrentUser();
        return ResponseEntity.ok(notificationService.getUnreadCount(user));
    }

    @PostMapping("/{notificationId}/read")
    public ResponseEntity<String> markAsRead(@PathVariable Long notificationId) {
        User user = SecurityUtil.getCurrentUser();
        notificationService.markAsRead(notificationId, user);
        return ResponseEntity.ok("Marked as read");
    }

    private Map<String, Object> toDto(Notification n) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", n.getId());
        dto.put("content", n.getContent());
        dto.put("type", n.getType().name());
        dto.put("read", n.isRead());
        dto.put("createdAt", n.getCreatedAt());
        if (n.getSender() != null) {
            dto.put("senderName", n.getSender().getFullName());
        }
        return dto;
    }
}

