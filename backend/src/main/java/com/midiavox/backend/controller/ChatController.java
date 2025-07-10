package com.midiavox.backend.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import com.midiavox.backend.model.ChatMessage;
import com.midiavox.backend.model.Chamado;
import com.midiavox.backend.model.User;
import com.midiavox.backend.repository.UserRepository;
import com.midiavox.backend.service.ChamadoService;
import com.midiavox.backend.service.ChatMessageService;
import com.midiavox.backend.service.OnlineUserService;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService chatMessageService;
    private final ChamadoService chamadoService;
    private final OnlineUserService onlineUserService;
    private final UserRepository userRepository;

    public ChatController(SimpMessagingTemplate messagingTemplate, ChatMessageService chatMessageService,
                          ChamadoService chamadoService, OnlineUserService onlineUserService, UserRepository userRepository) {
        this.messagingTemplate = messagingTemplate;
        this.chatMessageService = chatMessageService;
        this.chamadoService = chamadoService;
        this.onlineUserService = onlineUserService;
        this.userRepository = userRepository;
    }

    @MessageMapping("/chat.sendMessage")
    public ChatMessage sendMessage(ChatMessage message) {
        System.out.println("Received message to send: " + message);
        message.setTimestamp(java.time.LocalDateTime.now());
        ChatMessage savedMessage = chatMessageService.saveMessage(message);
        System.out.println("Saved message: " + savedMessage);
        // Send message to sender and receiver only
        messagingTemplate.convertAndSendToUser(message.getSender(), "/queue/messages", savedMessage);
        messagingTemplate.convertAndSendToUser(message.getReceiver(), "/queue/messages", savedMessage);
        return savedMessage;
    }

    @PostMapping("/sendMessage")
    public ChatMessage sendMessageRest(@RequestBody ChatMessage message) {
        System.out.println("Received REST message to send: " + message);
        message.setTimestamp(java.time.LocalDateTime.now());
        ChatMessage savedMessage = chatMessageService.saveMessage(message);
        System.out.println("Saved REST message: " + savedMessage);
        // Send message to sender and receiver only
        messagingTemplate.convertAndSendToUser(message.getSender(), "/queue/messages", savedMessage);
        messagingTemplate.convertAndSendToUser(message.getReceiver(), "/queue/messages", savedMessage);
        return savedMessage;
    }

    @GetMapping("/history")
    public List<ChatMessage> getChatHistory(@RequestParam String user1, @RequestParam String user2) {
        return chatMessageService.getChatHistory(user1, user2);
    }

    @GetMapping("/chamados")
    public List<Chamado> getChamadosForChat(Principal principal) {
        String username = principal.getName();
        User currentUser = userRepository.findByUsername(username).orElse(null);
        if (currentUser == null) {
            return java.util.Collections.emptyList();
        }
        String permission = currentUser.getPermission();
        if ("admin".equalsIgnoreCase(permission)) {
            return chamadoService.getAllChamados();
        } else if ("tecnico".equalsIgnoreCase(permission)) {
            return chamadoService.getChamadosByTecnico(username);
        } else if ("cliente".equalsIgnoreCase(permission)) {
            return chamadoService.getChamadosByUsuario(username);
        } else {
            return java.util.Collections.emptyList();
        }
    }

    @GetMapping("/onlineStatus")
    public Map<String, Boolean> getOnlineStatus(@RequestParam List<String> usernames) {
        Map<String, Boolean> statusMap = new HashMap<>();
        for (String user : usernames) {
            statusMap.put(user, onlineUserService.isUserOnline(user));
        }
        return statusMap;
    }
}
