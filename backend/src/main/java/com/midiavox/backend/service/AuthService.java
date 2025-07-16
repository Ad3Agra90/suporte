package com.midiavox.backend.service;

import com.midiavox.backend.model.User;
import com.midiavox.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.midiavox.backend.model.RefreshToken;
import com.midiavox.backend.repository.RefreshTokenRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final long refreshTokenDurationMs = 1000L * 60 * 2; // 2 minutes

    public boolean sendPasswordResetToken(String email) {
        // TODO: Implement token generation, save token, send email to user
        System.out.println("Sending password reset token to email: " + email);
        return true; // Stub success
    }

    public boolean resetPassword(String token, String newPassword) {
        // TODO: Validate token, find user, update password in DB
        System.out.println("Resetting password with token: " + token);
        return true; // Stub success
    }

    public User authenticate(String username, String password) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return null;
        }
        if (passwordEncoder.matches(password, user.getPassword())) {
            user.setOnline(true);
            userRepository.save(user);
            return user;
        }
        return null;
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    public void saveUser(User user) {
        userRepository.save(user);
    }

    public RefreshToken createRefreshToken(String username) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setUsername(username);
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
        refreshToken = refreshTokenRepository.save(refreshToken);
        return refreshToken;
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public boolean isRefreshTokenExpired(RefreshToken token) {
        return token.getExpiryDate().isBefore(Instant.now());
    }

    public void deleteByToken(String token) {
        refreshTokenRepository.deleteByToken(token);
    }

    public void deleteAllByUsername(String username) {
        refreshTokenRepository.deleteAllByUsername(username);
    }
}
