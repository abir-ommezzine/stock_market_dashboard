package com.stockproject.experiment_service.auth.repository;

import com.stockproject.experiment_service.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByCreatedAtAfter(LocalDateTime date);

    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.email) LIKE %:q% OR " +
           "LOWER(u.firstName) LIKE %:q% OR " +
           "LOWER(u.lastName) LIKE %:q%")
    List<User> searchByEmailOrName(@Param("q") String q);
}
