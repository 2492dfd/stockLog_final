package com.example.stockLog.tradelog.service;

import com.example.stockLog.tradelog.dto.*;
import com.example.stockLog.tradelog.entity.*;
import com.example.stockLog.community.entity.User;
import com.example.stockLog.tradelog.repository.AiAnalysisRepository;
import com.example.stockLog.tradelog.repository.StockMasterRepository;
import com.example.stockLog.tradelog.repository.TradeLogRepository;
import com.example.stockLog.community.repository.UserRepository;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class TradeLogService {
    private final TradeLogRepository tradeLogRepository;
    private final UserRepository userRepository;
    private final AiAnalysisService aiAnalysisService;
    private final StockDataService stockDataService; // Yahoo API 서비스 주입
    private final StockMasterRepository stockMasterRepository;
    private final AiAnalysisRepository aiAnalysisRepository;
    @PersistenceContext
    private EntityManager em;

    public Long write(Long userId, TradeLogRequestDto dto) {
        if (dto.getStockName() == null || dto.getStockName().trim().isEmpty()) {
            throw new IllegalArgumentException("종목명은 필수입니다.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("user not found"));

        validateTrade(dto);

        String correctName = dto.getStockName();
        try {
            StockInfoDto stockInfo = stockDataService.getStockInfo(dto.getTicker());
            if (stockInfo != null && stockInfo.getStockName() != null) {
                correctName = stockInfo.getStockName();
            }
        } catch (Exception e) {
            System.out.println("외부 API 연동 실패, 입력된 이름 사용: " + e.getMessage());
        }

        TradeCalculation calc = calculateTradeValues(dto);

        // 🚀 수정 포인트: realizedPL 초기값을 0.0 대신 null로 설정
        Double realizedPL = null;
        Double rateOfReturn = null;
        Double pPrice = dto.getPurchasePrice();
        Double ePrice = dto.getExecutionPrice();
        Double eQty = dto.getExecutedQuantity();

        // 2. 매도일 때만 계산 시도
        if (dto.getTradeType() == TradeType.SELL) {
            // 매수 평단가가 있을 때만 계산 수행
            if (pPrice != null && pPrice > 0 && ePrice != null && eQty != null) {
                realizedPL = (ePrice - pPrice) * eQty;
                rateOfReturn = ((ePrice - pPrice) / pPrice) * 100;
            } else {
                // 🚀 매수 평단가가 없으면 null 상태 유지
                System.out.println("🚩 매수 평단가 부재로 수익률 계산 제외");
            }
        }

        // 3. 빌더에서 모든 필드를 정확히 매핑 (누락된 필드 추가)
        TradeLog tradeLog = TradeLog.builder()
                .user(user)
                .stockName(correctName)
                .ticker(dto.getTicker())
                .marketType(dto.getMarketType())
                .broker(dto.getBroker())
                .tradeType(dto.getTradeType())
                .buyDate(dto.getBuyDate())
                .sellDate(dto.getSellDate())
                .executionPrice(ePrice)
                .executedQuantity(eQty)
                .purchasePrice(pPrice)
                .realizedPL(realizedPL)
                .rateOfReturn(rateOfReturn)
                .tradeDate(dto.getTradeDate())
                .fee(calc.getFee())
                .tax(calc.getTax())
                .totalCost(calc.getTotalCost())
                .reasonForBuy(dto.getReasonForBuy())
                .reasonForSale(dto.getReasonForSale())
                .tags(dto.getTags())
                .chartImageUrl(dto.getChartImageUrl())
                .build();

        tradeLog.initStatus();
        TradeLog savedLog = tradeLogRepository.saveAndFlush(tradeLog);
        return savedLog.getId();
    }


    @Transactional
    public void update(Long tradeLogId, TradeLogRequestDto dto, Long userId) {
        TradeLog tradeLog = tradeLogRepository.findById(tradeLogId)
                .orElseThrow(() -> new IllegalArgumentException("수정할 기록이 없습니다. ID: " + tradeLogId));

        if (!tradeLog.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("본인 기록만 수정 가능합니다.");
        }

        // 🚀 수정 시에도 서버에서 재계산 (0 저장 방지)
        Double realizedPL = null;
        Double rateOfReturn = null;
        if (dto.getTradeType() == TradeType.SELL) {
            if (dto.getPurchasePrice() != null && dto.getPurchasePrice() > 0
                    && dto.getExecutionPrice() != null && dto.getExecutedQuantity() != null) {
                realizedPL = (dto.getExecutionPrice() - dto.getPurchasePrice()) * dto.getExecutedQuantity();
                rateOfReturn = ((dto.getExecutionPrice() - dto.getPurchasePrice()) / dto.getPurchasePrice()) * 100;
            }
        }

        TradeCalculation calc = calculateTradeValues(dto);

        tradeLog.updateTradeLog(
                dto.getMarketType(),
                dto.getStockName(),
                dto.getTicker(),
                dto.getBroker(),
                dto.getTradeType(),
                dto.getBuyDate(),
                dto.getSellDate(),
                dto.getHoldingPeriod(),
                realizedPL,   // dto 대신 계산된 값(null 가능) 사용
                rateOfReturn, // dto 대신 계산된 값(null 가능) 사용
                dto.getExecutionPrice(),
                dto.getExecutedQuantity(),
                calc.getTax() + calc.getFee(),
                calc.getTotalCost(),
                dto.getReasonForSale(),
                dto.getReasonForBuy(),
                dto.getTags(),
                dto.getChartImageUrl()
        );
    }

    public void delete (Long tradeLogId, Long userId){
        User user=userRepository.findById(userId).orElseThrow(() -> new
                IllegalArgumentException("user not found"));
        TradeLog tradeLog=tradeLogRepository.findById(tradeLogId).orElseThrow(()->new
                IllegalArgumentException("tradeLog not found"));

        if(!tradeLog.getUser().getId().equals(userId)){
            throw new IllegalArgumentException("자신의 기록만 삭제할 수 있습니다.");
        }

        Optional<AiAnalysis> aiAnalysisOptional =
                aiAnalysisRepository.findByTradeLog(tradeLog);

        aiAnalysisOptional.ifPresent(aiAnalysisRepository::delete);

        tradeLogRepository.deleteById(tradeLogId);
    }

    private String getCorrectStockName (String ticker, String inputName){
        StockInfoDto stockInfo = stockDataService.getStockInfo(ticker);
        if (stockInfo != null) return stockInfo.getStockName();

        return stockMasterRepository.findById(ticker)
                .map(StockMaster::getStockName)
                .orElse(inputName);
    }

    private TradeCalculation calculateTradeValues (TradeLogRequestDto dto){
        // 🚀 수치 데이터가 null일 수 있으므로 방어 코드 추가
        double qty = (dto.getExecutedQuantity() != null) ? dto.getExecutedQuantity() : 0;
        double price = (dto.getExecutionPrice() != null) ? dto.getExecutionPrice() : 0;
        double baseAmount = qty * price;
        double fee = calculateFee(dto);
        double tax = calculateTax(dto, baseAmount);
        double totalCost = roundAmount(calculateTotalCost(dto, fee, tax));
        return new TradeCalculation(fee, tax, totalCost);
    }

    public double calculateTax (TradeLogRequestDto tradeLogRequestDto,double baseAmount){
        if (tradeLogRequestDto.getTradeType() == TradeType.BUY) return 0;
        return 0;
    }

    public double calculateFee (TradeLogRequestDto tradeLogRequestDto){
        if (tradeLogRequestDto.getExecutionPrice() == null || tradeLogRequestDto.getExecutedQuantity() == null) return 0;
        double rate;
        double baseAmount = tradeLogRequestDto.getExecutionPrice() * tradeLogRequestDto.getExecutedQuantity();
        if (tradeLogRequestDto.getMarketType().equals(MarketType.KOR)) {
            rate = tradeLogRequestDto.getBroker().getDomesticRate();
        } else {
            rate = tradeLogRequestDto.getBroker().getForeignRate();
        }
        double fee = baseAmount * rate;
        return Math.round(fee * 100) / 100.0;
    }

    private double calculateTotalCost (TradeLogRequestDto tradeLogRequestDto,double fee, double tax){
        double price = (tradeLogRequestDto.getExecutionPrice() != null) ? tradeLogRequestDto.getExecutionPrice() : 0;
        double qty = (tradeLogRequestDto.getExecutedQuantity() != null) ? tradeLogRequestDto.getExecutedQuantity() : 0;
        double baseAmount = price * qty;
        if (tradeLogRequestDto.getTradeType() == TradeType.BUY) {
            return baseAmount + fee + tax;
        } else {
            return baseAmount - fee - tax;
        }
    }

    private double roundAmount ( double amount){
        return Math.round(amount * 100) / 100.0;
    }

    private void validateTrade (TradeLogRequestDto tradeLogRequestDto){
        if (tradeLogRequestDto.getExecutedQuantity() == null || tradeLogRequestDto.getExecutedQuantity() <= 0) {
            throw new IllegalArgumentException("수량은 최소 1주 이상이어야 합니다.");
        }
        if (tradeLogRequestDto.getExecutionPrice() == null || tradeLogRequestDto.getExecutionPrice() <= 0) {
            throw new IllegalArgumentException("가격은 0보다 커야 합니다.");
        }
        if (tradeLogRequestDto.getStockName() == null || tradeLogRequestDto.getStockName().trim().isEmpty()) {
            throw new IllegalArgumentException("종목명을 입력해주세요.");
        }
    }

    private void initAiStatus (TradeLog tradeLog){
        tradeLog.initStatus();
    }

    public String executeAiAnalysis(Long tradeLogId) {
        TradeLog tradeLog = tradeLogRepository.findById(tradeLogId)
                .orElseThrow(() -> new IllegalArgumentException("매매 기록이 없습니다"));

        tradeLog.markAsAnalyzing();

        String promptTemplate = """
            너는 주식 투자 심리 전문가이자 냉철한 자산관리사야. 아래의 매매 기록을 보고, 유저의 '투자 심리'와 '행동'을 분석해서 조언해줘.

            [매매 정보]
            - 종목명: %s
            - 매매 수량: %s주
            - 평균 단가: %s
            - 매매 이유: %s
            - 사용자가 설정한 태그: [%s]

            [지침]
            1. 매매 당시 이 종목이 급등 중이었거나 변동성이 컸을 가능성을 언급하며 행동을 분석해줘.
            2. 만약 태그에 '뇌동매매'나 '추격매매'가 있다면, 왜 그런 행동이 위험한지 뼈를 때리듯 냉정하게 지적해줘.
            3. 마지막에는 '남에게 이끌리지 않는 매매'와 '충동 구매 지양'을 강조하며 토스(Toss) 스타일로 친절하게 3문장으로 요약해줘.
            """;

        String prompt = String.format(promptTemplate,
                tradeLog.getStockName(),
                String.valueOf(tradeLog.getExecutedQuantity()),
                String.valueOf(tradeLog.getExecutionPrice()),
                tradeLog.getReasonForSale(),
                tradeLog.getTagsAsString()
        );

        System.out.println(">>> [서비스] 프롬프트 조립 완료:");
        System.out.println(prompt);

        String result = aiAnalysisService.sendPrompt(prompt);
        saveAnalysisResult(tradeLogId, result);
        return result;
    }

    @Transactional
    public void saveAnalysisResult(Long tradeLogId, String result) {
        TradeLog tradeLog = tradeLogRepository.findById(tradeLogId)
                .orElseThrow(() -> new IllegalArgumentException("매매 기록이 없습니다."));

        Optional<AiAnalysis> existing = aiAnalysisRepository.findByTradeLog(tradeLog);

        if (existing.isPresent()) {
            AiAnalysis analysis = existing.get();
            analysis.updateContent(result);
        } else {
            AiAnalysis newAnalysis = AiAnalysis.builder()
                    .content(result)
                    .tradeLog(tradeLog)
                    .build();
            aiAnalysisRepository.save(newAnalysis);
        }
    }

    public void getMonthLog (Long userId,int year, int month){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDateTime startOfMonth = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = yearMonth.atEndOfMonth().atTime(23, 59, 59);
    }

    public List<SimpleTradeLogResponseDto> getMonthlySimple (Long userId,int year, int month){
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        return getSimpleLogs(userId, startDate, endDate);
    }

    public List<DetailTradeLogResponseDto> getMonthlyDetail (Long userId,int year, int month){
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        return getDetailLogs(userId, startDate, endDate);
    }

    public List<SimpleTradeLogResponseDto> getYearlySimple (Long userId,int year){
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);
        return getSimpleLogs(userId, startDate, endDate);
    }

    public List<DetailTradeLogResponseDto> getYearlyDetail (Long userId,int year){
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);
        return getDetailLogs(userId, startDate, endDate);
    }

    private List<SimpleTradeLogResponseDto> getSimpleLogs (Long userId, LocalDate start, LocalDate end){
        return tradeLogRepository.findByUserIdAndTradeDateBetween(userId, start, end)
                .stream()
                .filter(log->log.getTradeType()==TradeType.SELL)
                .map(SimpleTradeLogResponseDto::new)
                .collect(Collectors.toList());
    }

    private List<DetailTradeLogResponseDto> getDetailLogs (Long userId, LocalDate start, LocalDate end){
        return tradeLogRepository.findByUserIdAndTradeDateBetween(userId, start, end)
                .stream()
                .map(DetailTradeLogResponseDto::new)
                .collect(Collectors.toList());
    }

    public TradeSummaryDto getMonthlySummary (Long userId,int year, int month){
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return getSummary(userId, start, end);
    }

    public TradeSummaryDto getYearlySummary (Long userId,int year){
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        return getSummary(userId, start, end);
    }

    public TradeSummaryDto getSummary (Long userId, LocalDate start, LocalDate end){
        List<TradeLog> logs = tradeLogRepository.findByUserIdAndTradeDateBetween(userId, start, end);
        Double totalPL=tradeLogRepository.getTotalRealizedPL(userId, start, end);
        System.out.println("DB에서 직접 계산한 합계 : "+totalPL);
        return new TradeSummaryDto(logs, totalPL);
    }

    @Getter
    @AllArgsConstructor
    class TradeCalculation {
        private double fee;
        private double tax;
        private double totalCost;
    }

    public List<DetailTradeLogResponseDto> getDailyLogs(Long userId, LocalDate date) {
        em.clear();
        System.out.println(">>> [DEBUG] 조회 요청 날짜: " + date + ", 유저: " + userId);
        List<TradeLog> logs = tradeLogRepository.findByUserIdAndTradeDate(userId, date);
        System.out.println(">>> [DEBUG] 조회된 로그 개수: " + logs.size());

        return logs.stream()
                .map(DetailTradeLogResponseDto::new)
                .collect(Collectors.toList());
    }

    public List<Integer> getDaysWithTrades(Long userId, int year, int month) {
        if (userId == null) {
            throw new IllegalArgumentException("로그인이 필요한 서비스입니다.");
        }
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        return tradeLogRepository.findByUserIdAndTradeDateBetween(userId, start, end)
                .stream()
                .map(log -> log.getTradeDate().getDayOfMonth())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    public DailyJournalResponseDto dailyJournalStockLog(Long userId, DailyJournalResponseDto requestDto) {
        List<TradeLog> logs = tradeLogRepository.findByUserIdAndStockName(userId, requestDto.getStockName());
        if (logs.isEmpty()) return new DailyJournalResponseDto();
        TradeLog log = logs.get(0);
        return new DailyJournalResponseDto(log);
    }

    public DailyJournalResponseDto getLogDetailById(Long userId, Long tradeLogId) {
        TradeLog log = tradeLogRepository.findById(tradeLogId)
                .orElseThrow(() -> new IllegalArgumentException("해당 기록을 찾을 수 없습니다. ID: " + tradeLogId));
        if (!log.getUser().getId().equals(userId)) {
            throw new SecurityException("본인의 기록만 조회할 수 있는 권한이 있습니다.");
        }
        return new DailyJournalResponseDto(log);
    }

    @Transactional
    public void importCsvData(MultipartFile file, Long userId) throws IOException, CsvException {
        User user = userRepository.findById(userId).orElseThrow();

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream(), "UTF-8"))) {
            List<String[]> lines = reader.readAll();
            if (lines.size() <= 1) return;

            Map<String, Integer> idx = findColumnIndices(lines.get(0));
            System.out.println("🔍 매핑된 인덱스: " + idx);

            List<TradeLog> logsToSave = new ArrayList<>();

            for (int i = 1; i < lines.size(); i++) {
                String[] data = lines.get(i);

                String sName = getValue(data, idx, "stockName");
                Double ePrice = parseNumeric(getValue(data, idx, "executionPrice"));
                Double eQty = parseNumeric(getValue(data, idx, "executedQuantity"));
                String sDateStr = getValue(data, idx, "tradeDate");
                LocalDate sDate = parseDate(sDateStr);
                String sType = getValue(data, idx, "tradeType");
                String sMemo = getValue(data, idx, "memo");

                if (sName == null || ePrice == null || ePrice <= 0 || eQty == null || eQty <= 0 || sDate == null) {
                    System.out.println("⚠️ " + (i + 1) + "행: 필수 정보 누락으로 스킵");
                    continue;
                }

                Double pPrice = idx.containsKey("purchasePrice") ? parseNumeric(getValue(data, idx, "purchasePrice")) : null;
                Double realizedPL = null;
                Double rateOfReturn = null;

                TradeType tradeType = parseTradeType(sType);
                if (tradeType == TradeType.SELL && pPrice != null && pPrice > 0) {
                    realizedPL = (ePrice - pPrice) * eQty;
                    rateOfReturn = ((ePrice - pPrice) / pPrice) * 100;
                }

                TradeLog log = TradeLog.builder()
                        .user(user)
                        .stockName(sName)
                        .executionPrice(ePrice)
                        .executedQuantity(eQty)
                        .purchasePrice(pPrice)
                        .realizedPL(realizedPL)
                        .rateOfReturn(rateOfReturn)
                        .tradeDate(sDate)
                        .tradeType(tradeType)
                        .reasonForBuy(sMemo)
                        .build();

                logsToSave.add(log);
            }

            if (!logsToSave.isEmpty()) {
                System.out.println("💾 DB 저장 시도... 개수: " + logsToSave.size());
                tradeLogRepository.saveAll(logsToSave);
            }
        }
    }

    private static final Map<String, List<String>> COLUMN_ALIASES = Map.of(
            "stockName", List.of("종목", "종목명", "주식", "Stock", "Ticker", "Item", "stock_name", "종목 이름"),
            "tradeDate", List.of("날짜", "거래일", "거래일자", "일시", "Date", "TradeDate", "trade_date"),
            "tradeType", List.of("구분", "매매", "타입", "Action", "Type", "Side","매수/매도", "매수매도" ,"trade_type", "매매구분"),
            "executionPrice", List.of("단가", "체결가", "가격", "Price", "AvgPrice", "체결 단가", "체결단가"),
            "executedQuantity", List.of("수량", "수량(주)", "Quantity", "Qty", "Amount", "체결수량","체결 수량"),
            "memo", List.of("메모", "사유", "매매사유", "비고", "Note", "Reason","매매 사유")
    );

    private Map<String, Integer> findColumnIndices(String[] header) {
        Map<String, Integer> idxMap = new HashMap<>();
        for (int i = 0; i < header.length; i++) {
            String cleanedHeader = header[i].trim().replaceAll("\\s", "");
            for (Map.Entry<String, List<String>> entry : COLUMN_ALIASES.entrySet()) {
                for (String alias : entry.getValue()) {
                    if (cleanedHeader.equalsIgnoreCase(alias.replaceAll("\\s", ""))) {
                        idxMap.put(entry.getKey(), i);
                        break;
                    }
                }
            }
        }
        return idxMap;
    }

    private String getValue(String[] data, Map<String, Integer> map, String key) {
        if (!map.containsKey(key)) return null;
        return data[map.get(key)];
    }

    private Double parseNumeric(String input) {
        if (input == null || input.trim().isEmpty()) return null;
        try {
            return Double.parseDouble(input.replaceAll("[^0-9.-]", ""));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private LocalDate parseDate(String input) {
        if (input == null || input.isBlank()) return null;
        String cleaned = input.replaceAll("\\s", "").replace(".", "-").replace("/", "-");
        if (cleaned.endsWith("-")) cleaned = cleaned.substring(0, cleaned.length() - 1);
        try {
            java.time.format.DateTimeFormatter formatter = new java.time.format.DateTimeFormatterBuilder()
                    .appendPattern("yyyy")
                    .appendLiteral("-")
                    .appendValue(java.time.temporal.ChronoField.MONTH_OF_YEAR)
                    .appendLiteral("-")
                    .appendValue(java.time.temporal.ChronoField.DAY_OF_MONTH)
                    .toFormatter();
            return LocalDate.parse(cleaned, formatter);
        } catch (Exception e) {
            return null;
        }
    }

    private TradeType parseTradeType(String input) {
        if (input == null) return TradeType.BUY;
        if (input.contains("매도") || input.equalsIgnoreCase("SELL")) return TradeType.SELL;
        return TradeType.BUY;
    }
    //매매일지 공유하기.
    @Transactional(readOnly = true)
    public List<DailyJournalResponseDto> getMyTradeLogList(Long userId) {
        return tradeLogRepository.findByUserIdOrderByTradeDateDesc(userId)
                .stream()
                .map(log -> new DailyJournalResponseDto(log)) // 👈 이렇게 직접 호출하세요!
                .collect(Collectors.toList());
    }
}
