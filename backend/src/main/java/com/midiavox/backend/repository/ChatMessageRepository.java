package com.midiavox.backend.repository;

import com.midiavox.backend.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findBySenderAndReceiverOrderByTimestampAsc(String sender, String receiver);
    List<ChatMessage> findByReceiverAndSenderOrderByTimestampAsc(String receiver, String sender);
}
