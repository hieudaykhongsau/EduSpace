package com.example.edu.service;

import com.example.edu.entity.Notification;
import com.example.edu.entity.User;
import com.example.edu.enums.NotificationType;

import java.util.List;

public interface NotificationService {
    void sendNotification(User recipient, User sender, NotificationType type, String content);
    List<Notification> getUserNotifications(User user);
    void markAsRead(Long notificationId, User user);
    long getUnreadCount(User user);
}
