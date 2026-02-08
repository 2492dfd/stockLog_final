package com.example.stockLog.tradelog.controller;

import com.example.stockLog.tradelog.dto.StockMasterResponseDto;
import com.example.stockLog.tradelog.entity.StockMaster;
import com.example.stockLog.tradelog.service.StockService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
@Controller
public class StockController {
    private StockService stockService;
    @GetMapping("/api/stocks/search")
    public ResponseEntity<List<StockMasterResponseDto>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(stockService.searchStocks(keyword));
    }}
