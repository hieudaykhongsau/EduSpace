package com.example.edu.entity;

import com.example.edu.enums.RoomProvider;
import com.example.edu.enums.RoomStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "rooms")
@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long id;

    @Column(name = "room_name", nullable = false, length = 100)
    private String roomName;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "room_type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private RoomProvider roomTye;

    @Column(name = "create_at", updatable = false)
    private LocalDateTime createAt;

    @Builder.Default
    @Column(name = "room_status", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private RoomStatus roomStatus = RoomStatus.ACTIVE;

    @Column(name = "password")
    private String password;

    @Column(name = "room_code", unique = true, nullable = false, length = 8)
    private String roomCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_id")
    private User host;

    @Builder.Default
    @Column(name = "max_participants")
    private int maxParticipants = 8;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL)
    private List<Enrollment> enrollments;
}
