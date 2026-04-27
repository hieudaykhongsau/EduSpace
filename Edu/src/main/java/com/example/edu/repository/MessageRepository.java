package com.example.edu.repository;

import com.example.edu.entity.BoxChat;
import com.example.edu.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByBoxChatOrderByCreatedAtAsc(BoxChat boxChat);
}
