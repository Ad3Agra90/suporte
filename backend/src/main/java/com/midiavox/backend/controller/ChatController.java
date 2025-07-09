package com.midiavox.backend.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import com.midiavox.backend.model.ChatMessage;
import com.midiavox.backend.service.ChatMessageService;

import java.util.List;

@RestController
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService chatMessageService;

    public ChatController(SimpMessagingTemplate messagingTemplate, ChatMessageService chatMessageService) {
        this.messagingTemplate = messagingTemplate;
        this.chatMessageService = chatMessageService;
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

    @PostMapping("/api/chat/sendMessage")
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

    @GetMapping("/api/chat/history")
    public List<ChatMessage> getChatHistory(@RequestParam String user1, @RequestParam String user2) {
        return chatMessageService.getChatHistory(user1, user2);
    }
}
