package com.stockproject.repository;

import com.stockproject.model.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {
    // Spring Data JPA creates all the basic CRUD methods for you!
}