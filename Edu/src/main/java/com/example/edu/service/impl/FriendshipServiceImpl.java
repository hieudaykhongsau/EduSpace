package com.example.edu.service.impl;

import com.example.edu.dto.response.FriendshipDto;
import com.example.edu.dto.response.UserDto;
import com.example.edu.entity.Friendship;
import com.example.edu.entity.User;
import com.example.edu.enums.FriendshipStatus;
import com.example.edu.enums.NotificationType;
import com.example.edu.repository.FriendshipRepository;
import com.example.edu.repository.UserRepository;
import com.example.edu.service.FriendshipService;
import com.example.edu.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendshipServiceImpl implements FriendshipService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    public void sendFriendRequest(User requester, Long addresseeId) {
        if (requester.getId().equals(addresseeId)) {
            throw new RuntimeException("Cannot send friend request to yourself");
        }

        User addressee = userRepository.findById(addresseeId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if request already exists (either direction)
        Optional<Friendship> existing1 = friendshipRepository.findByRequesterAndAddressee(requester, addressee);
        Optional<Friendship> existing2 = friendshipRepository.findByRequesterAndAddressee(addressee, requester);

        if (existing1.isPresent() || existing2.isPresent()) {
            throw new RuntimeException("Friendship or request already exists");
        }

        Friendship friendship = Friendship.builder()
                .requester(requester)
                .addressee(addressee)
                .status(FriendshipStatus.PENDING)
                .build();
        
        friendshipRepository.save(friendship);

        notificationService.sendNotification(addressee, requester, NotificationType.FRIEND_REQUEST,
                requester.getFullName() + " đã gửi lời mời kết bạn");
    }

    @Override
    public void acceptFriendRequest(User addressee, Long requesterId) {
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Friendship friendship = friendshipRepository.findByRequesterAndAddressee(requester, addressee)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));

        if (friendship.getStatus() != FriendshipStatus.PENDING) {
            throw new RuntimeException("Friend request is not pending");
        }

        friendship.setStatus(FriendshipStatus.ACCEPTED);
        friendshipRepository.save(friendship);

        notificationService.sendNotification(requester, addressee, NotificationType.FRIEND_ACCEPT,
                addressee.getFullName() + " đã chấp nhận lời mời kết bạn");
    }

    @Override
    public void declineFriendRequest(User addressee, Long requesterId) {
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Friendship friendship = friendshipRepository.findByRequesterAndAddressee(requester, addressee)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));

        if (friendship.getStatus() != FriendshipStatus.PENDING) {
            throw new RuntimeException("Friend request is not pending");
        }

        friendshipRepository.delete(friendship);
    }

    @Override
    public void unfriend(User user, Long friendId) {
        User friend = userRepository.findById(friendId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Friendship> f1 = friendshipRepository.findByRequesterAndAddressee(user, friend);
        if (f1.isPresent() && f1.get().getStatus() == FriendshipStatus.ACCEPTED) {
            friendshipRepository.delete(f1.get());
            return;
        }

        Optional<Friendship> f2 = friendshipRepository.findByRequesterAndAddressee(friend, user);
        if (f2.isPresent() && f2.get().getStatus() == FriendshipStatus.ACCEPTED) {
            friendshipRepository.delete(f2.get());
            return;
        }

        throw new RuntimeException("Friendship not found");
    }

    @Override
    public List<UserDto> getFriends(User user) {
        List<Friendship> friendships = friendshipRepository.findByRequesterOrAddressee(user, user);
        
        List<UserDto> friends = new ArrayList<>();
        for (Friendship f : friendships) {
            if (f.getStatus() == FriendshipStatus.ACCEPTED) {
                User friendUser = f.getRequester().getId().equals(user.getId()) ? f.getAddressee() : f.getRequester();
                friends.add(UserDto.builder()
                        .id(friendUser.getId())
                        .fullName(friendUser.getFullName())
                        .avatarUrl(friendUser.getAvatarUrl())
                        .build());
            }
        }
        return friends;
    }

    @Override
    public List<FriendshipDto> getPendingRequests(User user) {
        List<Friendship> requests = friendshipRepository.findByAddresseeAndStatus(user, FriendshipStatus.PENDING);
        return requests.stream().map(f -> FriendshipDto.builder()
                .id(f.getId())
                .requester(UserDto.builder()
                        .id(f.getRequester().getId())
                        .fullName(f.getRequester().getFullName())
                        .avatarUrl(f.getRequester().getAvatarUrl())
                        .build())
                .addressee(UserDto.builder()
                        .id(f.getAddressee().getId())
                        .fullName(f.getAddressee().getFullName())
                        .avatarUrl(f.getAddressee().getAvatarUrl())
                        .build())
                .status(f.getStatus())
                .createdAt(f.getCreatedAt())
                .build()).collect(Collectors.toList());
    }
}
