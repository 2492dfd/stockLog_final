import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { ThumbsUp, Info, ChevronLeft, Sparkles } from 'lucide-react-native';
import { tradeApi } from '../src/api';

const TossLightGray = '#F2F4F6';
const TossDarkGray = '#191F28';
const TossBlue = '#3182F6';
const TossOrange = '#FF7D42';
const TossGray700 = '#4E5968';

interface AnalysisReport {
  summary: string;
  goodPoints: string;
  advice: string;
  stockName: string;
  tradeType: string;
}

// Custom animated loading component
const LoadingAnalysis = () => {
    const bounceAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const bounce = Animated.sequence([
            Animated.timing(bounceAnim, { toValue: -10, duration: 400, useNativeDriver: true }),
            Animated.timing(bounceAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]);

        const fade = Animated.sequence([
            Animated.timing(opacityAnim, { toValue: 0.5, duration: 400, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]);
        
        Animated.loop(Animated.parallel([bounce, fade])).start();
    }, [bounceAnim, opacityAnim]);

    return (
        <View style={styles.loadingContainer}>
            <Animated.View style={{ transform: [{ translateY: bounceAnim }], opacity: opacityAnim }}>
                <Sparkles size={40} color={TossBlue} />
            </Animated.View>
            <Text style={styles.loadingTitle}>Gemini AI가 핵심 시그널을 분석 중이에요</Text>
            <Text style={styles.loadingSubtitle}>뉴스 및 거래 데이터 분석 중...</Text>
        </View>
    );
};

const AiAnalysisReportScreen = () => {
  const router = useRouter();
  const { tradeId, stockName, tradeType } = useLocalSearchParams<{ tradeId: string, stockName: string, tradeType: string }>();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!tradeId) {
          setError('분석할 거래 ID가 없습니다.');
          setIsLoading(false);
          return;
      };
      try {
        // Simulate network delay for testing animation
        // await new Promise(resolve => setTimeout(resolve, 2000));

        setIsLoading(true);
        const response = await tradeApi.analyzeLog(tradeId);
        
        let analysisText = '';
        if (typeof response.data === 'string') {
            analysisText = response.data;
        } else if (response.data && typeof response.data === 'object') {
            // Gemini API raw structure handling
            if (response.data.candidates?.[0]?.content?.parts?.[0]?.text) {
                analysisText = response.data.candidates[0].content.parts[0].text;
            } else if (response.data.text) {
                // Simplified structure
                analysisText = response.data.text;
            } else {
                // Fallback
                analysisText = JSON.stringify(response.data);
            }
        } else {
             analysisText = "분석 결과를 인식할 수 없습니다.";
        }
        
        // --- Data Parsing Logic ---
        const summaryMatch = analysisText.match(/\[요약\](.*?)(?=\[잘한점\])/s) || analysisText.match(/요약:(.*?)(?=잘한점:)/s);
        const goodPointsMatch = analysisText.match(/\[잘한점\](.*?)(?=\[개선점\])/s) || analysisText.match(/잘한점:(.*?)(?=개선점:)/s);
        const adviceMatch = analysisText.match(/\[개선점\](.*)/s) || analysisText.match(/개선점:(.*)/s);

        const parsedReport = {
            summary: summaryMatch ? summaryMatch[1].trim() : '분석 요약을 가져올 수 없습니다.',
            goodPoints: goodPointsMatch ? goodPointsMatch[1].trim() : '긍정적인 분석을 가져올 수 없습니다.',
            advice: adviceMatch ? adviceMatch[1].trim() : '개선점 분석을 가져올 수 없습니다.',
            stockName: stockName || '종목명 없음', 
            tradeType: tradeType === 'BUY' ? '매수' : (tradeType === 'SELL' ? '매도' : (tradeType || '거래')),
        };
        setReport(parsedReport);

      } catch (e) {
        console.error(e);
        setError('분석 데이터를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [tradeId]);

  useEffect(() => {
    if (!isLoading && report) {
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading, report, contentOpacity]);

  const renderContent = () => {
    if (isLoading) {
      return <LoadingAnalysis />; 
    }
  
    if (error || !report) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>{error || '분석 보고서를 생성할 수 없습니다.'}</Text>
            </View>
        )
    }

    return (
        <Animated.View style={{ flex: 1, opacity: contentOpacity }}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.mainCard}>
                    <Text style={styles.reportHeader}>{report.stockName} {report.tradeType}</Text>
                    <Text style={styles.reportSummary}>{report.summary}</Text>
                </View>

                <View style={styles.detailCard}>
                    <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                            <ThumbsUp size={20} color={TossBlue} />
                        </View>
                        <View style={styles.detailTextContainer}>
                            <Text style={styles.detailTitle}>잘한 점</Text>
                            <Text style={styles.detailContent}>{report.goodPoints}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.detailCard}>
                    <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                            <Info size={20} color={TossOrange} />
                        </View>
                        <View style={styles.detailTextContainer}>
                            <Text style={styles.detailTitle}>개선할 점</Text>
                            <Text style={styles.detailContent}>{report.advice}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </Animated.View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
        <Stack.Screen options={{
            headerShown: true, // Show header for back button
            headerTransparent: true,
            headerTitle: '',
            headerLeft: () => (
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={28} color={TossDarkGray} />
                </TouchableOpacity>
            ),
            animation: 'fade', // Set transition animation to fade
        }}/>
        
        {renderContent()}
        
        {!isLoading && (
            <Animated.View style={[styles.footer, { opacity: contentOpacity }]}>
                <TouchableOpacity style={styles.confirmButton} onPress={() => router.back()}>
                    <Text style={styles.confirmButtonText}>확인</Text>
                </TouchableOpacity>
            </Animated.View>
        )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TossLightGray,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 100, // Adjust for transparent header
    paddingBottom: 100, // Padding to ensure content isn't hidden by footer
  },
  backButton: {
      marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: TossLightGray,
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: TossDarkGray,
    marginTop: 24,
    textAlign: 'center'
  },
  loadingSubtitle: {
    fontSize: 16,
    color: TossGray700,
    marginTop: 8,
  },
  errorText: {
    fontSize: 18,
    color: '#D91A2A',
    textAlign: 'center',
  },
  mainCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 24,
      marginBottom: 12,
  },
  reportHeader: {
      fontSize: 16,
      color: TossGray700,
      marginBottom: 8,
  },
  reportSummary: {
      fontSize: 22,
      fontWeight: 'bold',
      color: TossDarkGray,
      lineHeight: 32,
  },
  detailCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 24,
      marginBottom: 12,
  },
  detailRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
  },
  detailIconContainer: {
      marginRight: 16,
      marginTop: 2,
  },
  detailTextContainer: {
      flex: 1,
  },
  detailTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: TossDarkGray,
      marginBottom: 8,
  },
  detailContent: {
      fontSize: 16,
      color: TossGray700,
      lineHeight: 24,
  },
  footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 30, // More padding for home bar
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#E5E8EB',
  },
  confirmButton: {
      backgroundColor: TossBlue,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
  },
  confirmButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
  }
});

export default AiAnalysisReportScreen;