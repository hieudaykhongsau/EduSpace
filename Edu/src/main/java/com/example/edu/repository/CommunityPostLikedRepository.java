package com.example.edu.repository;

import com.example.edu.entity.CommunityPost;
import com.example.edu.entity.CommunityPostLiked;
import com.example.edu.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommunityPostLikedRepository extends JpaRepository<CommunityPostLiked, Long> {
    Optional<CommunityPostLiked> findByPostAndUser(CommunityPost post, User user);

    boolean existsByPostAndUser(CommunityPost post, User user);

    void deleteByPostId(Long id);
}
