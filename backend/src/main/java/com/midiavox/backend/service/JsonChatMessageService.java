package com.midiavox.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.midiavox.backend.model.ChatMessage;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JsonChatMessageService {

    private static final String CHAT_MESSAGES_FILE = "chat_messages.json";
    private final ObjectMapper objectMapper = new ObjectMapper();

    public synchronized ChatMessage saveMessage(ChatMessage message) {
        List<ChatMessage> messages = readMessages();
        message.setTimestamp(LocalDateTime.now());
        messages.add(message);
        writeMessages(messages);
        return message;
    }

    public synchronized List<ChatMessage> getChatHistory(String user1, String user2) {
        List<ChatMessage> messages = readMessages();
        return messages.stream()
                .filter(m -> (m.getSender().equals(user1) && m.getReceiver().equals(user2)) ||
                             (m.getSender().equals(user2) && m.getReceiver().equals(user1)))
                .sorted((m1, m2) -> m1.getTimestamp().compareTo(m2.getTimestamp()))
                .collect(Collectors.toList());
    }

    private List<ChatMessage> readMessages() {
        try {
            File file = new File(CHAT_MESSAGES_FILE);
            if (!file.exists()) {
                return new ArrayList<>();
            }
            return objectMapper.readValue(file, new TypeReference<List<ChatMessage>>() {});
        } catch (IOException e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    private void writeMessages(List<ChatMessage> messages) {
        try {
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(new File(CHAT_MESSAGES_FILE), messages);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
