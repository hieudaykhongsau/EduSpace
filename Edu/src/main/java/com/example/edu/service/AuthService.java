package com.example.edu.service;

import com.example.edu.dto.request.AuthRequest;
import com.example.edu.dto.request.RegisterRequest;
import com.example.edu.dto.response.AuthResponse;
import com.example.edu.dto.response.UserDto;


public interface AuthService {
    AuthResponse register(RegisterRequest request);

    AuthResponse authenticate(AuthRequest request);

    UserDto getUserProfile();

    UserDto updateProfile(String fullName);
}

