package com.stockproject.experiment_service.chat.controller;

import com.stockproject.experiment_service.auth.model.Role;
import com.stockproject.experiment_service.auth.model.User;
import com.stockproject.experiment_service.auth.repository.UserRepository;
import com.stockproject.experiment_service.auth.util.JwtUtil;
import com.stockproject.experiment_service.chat.dto.ConversationRequest;
import com.stockproject.experiment_service.chat.dto.ConversationResponse;
import com.stockproject.experiment_service.chat.dto.MessageRequest;
import com.stockproject.experiment_service.chat.dto.MessageResponse;
import com.stockproject.experiment_service.chat.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public ChatController(ChatService chatService, JwtUtil jwtUtil, UserRepository userRepository) {
        this.chatService = chatService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @PostMapping("/conversations")
    public ResponseEntity<?> createConversation(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody ConversationRequest request) {
        try {
            Long userId = getUserIdFromToken(token);
            ConversationResponse response = chatService.createConversation(userId, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations(@RequestHeader("Authorization") String token) {
        try {
            Long userId = getUserIdFromToken(token);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            List<ConversationResponse> conversations;
            if (user.getRole() == Role.ADMIN) {
                conversations = chatService.getAllConversations();
            } else {
                conversations = chatService.getUserConversations(userId);
            }

            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<?> getConversation(
            @RequestHeader("Authorization") String token,
            @PathVariable Long conversationId) {
        try {
            Long userId = getUserIdFromToken(token);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            boolean isAdmin = user.getRole() == Role.ADMIN;
            ConversationResponse response = chatService.getConversation(conversationId, userId, isAdmin);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<?> sendMessage(
            @RequestHeader("Authorization") String token,
            @PathVariable Long conversationId,
            @Valid @RequestBody MessageRequest request) {
        try {
            Long userId = getUserIdFromToken(token);
            MessageResponse response = chatService.sendMessage(conversationId, userId, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/conversations/{conversationId}/close")
    public ResponseEntity<?> closeConversation(
            @RequestHeader("Authorization") String token,
            @PathVariable Long conversationId) {
        try {
            Long userId = getUserIdFromToken(token);
            chatService.closeConversation(conversationId, userId);
            return ResponseEntity.ok(Map.of("message", "Conversation closed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private Long getUserIdFromToken(String token) {
        String jwt = token.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(jwt);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return user.getId();
    }
}
