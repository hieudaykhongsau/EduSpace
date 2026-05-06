package com.example.edu.service.impl;

import com.example.edu.dto.request.JoinRoomRequest;
import com.example.edu.dto.request.RoomRequest;
import com.example.edu.dto.response.RoomResponse;
import com.example.edu.entity.Enrollment;
import com.example.edu.entity.Guest;
import com.example.edu.entity.Room;
import com.example.edu.entity.User;
import com.example.edu.enums.RoomProvider;
import com.example.edu.enums.RoomStatus;
import com.example.edu.repository.EnrollmentRepository;
import com.example.edu.repository.RoomRepository;
import com.example.edu.security.SecurityUtil;
import com.example.edu.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final SimpMessageSendingOperations messagingTemplate;

    @Override
    @Transactional
    public RoomResponse createRoom(RoomRequest request) {
        User currentUser = SecurityUtil.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Unauthorized");
        }

        String roomCode = generateRoomCode();
        int maxParticipants = request.getMaxParticipants() != null ? request.getMaxParticipants() : 8;
        if (maxParticipants > 8)
            maxParticipants = 8; // Khống chế tối đa là 8
        RoomProvider roomType = request.getRoomTye() != null ? request.getRoomTye() : RoomProvider.PUBLIC;

        Room room = Room.builder()
                .roomName(request.getRoomName())
                .description(request.getDescription())
                .roomCode(roomCode)
                .roomTye(roomType)
                .password(request.getPassword())
                .host(currentUser)
                .maxParticipants(maxParticipants)
                .createAt(LocalDateTime.now())
                .roomStatus(RoomStatus.ACTIVE)
                .build();

        room = roomRepository.save(room);

        return mapToResponse(room);
    }

    @Override
    @Transactional
    public RoomResponse joinRoom(JoinRoomRequest request) {
        User currentUser = SecurityUtil.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Unauthorized");
        }

        Room room = roomRepository.findByRoomCode(request.getRoomCode())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (room.getRoomStatus() != RoomStatus.ACTIVE) {
            throw new RuntimeException("Room is not active");
        }

        if (room.getRoomTye() == RoomProvider.PRIVATE) {
            if (room.getPassword() != null && !room.getPassword().equals(request.getPassword())) {
                throw new RuntimeException("Incorrect password");
            }
        }

        // Only enroll if user is a Guest (has guest record in DB)
        if (currentUser instanceof Guest) {
            int currentMembers = enrollmentRepository.findByRoom_Id(room.getId()).size();
            // Tổng số người = currentMembers (Guest) + 1 (Host)
            if (currentMembers + 1 >= room.getMaxParticipants()) {
                throw new RuntimeException("Room is full");
            }

            if (!enrollmentRepository.existsByRoom_IdAndGuest_Id(room.getId(), currentUser.getId())) {
                Enrollment enrollment = Enrollment.builder()
                        .room(room)
                        .guest((Guest) currentUser)
                        .build();
                enrollmentRepository.save(enrollment);
            }
        }

        return mapToResponse(room);
    }

    @Override
    @Transactional
    public void leaveRoom(String roomCode) {
        User currentUser = SecurityUtil.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Unauthorized");
        }

        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        // Nếu host leave thì đóng phòng
        if (room.getHost() != null && room.getHost().getId().equals(currentUser.getId())) {
            closeRoom(roomCode);
        } else {
            // Remove enrollment
            enrollmentRepository.findByRoom_IdAndGuest_Id(room.getId(), currentUser.getId())
                    .ifPresent(enrollmentRepository::delete);
            // Broadcast
            messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/peer-left", currentUser.getId());
        }
    }

    @Override
    public RoomResponse getRoomByCode(String roomCode) {
        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        return mapToResponse(room);
    }

    @Override
    public List<RoomResponse> getActiveRooms() {
        return roomRepository.findByRoomStatus(RoomStatus.ACTIVE).stream()
                .filter(r -> r.getRoomTye() == RoomProvider.PUBLIC)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void closeRoom(String roomCode) {
        User currentUser = SecurityUtil.getCurrentUser();
        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (!SecurityUtil.isAdmin()
                && (room.getHost() == null || !room.getHost().getId().equals(currentUser.getId()))) {
            throw new RuntimeException("Unauthorized to close this room");
        }

        room.setRoomStatus(RoomStatus.INACTIVE);
        roomRepository.save(room);

        // Broadcast to all that room is closed
        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/room-closed", "Room has been closed by host");
    }

    private RoomResponse mapToResponse(Room room) {
        int memberCount = 0;
        if (room.getId() != null) {
            // memberCount = số Guest + 1 (Host)
            memberCount = enrollmentRepository.findByRoom_Id(room.getId()).size() + 1;
        }

        return RoomResponse.builder()
                .id(room.getId())
                .roomName(room.getRoomName())
                .description(room.getDescription())
                .roomCode(room.getRoomCode())
                .isPrivate(room.getRoomTye() == RoomProvider.PRIVATE)
                .roomStatus(room.getRoomStatus())
                .createdAt(room.getCreateAt())
                .hostName(room.getHost() != null ? room.getHost().getFullName() : "Unknown")
                .memberCount(memberCount)
                .build();
    }

    private String generateRoomCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
