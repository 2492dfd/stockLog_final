import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatDisplay } from '../utils/format';

const TossDarkGray = '#191F28';
const BuyColor = '#EF4444'; // Red for Buy
const SellColor = '#3182F6'; // Blue for Sell (TossBlue)

const LogCard = ({ stockName, tradeType, executionPrice, executedQuantity, realizedPL, rateOfReturn }) => {
  const isBuy = tradeType === 'BUY';
  const tradeColor = isBuy ? BuyColor : SellColor;

  return (
    <View style={[styles.card, { borderLeftColor: tradeColor, borderLeftWidth: 4 }]}>
      <View>
        <Text style={styles.stockName}>{stockName}</Text>
        <Text style={[styles.tradeType, { color: tradeColor }]}>{isBuy ? '매수' : '매도'}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>{formatDisplay(executionPrice, "원")}</Text>
        <Text style={styles.detailText}>{formatDisplay(executedQuantity, "주")}</Text>
        {!isBuy && (
          <>
            <Text style={[
              styles.detailText, 
              { 
                color: realizedPL != null ? (realizedPL > 0 ? BuyColor : (realizedPL < 0 ? SellColor : TossDarkGray)) : TossDarkGray, 
                fontWeight: 'bold' 
              }
            ]}>
              {(realizedPL && realizedPL > 0) ? '+' : ''}{formatDisplay(realizedPL, "원")}
            </Text>
            <Text style={styles.rateText}>
              수익률: {formatDisplay(rateOfReturn, "%", 2)}
            </Text>
            {realizedPL === null && (
                <Text style={styles.guideText}>
                    * 매수 정보가 없어 손익을 계산할 수 없습니다.
                </Text>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    paddingLeft: 16, // Adjust padding due to borderLeftWidth
  },
  stockName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TossDarkGray,
  },
  tradeType: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  detailsContainer: {
    alignItems: 'flex-end',
  },
  detailText: {
    fontSize: 14,
    color: TossDarkGray,
    marginBottom: 2, // Added for spacing
  },
  rateText: {
    fontSize: 12,
    color: TossDarkGray,
    marginTop: 4,
  },
  guideText: {
    fontSize: 11,
    color: 'gray',
    marginTop: 2,
  },
});

export default LogCard;
