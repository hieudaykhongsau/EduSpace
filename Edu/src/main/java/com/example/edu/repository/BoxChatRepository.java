package com.example.edu.repository;

import com.example.edu.entity.BoxChat;
import com.example.edu.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoxChatRepository extends JpaRepository<BoxChat, Long> {
    List<BoxChat> findByMembersContaining(User member);
}
