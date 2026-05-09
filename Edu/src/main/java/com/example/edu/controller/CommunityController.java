package com.example.edu.controller;

import com.example.edu.dto.request.AddCommentRequest;
import com.example.edu.dto.request.CreatePostRequest;
import com.example.edu.dto.response.CommunityCommentDto;
import com.example.edu.dto.response.CommunityPostDto;
import com.example.edu.entity.User;
import com.example.edu.security.SecurityUtil;
import com.example.edu.service.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    @PostMapping("/post")
    public ResponseEntity<CommunityPostDto> createPost(@RequestBody CreatePostRequest request) {
        User user = SecurityUtil.getCurrentUser();
        return ResponseEntity.ok(communityService.createPost(user, request.getContent(), request.getMediaUrl()));
    }

    @GetMapping("/feed")
    public ResponseEntity<List<CommunityPostDto>> getFeed() {
        User user = null;
        try {
            user = SecurityUtil.getCurrentUser();
        } catch (Exception e) {
            // User might be unauthenticated if we allow public feed
        }
        return ResponseEntity.ok(communityService.getAllPosts(user));
    }

    @PostMapping("/post/{postId}/like")
    public ResponseEntity<String> toggleLike(@PathVariable Long postId) {
        User user = SecurityUtil.getCurrentUser();
        communityService.toggleLike(user, postId);
        return ResponseEntity.ok("Like toggled");
    }

    @PostMapping("/post/{postId}/comment")
    public ResponseEntity<CommunityCommentDto> addComment(@PathVariable Long postId,
            @RequestBody AddCommentRequest request) {
        User user = SecurityUtil.getCurrentUser();
        return ResponseEntity.ok(communityService.addComment(user, postId, request.getContent()));
    }

    @GetMapping("/post/{postId}/comments")
    public ResponseEntity<List<CommunityCommentDto>> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(communityService.getPostComments(postId));
    }

    @DeleteMapping("/post/{postId}")
    public ResponseEntity<String> deletePost(@PathVariable Long postId) {
        User user = SecurityUtil.getCurrentUser();
        communityService.deletePost(postId);
        return ResponseEntity.ok("Post deleted");
    }

}
