package com.example.stockLog.graph.service;

import com.example.stockLog.graph.dto.StrategyRequestDto;
import com.example.stockLog.graph.dto.StrategyResponseDto;
import com.example.stockLog.graph.repository.StrategyRepository;
import com.example.stockLog.tradelog.entity.TradeLog;
import com.example.stockLog.tradelog.repository.TradeLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class StrategyService {
    private final StrategyRepository strategyRepository;
    private final TradeLogRepository tradeLogRepository;

    public List<StrategyResponseDto> getYearlyRealizedPL(Long userId, StrategyRequestDto dto) {
        int year = dto.getYear(); //연도 선택하면 tradeLogRepository에서 연도별 정보 빼오기..?
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        List<TradeLog> yearLogs = tradeLogRepository.findByUserIdAndTradeDateBetween(userId, start, end);
        List<StrategyResponseDto> result = new ArrayList<>();
        //1월부터 12월까지 각 달 수익률 +
        for (int m = 1; m <= 12; m++) {
            int currentMonth = m;

            // 🚀 여기서 '합산'이 일어납니다 (해당 월의 모든 매도 수익을 더함)
            double monthlySum = yearLogs.stream()
                    .filter(log -> log.getTradeDate().getMonthValue() == currentMonth)
                    .mapToDouble(log -> log.getRealizedPL() != null ? log.getRealizedPL() : 0.0) // ✅ null이면 0.0으로 치환
                    .sum();

            result.add(new StrategyResponseDto(currentMonth, monthlySum));
        }

        return result;
    }

    }


