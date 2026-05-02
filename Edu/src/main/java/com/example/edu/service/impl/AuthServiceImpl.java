package com.example.edu.service.impl;

import com.example.edu.dto.request.AuthRequest;
import com.example.edu.dto.request.RegisterRequest;
import com.example.edu.dto.response.AuthResponse;
import com.example.edu.dto.response.UserDto;
import com.example.edu.entity.Guest;
import com.example.edu.entity.User;
import com.example.edu.enums.AuthProvider;
import com.example.edu.enums.RoleProvider;
import com.example.edu.enums.StatusProvider;
import com.example.edu.repository.UserRepository;
import com.example.edu.security.JwtUtil;
import com.example.edu.security.SecurityUtil;
import com.example.edu.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    // In-memory Brute Force Protection Cache
    private final ConcurrentHashMap<String, Integer> failedAttempts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, LocalDateTime> lockoutTime = new ConcurrentHashMap<>();
    private static final int MAX_ATTEMPTS = 5;
    private static final int LOCKOUT_MINUTES = 15;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use.");
        }
        if (request.getUsername() != null) {
            if (!request.getUsername().matches("^[a-zA-Z0-9_]+$")) {
                throw new RuntimeException("Username must not contain spaces or special characters.");
            }
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new RuntimeException("Username is already in use..");
            }
        }

        User user = Guest.builder()
                .fullName(request.getFullName())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(RoleProvider.GUEST)
                .status(StatusProvider.ACTIVE) // Pending verification
                .build();
        userRepository.save(user);
        return AuthResponse.builder()
                .message("Registration successful.")
                .build();
    }


    @Override
    public AuthResponse authenticate(AuthRequest request) {
        String key = request.getEmailOrUsername();

        // 1. Check if user is currently locked out
        if (lockoutTime.containsKey(key)) {
            if (LocalDateTime.now().isBefore(lockoutTime.get(key))) {
                throw new LockedException("Your account has been temporarily locked due to too many incorrect entries. Please try again in 15 minutes.");
            } else {
                // Lockout period has expired, reset counters
                lockoutTime.remove(key);
                failedAttempts.remove(key);
            }
        }

        // 2. Attempt to find user
        User user = userRepository.findByEmail(key)
                .orElseGet(() -> userRepository.findByUsername(key)
                        .orElseThrow(() -> new BadCredentialsException("Invalid username or password.")));

        // 3. Ensure user is active
        if (!user.isEnabled()) {
            throw new DisabledException("Tài khoản chưa được kích hoạt hoặc đã bị ban.");        }
        // Nếu User này đăng ký qua GOOGLE, không cho phép đăng nhập bằng Password Local
        if(user.getProvider() != null && user.getProvider() == AuthProvider.google){
            throw new BadCredentialsException("This account was registered with Google. Please login via Google.");
        }
        // 4. Authenticate credentials
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword()));

            // Login successful: reset attempts
            failedAttempts.remove(key);
        } catch (BadCredentialsException ex) {
            // Login failed: increment attempts
            int attempts = failedAttempts.getOrDefault(key, 0) + 1;
            failedAttempts.put(key, attempts);

            if (attempts >= MAX_ATTEMPTS) {
                lockoutTime.put(key, LocalDateTime.now().plusMinutes(LOCKOUT_MINUTES));
                throw new LockedException("Your account has been temporarily locked due to 5 consecutive incorrect login attempts. Please try again in 15 minutes.");
            }
            throw new BadCredentialsException("Wrong password. You have " + (MAX_ATTEMPTS - attempts) + " more attempts.");
        }

        String jwtToken = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .message("Login successful.")
                .user(UserDto.fromEntity(user))
                .build();
    }

    @Override
    public UserDto getUserProfile() {
        User user = SecurityUtil.getCurrentUser();
        if (user == null) {
            throw new RuntimeException("User not found or not authenticated");
        }
        return UserDto.fromEntity(user);
    }

    @Override
    public UserDto updateProfile(String fullName) {
        User user = SecurityUtil.getCurrentUser();
        if (user == null) {
            throw new RuntimeException("User not found or not authenticated");
        }
        if (fullName != null && !fullName.trim().isEmpty()) {
            user.setFullName(fullName.trim());
        }
        userRepository.save(user);
        return UserDto.fromEntity(user);
    }
}

