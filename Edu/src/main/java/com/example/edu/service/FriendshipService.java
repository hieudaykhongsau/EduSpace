package com.example.edu.service;

import com.example.edu.dto.response.FriendshipDto;
import com.example.edu.dto.response.UserDto;
import com.example.edu.entity.User;

import java.util.List;

public interface FriendshipService {
    void sendFriendRequest(User requester, Long addresseeId);
    void acceptFriendRequest(User addressee, Long requesterId);
    void declineFriendRequest(User addressee, Long requesterId);
    void unfriend(User user, Long friendId);
    List<UserDto> getFriends(User user);
    List<FriendshipDto> getPendingRequests(User user);
}
