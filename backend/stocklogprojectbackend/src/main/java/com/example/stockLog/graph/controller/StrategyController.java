package com.example.stockLog.graph.controller;

import com.example.stockLog.community.config.CustomUserDetails;
import com.example.stockLog.graph.dto.StrategyRequestDto;
import com.example.stockLog.graph.dto.StrategyResponseDto;
import com.example.stockLog.graph.service.StrategyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StrategyController {
    private final StrategyService strategyService;

    @GetMapping("/api/strategy/yearly")
    public ResponseEntity<List<StrategyResponseDto>> getYearlyRealizedPL(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                                   @ModelAttribute StrategyRequestDto strategyRequestDto) {
        List<StrategyResponseDto> result = strategyService.getYearlyRealizedPL(userDetails.getId(), strategyRequestDto);
        return ResponseEntity.ok(result);
    }
}