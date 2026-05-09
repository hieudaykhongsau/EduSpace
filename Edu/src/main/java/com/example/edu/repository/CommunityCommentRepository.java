package com.example.edu.repository;

import com.example.edu.entity.CommunityComment;
import com.example.edu.entity.CommunityPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityCommentRepository extends JpaRepository<CommunityComment, Long> {
    List<CommunityComment> findByPostOrderByCreatedAtAsc(CommunityPost post);

    void deleteByPostId(Long id);
}
