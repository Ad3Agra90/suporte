package com.midiavox.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.midiavox.backend.repository.UserRepository;
import com.midiavox.backend.model.User;

import org.springframework.transaction.annotation.Transactional;

@Component
public class WebSocketEventListener {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @EventListener
    @Transactional
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        System.out.println("WebSocket connected: username=" + username + " at " + java.time.LocalDateTime.now());
        if (username != null) {
            User user = userRepository.findByUsername(username).orElse(null);
            if (user != null) {
                user.setOnline(true);
                userRepository.save(user);
                sendOnlineUsersUpdate();
            }
        }
    }

    @EventListener
    @Transactional
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        System.out.println("WebSocket disconnected: username=" + username + " at " + java.time.LocalDateTime.now());
        if (username != null) {
            User user = userRepository.findByUsername(username).orElse(null);
            if (user != null) {
                user.setOnline(false);
                userRepository.save(user);
                sendOnlineUsersUpdate();
            }
        }
    }

    private void sendOnlineUsersUpdate() {
        var onlineUsers = userRepository.findAll()
            .stream()
            .filter(User::isOnline)
            .map(User::getUsername)
            .toList();
        messagingTemplate.convertAndSend("/topic/onlineUsers", onlineUsers);
    }
}
