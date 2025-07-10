package com.midiavox.backend.service;

import com.midiavox.backend.model.ChatMessage;
import com.midiavox.backend.model.Chamado;
import com.midiavox.backend.model.User;
import com.midiavox.backend.repository.ChatMessageRepository;
import com.midiavox.backend.repository.UserRepository;
import com.midiavox.backend.service.ChamadoService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChamadoService chamadoService;
    private final UserRepository userRepository;

    public ChatMessageService(ChatMessageRepository chatMessageRepository, ChamadoService chamadoService, UserRepository userRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.chamadoService = chamadoService;
        this.userRepository = userRepository;
    }

    public ChatMessage saveMessage(ChatMessage message) {
        System.out.println("Saving message to DB: " + message);

        if (message.getChamadoId() != null) {
            Optional<Chamado> chamadoOpt = chamadoService.getChamadoById(message.getChamadoId());
            if (chamadoOpt.isPresent()) {
                Chamado chamado = chamadoOpt.get();
                String tecnicoUsername = chamado.getTecnico();
                if (tecnicoUsername != null) {
                    Optional<User> tecnicoOpt = userRepository.findByUsername(tecnicoUsername);
                    if (tecnicoOpt.isPresent()) {
                        User tecnico = tecnicoOpt.get();
                        if (!tecnico.isOnline()) {
                            throw new IllegalStateException("Técnico está offline. Não é possível enviar mensagem.");
                        }
                    }
                }
            }
        }

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
