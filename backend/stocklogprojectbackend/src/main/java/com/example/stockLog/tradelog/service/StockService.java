package com.example.stockLog.tradelog.service;

import com.example.stockLog.tradelog.dto.StockMasterResponseDto;
import com.example.stockLog.tradelog.entity.StockMaster;
import com.example.stockLog.tradelog.repository.StockMasterRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Getter
@Transactional
public class StockService {
    //검색 상단에 관련종목 뜨게 하는 service
    private final StockMasterRepository stockMasterRepository;
    public List<StockMasterResponseDto> searchStocks(String keyword){
        List<StockMaster> stocks = stockMasterRepository.findByStockNameContaining(keyword, PageRequest.of(0, 10));
        return stocks.stream()
                .map(StockMasterResponseDto::new)
                .collect(Collectors.toList());
    }
}
