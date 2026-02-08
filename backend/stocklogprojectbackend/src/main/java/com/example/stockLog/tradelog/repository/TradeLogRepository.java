package com.example.stockLog.tradelog.repository;

import com.example.stockLog.graph.dto.StrategyResponseDto;
import com.example.stockLog.tradelog.entity.TradeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface TradeLogRepository extends JpaRepository<TradeLog, Long> {
    List<TradeLog> findAllByUserId(Long userId);
    // 특정 사용자의 특정 기간(시작일~종료일) 사이의 모든 매매기록 가져오기
    List<TradeLog> findByUserIdAndTradeDateBetween(Long userId, LocalDate start, LocalDate end);
    // 1. 특정 사용자의 특정 날짜 매매 기록 가져오기 (하단 종목 리스트용)
    List<TradeLog> findByUserIdAndTradeDate(Long userId, LocalDate tradeDate);
    List<TradeLog> findByUserIdAndStockName(Long userId, String stockName);
    @Query("SELECT SUM(t.realizedPL) FROM TradeLog t " +
            "WHERE t.user.id = :userId AND t.tradeDate BETWEEN :start AND :end")
    Double getTotalRealizedPL(@Param("userId") Long userId,
                              @Param("start") LocalDate start,
                              @Param("end") LocalDate end);
    @Query("SELECT new com.example.stockLog.graph.dto.StrategyResponseDto(EXTRACT(MONTH FROM t.tradeDate), COALESCE(SUM(t.realizedPL), 0.0)) " +
            "FROM TradeLog t " +
            "WHERE t.user.id = :userId AND t.tradeDate BETWEEN :start AND :end " +
            "GROUP BY EXTRACT(MONTH FROM t.tradeDate)")
    List<StrategyResponseDto> findMonthlyRealizedPL(@Param("userId") Long userId,
                                                    @Param("start") LocalDate start,
                                                    @Param("end") LocalDate end);
    void deleteByUserId(Long userId);
    List<TradeLog> findByUserIdOrderByTradeDateDesc(Long userId);


}
