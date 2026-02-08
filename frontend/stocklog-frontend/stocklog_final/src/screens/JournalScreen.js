import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router'; // Add useLocalSearchParams
import { View, Text, StyleSheet, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Pressable, Modal, TextInput, Alert, Image as RNImage } from 'react-native';
import { Plus, X, Image } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import CalendarView from '../components/CalendarView';
import LogCard from '../components/LogCard';
import { Colors } from '../../constants/theme';
import { tradeApi, stockApi } from '../api';
import { formatDisplay } from '../utils/format';
import * as ImagePicker from 'expo-image-picker';

const TossLightGray = '#F2F4F6';
const TossDarkGray = '#191F28';
const TossBlue = '#3182F6';
const TossGray700 = '#4E5968';
const BuyColor = '#EF4444';
const SellColor = '#3182F6';
const ModalBackgroundColor = 'rgba(0,0,0,0.5)';
const InputBorderColor = '#D1D6DB';

const DEFAULT_TAGS = ['뇌동매매', '손절 미준수', '추격 매수', '공포매도', '비중 조절 실패'];

const TAG_COLORS = {
    '뇌동매매': { bg: '#FFEBEE', border: '#FFCDD2' }, // 연한 빨강
    '손절 미준수': { bg: '#FFFDE7', border: '#FFF9C4' }, // 연한 노랑
    '추격 매수': { bg: '#E8F5E9', border: '#C8E6C9' }, // 연한 초록
    '공포매도': { bg: '#E3F2FD', border: '#BBDEFB' }, // 연한 파랑
    '비중 조절 실패': { bg: '#F3E5F5', border: '#E1BEE7' }, // 연한 보라
};

const generateMarkedDates = (monthlyTradeDaysData, selectedDay) => {
    const markedDates = {};

    Object.entries(monthlyTradeDaysData).forEach(([date, tradeTypes]) => {
        const dots = [];
        if (tradeTypes.includes('BUY')) {
            dots.push({ color: BuyColor, selectedDotColor: BuyColor }); // Red for Buy
        }
        if (tradeTypes.includes('SELL')) {
            dots.push({ color: SellColor, selectedDotColor: SellColor }); // Blue for Sell
        }
        if (dots.length > 0) {
            markedDates[date] = { dots };
        }
    });

    if (selectedDay) {
        markedDates[selectedDay] = {
            ...(markedDates[selectedDay] || { dots: [] }),
            selected: true,
            customStyles: {
                container: { backgroundColor: '#FFFDE7', borderRadius: 15 }, // Pastel yellow for selected day
                text: { color: TossBlue, fontWeight: 'bold' }, // Reverted to TossBlue as requested
            },
        };
    }
    return markedDates;
};

// Helper Function for currency formatting
const formatCurrency = (value) => {
    if (value === null || value === undefined) return '0';
    const stringValue = String(value);
    // Remove leading zeros and convert to number
    const numberValue = parseInt(stringValue.replace(/^0+/, ''), 10);
    // Format with commas
    return numberValue.toLocaleString();
};

const TradeDetailModal = ({ visible, onClose, log, onEdit, onDelete, onAnalyze }) => {
    const [detailedLog, setDetailedLog] = useState(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(true);

    useEffect(() => {
        if (visible && log && log.logId) {
            setDetailedLog(log); // Set initial data from the list to prevent flicker and show something on load
            const fetchDetailedLog = async () => {
                setIsLoadingDetail(true);
                try {
                    const response = await tradeApi.getLog(log.logId);
                    console.log('Fetched detailed log:', response.data); // Debug log
                    // Merge the detailed response, giving priority to the new data from the API
                    setDetailedLog(prevLog => ({ ...prevLog, ...response.data }));
                } catch (error) {
                    console.error('Failed to fetch detailed trade log:', error.response?.data || error.message);
                    // On error, we can choose to stick with the summary data from the log prop
                    setDetailedLog(log); 
                } finally {
                    setIsLoadingDetail(false);
                }
            };
            fetchDetailedLog();
        } else {
            setDetailedLog(null);
        }
    }, [visible, log]);

    if (!visible || !log) return null;

    const renderLoading = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <View style={[styles.modalContent, {paddingBottom: 40, justifyContent: 'center', alignItems: 'center'}]}>
                    <Text style={styles.detailModalTitle}>상세 정보 로딩 중...</Text>
                </View>
            </Pressable>
        </Modal>
    );

    const renderError = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <View style={[styles.modalContent, {paddingBottom: 40, justifyContent: 'center', alignItems: 'center'}]}>
                    <Text style={styles.detailModalTitle}>상세 정보를 불러오지 못했습니다.</Text>
                    <Pressable onPress={onClose} style={{marginTop: 20, padding: 10, backgroundColor: TossBlue, borderRadius: 8}}>
                        <Text style={{color: '#FFFFFF', fontWeight: 'bold'}}>닫기</Text>
                    </Pressable>
                </View>
            </Pressable>
        </Modal>
    );

    if (isLoadingDetail) return renderLoading();
    if (!detailedLog) return renderError();
    
    const isBuy = detailedLog.tradeType === 'BUY';
    const tradeColor = isBuy ? BuyColor : SellColor;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <Pressable style={[styles.modalContent, {paddingBottom: 40}]} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.detailModalTitle}>매매 상세 기록</Text>
                        <Pressable onPress={onClose}>
                            <X size={24} color={TossDarkGray} />
                        </Pressable>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false} style={{ flexShrink: 1 }}>
                        <View style={[styles.detailHeader, { borderLeftColor: tradeColor }]}>
                            <Text style={styles.detailStockName}>{detailedLog.stockName}</Text>
                            <Text style={[styles.detailTradeType, { color: tradeColor }]}>{isBuy ? '매수' : '매도'}</Text>
                        </View>
                        <View style={styles.detailSection}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>시장 종류</Text>
                                <Text style={styles.detailValue}>{detailedLog.marketType}</Text>
                            </View>
                            {/* 티커 제거 요청 */}
                            {/*
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>티커</Text>
                                <Text style={styles.detailValue}>{detailedLog.ticker}</Text>
                            </View>
                            */}
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>증권사</Text>
                                <Text style={styles.detailValue}>{detailedLog.broker}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{isBuy ? '매수일' : '거래일'}</Text>
                                <Text style={styles.detailValue}>{detailedLog.tradeDate ? detailedLog.tradeDate.split('T')[0] : 'N/A'}</Text>
                            </View>
                            {!isBuy && (
                                <>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>보유 기간</Text>
                                        <Text style={styles.detailValue}>{formatDisplay(detailedLog.holdingPeriod, "일")}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>실현 손익</Text>
                                        <Text style={styles.detailValue}>{formatDisplay(detailedLog.realizedPL, "원")}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>수익률</Text>
                                        <Text style={styles.detailValue}>{formatDisplay(detailedLog.rateOfReturn, "%", 2)}</Text>
                                    </View>
                                </>
                            )}
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>체결 단가</Text>
                                <Text style={styles.detailValue}>{formatDisplay(detailedLog.executionPrice, "원")}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>체결 수량</Text>
                                <Text style={styles.detailValue}>{formatDisplay(detailedLog.executedQuantity, "주")}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>거래 비용</Text>
                                <Text style={styles.detailValue}>{formatDisplay(detailedLog.tradingCost, "원")}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>총 비용</Text>
                                <Text style={styles.detailValue}>{formatDisplay(detailedLog.totalCost, "원")}</Text>
                            </View>
                        </View>
                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>{isBuy ? '매수 사유' : '매도 사유'}</Text>
                            <Text style={styles.memoText}>
                                {isBuy 
                                    ? (detailedLog.reasonForBuy || detailedLog.reason || '-') 
                                    : (detailedLog.reasonForSale || detailedLog.reason || '-')}
                            </Text>
                        </View>
                        {detailedLog.chartImageUrl && (
                            <View style={styles.detailSection}>
                                <Text style={styles.detailLabel}>첨부된 차트</Text>
                                <RNImage source={{ uri: detailedLog.chartImageUrl }} style={styles.detailedChartImage} />
                            </View>
                        )}
                        {(detailedLog.tags || detailedLog.tag) && (detailedLog.tags || detailedLog.tag).length > 0 && (
                            <View style={styles.detailSection}>
                                <Text style={styles.detailLabel}>태그</Text>
                                <View style={[styles.tagsContainer, { flexWrap: 'wrap', marginTop: 10 }]}>
                                    {(detailedLog.tags || detailedLog.tag).map((tag, index) => {
                                        const colorInfo = TAG_COLORS[tag];
                                        const tagStyle = colorInfo 
                                            ? { backgroundColor: colorInfo.bg, borderColor: colorInfo.border, borderWidth: 1 } 
                                            : {};

                                        return (
                                            <View key={index} style={[styles.tagButton, tagStyle, { marginBottom: 8 }]}>
                                                <Text style={[styles.tagButtonText, { color: '#000000', fontWeight: 'bold' }]}>{tag}</Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        )}
                        {detailedLog.dividendStockName && (
                            <View style={styles.detailSection}>
                                <Text style={styles.detailLabel}>배당주 정보</Text>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>배당주 이름</Text>
                                    <Text style={styles.detailValue}>{detailedLog.dividendStockName}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>월별 배당금</Text>
                                    <Text style={styles.detailValue}>{formatDisplay(detailedLog.dividendPerMonth, "원")}</Text>
                                </View>
                            </View>
                        )}
                    </ScrollView>
                    <View style={styles.modalActionButtons}>
                        <TouchableOpacity style={[styles.modalActionButtonBase, styles.editButton]} onPress={(e) => {
                            if (e && e.stopPropagation) e.stopPropagation();
                            onEdit(detailedLog);
                        }}>
                            <Text style={styles.modalActionButtonText}>수정하기</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalActionButtonBase, styles.analyzeButton]} onPress={(e) => {
                            if (e && e.stopPropagation) e.stopPropagation();
                            onAnalyze(detailedLog);
                        }}>
                            <Text style={styles.modalActionButtonText}>AI 분석</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalActionButtonBase, styles.deleteButton]} onPress={(e) => {
                            if (e && e.stopPropagation) e.stopPropagation();
                            console.log('Delete button pressed for log:', detailedLog);
                            onDelete(detailedLog);
                        }}>
                            <Text style={[styles.modalActionButtonText, { color: '#D91D29' }]}>삭제하기</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const JournalScreen = () => {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [markedDates, setMarkedDates] = useState({});
    const [monthlyTradeDays, setMonthlyTradeDays] = useState({});
    const [dailyLogs, setDailyLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setModalVisible] = useState(false);
    const [isDetailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [stockName, setStockName] = useState('');
    const [tradeType, setTradeType] = useState('buy');
    const [marketType, setMarketType] = useState('domestic');
    const [pricePerShare, setPricePerShare] = useState('');
    const [quantity, setQuantity] = useState('');
    const [tradeReason, setTradeReason] = useState('');
    const [brokerage, setBrokerage] = useState('');
    const [tradeDate, setTradeDate] = useState(selectedDate);
    const [commissionTax, setCommissionTax] = useState('');
    const [averagePurchasePrice, setAveragePurchasePrice] = useState('');
    const [holdingPeriod, setHoldingPeriod] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingLogId, setEditingLogId] = useState(null);
    const [editingLog, setEditingLog] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isBrokerModalVisible, setIsBrokerModalVisible] = useState(false);
    const [stockSearchKeyword, setStockSearchKeyword] = useState('');
    const [stockSuggestions, setStockSuggestions] = useState([]);
    const [stockTicker, setStockTicker] = useState('');
    const [brokers, setBrokers] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [attachedImage, setAttachedImage] = useState(null);

    // Kiwoom Asset Data State
    const { isLinked, assetData: assetDataParam } = useLocalSearchParams();
    const [isKiwoomLinked, setIsKiwoomLinked] = useState(false);
    const [kiwoomAssetData, setKiwoomAssetData] = useState(null);

    useEffect(() => {
        if (isLinked === 'true' && assetDataParam) {
            try {
                const parsedAssetData = JSON.parse(assetDataParam);
                setIsKiwoomLinked(true);
                setKiwoomAssetData(parsedAssetData);
                // Optionally, clear the params from the URL if they are not meant to persist
                // router.setParams({ isLinked: undefined, assetData: undefined });
            } catch (e) {
                console.error("Failed to parse assetData JSON:", e);
                setIsKiwoomLinked(false);
                setKiwoomAssetData(null);
            }
        } else {
            setIsKiwoomLinked(false);
            setKiwoomAssetData(null);
        }
    }, [isLinked, assetDataParam]);

    const fetchBrokers = async () => {
        try {
            const response = await tradeApi.getBrokers();
            setBrokers(response.data);
        } catch (error) {
            console.error('Failed to fetch brokers:', error);
        }
    };

    const fetchMonthlyTradeDays = async (year, month) => {
        setIsLoading(true);
        try {
            const response = await tradeApi.getMonthlyTradeDays(year, month);
            setMonthlyTradeDays(response.data);
        } catch (error) {
            console.error('Failed to fetch monthly trade days:', error);
            setMonthlyTradeDays({}); // Clear data on error
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDailyTradeLogs = async (date) => {
        setIsLoading(true);
        try {
            const response = await tradeApi.getDailyTradeLogs(date);
            console.log('--- JournalScreen --- Fetched dailyLogs:', response.data);
            setDailyLogs(response.data);
        } catch (error) {
            console.error('Failed to fetch daily trade logs:', error);
            setDailyLogs([]); // Clear data on error
        } finally {
            setIsLoading(false);
        }
    };

    // Initial load effect
    useEffect(() => {
        fetchBrokers();
    }, []);

    // Effect for fetching monthly trade days when month/year of selectedDate changes
    useEffect(() => {
        const [year, month] = selectedDate.split('-').map(Number);
        fetchMonthlyTradeDays(year, month);
    }, [selectedDate]); 

    // Effect for fetching daily trade logs when selectedDate changes
    useEffect(() => {
        fetchDailyTradeLogs(selectedDate);
    }, [selectedDate]);

    // Effect for generating marked dates from monthlyTradeDays
    useEffect(() => {
        const generatedMarks = generateMarkedDates(monthlyTradeDays, selectedDate);
        setMarkedDates(generatedMarks);
    }, [monthlyTradeDays, selectedDate]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (stockSearchKeyword.length > 0) {
                const searchStocks = async () => {
                    try {
                        const response = await stockApi.searchStocks(stockSearchKeyword);
                        console.log('Stock search response for keyword:', stockSearchKeyword, response.data);
                        setStockSuggestions(response.data);
                    } catch (error) {
                        console.error('Failed to search stocks:', error);
                        setStockSuggestions([]);
                    }
                };
                searchStocks();
            } else {
                setStockSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(handler);
    }, [stockSearchKeyword]);

    const onDayPress = (day) => setSelectedDate(day.dateString);
    
    const handleFabPress = () => {
        clearForm();
        setModalVisible(true);
    };

    const handleCloseCreateModal = () => {
        setModalVisible(false);
        clearForm();
    };
    
    const handleLogPress = (log) => {
        // 현재 삭제 프로세스 중이면 실행 안 함
        if (isDeleting) return;

        if (!log || !log.logId) {
            console.error("handleLogPress failed: The selected log is invalid or missing an ID.", log);
            return; // Don't open the modal if the log is invalid
        }
        setSelectedLog(log);
        setDetailModalVisible(true);
    };

    const handleEditLog = (logToEdit) => {
        setEditingLog(logToEdit); // Store the whole log object
        setDetailModalVisible(false);
        setIsEditMode(true);
        setEditingLogId(logToEdit.logId);
        setStockName(logToEdit.stockName);
        
        const tradeTypeLower = logToEdit.tradeType ? logToEdit.tradeType.toLowerCase() : 'buy';
        setTradeType(tradeTypeLower);
        
        // Correctly identify market type including 'KOR'
        const isDomestic = ['KOSPI', 'KOSDAQ', 'KOR', 'DOMESTIC'].includes(logToEdit.marketType);
        const market = isDomestic ? 'domestic' : 'overseas';
        setMarketType(market);

        // Helper for formatting with commas
        const formatNum = (num) => {
            if (num === null || num === undefined) return '';
            const str = num.toString();
            if (market === 'domestic') {
                return str.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
            return str;
        };

        setPricePerShare(formatNum(logToEdit.executionPrice));
        setQuantity(logToEdit.executedQuantity ? logToEdit.executedQuantity.toString() : '');
        setTradeReason(logToEdit.reasonForSale || logToEdit.reason || '');
        
        // Find broker code by name or code
        const foundBroker = brokers.find(b => b.name === logToEdit.broker || b.code === logToEdit.broker);
        setBrokerage(foundBroker ? foundBroker.code : (logToEdit.broker || ''));

        // Handle date format safely
        let dateStr = new Date().toISOString().split('T')[0];
        if (logToEdit.tradeDate) {
             dateStr = logToEdit.tradeDate.includes('T') ? logToEdit.tradeDate.split('T')[0] : logToEdit.tradeDate;
        }
        setTradeDate(dateStr);
        
        setCommissionTax(formatNum(logToEdit.tradingCost));
        setAveragePurchasePrice(formatNum(logToEdit.averagePurchasePrice));
        setHoldingPeriod(logToEdit.holdingPeriod ? logToEdit.holdingPeriod.toString() : '');
        setStockTicker(logToEdit.ticker || '');
        setSelectedTags(logToEdit.tags || logToEdit.tag || []);
        setModalVisible(true);
    };

    const handleDeleteLog = async (logToDelete) => {
    const idToDelete = logToDelete.logId || logToDelete.id;
    console.log("📡 [1단계] 함수 진입 성공! ID:", idToDelete);

    if (!idToDelete) {
        alert("ID를 찾을 수 없습니다.");
        return;
    }

    // 웹과 앱 모두에서 작동하도록 보장하는 로직
    const performDelete = async () => {
        try {
            setIsDeleting(true);
            console.log("🚀 [2단계] 서버로 API 요청을 진짜 보냅니다!");
            
            // 여기서 api.js를 호출
            await tradeApi.deleteLog(idToDelete);
            
            console.log("✅ [3단계] 서버 응답 성공!");
            setDetailModalVisible(false);
            setSelectedLog(null);
            setDailyLogs(prev => prev.filter(log => (log.logId || log.id) !== idToDelete));
            alert("삭제되었습니다.");
        } catch (error) {
            console.error("❌ [에러] 서버 전송 실패:", error);
            alert("삭제 중 오류가 발생했습니다.");
        } finally {
            setIsDeleting(false);
        }
    };

    // 환경에 따른 확인창 호출
    if (Platform.OS === 'web') {
        if (window.confirm("정말로 삭제하시겠습니까?")) {
            await performDelete();
        }
    } else {
        Alert.alert("삭제 확인", "정말로 삭제하시겠습니까?", [
            { text: "취소", style: "cancel" },
            { text: "삭제", style: "destructive", onPress: performDelete }
        ]);
    }
};

    const handleAnalyzeLog = (log) => {
        setDetailModalVisible(false);
        router.push({
            pathname: '/ai-analysis',
            params: { 
                tradeId: log.logId,
                stockName: log.stockName,
                tradeType: log.tradeType
            }
        });
    };

    const handleTagPress = (tag) => {
        setSelectedTags((prevTags) => {
            if (prevTags.includes(tag)) {
                return prevTags.filter((t) => t !== tag);
            } else {
                return [...prevTags, tag];
            }
        });
    };

    const handleImagePick = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('죄송합니다. 사진을 첨부하려면 카메라 롤 권한이 필요합니다.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setAttachedImage(result.assets[0].uri);
        }
    };

    const handleSaveLog = async () => {
        if (!stockName) {
            Alert.alert('알림', '종목명을 입력해주세요.');
            return;
        }
        if (!brokerage) {
            Alert.alert('알림', '증권사를 선택해주세요.');
            return;
        }

        try {
            // Use the existing image URL from the log being edited, or null if creating a new one.
            let finalChartImageUrl = isEditMode && editingLog ? editingLog.chartImageUrl : null;

            // Step 1: If a new image has been selected, upload it first.
            if (attachedImage) {
                const formData = new FormData();
                
                if (Platform.OS === 'web') {
                    const response = await fetch(attachedImage);
                    const blob = await response.blob();
                    formData.append('file', blob, `chart_${Date.now()}.jpg`);
                } else {
                    const uriParts = attachedImage.split('.');
                    const fileType = uriParts[uriParts.length - 1];
                    formData.append('file', {
                        uri: attachedImage,
                        name: `chart_${Date.now()}.${fileType}`,
                        type: `image/${fileType}`,
                    });
                }
                
                console.log('Uploading image...');
                const uploadRes = await tradeApi.uploadImage(formData);
                finalChartImageUrl = uploadRes.data; // The server returns the URL of the uploaded image.
                console.log('Image upload successful, URL:', finalChartImageUrl);
            }

            // Step 2: Prepare the final trade log data, including the image URL.
            const safeParseFloat = (str) => {
                if (typeof str !== 'string') str = String(str || '');
                const num = parseFloat(str.replace(/,/g, ''));
                return isNaN(num) ? null : num;
            };
            const safeParseInt = (str) => {
                if (typeof str !== 'string') str = String(str || '');
                const num = parseInt(str.replace(/,/g, ''), 10);
                return isNaN(num) ? null : num;
            };

            const parsedPricePerShare = safeParseFloat(pricePerShare);
            const parsedQuantity = safeParseInt(quantity);

            if (!parsedPricePerShare || parsedPricePerShare <= 0) {
                Alert.alert('알림', '유효한 체결 단가를 입력해주세요.');
                return;
            }
            if (!parsedQuantity || parsedQuantity <= 0) {
                Alert.alert('알림', '유효한 체결 수량을 입력해주세요.');
                return;
            }

            const parsedCommissionTax = safeParseFloat(commissionTax);
            const parsedAveragePurchasePrice = safeParseFloat(averagePurchasePrice);
            const parsedHoldingPeriod = safeParseInt(holdingPeriod);
            const apiMarketType = marketType === 'domestic' ? 'KOR' : 'USA';
            
            const { estimatedTotalAmount, referenceCalculatedPl } = calculatePL(pricePerShare, quantity, commissionTax, averagePurchasePrice, tradeType);

            let finalRealizedPL = null;
            let finalRateOfReturn = null;
            if (tradeType === 'sell') {
                finalRealizedPL = referenceCalculatedPl;
                if (parsedAveragePurchasePrice && parsedQuantity && finalRealizedPL !== null) {
                    const totalPurchaseAmount = parsedAveragePurchasePrice * parsedQuantity;
                    if (totalPurchaseAmount !== 0) {
                        finalRateOfReturn = (finalRealizedPL / totalPurchaseAmount) * 100;
                    }
                }
            }
            
            const tradeLogData = {
                tradeDate: `${tradeDate}T00:00:00.000Z`,
                marketType: apiMarketType,
                stockName: stockName,
                ticker: stockTicker,
                broker: brokerage,
                tradeType: tradeType.toUpperCase(),
                buyDate: tradeType === 'buy' ? `${tradeDate}T00:00:00.000Z` : null,
                sellDate: tradeType === 'sell' ? `${tradeDate}T00:00:00.000Z` : null,
                holdingPeriod: parsedHoldingPeriod,
                realizedPL: finalRealizedPL,
                rateOfReturn: finalRateOfReturn,
                averagePurchasePrice: parsedAveragePurchasePrice,
                purchasePrice: parsedAveragePurchasePrice,
                executionPrice: parsedPricePerShare,
                executedQuantity: parsedQuantity,
                tradingCost: parsedCommissionTax,
                totalCost: estimatedTotalAmount,
                reasonForBuy: tradeType === 'buy' ? tradeReason : null,
                reasonForSale: tradeType === 'sell' ? tradeReason : null,
                reason: tradeReason || null,
                dividendStockName: null,
                dividendPerMonth: null,
                chartImageUrl: finalChartImageUrl, // Include the final image URL
                tags: selectedTags,
            };

            // Step 3: Save the complete trade log data.
            if (isEditMode && editingLogId) {
                await tradeApi.updateLog(editingLogId, tradeLogData);
            } else {
                await tradeApi.createLog(tradeLogData);
            }
            
            handleCloseCreateModal();
            
            // Refresh data to show the new/updated log
            const [year, month] = tradeDate.split('-').map(Number);
            fetchMonthlyTradeDays(year, month); 
            
            if (selectedDate === tradeDate) {
                fetchDailyTradeLogs(tradeDate);
            } else {
                setSelectedDate(tradeDate);
            }

        } catch (error) {
            console.error('Failed to save trade log:', error);
            let errorMessage = '매매일지를 저장하는 중 문제가 발생했습니다.';
            if (error.response) {
                console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
                if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            }
            Alert.alert('오류', errorMessage);
        }
    };

    const clearForm = () => {
        setStockName('');
        setTradeType('buy');
        setMarketType('domestic');
        setPricePerShare('');
        setQuantity('');
        setTradeReason('');
        setBrokerage('');
        setTradeDate(selectedDate);
        setCommissionTax('');
        setAveragePurchasePrice('');
        setHoldingPeriod('');
        setIsEditMode(false);
        setEditingLogId(null);
        setEditingLog(null);
        setStockSearchKeyword('');
        setStockSuggestions([]);
        setStockTicker('');
        setSelectedTags([]);
        setAttachedImage(null);
    };

    const formatCurrencyInput = (text, market) => {
      const cleanedText = text.replace(/[^0-9.]/g, '');
      // Always format as domestic (comma separated) even for overseas
      return cleanedText.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const handlePricePerShareChange = (text) => setPricePerShare(formatCurrencyInput(text, marketType));
    const handleQuantityChange = (text) => setQuantity(text.replace(/[^0-9]/g, ''));
    const handleCommissionTaxChange = (text) => setCommissionTax(formatCurrencyInput(text, marketType));
    const handleAveragePurchasePriceChange = (text) => setAveragePurchasePrice(formatCurrencyInput(text, marketType));
    const handleHoldingPeriodChange = (text) => setHoldingPeriod(text.replace(/[^0-9]/g, ''));
  
    // Always return '원' regardless of market type
    const getCurrencySymbol = (market) => '원';
    const getQuantityUnit = () => '주';
    const getTradeReasonPlaceholder = () => tradeType === 'buy' ? '왜 이 종목을 선택했나요?' : '판매하게 된 결정적 이유는 무엇인가요?';
    
    const calculatePL = (pricePerShare, quantity, commissionTax, averagePurchasePrice, tradeType) => {
        const execPrice = parseFloat(pricePerShare.replace(/,/g, '')) || 0;
        const qty = parseFloat(quantity.replace(/,/g, '')) || 0;
        const commTax = parseFloat(commissionTax.replace(/,/g, '')) || 0;
        const avgPurchPrice = parseFloat(averagePurchasePrice.replace(/,/g, '')) || 0;
        let estimatedTotalAmount = 0;
        let referenceCalculatedPl = 0;
        if (tradeType === 'buy') {
            estimatedTotalAmount = (execPrice * qty) + commTax;
        } else { // sell
            estimatedTotalAmount = (execPrice * qty) - commTax;
            if (avgPurchPrice > 0) {
                referenceCalculatedPl = (execPrice - avgPurchPrice) * qty - commTax;
            }
        }
        return { estimatedTotalAmount, referenceCalculatedPl };
    };

    const { estimatedTotalAmount, referenceCalculatedPl } = useMemo(() => calculatePL(pricePerShare, quantity, commissionTax, averagePurchasePrice, tradeType), [pricePerShare, quantity, commissionTax, averagePurchasePrice, tradeType]);

    return (
        <View style={{ flex: 1, backgroundColor: TossLightGray }}>
            <FlatList
                ListHeaderComponent={
                    <>
                        {/* Kiwoom Asset Summary Card */}
                        <Text style={styles.screenTitle}>매매일지</Text>
                        <CalendarView
                            onDayPress={onDayPress}
                            markedDates={markedDates}
                            monthFormat={'yyyy년 MM월'}
                        />
                        <TouchableOpacity style={styles.addTradeButton} onPress={() => router.push('/settlement-stats')}>
                            <Plus size={20} color={TossDarkGray} style={{ marginRight: 8 }} />
                            <Text style={styles.addTradeButtonText}>결산 및 통계 보기</Text>
                        </TouchableOpacity>
                    </>
                }
                data={dailyLogs}
                keyExtractor={(item, index) => String(item.logId ?? index)}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleLogPress(item)}>
                        <LogCard
                            id={item.logId}
                            stockName={item.stockName}
                            tradeType={item.tradeType}
                            executionPrice={item.executionPrice}
                            executedQuantity={item.executedQuantity}
                            realizedPL={item.realizedPL}
                            rateOfReturn={item.rateOfReturn} // rateOfReturn prop 추가
                        />
                    </TouchableOpacity>
                )}
                style={styles.logList}
                contentContainerStyle={styles.logListContent}
                ListEmptyComponent={<Text style={styles.noLogsText}>{isLoading ? '로딩 중...' : '선택한 날짜의 매매 기록이 없습니다.'}</Text>}
            />
            <TouchableOpacity style={styles.floatingButton} onPress={handleFabPress}>
                <Plus size={30} color="#FFFFFF" />
            </TouchableOpacity>

            <TradeDetailModal
                visible={isDetailModalVisible}
                onClose={() => setDetailModalVisible(false)}
                log={selectedLog}
                onEdit={handleEditLog}
                onDelete={handleDeleteLog}
                onAnalyze={handleAnalyzeLog}
            />

            <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={handleCloseCreateModal}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingContainer}>
                    <Pressable style={styles.modalOverlay} onPress={handleCloseCreateModal}>
                        <Pressable style={styles.modalContent}>
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>{isEditMode ? '매매일지 수정' : '매매일지 작성'}</Text>
                                    <Pressable onPress={handleCloseCreateModal}>
                                        <X size={24} color={TossDarkGray} />
                                    </Pressable>
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>거래 날짜</Text>
                                    <TextInput style={styles.textInput} placeholder="YYYY-MM-DD" value={tradeDate} onChangeText={setTradeDate} placeholderTextColor="#999" />
                                </View>
                                <View style={styles.marketTypeContainer}>
                                    <TouchableOpacity style={[styles.marketTypeButton, marketType === 'domestic' && styles.marketTypeButtonActive]} onPress={() => setMarketType('domestic')}>
                                        <Text style={[styles.marketTypeButtonText, marketType === 'domestic' && styles.marketTypeButtonTextActive]}>국내주식</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.marketTypeButton, marketType === 'overseas' && styles.marketTypeButtonActive, { marginLeft: 10 }]} onPress={() => setMarketType('overseas')}>
                                        <Text style={[styles.marketTypeButtonText, marketType === 'overseas' && styles.marketTypeButtonTextActive]}>해외주식</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>종목명</Text>
                                    <TextInput 
                                        style={styles.textInput} 
                                        placeholder="종목명을 입력하세요" 
                                        value={stockName} 
                                        onChangeText={(text) => {
                                            setStockName(text);
                                            setStockSearchKeyword(text);
                                        }} 
                                        placeholderTextColor="#999" 
                                    />
                                    {stockSuggestions.length > 0 && (
                                        <FlatList
                                            data={stockSuggestions}
                                            keyExtractor={(item) => item.ticker}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity 
                                                    style={styles.suggestionItem}
                                                    onPress={() => {
                                                        setStockName(item.stockName);
                                                        setStockTicker(item.ticker);
                                                        setStockSearchKeyword('');
                                                        setStockSuggestions([]);
                                                    }}
                                                >
                                                    <Text>{item.stockName} ({item.ticker})</Text>
                                                </TouchableOpacity>
                                            )}
                                        />
                                    )}
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>증권사</Text>
                                    <TouchableOpacity 
                                        style={styles.textInput} 
                                        onPress={() => setIsBrokerModalVisible(true)}
                                    >
                                        <Text style={styles.textInput}>
                                            {brokers.find(b => b.code === brokerage)?.name || '증권사를 선택하세요'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>거래 종류</Text>
                                    <View style={styles.tradeTypeContainer}>
                                        <TouchableOpacity style={[styles.tradeTypeButton, tradeType === 'buy' && styles.tradeTypeButtonActiveBuy]} onPress={() => setTradeType('buy')}>
                                            <Text style={[styles.tradeTypeButtonText, tradeType === 'buy' && styles.tradeTypeButtonTextActive]}>매수</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.tradeTypeButton, tradeType === 'sell' && styles.tradeTypeButtonActiveSell, { marginLeft: 10 }]} onPress={() => setTradeType('sell')}>
                                            <Text style={[styles.tradeTypeButtonText, tradeType === 'sell' && styles.tradeTypeButtonTextActive]}>매도</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>체결 단가</Text>
                                    <View style={styles.inputWithUnitContainer}>
                                        <TextInput style={[styles.textInput, { flex: 1, borderBottomWidth: 0 }]} placeholder="가격을 입력하세요" keyboardType="numeric" value={pricePerShare} onChangeText={handlePricePerShareChange} placeholderTextColor="#999" />
                                        <Text style={[styles.unitLabel, {color: themeColors.UnitLabelColor}]}>{getCurrencySymbol(marketType)}</Text>
                                    </View>
                                    <View style={styles.inputUnderline} />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>체결 수량</Text>
                                    <View style={styles.inputWithUnitContainer}>
                                        <TextInput style={[styles.textInput, { flex: 1, borderBottomWidth: 0 }]} placeholder="수량을 입력하세요" keyboardType="numeric" value={quantity} onChangeText={handleQuantityChange} placeholderTextColor="#999" />
                                        <Text style={[styles.unitLabel, {color: themeColors.UnitLabelColor}]}>{getQuantityUnit()}</Text>
                                    </View>
                                    <View style={styles.inputUnderline} />
                                </View>
                                {tradeType === 'sell' && (
                                    <>
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.inputLabel}>매수 평단가</Text>
                                            <View style={styles.inputWithUnitContainer}>
                                                <TextInput style={[styles.textInput, { flex: 1, borderBottomWidth: 0 }]} placeholder="매수 시 1주당 평균 가격" keyboardType="numeric" value={averagePurchasePrice} onChangeText={handleAveragePurchasePriceChange} placeholderTextColor="#999" />
                                                <Text style={[styles.unitLabel, {color: themeColors.UnitLabelColor}]}>{getCurrencySymbol(marketType)}</Text>
                                            </View>
                                            <View style={styles.inputUnderline} />
                                        </View>
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.inputLabel}>보유 기간</Text>
                                            <TextInput style={styles.textInput} placeholder="보유 기간 (일 단위)" value={holdingPeriod} onChangeText={handleHoldingPeriodChange} placeholderTextColor="#999" />
                                        </View>
                                    </>
                                )}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>{tradeType === 'buy' ? '매수 이유' : '매도 이유'}</Text>
                                    <TextInput style={styles.textAreaInput} placeholder={getTradeReasonPlaceholder()} multiline={true} value={tradeReason} onChangeText={setTradeReason} placeholderTextColor="#999" textAlignVertical="top" />
                                    <TouchableOpacity style={styles.attachButton} onPress={handleImagePick}>
                                        <Image size={18} color={TossGray700} style={{ marginRight: 6 }} />
                                        <Text style={styles.attachButtonText}>차트 사진 첨부</Text>
                                    </TouchableOpacity>
                                    {attachedImage && (
                                        <View style={styles.imagePreviewContainer}>
                                            <RNImage source={{ uri: attachedImage }} style={styles.previewImage} />
                                            <TouchableOpacity onPress={() => setAttachedImage(null)} style={styles.removeImageButton}>
                                                <X size={18} color="#FFFFFF" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsContainer}>
                                        {DEFAULT_TAGS.map((tag, index) => {
                                            const isSelected = selectedTags.includes(tag);
                                            const colorInfo = TAG_COLORS[tag];
                                            
                                            // Only apply custom background/border if selected
                                            const selectionStyle = isSelected && colorInfo
                                                ? { backgroundColor: colorInfo.bg, borderColor: colorInfo.border, borderWidth: 1 }
                                                : {};
                                                
                                            // Text is always black as requested
                                            const textStyle = { color: '#000000', fontWeight: isSelected ? 'bold' : '500' };

                                            return (
                                                <TouchableOpacity 
                                                    key={index} 
                                                    style={[styles.tagButton, selectionStyle]}
                                                    onPress={() => handleTagPress(tag)}
                                                    activeOpacity={0.7} // Visual feedback without changing shape
                                                >
                                                    <Text style={[styles.tagButtonText, textStyle]}>{tag}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>매매 비용 (수수료/세금)</Text>
                                    <View style={styles.inputWithUnitContainer}>
                                        <TextInput style={[styles.textInput, { flex: 1, borderBottomWidth: 0 }]} placeholder="수수료 및 세금" keyboardType="numeric" value={commissionTax} onChangeText={handleCommissionTaxChange} placeholderTextColor="#999" />
                                        <Text style={[styles.unitLabel, {color: themeColors.UnitLabelColor}]}>{getCurrencySymbol(marketType)}</Text>
                                    </View>
                                    <View style={styles.inputUnderline} />
                                </View>
                                <View style={styles.calculationResultSection}>
                                    <View style={styles.totalAmountContainer}>
                                        <Text style={styles.totalAmountLabel}>예상 총 {tradeType === 'buy' ? '매수' : '매도'} 금액</Text>
                                        <Text style={styles.totalAmountValue}>
                                            {formatDisplay(estimatedTotalAmount, "원")}
                                        </Text>
                                    </View>
                                    {tradeType === 'sell' && (
                                        <View style={styles.totalAmountContainer}>
                                            <Text style={styles.totalAmountLabel}>실현 손익</Text>
                                            <Text style={[styles.totalAmountValue, { color: referenceCalculatedPl >= 0 ? BuyColor : SellColor }]}>
                                                {formatDisplay(referenceCalculatedPl, "원")}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </ScrollView>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSaveLog}>
                                <Text style={styles.saveButtonText}>{isEditMode ? '수정하기' : '기록하기'}</Text>
                            </TouchableOpacity>
                        </Pressable>
                    </Pressable>
                </KeyboardAvoidingView>
            </Modal>
            {/* Broker Picker Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isBrokerModalVisible}
                onRequestClose={() => setIsBrokerModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setIsBrokerModalVisible(false)}>
                    <Pressable style={[styles.modalContent, {maxHeight: '50%'}]} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>증권사 선택</Text>
                            <Pressable onPress={() => setIsBrokerModalVisible(false)}>
                                <X size={24} color={TossDarkGray} />
                            </Pressable>
                        </View>
                        <FlatList
                            data={brokers}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={styles.suggestionItem}
                                    onPress={() => {
                                        setBrokerage(item.code);
                                        setIsBrokerModalVisible(false);
                                    }}
                                >
                                    <Text>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    attachButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F4F6',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginTop: 12,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: InputBorderColor,
    },
    attachButtonText: {
        fontSize: 16,
        color: TossDarkGray,
        fontWeight: 'bold',
    },
    imagePreviewContainer: {
        marginTop: 15,
        position: 'relative',
        alignSelf: 'flex-start',
    },
    previewImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: InputBorderColor,
    },
    removeImageButton: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logList: { flex: 1 },
    logListContent: { paddingBottom: 200, flexGrow: 1, paddingHorizontal: 20, paddingTop: 60 },
    noLogsText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: TossDarkGray },
    floatingButton: { position: 'absolute', bottom: 110, right: 25, backgroundColor: '#3182F6', width: 58, height: 58, borderRadius: 29, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, zIndex: 9999 },
    addTradeButtonText: { fontSize: 18, color: TossDarkGray, fontWeight: 'bold' },
    screenTitle: { fontSize: 28, fontWeight: 'bold', color: TossDarkGray, marginBottom: 20, marginTop: 10 },
    addTradeButton: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 15, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 20, borderWidth: 1, borderColor: InputBorderColor, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
    keyboardAvoidingContainer: { flex: 1 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: ModalBackgroundColor },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' },
    modalScrollContent: { paddingBottom: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: TossDarkGray, flex: 1, textAlign: 'center', marginLeft: 24 },
    marketTypeContainer: { flexDirection: 'row', marginBottom: 20, backgroundColor: InputBorderColor, borderRadius: 8, padding: 3 },
    marketTypeButton: { flex: 1, paddingVertical: 10, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
    marketTypeButtonActive: { backgroundColor: '#FFFFFF' },
    marketTypeButtonText: { fontSize: 15, color: TossDarkGray, fontWeight: 'bold' },
    marketTypeButtonTextActive: { color: TossBlue },
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 14, color: TossDarkGray, marginBottom: 5, fontWeight: 'bold' },
    textInput: { fontSize: 18, color: TossDarkGray, paddingVertical: 10 },
    textAreaInput: { fontSize: 16, color: TossDarkGray, borderWidth: 1, borderColor: InputBorderColor, borderRadius: 8, padding: 10, minHeight: 100, textAlignVertical: 'top' },
    inputUnderline: { height: 1, backgroundColor: InputBorderColor, marginTop: -5, marginBottom: 5 },
    inputWithUnitContainer: { flexDirection: 'row', alignItems: 'center' },
    unitLabel: { fontSize: 16, marginLeft: 5, paddingVertical: 10 },
    tradeTypeContainer: { flexDirection: 'row', marginTop: 5 },
    tradeTypeButton: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: InputBorderColor, alignItems: 'center' },
    tradeTypeButtonActiveBuy: { backgroundColor: BuyColor },
    tradeTypeButtonActiveSell: { backgroundColor: SellColor },
    tradeTypeButtonText: { fontSize: 16, color: TossDarkGray, fontWeight: 'bold' },
    tradeTypeButtonTextActive: { color: '#FFFFFF' },
    calculationResultSection: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: InputBorderColor },
    totalAmountContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    totalAmountLabel: { fontSize: 16, color: TossDarkGray, fontWeight: 'bold' },
    totalAmountValue: { fontSize: 20, color: TossDarkGray, fontWeight: 'bold' },
    saveButton: { backgroundColor: TossBlue, borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginTop: 20 },
    saveButtonText: { fontSize: 18, color: '#FFFFFF', fontWeight: 'bold' },
    detailModalTitle: { fontSize: 20, fontWeight: 'bold', color: TossDarkGray, flex: 1, textAlign: 'center', marginLeft: 24 },
    detailHeader: { paddingVertical: 20, paddingHorizontal: 16, borderLeftWidth: 4, marginBottom: 20, backgroundColor: '#F9FAFB' },
    detailStockName: { fontSize: 24, fontWeight: 'bold', color: TossDarkGray },
    detailTradeType: { fontSize: 18, fontWeight: 'bold', marginTop: 4 },
    detailSection: { marginBottom: 20, borderTopWidth: 1, borderTopColor: '#F2F4F6', paddingTop: 20 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' },
    detailLabel: { fontSize: 16, color: '#6B7684' },
    detailValue: { fontSize: 16, color: TossDarkGray, fontWeight: '600' },
    totalRow: { borderTopWidth: 1, borderTopColor: '#F2F4F6', paddingTop: 16, marginTop: 8 },
    totalLabel: { fontSize: 18, color: TossDarkGray, fontWeight: 'bold' },
    totalValue: { fontSize: 20, fontWeight: 'bold' },
    memoText: { fontSize: 16, color: TossDarkGray, lineHeight: 24, marginTop: 8, padding: 12, backgroundColor: '#F2F4F6', borderRadius: 8 },
    detailedChartImage: {
        width: '100%',
        height: 300,
        resizeMode: 'contain',
        borderRadius: 8,
        marginTop: 10,
        backgroundColor: '#F9FAFB',
    },
    modalActionButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20, paddingHorizontal: 10 },
    modalActionButtonBase: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: InputBorderColor,
        marginHorizontal: 5,
    },
    modalActionButtonText: {
        fontSize: 16,
        color: TossDarkGray,
        fontWeight: 'bold',
    },
    editButton: {
        // This button will use the base style directly
    },
    analyzeButton: {
        backgroundColor: '#FFFBE6',
        borderColor: '#FFC107',
    },
    deleteButton: {
        backgroundColor: '#FBEBEA',
        borderColor: '#EF4444',
    },
    aiAnalysisModalContent: { paddingTop: 20 },
    aiAnalysisText: { fontSize: 16, color: TossDarkGray, lineHeight: 24, marginTop: 10 },
    suggestionItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
    tagsContainer: { flexDirection: 'row', marginTop: 10 },
    tagButton: { backgroundColor: '#F2F4F6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
    tagButtonSelected: { backgroundColor: TossBlue },
    tagButtonText: { color: TossGray700, fontSize: 14, fontWeight: '600' },
    tagButtonTextSelected: { color: '#FFFFFF' },
    kiwoomSummaryCard: {
        backgroundColor: '#E9F2FF', // Lighter blue for success
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 20, // To match screen padding
        marginBottom: 20,
        marginTop: 20, 
    },
    kiwoomTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: TossBlue,
        marginBottom: 10,
    },
    kiwoomTotalAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: TossBlue,
        marginBottom: 20,
    },
    kiwoomDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    kiwoomDetailLabel: {
        fontSize: 15,
        color: TossGray700,
    },
    kiwoomDetailValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    positive: {
        color: BuyColor, // Red for positive
    },
    negative: {
        color: SellColor, // Blue for negative
    },
});

export default JournalScreen;