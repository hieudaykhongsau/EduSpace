package com.example.edu.repository;

import com.example.edu.entity.Friendship;
import com.example.edu.entity.User;
import com.example.edu.enums.FriendshipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    List<Friendship> findByRequesterOrAddressee(User requester, User addressee);
    List<Friendship> findByAddresseeAndStatus(User addressee, FriendshipStatus status);
    Optional<Friendship> findByRequesterAndAddressee(User requester, User addressee);
}
