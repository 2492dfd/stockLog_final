import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { tradeApi, strategyApi } from '../../src/api';
import { formatDisplay } from '../src/utils/format';

// --- Color Constants ---
const Colors = {
  background: '#FFFFFF',
  surface: '#F2F4F6',
  textPrimary: '#191F28',
  textSecondary: '#6B7684',
  accentRed: '#F04452',
  accentBlue: '#3182F6',
  border: '#E5E8EB',
};

// --- Helpers ---
const MONTHS = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);

const SettlementScreen = () => {
  const router = useRouter();
  // View State
  const [period, setPeriod] = useState('monthly'); // 'monthly' or 'yearly'
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);

  // Data State
  const [chartData, setChartData] = useState(null);
  
  const isNextDisabled = useMemo(() => {
    // Only applies to monthly period now
    if (period !== 'monthly') return true;
    return currentYear === new Date().getFullYear();
  }, [period, currentYear]);

  const handlePrev = () => {
    if (period === 'monthly') {
      setCurrentYear(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (isNextDisabled || period !== 'monthly') return;
    setCurrentYear(prev => prev + 1);
  };

  // Fetch data when period/year/month changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setChartData(null);
      
      try {
        if (period === 'monthly') {
          const strategyResponse = await strategyApi.getYearlyStrategy(currentYear);
          const yearlyData = strategyResponse.data;
          
          const monthlyPL = Array(12).fill(0);
          if (yearlyData) {
            yearlyData.forEach(item => {
              if (item.month && item.realizedPL !== null) {
                const monthIndex = item.month - 1;
                if (monthIndex >= 0 && monthIndex < 12) {
                  monthlyPL[monthIndex] = item.realizedPL;
                }
              }
            });
          }
          setChartData({
            labels: MONTHS,
            datasets: [{ data: monthlyPL }]
          });

        } else { // yearly
          const endYear = new Date().getFullYear();
          const startYear = endYear - 4;
          const years = Array.from({ length: 5 }, (_, i) => startYear + i);
          
          const yearlyDataPromises = years.map(year => strategyApi.getYearlyStrategy(year));
          const yearlyDataResponses = await Promise.all(yearlyDataPromises);
          
          const yearlyPL = yearlyDataResponses.map(response => {
            const yearlyData = response.data;
            let totalRealizedPL = 0;
            if (yearlyData) {
              yearlyData.forEach(item => {
                if (item.realizedPL !== null) {
                  totalRealizedPL += item.realizedPL;
                }
              });
            }
            return totalRealizedPL;
          });

          setChartData({
            labels: years.map(String),
            datasets: [{ data: yearlyPL }]
          });
        }
      } catch (error) {
        console.error("Failed to fetch settlement data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [period, currentYear]);

  const formattedDate = useMemo(() => {
    return `${currentYear}년`;
  }, [currentYear]);
  
  const chartConfig = {
    backgroundColor: Colors.surface,
    backgroundGradientFrom: Colors.background,
    backgroundGradientTo: Colors.background,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(49, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 118, 132, ${opacity})`,
    propsForDots: { r: "0" },
    propsForBackgroundLines: {
        strokeDasharray: '',
        stroke: Colors.border,
    },
    fromZero: true,
    yAxisInterval: 1, // To prevent label artifacts
  };

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color={Colors.accentBlue} style={{ marginTop: 50, flex: 1, justifyContent: 'center' }} />;
    }
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>{period === 'monthly' ? '월별 실현손익' : '연도별 실현손익'}</Text>
        {chartData && chartData.datasets[0].data.some(d => d !== 0) ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ alignItems: 'center' }}
          >
            <BarChart
              data={chartData}
              width={period === 'monthly' ? 720 : 400}
              height={250}
              chartConfig={chartConfig}
              style={[styles.chartStyle, period === 'monthly' && { marginLeft: -50 }]}
              showValuesOnTopOfBars={true}
              withInnerLines={true}
              withHorizontalLabels={false}
              yAxisLabel=""
              yAxisSuffix=""
              formatYLabel={() => ''}
              barRadius={5}
              barPercentage={1}
            />
          </ScrollView>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>차트 데이터가 없습니다.</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>

        <ScrollView style={styles.container}>
            <View style={styles.contentContainer}>
                <Text style={styles.screenTitle}>결산</Text>
                {/* Top Navigation */}
                <View style={styles.topNavContainer}>
                    <View style={styles.topNav}>
                        <View style={styles.tabSwitchContainer}>
                        <TouchableOpacity style={[styles.tab, period === 'monthly' && styles.tabActive]} onPress={() => setPeriod('monthly')}>
                            <Text style={[styles.tabText, period === 'monthly' && styles.tabTextActive]}>월별</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.tab, period === 'yearly' && styles.tabActive]} onPress={() => setPeriod('yearly')}>
                            <Text style={[styles.tabText, period === 'yearly' && styles.tabTextActive]}>연도별</Text>
                        </TouchableOpacity>
                    </View>
                    {period === 'monthly' && (
                      <View style={[styles.dateSelector, {marginLeft: 'auto'}]}>
                          <TouchableOpacity onPress={handlePrev} style={styles.arrowButton}>
                              <ChevronLeft size={22} color={Colors.textPrimary} />
                          </TouchableOpacity>
                          <Text style={styles.dateSelectorText}>{formattedDate}</Text>
                          <TouchableOpacity onPress={handleNext} disabled={isNextDisabled} style={styles.arrowButton}>
                              <ChevronRight size={22} color={isNextDisabled ? Colors.border : Colors.textPrimary} />
                          </TouchableOpacity>
                      </View>
                    )}
                    </View>
                </View>

                {renderContent()}
            </View>
        </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.surface, paddingTop: Platform.OS === 'android' ? 30 : 0,},
  container: { flex: 1, backgroundColor: Colors.surface, paddingBottom: 100 },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 60, // 이 값을 60으로 변경
    paddingBottom: 100,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 20,
    marginTop: 10, // 이 부분을 추가
  },
  topNavContainer: { zIndex: 10, paddingHorizontal: 20, paddingTop: 10, },
  topNav: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingVertical: 16, },
  tabSwitchContainer: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 8, padding: 4, },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, },
  tabActive: { backgroundColor: Colors.background },
  tabText: { fontSize: 16, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.textPrimary },
  dateSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  arrowButton: { padding: 8, },
  dateSelectorText: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary, marginHorizontal: 16 },
  chartContainer: {
    flex: 1,
    marginTop: 40,
    paddingHorizontal: 0,
  },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 16, },
  chartStyle: {
    marginTop: 16,
    borderRadius: 16,
  },
  noDataContainer: {
      height: 250,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.surface,
      borderRadius: 16,
      marginTop: 16,
  },
  noDataText: {
      color: Colors.textSecondary,
      fontSize: 16,
  }
});

export default SettlementScreen;