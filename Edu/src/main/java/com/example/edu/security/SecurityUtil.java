package com.example.edu.security;

import com.example.edu.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {
    /**
     * Lấy thực thể User (Người dùng) đang đăng nhập hiện tại.
     * Hỗ trợ cả đăng nhập qua JWT cục bộ (UserDetails) và OAuth2 (Google).
     */
    public static User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getPrincipal().equals("anonymousUser")) {
            return null;
        }

        Object principal = authentication.getPrincipal();

        // Nếu user đăng nhập bằng tài khoản nội bộ (JWT)
        if (principal instanceof User) {
            return (User) principal;
        }
        // Nếu user đăng nhập bằng mạng xã hội (OAuth2)
        else if (principal instanceof CustomOAuth2User) {
            return ((CustomOAuth2User) principal).getUser();
        }

        return null;
    }

    /**
     * Lấy ID của người dùng đang đăng nhập.
     */
    public static Long getCurrentUserId() {
        User user = getCurrentUser();
        return user != null ? user.getId() : null;
    }

    /**
     * Kiểm tra xem người dùng hiện tại có vai trò (Role) cụ thể hay không.
     * Ví dụ: hasRole("ADMIN"), hasRole("GUEST")
     */
    public static boolean hasRole(String roleName) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String targetRole = "ROLE_" + roleName.toUpperCase();
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            if (authority.getAuthority().equalsIgnoreCase(targetRole)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Tiện ích nhanh để kiểm tra xem user hiện tại có phải Admin không.
     */
    public static boolean isAdmin() {
        return hasRole("ADMIN");
    }
}
