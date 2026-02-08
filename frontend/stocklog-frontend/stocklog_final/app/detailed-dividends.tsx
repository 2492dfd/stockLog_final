import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// --- Color Constants ---
const Colors = {
  background: '#FFFFFF',
  surface: '#F8F9FA',
  textPrimary: '#191F28',
  textSecondary: '#6B7684',
  accentRed: '#F04452',
  border: '#E5E8EB',
};

// --- Mock Data (Expanded for Detail View) ---
const detailedDividends = [
  { id: '1', name: '코카-콜라 (KO)', holdingQuantity: 100, dividendPerShare: 0.46, totalInvestment: 5800, dividendYield: 3.17, totalAmount: 46 },
  { id: '2', name: '리얼티 인컴 (O)', holdingQuantity: 50, dividendPerShare: 0.25, totalInvestment: 2600, dividendYield: 5.76, totalAmount: 12.5 },
  { id: '3', name: '삼성전자 (우)', holdingQuantity: 200, dividendPerShare: 361, totalInvestment: 11200000, dividendYield: 2.58, totalAmount: 72200 },
  { id: '4', name: 'AT&T (T)', holdingQuantity: 150, dividendPerShare: 0.27, totalInvestment: 2550, dividendYield: 6.5, totalAmount: 40.5 },
];

const DetailedDividendsScreen = () => {
  const router = useRouter();

  const Header = () => (
    <View style={styles.tableHeaderRow}>
      <Text style={[styles.tableHeaderText, { flex: 3 }]}>종목명</Text>
      <Text style={[styles.tableHeaderText, { flex: 2, textAlign: 'right' }]}>보유 수량</Text>
      <Text style={[styles.tableHeaderText, { flex: 2, textAlign: 'right' }]}>주당 배당금</Text>
      <Text style={[styles.tableHeaderText, { flex: 3, textAlign: 'right' }]}>총 투자 금액</Text>
      <Text style={[styles.tableHeaderText, { flex: 2, textAlign: 'right' }]}>배당률</Text>
    </View>
  );

  const Row = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, { flex: 3, fontWeight: '500' }]}>{item.name}</Text>
      <Text style={[styles.tableCell, { flex: 2, textAlign: 'right' }]}>{item.holdingQuantity.toLocaleString()}주</Text>
      <Text style={[styles.tableCell, { flex: 2, textAlign: 'right' }]}>
        {item.dividendPerShare !== null && item.dividendPerShare !== undefined
          ? item.name.includes('(') ? `$${item.dividendPerShare.toFixed(2)}` : `${item.dividendPerShare.toLocaleString()}원`
          : "-"}
      </Text>
      <Text style={[styles.tableCell, { flex: 3, textAlign: 'right' }]}>{item.name.includes('(') ? `$${item.totalInvestment.toLocaleString()}` : `${item.totalInvestment.toLocaleString()}원`}</Text>
      <Text style={[styles.tableCell, { flex: 2, textAlign: 'right', color: Colors.accentRed }]}>
        {item.dividendYield !== null && item.dividendYield !== undefined
          ? `${item.dividendYield.toFixed(2)}%`
          : "-"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>상세 배당 리스트</Text>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView style={styles.container}>
        <View style={styles.tableWrapper}>
          <Header />
          {detailedDividends.map(item => <Row key={item.id} item={item} />)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
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
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary },
  tableWrapper: {
    margin: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tableCell: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
});

export default DetailedDividendsScreen;
