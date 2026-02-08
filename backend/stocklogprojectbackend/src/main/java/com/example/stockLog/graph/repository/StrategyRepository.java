package com.example.stockLog.graph.repository;

import com.example.stockLog.graph.entity.Strategy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface StrategyRepository extends JpaRepository<Strategy, Long> {
    //userId를 기준으로
    Optional<Strategy> findByUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end);
}
