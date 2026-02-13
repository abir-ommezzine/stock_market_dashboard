package com.stockproject.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "stocks") // This defines the table name in Postgres
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String symbol; // e.g., "AAPL"

    private String companyName;

    private Double currentPrice;
}