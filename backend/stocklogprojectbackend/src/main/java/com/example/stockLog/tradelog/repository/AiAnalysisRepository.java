package com.example.stockLog.tradelog.repository;

import com.example.stockLog.tradelog.entity.AiAnalysis;
import com.example.stockLog.tradelog.entity.TradeLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AiAnalysisRepository extends JpaRepository<AiAnalysis,Long> {
    Optional<AiAnalysis> findByTradeLog(TradeLog tradeLog);
}
