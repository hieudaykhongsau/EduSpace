package com.example.edu.service;

import com.example.edu.dto.request.JoinRoomRequest;
import com.example.edu.dto.request.RoomRequest;
import com.example.edu.dto.response.RoomResponse;

import java.util.List;

public interface RoomService {
    RoomResponse createRoom(RoomRequest request);
    RoomResponse joinRoom(JoinRoomRequest request);
    void leaveRoom(String roomCode);
    RoomResponse getRoomByCode(String roomCode);
    List<RoomResponse> getActiveRooms();
    void closeRoom(String roomCode);
}
