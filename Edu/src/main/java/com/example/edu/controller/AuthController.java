package com.example.edu.controller;

import com.example.edu.dto.request.AuthRequest;
import com.example.edu.dto.request.RegisterRequest;
import com.example.edu.dto.response.AuthResponse;
import com.example.edu.dto.response.UserDto;

import com.example.edu.repository.UserRepository;
import com.example.edu.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Các API liên quan đến đăng ký, đăng nhập và thông tin tài khoản")
public class AuthController {
    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản mới", description = "Tạo một user mới trong hệ thống")
    @ApiResponse(responseCode = "200", description = "Đăng ký thành công và trả về Token")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse authResponse = authService.register(request);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập", description = "Xác thực user bằng email/password và trả về JWT Token")
    public ResponseEntity<AuthResponse> authenticate(@RequestBody AuthRequest request) {
        AuthResponse authResponse = authService.authenticate(request);
        return ResponseEntity.ok(authResponse);
    }

    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestParam String email) {
        boolean exists = userRepository.existsByEmail(email);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @GetMapping("/check-username")
    public ResponseEntity<Map<String, Boolean>> checkUsername(@RequestParam String username) {
        boolean exists = userRepository.existsByUsername(username);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin cá nhân", description = "Yêu cầu cung cấp JWT Token trong header Authorization")
    public ResponseEntity<UserDto> getUserProfile() {
        return ResponseEntity.ok(authService.getUserProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(@RequestBody Map<String, String> body) {
        String fullName = body.get("fullName");
        return ResponseEntity.ok(authService.updateProfile(fullName));
    }
}
