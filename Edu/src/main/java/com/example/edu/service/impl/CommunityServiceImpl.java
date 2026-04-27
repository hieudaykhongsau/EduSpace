package com.example.edu.service.impl;

import com.example.edu.dto.response.CommunityCommentDto;
import com.example.edu.dto.response.CommunityPostDto;
import com.example.edu.dto.response.UserDto;
import com.example.edu.entity.CommunityComment;
import com.example.edu.entity.CommunityPost;
import com.example.edu.entity.CommunityPostLiked;
import com.example.edu.entity.User;
import com.example.edu.enums.NotificationType;
import com.example.edu.repository.CommunityCommentRepository;
import com.example.edu.repository.CommunityPostLikedRepository;
import com.example.edu.repository.CommunityPostRepository;
import com.example.edu.service.CommunityService;
import com.example.edu.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunityServiceImpl implements CommunityService {

    private final CommunityPostRepository communityPostRepository;
    private final CommunityPostLikedRepository communityPostLikedRepository;
    private final CommunityCommentRepository communityCommentRepository;
    private final NotificationService notificationService;

    @Override
    public CommunityPostDto createPost(User author, String content, String mediaUrl) {
        CommunityPost post = CommunityPost.builder()
                .author(author)
                .content(content)
                .mediaUrl(mediaUrl)
                .build();
        
        post = communityPostRepository.save(post);
        return mapToDto(post, false);
    }

    @Override
    public List<CommunityPostDto> getAllPosts(User currentUser) {
        return communityPostRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(post -> {
                    boolean isLiked = currentUser != null && communityPostLikedRepository.existsByPostAndUser(post, currentUser);
                    return mapToDto(post, isLiked);
                })
                .collect(Collectors.toList());
    }

    @Override
    public void toggleLike(User user, Long postId) {
        CommunityPost post = communityPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Optional<CommunityPostLiked> existingLike = communityPostLikedRepository.findByPostAndUser(post, user);

        if (existingLike.isPresent()) {
            communityPostLikedRepository.delete(existingLike.get());
            post.setLikeCount(post.getLikeCount() - 1);
        } else {
            CommunityPostLiked like = CommunityPostLiked.builder()
                    .post(post)
                    .user(user)
                    .build();
            communityPostLikedRepository.save(like);
            post.setLikeCount(post.getLikeCount() + 1);

            // Notify author if someone else liked their post
            if (!post.getAuthor().getId().equals(user.getId())) {
                notificationService.sendNotification(
                        post.getAuthor(),
                        user,
                        NotificationType.LIKE,
                        user.getFullName() + " đã thích bài viết của bạn"
                );
            }
        }
        communityPostRepository.save(post);
    }

    @Override
    public CommunityCommentDto addComment(User author, Long postId, String content) {
        CommunityPost post = communityPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        CommunityComment comment = CommunityComment.builder()
                .post(post)
                .author(author)
                .content(content)
                .build();
        
        comment = communityCommentRepository.save(comment);

        post.setCommentCount(post.getCommentCount() + 1);
        communityPostRepository.save(post);

        // Notify author if someone else commented
        if (!post.getAuthor().getId().equals(author.getId())) {
            notificationService.sendNotification(
                    post.getAuthor(),
                    author,
                    NotificationType.COMMENT,
                    author.getFullName() + " đã bình luận về bài viết của bạn"
            );
        }

        return mapCommentToDto(comment);
    }

    @Override
    public List<CommunityCommentDto> getPostComments(Long postId) {
        CommunityPost post = communityPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        return communityCommentRepository.findByPostOrderByCreatedAtAsc(post).stream()
                .map(this::mapCommentToDto)
                .collect(Collectors.toList());
    }

    private CommunityPostDto mapToDto(CommunityPost post, boolean isLikedByCurrentUser) {
        return CommunityPostDto.builder()
                .id(post.getId())
                .author(UserDto.builder()
                        .id(post.getAuthor().getId())
                        .fullName(post.getAuthor().getFullName())
                        .avatarUrl(post.getAuthor().getAvatarUrl())
                        .build())
                .authorName(post.getAuthor().getFullName())
                .authorAvatarUrl(post.getAuthor().getAvatarUrl())
                .content(post.getContent())
                .mediaUrl(post.getMediaUrl())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .isLikedByCurrentUser(isLikedByCurrentUser)
                .liked(isLikedByCurrentUser)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    private CommunityCommentDto mapCommentToDto(CommunityComment comment) {
        return CommunityCommentDto.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .author(UserDto.builder()
                        .id(comment.getAuthor().getId())
                        .fullName(comment.getAuthor().getFullName())
                        .avatarUrl(comment.getAuthor().getAvatarUrl())
                        .build())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
