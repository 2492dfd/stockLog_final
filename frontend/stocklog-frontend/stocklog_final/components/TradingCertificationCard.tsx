import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Colors = {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    textPrimary: '#191F28',
    textSecondary: '#6B7684',
    accentRed: '#F04452', // 매수 시 수익률, 매도 시 빨간색
    accentBlue: '#3182F6', // 매도 시 수익률, 매수 시 파란색
    border: '#E5E8EB',
    tossBlue: '#3182F6', // 토스 블루
    lightGray: '#F2F4F6', // 배경 연한 회색
    darkGray: '#191F28', // 진한 회색 (텍스트)
};

const TradingCertificationCard = ({ transactionData }) => {
    if (!transactionData) {
        return null;
    }

    const isBuy = transactionData.tradeType === 'BUY';

    // 공통 헤더 디자인: [종목명] 강조, 옆에 [매수/매도 상태 태그] 배치
    const tradeTypeTagBackgroundColor = isBuy ? Colors.accentBlue : Colors.accentRed;
    const tradeTypeTagTextColor = Colors.background; // 흰색
    const tradeTypeText = isBuy ? '매수' : '매도';

    // 매도(Sell) 기록일 경우: 실현수익, 수익률 강조 스타일
    const profitColor = transactionData.realizedProfit >= 0 ? Colors.accentRed : Colors.accentBlue;

    return (
        <View style={styles.card}>
            {/* --- Header Section --- */}
            <View style={styles.header}>
                <Text style={styles.stockName}>{transactionData.stockName}</Text>
                <View style={[styles.tradeTypeTag, { backgroundColor: tradeTypeTagBackgroundColor }]}>
                    <Text style={[styles.tradeTypeTagText, { color: tradeTypeTagTextColor }]}>
                        {tradeTypeText}
                    </Text>
                </View>
            </View>

            {/* --- Case B: 매도(Sell) 기록일 경우 실현수익, 수익률 강조 --- */}
            {!isBuy && transactionData.realizedProfit !== undefined && transactionData.rateOfReturn !== undefined && (
                <View style={styles.profitSection}>
                    <View style={styles.profitItem}>
                        <Text style={styles.profitLabel}>실현손익</Text>
                        <Text style={[styles.profitValue, { color: profitColor }]}>
                            {transactionData.realizedProfit >= 0 ? '+' : ''}
                            {transactionData.realizedProfit?.toLocaleString()}원
                        </Text>
                    </View>
                    <View style={styles.profitItem}>
                        <Text style={styles.profitLabel}>수익률</Text>
                        <Text style={[styles.profitValue, { color: profitColor }]}>
                            {transactionData.rateOfReturn >= 0 ? '+' : ''}
                            {transactionData.rateOfReturn?.toFixed(2)}%
                        </Text>
                    </View>
                </View>
            )}

            {/* --- Details Section (2열 그리드) --- */}
            <View style={styles.detailsGrid}>
                <View style={styles.gridRow}>
                    <Text style={styles.label}>매수일</Text>
                    <Text style={styles.value}>{transactionData.tradeDate}</Text>
                </View>
                <View style={styles.gridRow}>
                    <Text style={styles.label}>체결단가</Text>
                    <Text style={styles.value}>{transactionData.executionPrice?.toLocaleString()}원</Text>
                </View>
                <View style={styles.gridRow}>
                    <Text style={styles.label}>체결수량</Text>
                    <Text style={styles.value}>{transactionData.executedQuantity?.toLocaleString()}주</Text>
                </View>
                {/* 거래비용 및 총 비용은 매수/매도 공통으로 가정 */}
                {transactionData.tradingFee !== undefined && (
                    <View style={styles.gridRow}>
                        <Text style={styles.label}>거래비용</Text>
                        <Text style={styles.value}>{transactionData.tradingFee?.toLocaleString()}원</Text>
                    </View>
                )}
                {transactionData.totalCost !== undefined && (
                    <View style={styles.gridRow}>
                        <Text style={styles.label}>총 비용</Text>
                        <Text style={styles.value}>{transactionData.totalCost?.toLocaleString()}원</Text>
                    </View>
                )}
            </View>

            {/* --- Case A: 매수(Buy) 기록일 경우 매수 사유 (인용구 스타일) --- */}
            {isBuy && transactionData.reason && (
                <View style={styles.blockquoteContainer}>
                    <Text style={styles.blockquoteText}>"{transactionData.reason}"</Text>
                </View>
            )}
            {/* Case B: 매도(Sell) 기록일 경우에도 매매 사유를 동일하게 표시 */}
            {!isBuy && transactionData.reason && (
                <View style={styles.blockquoteContainer}>
                    <Text style={styles.blockquoteText}>"{transactionData.reason}"</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.darkGray, // 어두운 배경
        borderRadius: 16, // 둥근 모서리
        padding: 20,
        marginBottom: 16,
        overflow: 'hidden',
        // 그림자 효과는 플랫폼마다 다르게 적용될 수 있음 (iOS: shadow, Android: elevation)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.textSecondary, // 깔끔한 구분선
    },
    stockName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.background, // 흰색 텍스트
        marginRight: 10,
    },
    tradeTypeTag: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    tradeTypeTagText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    profitSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.textSecondary,
    },
    profitItem: {
        alignItems: 'center',
    },
    profitLabel: {
        fontSize: 14,
        color: Colors.textSecondary, // 연한 회색 레이블
        marginBottom: 4,
    },
    profitValue: {
        fontSize: 24, // 큰 폰트로 강조
        fontWeight: 'bold',
    },
    detailsGrid: {
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.textSecondary, // 깔끔한 구분선
    },
    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    label: {
        fontSize: 16,
        color: Colors.textSecondary, // 연한 회색 레이블
    },
    value: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.background, // 흰색 값
    },
    blockquoteContainer: {
        backgroundColor: Colors.lightGray, // 연한 회색 배경
        borderRadius: 8,
        padding: 12,
        marginTop: 16, // 위쪽 여백
    },
    blockquoteText: {
        fontSize: 15,
        fontStyle: 'italic',
        color: Colors.darkGray,
        lineHeight: 22,
    },
});

export default TradingCertificationCard;
