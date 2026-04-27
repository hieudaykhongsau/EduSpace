package com.example.edu.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "box_chats")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoxChat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "chat_name")
    private String chatName;

    @Column(name = "is_group", nullable = false)
    private boolean isGroup;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "box_chat_members",
            joinColumns = @JoinColumn(name = "box_chat_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    private Set<User> members = new HashSet<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
