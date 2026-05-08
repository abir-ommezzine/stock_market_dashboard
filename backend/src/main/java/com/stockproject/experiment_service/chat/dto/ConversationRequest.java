package com.stockproject.experiment_service.chat.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationRequest {
    @NotBlank(message = "Subject is required")
    private String subject;
    
    @NotBlank(message = "Initial message is required")
    private String initialMessage;
}
