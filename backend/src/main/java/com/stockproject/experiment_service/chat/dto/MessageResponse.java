package com.stockproject.experiment_service.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponse {
    private Long id;
    private Long senderId;
    private String senderFirstName;
    private String senderLastName;
    private String content;
    private Boolean isAdminMessage;
    private LocalDateTime createdAt;
}
