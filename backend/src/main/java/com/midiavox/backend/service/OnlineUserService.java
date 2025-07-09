package com.midiavox.backend.service;

import com.midiavox.backend.model.User;
import com.midiavox.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OnlineUserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> getAllOnlineUsers() {
        return userRepository.findByOnlineTrue();
    }

    public boolean isUserOnline(String username) {
        return userRepository.findByUsername(username)
                .map(User::isOnline)
                .orElse(false);
    }
}
