package com.example.edu.controller;

import com.example.edu.entity.Notification;
import com.example.edu.entity.User;
import com.example.edu.security.SecurityUtil;
import com.example.edu.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications() {
        User user = SecurityUtil.getCurrentUser();
        return ResponseEntity.ok(notificationService.getUserNotifications(user));
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
}
