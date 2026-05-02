package com.example.edu.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "guests")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Guest extends User{
    @Column(name = "dob")
    private LocalDate dob;

    @JsonIgnore
    @OneToMany(mappedBy = "guest", cascade = CascadeType.ALL)
    private List<Enrollment> enrollments;

    @Override
    public String getUsername() {
        return (this.getEmail() != null) ? this.getEmail() : super.getUsername();
    }
}
