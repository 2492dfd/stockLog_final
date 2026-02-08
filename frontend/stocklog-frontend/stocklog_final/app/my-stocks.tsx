import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { getPortfolioList, updatePortfolioItem, deletePortfolioItem } from '../src/api/index.js';

// Import AddStockModal for editing
import AddStockModal from '../components/AddStockModal.tsx';

const Colors = {
  background: '#FFFFFF',
  surface: '#F8F9FA',
  textPrimary: '#191F28',
  textSecondary: '#6B7684',
  accentRed: '#F04452',
  accentBlue: '#3182F6',
  border: '#E5E8EB',
  error: '#D93636',
  delete: '#E03131',
};

const MyStocksScreen = () => {
  const router = useRouter();
  // State for fetched stocks
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for AddStockModal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [stockToEdit, setStockToEdit] = useState<any | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false); // For modal's save/delete loading indicator

  const [isChoiceModalVisible, setIsChoiceModalVisible] = useState(false);
  const [selectedStockForChoice, setSelectedStockForChoice] = useState<any | undefined>(undefined);

  const fetchStocks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching portfolio list...');
      const response = await getPortfolioList();
      console.log('Portfolio list API response status:', response.status);
      console.log('Portfolio list API response data:', response.data);
      if (response.status === 200) {
        setStocks(response.data || []);
      } else {
        console.error('API response status not 200:', response.status, response.data);
        setError('포트폴리오 데이터를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error("Failed to fetch portfolio list with error:", err.response ? err.response.data : err.message); // 상세 로그 추가
      setError('포트폴리오 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  const handleEditStock = (stock: any) => {
    console.log('Opening edit/delete options for:', stock.stockName); // Debug log
    setSelectedStockForChoice(stock);
    setIsChoiceModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setStockToEdit(undefined); // Clear stock to edit
    setSelectedStockForChoice(undefined); // Clear selected stock for choice
    setIsChoiceModalVisible(false); // Close choice modal
  };

  const handleSaveEdit = async (updatedStockData: any) => {
    setIsSaving(true);
    try {
      if (!stockToEdit?.portfolioId) {
        throw new Error('Stock to edit has no portfolioId.');
      }

      const payload = {
        stockName: updatedStockData.stockName,
        executedQuantity: updatedStockData.executedQuantity,
        executionPrice: updatedStockData.executionPrice,
        buyDate: updatedStockData.buyDate,
      };

      await updatePortfolioItem(stockToEdit.portfolioId, payload);
      handleCloseModal();
      fetchStocks(); // Refresh the list
    } catch (err) {
      console.error("Failed to update stock:", err);
      alert('종목 수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStock = async (portfolioId: number) => {
    setIsSaving(true);
    try {
      console.log('Attempting to delete stock with portfolioId:', portfolioId);
      const response = await deletePortfolioItem(portfolioId);
      console.log('Delete stock API response:', response); // Log the full response
      handleCloseModal();
      fetchStocks(); // Refresh the list
      alert('종목이 성공적으로 삭제되었습니다.');
    } catch (err) {
      console.error('Failed to delete stock:', err);
      alert('종목 삭제에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const Header = () => (
    <View style={styles.tableHeaderRow}>
      <Text style={[styles.tableHeaderText, styles.colStockName]}>종목명</Text>
      <Text style={[styles.tableHeaderText, styles.colDate]}>구매날짜</Text>
      <Text style={[styles.tableHeaderText, styles.colAmount]}>평단가</Text>
      <Text style={[styles.tableHeaderText, styles.colQuantity]}>구매수량</Text>
      <Text style={[styles.tableHeaderText, styles.colTotalAmount]}>구매한비용</Text>
      <Text style={[styles.tableHeaderText, styles.colCurrentPrice]}>현재가</Text>
      <Text style={[styles.tableHeaderText, styles.colRate]}>수익률</Text>
      <Text style={[styles.tableHeaderText, styles.colProfit]}>실현손익</Text>
    </View>
  );

  const Row = ({ item, onEdit }: { item: any, onEdit: (item: any) => void }) => (
    <TouchableOpacity style={styles.tableRow} onPress={() => onEdit(item)}>
      <Text style={[styles.tableCell, styles.colStockName]}>{item.stockName}</Text>
      <Text style={[styles.tableCell, styles.colDate]}>{item.buyDate}</Text>
      <Text style={[styles.tableCell, styles.colAmount]}>{item.executionPrice}</Text>
      <Text style={[styles.tableCell, styles.colQuantity]}>{item.executedQuantity}</Text>
      <Text style={[styles.tableCell, styles.colTotalAmount]}>{item.totalCost}</Text>
      <Text style={[styles.tableCell, styles.colCurrentPrice]}>{item.currentPrice ? item.currentPrice.toLocaleString() : "-"}</Text>
      <Text style={[styles.tableCell, styles.colRate, { color: item.rateOfReturn >= 0 ? Colors.accentRed : Colors.accentBlue }]}>{item.rateOfReturn !== null ? `${item.rateOfReturn.toFixed(2)}%` : "-"}</Text>
      <Text style={[styles.tableCell, styles.colProfit, { color: item.realizedPL >= 0 ? Colors.accentRed : Colors.accentBlue }]}>{item.realizedPL !== null ? `${item.realizedPL.toLocaleString()}` : "-"}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/strategy')} style={styles.backButton}>
          <ChevronLeft size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>나의 종목 전체보기</Text>
        <View style={{ width: 28 }} />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.accentBlue} style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : stocks.length === 0 ? (
        <Text style={styles.emptyText}>보유한 종목이 없습니다.</Text>
      ) : (
        <ScrollView style={{pointerEvents: 'box-none'}}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={styles.tableContainer}>
              <Header />
              {stocks.map((stock: any, index: number) => (
                <Row key={stock.portfolioId ?? index} item={stock} onEdit={handleEditStock} />
              ))}
            </View>
          </ScrollView>
        </ScrollView>
      )}

      <AddStockModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveEdit}
        isLoading={isSaving}
        stockToEdit={stockToEdit}
        onDelete={() => handleDeleteStock(stockToEdit?.portfolioId)} // Pass delete handler
        isEditing={!!stockToEdit} // Let modal know if it's editing
      />

      {/* Choice Modal for Edit/Delete */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isChoiceModalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.choiceModalView}>
            <Text style={styles.choiceModalTitle}>{selectedStockForChoice?.stockName} 종목 관리</Text>
            <View style={styles.choiceButtonContainer}>
              <TouchableOpacity
                style={[styles.choiceButton, styles.choiceButtonEdit]}
                onPress={() => {
                  setStockToEdit(selectedStockForChoice);
                  setIsModalVisible(true);
                  setIsChoiceModalVisible(false);
                }}
              >
                <Text style={styles.choiceButtonText}>수정</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.choiceButton, styles.choiceButtonDelete]}
                onPress={() => {
                  console.log('ChoiceModal Delete button pressed, calling handleDeleteStock directly for test'); // 로그 변경
                  handleDeleteStock(selectedStockForChoice?.portfolioId);
                  setIsChoiceModalVisible(false); // 선택 모달 닫기
                }}
              >
                <Text style={styles.choiceButtonText}>삭제</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.choiceButton, styles.choiceButtonCancel]}
                onPress={handleCloseModal}
              >
                <Text style={styles.choiceButtonText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
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
  colDate: { width: 120, textAlign: 'center' },
  colAmount: { width: 110, textAlign: 'center' },
  colQuantity: { width: 80, textAlign: 'center' },
  colTotalAmount: { width: 130, textAlign: 'right' },
  colCurrentPrice: { width: 110, textAlign: 'right' },
  colRate: { width: 100, textAlign: 'right', fontWeight: '600' },
  colProfit: { width: 110, textAlign: 'right', fontWeight: 'bold' },

  // Styles for Choice Modal
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  choiceModalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  choiceModalTitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  choiceButtonContainer: {
    width: '100%',
  },
  choiceButton: {
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    marginTop: 10,
    width: '100%',
  },
  choiceButtonEdit: {
    backgroundColor: Colors.accentBlue,
  },
  choiceButtonDelete: {
    backgroundColor: Colors.delete,
  },
  choiceButtonCancel: {
    backgroundColor: Colors.textSecondary,
  },
  choiceButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default MyStocksScreen;
