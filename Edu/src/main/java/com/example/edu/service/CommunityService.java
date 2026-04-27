package com.example.edu.service;

import com.example.edu.dto.response.CommunityCommentDto;
import com.example.edu.dto.response.CommunityPostDto;
import com.example.edu.entity.User;

import java.util.List;

public interface CommunityService {
    CommunityPostDto createPost(User author, String content, String mediaUrl);
    List<CommunityPostDto> getAllPosts(User currentUser);
    void toggleLike(User user, Long postId);
    
    CommunityCommentDto addComment(User author, Long postId, String content);
    List<CommunityCommentDto> getPostComments(Long postId);
}
