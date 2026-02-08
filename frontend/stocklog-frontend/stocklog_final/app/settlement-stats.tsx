import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator, Dimensions } from 'react-native';

import { ChevronDown, ChevronLeft, ChevronUp, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { tradeApi, strategyApi } from '../src/api';
import { formatDisplay } from '../src/utils/format';

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

// --- Helpers ---
const MONTHS = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);
const generateYears = (startYear) => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= startYear; year--) {
    years.push(year);
  }
  return years;
};

// --- Reusable Components ---
const SummaryCard = ({ title, value, valueColor = Colors.textPrimary, subValue, rate, cardStyle }) => (
  <View style={[styles.card, cardStyle]}>
    <Text style={styles.cardTitle}>{title}</Text>
    <View style={styles.cardValueContainer}>
      <Text style={[styles.cardValue, { color: valueColor }]}>{value}</Text>
      {rate !== null && rate !== undefined
        ? (
          <Text style={[styles.cardRate, { color: valueColor }]}>
            ({rate >= 0 ? '+' : ''}{rate.toFixed(1)}%)
          </Text>
        )
        : ( // If rate is null/undefined, treat as 0 for display
          <Text style={[styles.cardRate, { color: Colors.accentRed }]}>
            (+0.0%)
          </Text>
        )
      }
    </View>
    {subValue && <Text style={styles.cardSubValue}>{subValue}</Text>}
  </View>
);

const SettlementStatsScreen = () => {
  const router = useRouter();
  // View State
  const [period, setPeriod] = useState('monthly'); // 'monthly' or 'yearly'
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [isYearMonthDropdownVisible, setYearMonthDropdownVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Data State
  const [summary, setSummary] = useState(null);
  const [simpleLogs, setSimpleLogs] = useState([]);

  
  const isNextDisabled = useMemo(() => {
    const now = new Date();
    if (period === 'monthly') {
      return currentYear === now.getFullYear() && currentMonth === (now.getMonth() + 1);
    }
    return currentYear === now.getFullYear();
  }, [period, currentYear, currentMonth]);

  const handlePrev = () => {
    if (period === 'monthly') {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(prev => prev - 1);
      } else {
        setCurrentMonth(prev => prev - 1);
      }
    } else {
      setCurrentYear(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (isNextDisabled) return;
    if (period === 'monthly') {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(prev => prev + 1);
      } else {
        setCurrentMonth(prev => prev + 1);
      }
    } else {
      setCurrentYear(prev => prev + 1);
    }
  };

  // Fetch data when period/year/month changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setSimpleLogs([]);
      setSummary(null);

      try {
        if (period === 'monthly') {
          const [summaryRes, simpleLogsRes] = await Promise.all([
            tradeApi.getMonthlySummary(currentYear, currentMonth),
            tradeApi.getMonthlySimple(currentYear, currentMonth)
          ]);
          setSummary(summaryRes.data);
          const logs = simpleLogsRes.data;
          setSimpleLogs(logs);

        } else { // yearly
          const strategyResponse = await strategyApi.getYearlyStrategy(currentYear);
          const yearlyData = strategyResponse.data;
          
          let totalRealizedPL = 0;

          if (yearlyData) {
            yearlyData.forEach(item => {
              if (item.realizedPL !== null) {
                totalRealizedPL += item.realizedPL;
              }
            });

            // Update summary state from the new API response
            setSummary({ 
              totalRealizedPL: totalRealizedPL, 
              totalTransactionCost: null, 
              averageRateOfReturn: null, 
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch settlement data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [period, currentYear, currentMonth]);


  const handleFetchDetail = () => {
    router.push({
      pathname: '/detailed-transactions',
      params: { 
        year: currentYear, 
        month: currentMonth, 
        period: period 
      }
    });
  };

  const formattedDate = useMemo(() => {
    if (period === 'monthly') {
      if (currentYear === 2026) {
        return `${currentMonth}월`;
      }
      return `${currentYear}년 ${currentMonth}월`;
    }
    return `${currentYear}년`;
  }, [period, currentYear, currentMonth]);
  
  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color={Colors.accentBlue} style={{ marginTop: 50 }} />;
    }
    
    const realizedPL = summary?.totalRealizedPL ?? summary?.realizedPL ?? null;
    const totalCost = summary?.totalTransactionCost ?? null;
    const totalRate = summary?.averageRateOfReturn ?? null;
    const displayPL = realizedPL ?? 0;

    return (
      <>
        {/* Summary Dashboard */}
        <View style={styles.summaryGrid}>
          <SummaryCard
            title="총 실현손익"
            value={`${displayPL >= 0 ? '+' : ''}${formatDisplay(displayPL, '원')}`}
            valueColor={displayPL >= 0 ? Colors.accentRed : Colors.accentBlue}
            rate={totalRate}
            cardStyle={styles.cardFullWidth}
          />
          <Text style={styles.totalCostText}> 총 비용: {formatDisplay(totalCost, '원')} (수수료+제세금) </Text>
          <Text style={styles.infoText}>* 매도로 기록되지 않은 항목의 손익은 총 실현손익에 포함되지 않습니다.</Text>
        </View>
        
        {/* Transaction List */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity style={styles.sectionHeader} onPress={handleFetchDetail}>
            <Text style={styles.sectionTitle}>{`${formattedDate}의 매매 리스트`}</Text>
            <Text style={styles.seeMoreText}>더보기 ></Text>
          </TouchableOpacity>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderText, { flex: 2, textAlign: 'left' }]}>종목</Text>
              <Text style={[styles.tableHeaderText, { flex: 2, textAlign: 'center' }]}>실현 손익</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>수익률</Text>
            </View>
            {renderSimpleTable()}
          </View>
        </View>
      </>
    );
  };

  const renderSimpleTable = () => (
    <FlatList
      data={simpleLogs}
      keyExtractor={(item, index) => `${item.logId}-${index}`}
      renderItem={({ item: tx }) => (
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.tableCellStock]}>{tx.stockName}</Text>
          <Text style={[styles.tableCell, styles.tableCellProfit, { color: tx.realizedPL === null ? '#999' : (tx.realizedPL > 0 ? '#E53935' : '#1E88E5') }]}>
            {tx.realizedPL !== null ? (tx.realizedPL > 0 ? '+' : '') : ''}{formatDisplay(tx.realizedPL)}
          </Text>
          <Text style={[styles.tableCell, styles.tableCellRate, { color: tx.rateOfReturn === null ? '#999' : (tx.rateOfReturn > 0 ? '#E53935' : '#1E88E5') }]}>
            {formatDisplay(tx.rateOfReturn, '%', 1)}
          </Text>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.noDataText}>거래 기록이 없습니다.</Text>}
    />
  );
  
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/'); // Fallback to home/journal screen
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView style={styles.container}>
        <View style={styles.contentContainer}>
          {/* Top Navigation */}
          <View style={styles.topNavContainer}>
              <View style={styles.topNav}>
                  {/* Left arrow */}
                  <TouchableOpacity onPress={handlePrev} style={styles.arrowButton}>
                    <ChevronLeft size={24} color={Colors.textPrimary} />
                  </TouchableOpacity>

                  {/* Date display based on year */}
                  {currentYear === 2026 ? (
                    <Text style={styles.dateSelectorText}>
                      {currentMonth}월
                    </Text>
                  ) : (
                    <TouchableOpacity onPress={() => setYearMonthDropdownVisible(!isYearMonthDropdownVisible)}>
                      <Text style={styles.dateSelectorText}>
                        {currentYear}년 {currentMonth}월
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Right arrow */}
                  <TouchableOpacity onPress={handleNext} style={styles.arrowButton} disabled={isNextDisabled}>
                    <ChevronRight size={24} color={isNextDisabled ? Colors.textSecondary : Colors.textPrimary} />
                  </TouchableOpacity>
              </View>
              {isYearMonthDropdownVisible && (
                <View style={styles.dropdown}>
                  {/* ... */}
                </View>
              )}
          </View>

          {renderContent()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.surface }, // Changed background
  container: { flex: 1, backgroundColor: Colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary },
  topNavContainer: { position: 'relative', zIndex: 10, },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, },
  tabSwitchContainer: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 8, padding: 4, },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, },
  tabActive: { backgroundColor: Colors.background },
  tabText: { fontSize: 16, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.textPrimary },
  dateSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  arrowButton: { padding: 8, },
  dateSelectorText: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary, marginHorizontal: 16 },
  summaryGrid: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  card: { padding: 0 }, // Remove padding from inner card
  cardFullWidth: { width: '100%' },
  totalCostText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'right', marginTop: 8, },
  infoText: { fontSize: 12, color: Colors.textSecondary, textAlign: 'right', marginTop: 4, },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20, // 0 -> 20으로 복구
    paddingBottom: 100,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 },
  cardValueContainer: { flexDirection: 'row', alignItems: 'baseline' },
  cardValue: { fontSize: 22, fontWeight: 'bold' },
  cardRate: { fontSize: 18, fontWeight: '600', marginLeft: 8 },
  cardSubValue: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  sectionContainer: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.textPrimary },
  seeMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chartStyle: {
    marginTop: 16,
    borderRadius: 16,
  },
  tableContainer: { 
    backgroundColor: Colors.background, // Colors.surface -> Colors.background 로 변경
    borderRadius: 16, 
    padding: 16,
    maxHeight: 220, 
    flex: 1,
  },
  tableHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.border, },
  tableHeaderText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary, },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, },
  tableCell: { fontSize: 16, color: Colors.textPrimary, },
  tableCellStock: { flex: 2, fontWeight: '500', },
  tableCellProfit: { flex: 2, fontWeight: 'bold', textAlign: 'center', },
    tableCellRate: {
      flex: 1,
      textAlign: 'center',
      color: Colors.textSecondary,
      fontSize: 15,
    },
    aiInsightBox: {
      backgroundColor: Colors.surface,
      borderRadius: 16,
      padding: 20,
      marginTop: 8,
      marginBottom: 40,
    },
    aiInsightText: { fontSize: 16, color: Colors.textPrimary, lineHeight: 24 },
    noDataContainer: {
        height: 220,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 16,
        marginTop: 16,
    },
    noDataText: {
        textAlign: 'center',
        paddingVertical: 30,
        color: Colors.textSecondary,
        fontSize: 16,
    }
});

export default SettlementStatsScreen;
