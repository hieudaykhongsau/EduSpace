package com.example.edu.controller;

import com.example.edu.dto.response.FriendshipDto;
import com.example.edu.dto.response.UserDto;
import com.example.edu.entity.User;
import com.example.edu.security.SecurityUtil;
import com.example.edu.service.FriendshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendshipController {

    private final FriendshipService friendshipService;

    @PostMapping("/request/{addresseeId}")
    public ResponseEntity<String> sendRequest(@PathVariable Long addresseeId) {
        User user = SecurityUtil.getCurrentUser();
        friendshipService.sendFriendRequest(user, addresseeId);
        return ResponseEntity.ok("Friend request sent successfully");
    }

    @PostMapping("/accept/{requesterId}")
    public ResponseEntity<String> acceptRequest(@PathVariable Long requesterId) {
        User user = SecurityUtil.getCurrentUser();
        friendshipService.acceptFriendRequest(user, requesterId);
        return ResponseEntity.ok("Friend request accepted");
    }

    @PostMapping("/decline/{requesterId}")
    public ResponseEntity<String> declineRequest(@PathVariable Long requesterId) {
        User user = SecurityUtil.getCurrentUser();
        friendshipService.declineFriendRequest(user, requesterId);
        return ResponseEntity.ok("Friend request declined");
    }

    @DeleteMapping("/unfriend/{friendId}")
    public ResponseEntity<String> unfriend(@PathVariable Long friendId) {
        User user = SecurityUtil.getCurrentUser();
        friendshipService.unfriend(user, friendId);
        return ResponseEntity.ok("Unfriended successfully");
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getFriends() {
        User user = SecurityUtil.getCurrentUser();
        return ResponseEntity.ok(friendshipService.getFriends(user));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<FriendshipDto>> getPendingRequests() {
        User user = SecurityUtil.getCurrentUser();
        return ResponseEntity.ok(friendshipService.getPendingRequests(user));
    }
}
