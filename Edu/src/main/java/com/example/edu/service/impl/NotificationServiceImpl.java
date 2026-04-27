package com.example.edu.service.impl;

import com.example.edu.entity.Notification;
import com.example.edu.entity.User;
import com.example.edu.enums.NotificationType;
import com.example.edu.repository.NotificationRepository;
import com.example.edu.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessageSendingOperations messagingTemplate;

    @Override
    public void sendNotification(User recipient, User sender, NotificationType type, String content) {
        if (recipient.getId().equals(sender.getId())) {
            return; // Don't notify yourself
        }

        Notification notification = Notification.builder()
                .recipient(recipient)
                .sender(sender)
                .type(type)
                .content(content)
                .isRead(false)
                .build();

        Notification savedNotification = notificationRepository.save(notification);

        // Send via WebSocket to /user/{username}/queue/notifications
        messagingTemplate.convertAndSendToUser(
                recipient.getUsername(),
                "/queue/notifications",
                savedNotification
        );
    }

    @Override
    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
    }

    @Override
    public void markAsRead(Long notificationId, User user) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            if (notification.getRecipient().getId().equals(user.getId())) {
                notification.setRead(true);
                notificationRepository.save(notification);
            }
        });
    }

    @Override
    public long getUnreadCount(User user) {
        return notificationRepository.countByRecipientAndIsReadFalse(user);
    }
}
