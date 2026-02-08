import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getPortfolioSummary, getPortfolioList, addPortfolioItem } from '../api';
import { PlusCircle } from 'lucide-react-native';
import AddStockModal from '../../components/AddStockModal'; // 경로 수정

// --- Color Constants ---
const Colors = {
  background: '#FFFFFF',
  textPrimary: '#191F28',
  textSecondary: '#6B7684',
  accentBlue: '#3182F6',
  border: '#F0F1F3',
  positive: '#D93636', // 상승 (빨강)
  negative: '#3182F6', // 하락 (파랑)
};

const PortfolioScreen = () => {
  const [summary, setSummary] = useState(null);
  const [portfolioList, setPortfolioList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, listRes] = await Promise.all([
        getPortfolioSummary(),
        getPortfolioList(),
      ]);
      setSummary(summaryRes.data);
      setPortfolioList(listRes.data);
    } catch (error) {
      console.error('Failed to fetch portfolio data:', error);
      Alert.alert('오류', '데이터를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleSaveStock = async (stockData) => {
    setIsSaving(true);
    try {
        await addPortfolioItem(stockData);
        setIsModalVisible(false);
        Alert.alert('성공', '종목이 추가되었습니다.');
        await fetchData(); // Refresh data
    } catch (error) {
        console.error("Failed to add stock:", error);
        Alert.alert('오류', '종목 추가에 실패했습니다.');
    } finally {
        setIsSaving(false);
    }
  };

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return '-';
    return `${value.toLocaleString()}원`;
  };

  const formatPercentage = (value) => {
    if (typeof value !== 'number') return '-';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const renderSummary = () => (
    <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>총 평가금액</Text>
            <Text style={styles.summaryValue}>{formatCurrency(summary?.totalValuation)}</Text>
        </View>
        <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>총 투자원금</Text>
            <Text style={styles.summaryMuted}>{formatCurrency(summary?.totalPurchaseAmount)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>총 평가손익</Text>
            <Text style={[styles.summaryValue, {color: summary?.totalUnrealizedPL >= 0 ? Colors.positive : Colors.negative}]}>
                {summary?.totalUnrealizedPL >= 0 ? '+' : ''}{formatCurrency(summary?.totalUnrealizedPL)}
            </Text>
        </View>
        <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>총 수익률</Text>
            <Text style={[styles.summaryValue, {color: summary?.overallRateOfReturn >= 0 ? Colors.positive : Colors.negative}]}>
                ({formatPercentage(summary?.overallRateOfReturn)})
            </Text>
        </View>
    </View>
  );

  const renderPortfolioItem = (item) => (
    <View key={item.id} style={styles.portfolioRow}>
        <Text style={styles.colName}>{item.stockName}</Text>
        <Text style={styles.colDate}>{item.buyDate}</Text>
        <Text style={styles.colAvg}>{formatCurrency(item.averagePurchasePrice)}</Text>
        <Text style={styles.colQty}>{item.quantity}</Text>
        <Text style={[styles.colPl, {color: item.unrealizedPL >= 0 ? Colors.positive : Colors.negative}]}>
            {item.unrealizedPL >= 0 ? '+' : ''}{formatCurrency(item.unrealizedPL)}
        </Text>
        <Text style={[styles.colRate, {color: item.rateOfReturn >= 0 ? Colors.positive : Colors.negative}]}>
            {formatPercentage(item.rateOfReturn)}
        </Text>
    </View>
  );

  if (loading && !refreshing) {
    return <ActivityIndicator size="large" color={Colors.accentBlue} style={styles.loadingIndicator} />;
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accentBlue} />}
      >
          <View style={styles.header}>
              <Text style={styles.screenTitle}>보유 종목</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                  <PlusCircle size={28} color={Colors.accentBlue} />
              </TouchableOpacity>
          </View>

          {summary && renderSummary()}

          <Text style={styles.exchangeRateNotice}>* 미국 주식은 실시간 환율이 적용된 원화 가격입니다.</Text>

          <View style={styles.listHeader}>
              <Text style={styles.listTitle}>종목별 상세</Text>
          </View>

          {/* Column Headers */}
          <View style={styles.portfolioHeader}>
              <Text style={styles.colNameHeader}>종목명</Text>
              <Text style={styles.colDateHeader}>매수일</Text>
              <Text style={styles.colAvgHeader}>평단가</Text>
              <Text style={styles.colQtyHeader}>수량</Text>
              <Text style={styles.colPlHeader}>평가손익</Text>
              <Text style={styles.colRateHeader}>수익률</Text>
          </View>

          {portfolioList.length > 0 ? (
              portfolioList.map(renderPortfolioItem)
          ) : (
              <Text style={styles.noDataText}>보유중인 종목이 없습니다.</Text>
          )}
      </ScrollView>
      <AddStockModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveStock}
        isLoading={isSaving}
      />
    </>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scrollContent: { paddingBottom: 120, paddingTop: 60, paddingHorizontal: 20 },
    loadingIndicator: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10, },
    screenTitle: { fontSize: 28, fontWeight: 'bold', color: Colors.textPrimary },
    summaryContainer: { backgroundColor: '#F8F9FA', borderRadius: 16, padding: 20, marginBottom: 30, },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, },
    summaryLabel: { fontSize: 16, color: Colors.textSecondary },
    summaryValue: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
    summaryMuted: { fontSize: 16, color: Colors.textSecondary, fontWeight: '500' },
    summaryDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 8, },
    listHeader: { borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: 12, marginBottom: 8, },
    listTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
    // New styles for portfolio list layout
    portfolioHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface, // Light background for headers
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        borderRadius: 8,
        marginBottom: 8,
    },
    portfolioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    // Column styles - headers
    colNameHeader: { flex: 1.5, textAlign: 'left', fontSize: 13, fontWeight: 'bold', color: Colors.textSecondary },
    colDateHeader: { flex: 1.2, textAlign: 'center', fontSize: 13, fontWeight: 'bold', color: Colors.textSecondary },
    colAvgHeader: { flex: 1, textAlign: 'right', fontSize: 13, fontWeight: 'bold', color: Colors.textSecondary },
    colQtyHeader: { flex: 0.8, textAlign: 'right', fontSize: 13, fontWeight: 'bold', color: Colors.textSecondary },
    colPlHeader: { flex: 1.3, textAlign: 'right', fontSize: 13, fontWeight: 'bold', color: Colors.textSecondary },
    colRateHeader: { flex: 1, textAlign: 'right', fontSize: 13, fontWeight: 'bold', color: Colors.textSecondary },
    // Column styles - data
    colName: { flex: 1.5, textAlign: 'left', fontSize: 14, color: Colors.textPrimary, paddingRight: 5, fontWeight: '600' },
    colDate: { flex: 1.2, textAlign: 'center', fontSize: 13, color: Colors.textSecondary },
    colAvg: { flex: 1, textAlign: 'right', fontSize: 14, color: Colors.textPrimary },
    colQty: { flex: 0.8, textAlign: 'right', fontSize: 14, color: Colors.textPrimary },
    colPl: { flex: 1.3, textAlign: 'right', fontSize: 14, fontWeight: '600' },
    colRate: { flex: 1, textAlign: 'right', fontSize: 14, fontWeight: '600' },
    // Old styles - removed or adapted
    // itemContainer: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border, },
    // itemHeader: { marginBottom: 12 },
    // stockName: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
    // itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, },
    // itemLabel: { fontSize: 14, color: Colors.textSecondary },
    // itemValue: { fontSize: 15, fontWeight: '600' },
    // itemMutedValue: { fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },
    // itemDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
    noDataText: { textAlign: 'center', color: Colors.textSecondary, marginTop: 40, fontSize: 16 },
    exchangeRateNotice: {
        fontSize: 12,
        color: Colors.textSecondary,
        textAlign: 'right',
        marginTop: -20,
        marginBottom: 20,
        paddingHorizontal: 5,
    },
});

export default PortfolioScreen;
