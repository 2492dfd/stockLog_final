import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { getPortfolioList, getPortfolioSummary, addPortfolioItem } from '../../src/api/index.js';
import AddStockModal from '../../components/AddStockModal';
import { Plus } from 'lucide-react-native';
import { PieChart } from 'react-native-gifted-charts'; // New import for PieChart

const TossLightGray = '#F2F4F6';
const TossDarkGray = '#191F28';
const TossBlue = '#0064FF';
const InputBorderColor = '#D1D6DB'; // 추가

// Helper to generate random colors for the pie chart
const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

// PortfolioSummary Component - Re-integrated here
const PortfolioSummary = ({ summary, pieData }) => {
    if (!summary) return null;

    // 종목이 없을 때 가운데 정렬을 위한 조건부 스타일
    const isEmptyPortfolio = pieData.length === 0;

    return (
        <View style={styles.summaryContainer}>
            {isEmptyPortfolio ? (
                <View style={styles.emptyPortfolioStatsContainer}> {/* 새로운 스타일 적용 */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>총 매수금액</Text>
                            <Text style={styles.statValue}>{(summary.totalCost || 0).toLocaleString()}원</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>총 실현손익</Text>
                            <Text style={[styles.statValue, (summary.totalRealizedPL || 0) >= 0 ? styles.profit : styles.loss]}>
                                {(Math.round(summary.totalRealizedPL || 0)) >= 0 ? '+' : ''}{(Math.round(summary.totalRealizedPL || 0)).toLocaleString()}원
                            </Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>평균 수익률</Text>
                            <Text style={[styles.statValue, (summary.averageRateOfReturn || 0) >= 0 ? styles.profit : styles.loss]}>
                                {(summary.averageRateOfReturn || 0) >= 0 ? '+' : ''}{(summary.averageRateOfReturn || 0).toFixed(2)}%
                            </Text>
                        </View>
                    </View>
                </View>
            ) : (
                <> {/* 종목이 있을 때는 기존대로 렌더링 */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>총 매수금액</Text>
                            <Text style={styles.statValue}>{(summary.totalCost || 0).toLocaleString()}원</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>총 실현손익</Text>
                            <Text style={[styles.statValue, (summary.totalRealizedPL || 0) >= 0 ? styles.profit : styles.loss]}>
                                {(Math.round(summary.totalRealizedPL || 0)) >= 0 ? '+' : ''}{(Math.round(summary.totalRealizedPL || 0)).toLocaleString()}원
                            </Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>평균 수익률</Text>
                            <Text style={[styles.statValue, (summary.averageRateOfReturn || 0) >= 0 ? styles.profit : styles.loss]}>
                                {(summary.averageRateOfReturn || 0) >= 0 ? '+' : ''}{(summary.averageRateOfReturn || 0).toFixed(2)}%
                            </Text>
                        </View>
                    </View>
                    <View style={styles.chartContainer}>
                        {pieData.length > 0 &&
                            <PieChart
                                data={pieData}
                                donut
                                innerRadius={50}
                                radius={100}
                                centerLabelComponent={() => <Text style={styles.chartCenterLabel}>종목별 비율</Text>}
                            />
                        }
                    </View>
                </>
            )}
        </View>
    );
};


const StrategyScreen = () => {
  const [stocks, setStocks] = useState([]); // This now holds individual portfolio items
  const [summaryData, setSummaryData] = useState(null); // State for portfolio summary
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();



  const fetchPortfolioData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Fetch the list first
      const portfolioListResponse = await getPortfolioList();
      setStocks(portfolioListResponse.data || []);
      
      // 2. After a delay, fetch the summary
      setTimeout(async () => {
        try {
          const portfolioSummaryResponse = await getPortfolioSummary();
          setSummaryData(portfolioSummaryResponse.data);
        } catch (e) {
          // Don't set a global error for summary failure, maybe just log it
          // or have a separate state for summary error.
          console.error('Failed to fetch portfolio summary:', e);
        } finally {
          // Set loading to false only after the final call is attempted
          setLoading(false);
        }
      }, 500);

    } catch (e) {
      setError('포트폴리오 데이터를 불러오는데 실패했습니다.');
      console.error("Failed to fetch portfolio data:", e.response ? e.response.data : e.message); // 상세 로그 추가
      setLoading(false); // Ensure loading is false on primary fetch error
    }
  }, []);

  useEffect(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPortfolioData().then(() => setRefreshing(false));
  }, [fetchPortfolioData]);

  const handleAddStock = async (stockData) => {
    setIsSaving(true);
    try {
      // Assuming portfolioApi.addStock maps to the correct backend endpoint
      await addPortfolioItem(stockData);
      setIsModalVisible(false);
      fetchPortfolioData(); // Refresh the list and summary
    } catch (error) {
      console.error('Failed to add stock:', error);
      alert('종목 추가에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeeMore = () => {
    router.push({
      pathname: '/my-stocks',
      params: { stocks: JSON.stringify(stocks) },
    });
  };

  const pieData = useMemo(() => {
    if (!stocks || stocks.length === 0) {
        return [];
    }
    return stocks.map(item => ({
        value: (item.executedQuantity || 0) * (item.currentPrice || 0),
        color: getRandomColor(),
        text: item.stockName,
    }));
  }, [stocks]);

  const renderStockList = () => {
    if (loading && !refreshing) {
      return <ActivityIndicator size="large" color={TossBlue} style={{ marginTop: 20 }} />;
    }

    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }

    if (stocks.length === 0) {
      return <Text style={styles.emptyText}>보유한 종목이 없습니다. 우측 상단 '+' 버튼으로 추가해보세요.</Text>;
    }

    return (
      <View style={styles.table}>
        <View style={styles.tableHeader}> {/* styles.tableHeader는 이제 styles.row 역할 */}
          <View style={styles.column}><Text style={[styles.headerText, styles.textLeft]}>종목명</Text></View>
          <View style={styles.column}><Text style={[styles.headerText, styles.textRight]}>평단가</Text></View>
          <View style={styles.column}><Text style={[styles.headerText, styles.textRight]}>체결 수량</Text></View>
          <View style={styles.column}><Text style={[styles.headerText, styles.textRight]}>실현손익</Text></View>
          <View style={styles.column}><Text style={[styles.headerText, styles.textRight]}>수익률</Text></View>
        </View>
        <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled={true}>
          {stocks.map((stock, index) => (
            <View key={stock.portfolioId ?? index} style={styles.tableRow}> {/* styles.tableRow는 이제 styles.row 역할 */}
              <View style={styles.column}><Text style={[styles.rowText, styles.textLeft]}>{stock.stockName}</Text></View>
              <View style={styles.column}><Text style={[styles.rowText, styles.textRight, styles.tabularNums]}>{(stock.executionPrice || 0).toLocaleString()}</Text></View>
              <View style={styles.column}><Text style={[styles.rowText, styles.textRight, styles.tabularNums]}>{(stock.executedQuantity || 0).toLocaleString()}</Text></View>
              <View style={styles.column}><Text style={[styles.rowText, styles.textRight, styles.tabularNums, (stock.realizedPL || 0) >= 0 ? styles.profit : styles.loss]}>
                {(Math.round(stock.realizedPL || 0)) >= 0 ? '+' : ''}{(Math.round(stock.realizedPL || 0)).toLocaleString()}
              </Text></View>
              <View style={styles.column}><Text style={[styles.rowText, styles.textRight, styles.tabularNums, (stock.rateOfReturn || 0) >= 0 ? styles.profit : styles.loss]}>
                {(stock.rateOfReturn || 0).toFixed(2)}%
              </Text></View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.screenTitle}>전략</Text>
          <View style={styles.cardBox}>
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeader}>나의 종목</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {stocks.length > 0 && (
                  <TouchableOpacity onPress={handleSeeMore} style={{ marginRight: 16 }}>
                    <Text style={styles.seeMoreText}>더보기</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                  <Plus size={24} color={TossBlue} />
                </TouchableOpacity>
              </View>
            </View>
            {renderStockList()}
          </View>

          {/* New Card for Portfolio Summary */}
          <View style={styles.cardBox}>
            <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionHeader}>포트폴리오 현황</Text>
            </View>
            <PortfolioSummary summary={summaryData} pieData={pieData} />
          </View>

          {/* AI 분석 버튼 */}
          <TouchableOpacity style={styles.aiAnalysisButton} onPress={() => router.push('/ai-analysis')}>
            <Text style={styles.aiAnalysisButtonText}>AI 분석</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
      <AddStockModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleAddStock}
        isLoading={isSaving}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TossLightGray,
    paddingBottom: 100, // Keep paddingBottom here, or move to contentContainer for consistency
    // paddingTop: 60, // Removed from here
  },
  contentContainer: { // Correctly uses paddingHorizontal
    paddingHorizontal: 20,
    paddingTop: 60, // Moved here from container
    paddingBottom: 100, // Added for consistency with JournalScreen
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: TossDarkGray,
    marginBottom: 20,
    marginTop: 10, // 이 부분을 추가
  },
  cardBox: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E8EB',
    padding: 20,
    marginBottom: 16,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: TossDarkGray,
  },
  seeMoreText: {
    fontSize: 16,
    color: TossBlue,
    fontWeight: '600',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: { // row 역할
    flexDirection: 'row',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E8EB',
    paddingBottom: 10,
    marginBottom: 10,
    paddingHorizontal: 15, // 가이드라인에 따라 15로 변경
  },
  headerText: {
    fontSize: 12,
    color: '#8491A0',
    fontWeight: '600',
    // textAlign: 'left' 또는 'right'는 개별 Text 컴포넌트에서 적용
  },
  tableRow: { // row 역할
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E8EB',
    paddingHorizontal: 15, // 가이드라인에 따라 15로 변경
  },
  rowText: {
    fontSize: 14,
    color: TossDarkGray,
    // textAlign: 'left' 또는 'right'는 개별 Text 컴포넌트에서 적용
  },
  column: {
    flex: 1, // 5등분
    justifyContent: 'center', // 텍스트를 수직 중앙 정렬 (필요시)
    // alignItems: 'flex-start' 또는 'flex-end'는 Text의 textAlign으로 대체
  },
  textLeft: {
    textAlign: 'left',
  },
  textRight: {
    textAlign: 'right',
  },
  tabularNums: {
    fontVariant: ['tabular-nums'],
  },
  errorText: {
    marginTop: 20,
    textAlign: 'center',
    color: 'red',
  },
  emptyText: {
    marginTop: 20,
    textAlign: 'center',
    color: TossDarkGray,
    lineHeight: 24,
  },
  // New styles for Portfolio Summary
  summaryContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12, // Slightly smaller radius for nested component
    padding: 15,
    marginBottom: 15, // Reduced margin for spacing
    borderWidth: 1,
    borderColor: '#E5E8EB',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statBox: {
    alignItems: 'center',
    marginHorizontal: 25, // 좌우 마진 추가 (20 -> 25)
  },
  statLabel: {
    fontSize: 13, // Slightly smaller font
    color: '#6B7684',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16, // Slightly smaller font
    fontWeight: 'bold',
    color: '#191F28',
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  chartCenterLabel: {
    fontSize: 15, // Slightly smaller font
    fontWeight: 'bold',
    color: '#191F28',
  },
  profit: {
    color: '#F04452', // Red
  },
  loss: {
    color: '#3182F6', // Blue
  },
  emptyPortfolioStatsContainer: {
    flex: 1,
    justifyContent: 'center', // 수직 중앙 정렬
    alignItems: 'center',    // 수평 중앙 정렬 (내부 statsContainer가 flex-direction: row 이므로)
    minHeight: 180, // minHeight를 120 -> 180 으로 늘림
  },
  aiAnalysisButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: InputBorderColor,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    paddingHorizontal: 20,
  },
  aiAnalysisButtonText: {
    color: TossDarkGray,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default StrategyScreen;
