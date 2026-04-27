package com.example.edu.controller;

import com.example.edu.dto.request.JoinRoomRequest;
import com.example.edu.dto.request.RoomRequest;
import com.example.edu.dto.response.RoomResponse;
import com.example.edu.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/guest/room")
@RequiredArgsConstructor
public class RoomController {
    private final RoomService roomService;

    @PostMapping("/create-room")
    public ResponseEntity<RoomResponse> createRoom(@Valid @RequestBody RoomRequest request) {
        RoomResponse room = roomService.createRoom(request);
        return ResponseEntity.ok(room);
    }

    @PostMapping("/join")
    public ResponseEntity<RoomResponse> joinRoom(@Valid @RequestBody JoinRoomRequest request) {
        RoomResponse room = roomService.joinRoom(request);
        return ResponseEntity.ok(room);
    }

    @PostMapping("/{roomCode}/leave")
    public ResponseEntity<Void> leaveRoom(@PathVariable String roomCode) {
        roomService.leaveRoom(roomCode);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{roomCode}")
    public ResponseEntity<RoomResponse> getRoom(@PathVariable String roomCode) {
        return ResponseEntity.ok(roomService.getRoomByCode(roomCode));
    }

    @GetMapping("/active")
    public ResponseEntity<java.util.List<RoomResponse>> getActiveRooms() {
        return ResponseEntity.ok(roomService.getActiveRooms());
    }

    @DeleteMapping("/{roomCode}")
    public ResponseEntity<Void> closeRoom(@PathVariable String roomCode) {
        roomService.closeRoom(roomCode);
        return ResponseEntity.ok().build();
    }
}
