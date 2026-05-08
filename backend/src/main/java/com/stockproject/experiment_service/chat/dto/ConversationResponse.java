package com.stockproject.experiment_service.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationResponse {
    private Long id;
    private Long userId;
    private String userFirstName;
    private String userLastName;
    private String userEmail;
    private String subject;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime lastMessageAt;
    private List<MessageResponse> messages;
    private String lastMessage;
}
