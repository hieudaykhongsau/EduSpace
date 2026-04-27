package com.example.edu.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthRequest {
    @NotBlank(message = "Email hoặc Username không được để trống")
    private String emailOrUsername;
    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;
}
