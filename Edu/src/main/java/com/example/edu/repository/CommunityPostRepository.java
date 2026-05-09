package com.example.edu.repository;

import com.example.edu.entity.CommunityPost;
import com.example.edu.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {
    List<CommunityPost> findAllByOrderByCreatedAtDesc();

    long countByAuthor(User author);

    Optional<CommunityPost> findTopByAuthorOrderByCreatedAtDesc(User author);

    void deleteById(Long id);
}
