package com.midiavox.backend.service;

import com.midiavox.backend.model.User;
import com.midiavox.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
}
