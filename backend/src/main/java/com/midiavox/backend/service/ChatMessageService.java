package com.midiavox.backend.service;

import com.midiavox.backend.model.ChatMessage;
import com.midiavox.backend.repository.ChatMessageRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;

    public ChatMessageService(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    public ChatMessage saveMessage(ChatMessage message) {
        System.out.println("Saving message to DB: " + message);
        ChatMessage saved = chatMessageRepository.save(message);
        System.out.println("Saved message: " + saved);
        return saved;
    }

    public List<ChatMessage> getChatHistory(String user1, String user2) {
        List<ChatMessage> messages = new ArrayList<>();
        messages.addAll(chatMessageRepository.findBySenderAndReceiverOrderByTimestampAsc(user1, user2));
        messages.addAll(chatMessageRepository.findBySenderAndReceiverOrderByTimestampAsc(user2, user1));
        messages.sort((m1, m2) -> m1.getTimestamp().compareTo(m2.getTimestamp()));
        return messages;
    }
}
