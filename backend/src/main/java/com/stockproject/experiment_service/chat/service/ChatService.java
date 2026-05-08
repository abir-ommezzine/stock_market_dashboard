package com.stockproject.experiment_service.chat.service;

import com.stockproject.experiment_service.auth.model.Role;
import com.stockproject.experiment_service.auth.model.User;
import com.stockproject.experiment_service.auth.repository.UserRepository;
import com.stockproject.experiment_service.chat.dto.ConversationRequest;
import com.stockproject.experiment_service.chat.dto.ConversationResponse;
import com.stockproject.experiment_service.chat.dto.MessageRequest;
import com.stockproject.experiment_service.chat.dto.MessageResponse;
import com.stockproject.experiment_service.chat.model.Conversation;
import com.stockproject.experiment_service.chat.model.Message;
import com.stockproject.experiment_service.chat.repository.ConversationRepository;
import com.stockproject.experiment_service.chat.repository.MessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public ChatService(ConversationRepository conversationRepository,
                      MessageRepository messageRepository,
                      UserRepository userRepository) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ConversationResponse createConversation(Long userId, ConversationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Conversation conversation = Conversation.builder()
                .user(user)
                .subject(request.getSubject())
                .status("OPEN")
                .build();

        conversation = conversationRepository.save(conversation);

        // Create initial message
        Message message = Message.builder()
                .conversation(conversation)
                .sender(user)
                .content(request.getInitialMessage())
                .isAdminMessage(false)
                .build();

        messageRepository.save(message);

        return toConversationResponse(conversation, true);
    }

    @Transactional
    public MessageResponse sendMessage(Long conversationId, Long userId, MessageRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        // Check if user has access to this conversation
        boolean isAdmin = user.getRole() == Role.ADMIN;
        if (!isAdmin && !conversation.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }

        Message message = Message.builder()
                .conversation(conversation)
                .sender(user)
                .content(request.getContent())
                .isAdminMessage(isAdmin)
                .build();

        message = messageRepository.save(message);

        // Update conversation last message time
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        return toMessageResponse(message);
    }

    public List<ConversationResponse> getUserConversations(Long userId) {
        List<Conversation> conversations = conversationRepository.findByUserIdOrderByLastMessageAtDesc(userId);
        return conversations.stream()
                .map(c -> toConversationResponse(c, false))
                .collect(Collectors.toList());
    }

    public List<ConversationResponse> getAllConversations() {
        List<Conversation> conversations = conversationRepository.findAllByOrderByLastMessageAtDesc();
        return conversations.stream()
                .map(c -> toConversationResponse(c, false))
                .collect(Collectors.toList());
    }

    public ConversationResponse getConversation(Long conversationId, Long userId, boolean isAdmin) {
        Conversation conversation;
        
        if (isAdmin) {
            conversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        } else {
            conversation = conversationRepository.findByIdAndUserId(conversationId, userId)
                    .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        }

        return toConversationResponse(conversation, true);
    }

    @Transactional
    public void closeConversation(Long conversationId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        // Only admins can close conversations
        if (user.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Only admins can close conversations");
        }

        conversation.setStatus("CLOSED");
        conversationRepository.save(conversation);
    }

    private ConversationResponse toConversationResponse(Conversation conversation, boolean includeMessages) {
        List<MessageResponse> messages = null;
        String lastMessage = null;

        if (includeMessages) {
            messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId())
                    .stream()
                    .map(this::toMessageResponse)
                    .collect(Collectors.toList());
            
            if (!messages.isEmpty()) {
                lastMessage = messages.get(messages.size() - 1).getContent();
            }
        } else {
            List<Message> msgs = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId());
            if (!msgs.isEmpty()) {
                lastMessage = msgs.get(msgs.size() - 1).getContent();
            }
        }

        return ConversationResponse.builder()
                .id(conversation.getId())
                .userId(conversation.getUser().getId())
                .userFirstName(conversation.getUser().getFirstName())
                .userLastName(conversation.getUser().getLastName())
                .userEmail(conversation.getUser().getEmail())
                .subject(conversation.getSubject())
                .status(conversation.getStatus())
                .createdAt(conversation.getCreatedAt())
                .lastMessageAt(conversation.getLastMessageAt())
                .messages(messages)
                .lastMessage(lastMessage)
                .build();
    }

    private MessageResponse toMessageResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .senderId(message.getSender().getId())
                .senderFirstName(message.getSender().getFirstName())
                .senderLastName(message.getSender().getLastName())
                .content(message.getContent())
                .isAdminMessage(message.getIsAdminMessage())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
