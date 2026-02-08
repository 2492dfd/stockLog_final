# 📈 StockLog: Smart Trading Journal & Portfolio Manager

> **데이터와 AI로 완성하는 스마트 투자 습관** > 단순한 기록을 넘어 실시간 시세 연동과 AI 피드백을 통해 투자 전략을 고도화하는 매매일지 플랫폼입니다.

---

## 🚀 주요 기능 (Key Features)

### 1️⃣ 스마트 매매일지 (Trading Log & Calendar)
* **투자 캘린더:** 매수/매도 내역을 날짜별로 시각화(Dots)하여 나의 매매 빈도와 패턴을 한눈에 파악합니다.
* **성과 통계:** 월별/연도별 **평균 수익률 및 승률(실현율)**을 자동 산출하여 정량적인 성과 측정이 가능합니다.
* **매매 복기:** 매매 이유를 상세히 기록하고 보관할 수 있습니다.
* **AI 투자 피드백:** 내 매매일지를 분석한 **AI가 투자 전략에 대한 객관적인 피드백**을 제공하여 감정적 매매를 방지합니다.

### 2️⃣ 실시간 자산 관리 (Real-time Portfolio)
* **Google Sheets API 연동:** 종목명만 입력하면 구글 스프레드시트의 주가 수식을 통해 **현재가 정보가 자동으로 동기화**됩니다.
* **비중 분석 파이차트:** 전체 자산 중 종목별 비중을 시각적으로 확인하여 포트폴리오 다각화를 돕습니다.
* **실시간 자산 트래킹:** 총 투자 자산 및 총 손익을 실시간으로 계산합니다.

### 3️⃣ 시각적 결산 리포트 (Visual Analytics)
* **월간/연간 손익 그래프:** 실현손익의 변화 추이를 막대 및 선 그래프로 제공하여 자산 성장을 시각화합니다.
* **성과 요약:** 한눈에 보는 결산 화면을 통해 직관적인 투자 성적표를 제공합니다.

### 4️⃣ 소셜 트레이딩 커뮤니티 (Community)
* **매매일지 공유:** 자신의 분석 내용과 매매 기록을 커뮤니티에 게시하여 다른 유저와 인사이트를 나눕니다.
* **실시간 소통:** 유저들 간의 소통 기능을 통해 건전한 투자 생태계를 구축합니다.

---

## 🌟 StockLog만의 차별점 (Core Values)

### 🔗 키움증권 API 자동 연동
기존 매매일지 앱들의 수동 입력 불편함을 해결했습니다. 키움증권 사용자라면 클릭 한 번으로 **보유 종목 정보와 매수 평단가 등을 앱으로 자동 로드**할 수 있습니다.

### 📂 매매기록 일괄 마이그레이션
노션(Notion)이나 엑셀(Excel)에 작성해둔 **과거 매매 기록을 한꺼번에 가져오기** 기능을 지원합니다. 데이터의 연속성을 잃지 않고 StockLog로 통합 관리가 가능합니다.

---

## 🏗 기술 스택 (Tech Stack)

### **Frontend**
- **Framework:** React Native (Expo)
- **State Management:** React Context API / Hooks
- **Visualization:** React Native Gifted Charts, Calendars

### **Backend**
- **Language:** Java 21
- **Framework:** Spring Boot 3.x
- **Security:** Spring Security & JWT
- **Database:** MySQL 8.0, Spring Data JPA

### **External APIs**
- **Google Sheets API:** 실시간 종목 데이터 파싱
- **Kiwoom Open API:** 증권사 계좌 및 잔고 연동
- **OpenAI API:** 매매 피드백 알고리즘

---

## 🎨 화면 미리보기 (Screenshots)

| 매매 캘린더 | 포트폴리오 분석 | 자산 결산 | 커뮤니티 |
| :---: | :---: | :---: | :---: |
| <img src="https://via.placeholder.com/200x400" width="200"> | <img src="https://via.placeholder.com/200x400" width="200"> | <img src="https://via.placeholder.com/200x400" width="200"> | <img src="https://via.placeholder.com/200x400" width="200"> |

---

## 🛠 설치 및 실행 방법 (Installation)

### 1. Backend Setup
```bash
# 1. Repository Clone
git clone [https://github.com/your-id/stocklog-backend.git](https://github.com/your-id/stocklog-backend.git)

# 2. application.yml 설정 (DB 및 API Key 입력 필요)

# 3. Build & Run
./gradlew bootRun
