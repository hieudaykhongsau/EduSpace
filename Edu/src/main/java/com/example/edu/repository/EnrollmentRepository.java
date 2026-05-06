package com.example.edu.repository;

import com.example.edu.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByRoom_Id(Long roomId);
    Optional<Enrollment> findByRoom_IdAndGuest_Id(Long roomId, Long guestId);
    boolean existsByRoom_IdAndGuest_Id(Long roomId, Long guestId);
}
