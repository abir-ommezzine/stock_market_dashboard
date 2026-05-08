package com.stockproject.experiment_service.chat.repository;

import com.stockproject.experiment_service.chat.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    List<Conversation> findByUserIdOrderByLastMessageAtDesc(Long userId);
    List<Conversation> findAllByOrderByLastMessageAtDesc();
    Optional<Conversation> findByIdAndUserId(Long id, Long userId);
}
