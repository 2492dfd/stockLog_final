package com.example.stockLog.config;

import com.example.stockLog.tradelog.entity.StockMaster;
import com.example.stockLog.tradelog.repository.StockMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class StockDataInitializer implements CommandLineRunner {
    private final StockMasterRepository stockMasterRepository;

    @Override
    public void run(String... args) throws Exception {
        // 테이블에 데이터가 없을 때만 실행
        if (stockMasterRepository.count() == 0) {
            System.out.println(">> [System] 종목 마스터 데이터 초기화 시작...");

            List<StockMaster> initialStocks = List.of(
                    new StockMaster("005930.KS", "삼성전자", "KOSPI"),
                    new StockMaster("000660.KS", "SK하이닉스", "KOSPI"),
                    new StockMaster("035420.KS", "NAVER", "KOSPI"),
                    new StockMaster("035720.KS", "카카오", "KOSPI"),
                    new StockMaster("005380.KS", "현대차", "KOSPI"),
                    new StockMaster("068270.KS", "셀트리온", "KOSPI"),
                    new StockMaster("105560.KS", "KB금융", "KOSPI"),
                    new StockMaster("055550.KS", "신한지주", "KOSPI")
            );

            stockMasterRepository.saveAll(initialStocks);
            System.out.println(">> [System] 종목 데이터 " + initialStocks.size() + "건 저장 완료.");
        }
    }
}
