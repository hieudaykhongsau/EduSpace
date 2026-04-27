package com.example.edu.service;

import com.example.edu.dto.response.PeerInfo;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RoomSessionManager {

    // K mapping từ SessionId tới RoomCode
    private final Map<String, String> sessionToRoomMap = new ConcurrentHashMap<>();
    
    // K mapping từ RoomCode tới Set các PeerInfo
    private final Map<String, Set<PeerInfo>> roomToPeersMap = new ConcurrentHashMap<>();

    public void addPeer(String roomCode, PeerInfo peer) {
        roomToPeersMap.computeIfAbsent(roomCode, k -> ConcurrentHashMap.newKeySet()).add(peer);
        sessionToRoomMap.put(peer.getSessionId(), roomCode);
    }

    public void removePeer(String roomCode, String sessionId) {
        Set<PeerInfo> peers = roomToPeersMap.get(roomCode);
        if (peers != null) {
            peers.removeIf(p -> p.getSessionId().equals(sessionId));
            if (peers.isEmpty()) {
                roomToPeersMap.remove(roomCode);
            }
        }
        sessionToRoomMap.remove(sessionId);
    }

    public Set<PeerInfo> getPeersInRoom(String roomCode) {
        Set<PeerInfo> peers = roomToPeersMap.get(roomCode);
        return peers != null ? Collections.unmodifiableSet(peers) : Collections.emptySet();
    }

    public boolean isRoomFull(String roomCode, int maxParticipants) {
        Set<PeerInfo> peers = roomToPeersMap.get(roomCode);
        return peers != null && peers.size() >= maxParticipants;
    }

    public void handleDisconnect(String sessionId, SimpMessageSendingOperations messagingTemplate) {
        String roomCode = sessionToRoomMap.get(sessionId);
        if (roomCode != null) {
            Set<PeerInfo> peers = roomToPeersMap.get(roomCode);
            PeerInfo disconnectedPeer = null;
            if (peers != null) {
                for (PeerInfo peer : peers) {
                    if (peer.getSessionId().equals(sessionId)) {
                        disconnectedPeer = peer;
                        break;
                    }
                }
            }
            
            removePeer(roomCode, sessionId);
            
            if (disconnectedPeer != null) {
                // Broadcast "peer-left" list
                messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/peer-left", disconnectedPeer.getUserId());
            }
        }
    }
}
