package com.example.stockLog.tradelog.service;

import com.example.stockLog.tradelog.dto.CalculateDto;
import com.example.stockLog.tradelog.dto.StockInfoDto;
import com.example.stockLog.tradelog.entity.Calculate;
import com.example.stockLog.tradelog.repository.CalculateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class CalculateService {
    private final CalculateRepository calculateRepository;
    private final StockApiClient apiClient;
    //배당금 계산하기
    //API에서 가져오기. 저장하기
    public void calculateDividend(CalculateDto dto) {
        //api 저장소 만들기..? 거기서 api가져오기..?
    }
    public void update(Long dividendId, CalculateDto dto) {
        Calculate calculate = calculateRepository.findById(dividendId)
                .orElseThrow(()-> new IllegalArgumentException("없"));

        calculate.updateDividend(dto.getStockName(), dto.getQuantity());
    }
    //가져온 api정보 저장하기
        public void saveWithApi(String userInputName, double quantity) {
            // 1. 이름으로 티커와 상세 정보 가져오기 (기계 작동)
            StockInfoDto info = apiClient.searchByStockName(userInputName);

            // 2. 가져온 정보로 엔티티 만들기
            Calculate dividend = Calculate.builder()
                    .stockName(info.getStockName()) // API가 찾아준 정확한 이름
                    .ticker(info.getTicker())       // API가 찾아준 티커
                    .quantity(quantity)
                    // ... 나머지는 나중에 배당 API에서 가져올 부분
                    .build();

            calculateRepository.save(dividend);
        }

    }
