package com.raj.citizen_grievance_backend.service;

import com.raj.citizen_grievance_backend.dto.NotificationResponse;
import com.raj.citizen_grievance_backend.entity.Notification;
import com.raj.citizen_grievance_backend.entity.NotificationType;
import com.raj.citizen_grievance_backend.exception.ForbiddenException;
import com.raj.citizen_grievance_backend.exception.ResourceNotFoundException;
import com.raj.citizen_grievance_backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    private final ConcurrentHashMap<UUID, CopyOnWriteArrayList<SseEmitter>> activeEmitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(UUID userId) {
        // SSE timeout set to 30 minutes (1,800,000 milliseconds)
        SseEmitter emitter = new SseEmitter(1800000L);

        CopyOnWriteArrayList<SseEmitter> userEmitters = activeEmitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>());
        userEmitters.add(emitter);

        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> {
            emitter.complete();
            removeEmitter(userId, emitter);
        });
        emitter.onError((ex) -> {
            emitter.complete();
            removeEmitter(userId, emitter);
        });

        // Send initial validation message
        try {
            emitter.send(SseEmitter.event().name("init").data("Connected successfully"));
        } catch (Exception e) {
            removeEmitter(userId, emitter);
        }

        return emitter;
    }

    private void removeEmitter(UUID userId, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> list = activeEmitters.get(userId);
        if (list != null) {
            list.remove(emitter);
            if (list.isEmpty()) {
                activeEmitters.remove(userId);
            }
        }
    }

    @Scheduled(fixedDelay = 15000)
    public void sendHeartbeat() {
        List<SseEmitter> deadEmitters = new ArrayList<>();
        activeEmitters.forEach((userId, list) -> {
            for (SseEmitter emitter : list) {
                try {
                    emitter.send(SseEmitter.event().name("ping").data("heartbeat"));
                } catch (Exception e) {
                    deadEmitters.add(emitter);
                }
            }
        });

        if (!deadEmitters.isEmpty()) {
            deadEmitters.forEach(emitter -> {
                activeEmitters.forEach((userId, list) -> {
                    if (list.remove(emitter)) {
                        if (list.isEmpty()) {
                            activeEmitters.remove(userId);
                        }
                    }
                });
            });
        }
    }

    @Transactional
    public void sendNotification(UUID recipientId, String message, UUID relatedComplaintId, NotificationType type, UUID targetEntityId) {
        Notification notification = Notification.builder()
                .recipientId(recipientId)
                .message(message)
                .relatedComplaintId(relatedComplaintId)
                .type(type)
                .targetEntityId(targetEntityId)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        NotificationResponse responseDto = mapToResponse(saved);

        CopyOnWriteArrayList<SseEmitter> userEmitters = activeEmitters.get(recipientId);
        if (userEmitters != null) {
            List<SseEmitter> failedEmitters = new ArrayList<>();
            for (SseEmitter emitter : userEmitters) {
                try {
                    emitter.send(SseEmitter.event().name("notification").data(responseDto));
                } catch (Exception e) {
                    failedEmitters.add(emitter);
                }
            }
            if (!failedEmitters.isEmpty()) {
                userEmitters.removeAll(failedEmitters);
                if (userEmitters.isEmpty()) {
                    activeEmitters.remove(recipientId);
                }
            }
        }
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(UUID userId) {
        return notificationRepository.findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));

        if (!notification.getRecipientId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to modify this notification");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .recipientId(notification.getRecipientId())
                .message(notification.getMessage())
                .relatedComplaintId(notification.getRelatedComplaintId())
                .type(notification.getType() != null ? notification.getType().name() : null)
                .targetEntityId(notification.getTargetEntityId())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
