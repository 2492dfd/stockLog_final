import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Modal, Image } from 'react-native';
import { ChevronLeft, X } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { tradeApi } from '../src/api';

// --- Color Constants ---
const Colors = {
  background: '#FFFFFF',
  surface: '#F8F9FA',
  textPrimary: '#191F28',
  textSecondary: '#6B7684',
  accentRed: '#F04452',
  accentBlue: '#3182F6',
  border: '#E5E8EB',
};

const TAG_COLORS: { [key: string]: { bg: string, border: string } } = {
  '뇌동매매': { bg: '#FFEBEE', border: '#FFCDD2' },
  '손절 미준수': { bg: '#FFFDE7', border: '#FFF9C4' },
  '추격 매수': { bg: '#E8F5E9', border: '#C8E6C9' },
  '공포매도': { bg: '#E3F2FD', border: '#BBDEFB' },
  '비중 조절 실패': { bg: '#F3E5F5', border: '#E1BEE7' },
};

const DetailedTransactionsScreen = () => {
  const router = useRouter();
  const { year, month, period } = useLocalSearchParams<{ year: string, month: string, period: string }>();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetailedData = async () => {
      setIsLoading(true);
      try {
        let response;
        if (period === 'monthly') {
          response = await tradeApi.getMonthlyDetail(parseInt(year!), parseInt(month!));
        } else {
          response = await tradeApi.getYearlyDetail(parseInt(year!));
        }
        setTransactions(response.data);
      } catch (error) {
        console.error("Failed to fetch detailed transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (year) {
      fetchDetailedData();
    }
  }, [year, month, period]);

  const Header = () => (
    <View style={styles.tableHeaderRow}>
      <Text style={[styles.tableHeaderText, styles.colStockName]}>종목명</Text>
      <Text style={[styles.tableHeaderText, styles.colBrokerage]}>증권사</Text>
      <Text style={[styles.tableHeaderText, styles.colTradeType]}>매매</Text>
      <Text style={[styles.tableHeaderText, styles.colDate]}>매수일</Text>
      <Text style={[styles.tableHeaderText, styles.colDate]}>매도일</Text>
      <Text style={[styles.tableHeaderText, styles.colHoldingPeriod]}>보유</Text>
      <Text style={[styles.tableHeaderText, styles.colProfit]}>실현손익</Text>
      <Text style={[styles.tableHeaderText, styles.colRate]}>수익률</Text>
      <Text style={[styles.tableHeaderText, styles.colAmount]}>체결단가</Text>
      <Text style={[styles.tableHeaderText, styles.colQuantity]}>수량</Text>
      <Text style={[styles.tableHeaderText, styles.colAmount]}>매매비용</Text>
      <Text style={[styles.tableHeaderText, styles.colTotalAmount]}>총 체결금액</Text>
      <Text style={[styles.tableHeaderText, styles.colTag]}>태그</Text>
      <Text style={[styles.tableHeaderText, styles.colReason]}>매매이유</Text>
      <Text style={[styles.tableHeaderText, styles.colChart]}>차트사진</Text>
    </View>
  );

  const Row = ({ item }: { item: any }) => {
    const tags = item.tags || item.tag || [];
    
    return (
      <View style={styles.tableRow}>
        <Text style={[styles.tableCell, styles.colStockName]} numberOfLines={2} ellipsizeMode="tail">
          {item.stockName}
        </Text>
        <Text style={[styles.tableCell, styles.colBrokerage]}>{item.broker || '-'}</Text>
        <Text style={[styles.tableCell, styles.colTradeType, { color: item.tradeType === 'BUY' ? Colors.accentRed : Colors.accentBlue }]}>
          {item.tradeType === 'BUY' ? '매수' : '매도'}
        </Text>
        <Text style={[styles.tableCell, styles.colDate]}>{item.buyDate ? item.buyDate.split('T')[0] : '-'}</Text>
        <Text style={[styles.tableCell, styles.colDate]}>{item.sellDate ? item.sellDate.split('T')[0] : '-'}</Text>
        <Text style={[styles.tableCell, styles.colHoldingPeriod]}>{item.holdingPeriod ?? 0}일</Text>
        <Text style={[styles.tableCell, styles.colProfit, { color: (item.realizedPL || 0) >= 0 ? Colors.accentRed : Colors.accentBlue }]}>
          {(item.realizedPL || 0) >= 0 ? '+' : ''}{Math.floor(item.realizedPL || 0).toLocaleString()}
        </Text>
        <Text style={[styles.tableCell, styles.colRate, { color: (item.realizedPL || 0) >= 0 ? Colors.accentRed : Colors.accentBlue }]}>
          {item.rateOfReturn !== null ? `${item.rateOfReturn.toFixed(2)}%` : "-"}
        </Text>
        <Text style={[styles.tableCell, styles.colAmount]}>{(item.executionPrice || 0).toLocaleString()}</Text>
        <Text style={[styles.tableCell, styles.colQuantity]}>{(item.executedQuantity || 0).toLocaleString()}</Text>
        <Text style={[styles.tableCell, styles.colAmount]}>{(item.tradingCost || 0).toLocaleString()}</Text>
        <Text style={[styles.tableCell, styles.colTotalAmount]}>{(item.totalCost || 0).toLocaleString()}</Text>
        
        {/* Styled Tags Column */}
        <View style={[styles.tableCell, styles.colTag, styles.tagCellContainer]}>
          {tags.length > 0 ? (
            tags.map((tag: string, idx: number) => {
              const colorInfo = TAG_COLORS[tag] || { bg: '#F2F4F6', border: '#E5E8EB' };
              return (
                <View key={idx} style={[styles.tagChip, { backgroundColor: colorInfo.bg, borderColor: colorInfo.border }]}>
                  <Text style={styles.tagChipText}>#{tag.replace(/\s/g, '')}</Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.tableCell}>-</Text>
          )}
        </View>

        <Text style={[styles.tableCell, styles.colReason]}>{item.reasonForSale || item.reason || '-'}</Text>

        <View style={[styles.tableCell, styles.colChart, { justifyContent: 'center', alignItems: 'center' }]}>
          {item.chartImageUrl ? (
            <TouchableOpacity onPress={() => {
              setSelectedImageUrl(item.chartImageUrl);
              setImageModalVisible(true);
            }}>
              <Text style={styles.viewButton}>보기</Text>
            </TouchableOpacity>
          ) : (
            <Text style={{ color: Colors.textSecondary }}>-</Text>
          )}
        </View>
      </View>
    );
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/settlement-stats');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleBack} 
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {period === 'monthly' ? `${year}년 ${month}월` : `${year}년`} 상세 매매 리스트
        </Text>
        <View style={{ width: 28 }} />
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accentBlue} />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.tableContainer}>
              <Header />
              {transactions.length > 0 ? (
                transactions.map((item, index) => <Row key={`${item.logId}-${index}`} item={item} />)
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>상세 매매 내역이 없습니다.</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </ScrollView>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={isImageModalVisible}
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalCloseButton} 
            onPress={() => setImageModalVisible(false)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={32} color="#FFFFFF" />
          </TouchableOpacity>
          {selectedImageUrl && (
            <Image
              source={{ uri: selectedImageUrl }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: Colors.border, 
    backgroundColor: Colors.background,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { width: 1000, padding: 100, alignItems: 'center' },
  emptyText: { color: Colors.textSecondary, fontSize: 16 },
  tableContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    paddingHorizontal: 8,
  },
  tableCell: {
    fontSize: 13,
    color: Colors.textPrimary,
    paddingHorizontal: 8,
  },
  // Column Styles
  colStockName: { width: 150, textAlign: 'left' },
  colBrokerage: { width: 100, textAlign: 'left' },
  colTradeType: { width: 60, textAlign: 'center' },
  colDate: { width: 100, textAlign: 'center' },
  colHoldingPeriod: { width: 70, textAlign: 'center' },
  colProfit: { width: 110, textAlign: 'center', fontWeight: 'bold' },
  colRate: { width: 80, textAlign: 'center', fontWeight: '600' },
  colAmount: { width: 110, textAlign: 'right' },
  colQuantity: { width: 80, textAlign: 'right' },
  colTotalAmount: { width: 130, textAlign: 'right', fontWeight: '600', marginRight: 16 },
  colTag: { width: 200, textAlign: 'left' }, // Widened slightly for chips
  colReason: { width: 300, textAlign: 'left' },
  colChart: { width: 80 },
  viewButton: {
    color: Colors.accentBlue,
    fontWeight: 'bold',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#EAF2FF',
    overflow: 'hidden', // for borderRadius on Android
  },
  tagCellContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    paddingVertical: 4,
  },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  tagChipText: {
    fontSize: 11,
    color: '#000000',
    fontWeight: '600',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 60, // Adjusted for SafeArea
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  modalImage: {
    width: '100%',
    height: '80%',
  },
});

export default DetailedTransactionsScreen;