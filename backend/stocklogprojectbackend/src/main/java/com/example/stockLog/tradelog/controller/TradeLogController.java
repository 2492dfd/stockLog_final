package com.example.stockLog.tradelog.controller;

import com.example.stockLog.community.config.CustomUserDetails;
import com.example.stockLog.tradelog.dto.*;
import com.example.stockLog.tradelog.entity.Broker;
import com.example.stockLog.tradelog.entity.StockMaster;
import com.example.stockLog.tradelog.entity.TradeLog;
import com.example.stockLog.tradelog.entity.TradeType;
import com.example.stockLog.tradelog.repository.StockMasterRepository;
import com.example.stockLog.tradelog.repository.TradeLogRepository;
import com.example.stockLog.tradelog.service.TradeLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/api/tradelogs")
@RequiredArgsConstructor
public class TradeLogController {
    //목록 조회
    //상세 조회
    //일지 생성
    //일지 수정
    //일지 삭제
    //AI 분석
    private final TradeLogService tradeLogService;
    private final StockMasterRepository stockMasterRepository;
    private final TradeLogRepository tradeLogRepository;


    @PostMapping
    public ResponseEntity<?> createLog(@AuthenticationPrincipal CustomUserDetails userDetails,
                                       @RequestBody TradeLogRequestDto tradeLogRequestDto) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 정보가 없습니다.");
            }

            // 💡 ID 추출 방식을 서비스와 통일 (getId()가 있다면 그걸 사용)
            Long userId = userDetails.getId();

            Long tradeLogId = tradeLogService.write(userId, tradeLogRequestDto);
            return ResponseEntity.ok(tradeLogId);
        } catch (Exception e) {
            // 💥 중요: 서버 콘솔에 진짜 에러 원인을 찍어서 범인을 잡아야 합니다!
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateLog(@PathVariable("id") Long tradeLogId, @RequestBody TradeLogRequestDto tradeLogRequestDto,@AuthenticationPrincipal CustomUserDetails userDetails ){
        tradeLogService.update(tradeLogId, tradeLogRequestDto, userDetails.getId());
        return ResponseEntity.ok().build();
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLog(@PathVariable("id") Long id,@AuthenticationPrincipal CustomUserDetails userDetails ){
        tradeLogService.delete(id, userDetails.getId());
        return ResponseEntity.ok().build();
    }
    //DeleteMapping은 body없이 보냄..
    @PostMapping("/{id}/analyze")
    public ResponseEntity<AiAnalysisResponseDto> analyzeLog(@PathVariable("id") Long tradeLogId, @RequestBody(required = false) Map<String, Object> body){
        String aiAnalyze=tradeLogService.executeAiAnalysis(tradeLogId);
        // 2. DTO 바구니에 담습니다. (빌더 패턴 사용)
        AiAnalysisResponseDto response = AiAnalysisResponseDto.builder()
                .content(aiAnalyze)
                .build();

        // 3. DTO를 담아서 성공 응답을 보냅니다.
        return ResponseEntity.ok(response);
    }


    //월별 기록 전부 가져오기
    @GetMapping("/monthly/simple")
    public ResponseEntity<List<SimpleTradeLogResponseDto>> getMonthlySimple(@AuthenticationPrincipal  CustomUserDetails userDetails,
                                                                            @RequestParam int year,
                                                                            @RequestParam int month){
        Long userId=userDetails.getUser().getId();
        List<SimpleTradeLogResponseDto> logs = tradeLogService.getMonthlySimple(userId, year, month);
        return ResponseEntity.ok(logs);
    }
    @GetMapping("/monthly/detail")
    public  ResponseEntity<List<DetailTradeLogResponseDto>> getMonthlyDetail(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                                             @RequestParam int year,
                                                                             @RequestParam int month){
        Long userId=userDetails.getUser().getId();
        return ResponseEntity.ok(tradeLogService.getMonthlyDetail(userId, year, month));
    }
    //연도별 기록 전부 가져오기
    @GetMapping("/yearly/simple")
    public ResponseEntity<List<SimpleTradeLogResponseDto>> getYearlySimple(@AuthenticationPrincipal  CustomUserDetails userDetails,
                                                           @RequestParam int year){
        Long userId=userDetails.getUser().getId();
        return ResponseEntity.ok(tradeLogService.getYearlySimple(userId, year));
    }
    @GetMapping("/yearly/detail")
    public  ResponseEntity<List<DetailTradeLogResponseDto>> getYearlyDetail(@AuthenticationPrincipal  CustomUserDetails userDetails,
                                                                            @RequestParam int year){
        Long userId=userDetails.getUser().getId();
        return ResponseEntity.ok(tradeLogService.getYearlyDetail(userId, year));
    }
    @GetMapping("/monthly/summary")
    public ResponseEntity<TradeSummaryDto> getMonthlySummary(@AuthenticationPrincipal  CustomUserDetails userDetails,
                                                             @RequestParam int year,
                                                             @RequestParam int month){
        Long userId=userDetails.getUser().getId();
        TradeSummaryDto summary=tradeLogService.getMonthlySummary(userId, year, month);
        return ResponseEntity.ok(summary);
    }
    @GetMapping("/yearly/summary")
    public ResponseEntity<TradeSummaryDto> getYearlySummary(@AuthenticationPrincipal CustomUserDetails userDetails,
                                            @RequestParam int year){
        Long userId=userDetails.getUser().getId();
        TradeSummaryDto summary = tradeLogService.getYearlySummary(userId, year);
        return ResponseEntity.ok(summary);
    }
    // 종목명 실시간 검색 API
    @GetMapping("/stocks/search")
    public ResponseEntity<List<StockMasterResponseDto>> searchStocks(@RequestParam String keyword) {
        // 키워드가 포함된 종목 10개만 가져오기
        List<StockMaster> stocks = stockMasterRepository.findTop10ByStockNameContaining(keyword);

        // 엔티티를 직접 주기보다 필요한 정보(이름, 티커)만 담은 DTO로 변환해서 주는 것이 좋습니다.
        List<StockMasterResponseDto> response = stocks.stream()
                .map(s -> new StockMasterResponseDto(s.getTicker(), s.getStockName()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
    // 증권사 선택창용 목록 API
    @GetMapping("/brokers")
    public ResponseEntity<List<BrokerResponseDto>> getBrokers() {
        // Enum의 모든 값을 리스트로 변환
        List<BrokerResponseDto> brokers = Arrays.stream(Broker.values())
                .map(b -> new BrokerResponseDto(b.name(), b.getName())) // KIWOOM, 키움증권
                .collect(Collectors.toList());

        return ResponseEntity.ok(brokers);
    }
    // 1. 특정 날짜의 매매 내역 가져오기 (하단 종목 상자용)
    @GetMapping("/day")
    public ResponseEntity<List<DetailTradeLogResponseDto>> getDailyLogs(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam String date // "2026-01-04" 형식
    ) {
        Long userId = userDetails.getUser().getId();
        LocalDate targetDate = LocalDate.parse(date);

        // 서비스에 getDailyLogs 메서드를 만들어야 합니다.
        List<DetailTradeLogResponseDto> logs = tradeLogService.getDailyLogs(userId, targetDate);
        return ResponseEntity.ok(logs);
    }

    // 2. 해당 월에 매매가 있는 '날짜'만 가져오기 (캘린더 점 찍기용)
    @GetMapping("/monthly/days-with-trades")
    public ResponseEntity<Map<String, Set<String>>> getDaysWithTrades(@AuthenticationPrincipal CustomUserDetails userDetails, // 인증 정보 추가
                                                      @RequestParam int year,
                                                      @RequestParam int month) {

        // 1. 로그인 체크 및 ID 추출
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId=userDetails.getUser().getId();
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        List<TradeLog> logs = tradeLogRepository.findByUserIdAndTradeDateBetween(userId, start, end);

        // 날짜별로 TradeType(BUY, SELL)을 모으는 Map 생성
        Map<String, Set<String>> tradeMap = new HashMap<>();

        for (TradeLog log : logs) {
            String dateStr = log.getTradeDate().toString(); // "2026-01-04"
            String type = log.getTradeType().name();       // "BUY" 또는 "SELL"

            tradeMap.computeIfAbsent(dateStr, k -> new HashSet<>()).add(type);
        }

        return ResponseEntity.ok(tradeMap);
    }
    @GetMapping("/journal/detail/{tradeLogId}")
    public ResponseEntity<DailyJournalResponseDto> getStockLogDetail(
            @PathVariable(name="tradeLogId") Long tradeLogId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        if(tradeLogId == null){
            return ResponseEntity.ok(new DailyJournalResponseDto());
        }

        try {
            // 🚀 수정: userDetails.getId() 대신 userDetails.getUser().getId() 사용
            Long userId = userDetails.getUser().getId();

            DailyJournalResponseDto result = tradeLogService.getLogDetailById(userId, tradeLogId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            // 🚩 여기서 에러 로그를 찍어보면 범인이 확실해집니다.
            System.out.println("❌ 상세조회 실패 원인: " + e.getMessage());
            return ResponseEntity.ok(new DailyJournalResponseDto());
        }
    }
}
