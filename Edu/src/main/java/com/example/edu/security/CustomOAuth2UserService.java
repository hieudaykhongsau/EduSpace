package com.example.edu.security;

import com.example.edu.entity.Guest;
import com.example.edu.entity.User;
import com.example.edu.enums.AuthProvider;
import com.example.edu.enums.RoleProvider;
import com.example.edu.enums.StatusProvider;
import com.example.edu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private final UserRepository userRepository;


    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        try {
            return processOAuth2User(userRequest, oAuth2User);
        } catch (Exception ex) {
            throw new OAuth2AuthenticationException(ex.getMessage());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oAuth2User) {
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        AuthProvider provider = AuthProvider.valueOf(registrationId.toLowerCase());

        String email = oAuth2User.getAttribute("email");
        if (email == null) {
            throw new IllegalArgumentException("Email not found from OAuth2 provider");
        }

        String name = oAuth2User.getAttribute("name");
        String pUrl = oAuth2User.getAttribute("picture");

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Luôn cập nhật thông tin mới nhất từ nhà cung cấp (Google)
            user.setFullName(name != null ? name : user.getFullName());
            user.setAvatarUrl(pUrl != null ? pUrl : user.getAvatarUrl());
            user.setProvider(provider);
            user = userRepository.save(user);
        } else {
            // Register new user
            user = Guest.builder()
                    .email(email)
                    .fullName(name != null ? name : "Unknown")
                    // Generating a dummy username based on email prefix
                    .username(email.split("@")[0] + "_" + provider.name())
                    .password("")
                    .avatarUrl(pUrl)
                    .role(RoleProvider.GUEST)
                    .status(StatusProvider.ACTIVE)
                    .provider(provider)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            user = userRepository.save(user);
        }

        return CustomOAuth2User.create(user, oAuth2User.getAttributes());
    }
}
