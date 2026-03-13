package com.example.stockLog.portfolio.service;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.SheetsScopes;
import com.google.api.services.sheets.v4.model.ValueRange;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.List;
@Service
@Slf4j
public class GoogleSheetsService {
    private final String SPREADSHEET_ID = "1PdAW-rtIi26ngqVVc8okuZ4A0h5wC0Jm8T7gAurewsE";
    private Sheets sheetsService; //google에서 제공하는 google api라이브러리에 포함된 클래스

    @PostConstruct
    public void init() throws IOException, GeneralSecurityException {
        InputStream in = getClass().getResourceAsStream("/google-key.json");
        //in을 통해 파일의 데이터에 접근 가능. 통로라고 이해
        //파일 없으면 에러
        if (in == null) {
            throw new IOException("google-key.json 파일을 찾을 수 없습니다. src/main/resources 위치를 확인하세요.");
        }
        //구글 인증 객체 생성
        GoogleCredentials credentials = GoogleCredentials.fromStream(in)
                .createScoped(Collections.singleton(SheetsScopes.SPREADSHEETS));
        //구글 시트 조립 시작.
        sheetsService = new Sheets.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                new HttpCredentialsAdapter(credentials))
                .setApplicationName("StockLog")
                .build();
        //서버 꺼지기 전까지 이미 필드에 저장되어 있는 sheetsService 사용 가능
    }

    public String[] findTickerAndMarket(String stockName) {
        // TickerMap 탭의 A(종목명), B(티커), C(시장) 열을 읽어옴
        List<List<Object>> data = getSheetData("TickerMap!A2:C5000");

        if (data != null) {
            for (List<Object> row : data) { //표에서 한줄씩
                if (row.size() >= 2) {
                    String sheetStockName = row.get(0).toString().trim();
                    // 사용자가 보낸 이름이 시트의 종목명을 포함하거나 같을 때
                    if (sheetStockName.equals(stockName) || stockName.contains(sheetStockName)) {
                        String ticker = row.get(1).toString().trim();//맞으면 티커 가져옴
                        String market = (row.size() >= 3) ? row.get(2).toString().trim() : "KRX";//시장 있으면 가져오고 없으면 기본값
                        return new String[]{ticker, market};
                    }
                }
            }
        }
        log.warn("TickerMap에서 종목을 찾을 수 없음: {}", stockName);
        return null;
    }

    // 시트의 데이터를 읽어옴
    public List<List<Object>> getSheetData(String range) {
        try {
            //구글 전용 데이터 배달 상자 ValueRange
            ValueRange response = sheetsService.spreadsheets().values()//시트 내부의 실제 값에 접근
                    .get(SPREADSHEET_ID, range)
                    .execute();
            return response.getValues();
        } catch (IOException e) {
            log.error("구글 시트 데이터 읽기 실패: {}", e.getMessage());
            return null;
        }
    }

    /**
     * [수정] 티커를 시트1에 기록할 때 시장 정보를 조합해서 기록 (예: KRX:005930)
     */
    public void appendTicker(String ticker, String market) {
        try {
            // 국장이면 KRX: 를 붙이고, 아니면 그냥 티커만 (또는 NASDAQ: 등) 기록
            String finalTicker = "KRX".equalsIgnoreCase(market) ? "KRX:" + ticker : ticker;

            ValueRange appendBody = new ValueRange()
                    .setValues(Collections.singletonList(Collections.singletonList(finalTicker)));

            sheetsService.spreadsheets().values()
                    .append(SPREADSHEET_ID, "시트1!B3", appendBody)
                    .setValueInputOption("USER_ENTERED")
                    .execute();

            log.info("시트1에 티커 추가 성공: {}", finalTicker);
        } catch (IOException e) {
            log.error("시트 티커 추가 실패: {}", e.getMessage());
        }
    }
}
