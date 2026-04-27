package com.example.edu.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "admins")
@Setter
@Getter
@SuperBuilder
@NoArgsConstructor
public class Admin extends User{

}
