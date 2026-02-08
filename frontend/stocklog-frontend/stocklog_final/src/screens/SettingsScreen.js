import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import ImportCSVModal from '../../components/ImportCSVModal'; // 새로 생성한 모달 import
import { importTradeLogs } from '../../src/api'; // src/api/index.js에서 importTradeLogs 함수 import

const TossLightGray = '#F2F4F6';
const TossDarkGray = '#191F28';

const SettingsScreen = () => {
  const [isImportCSVModalVisible, setIsImportCSVModalVisible] = useState(false);

  const handleImportCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv', // CSV 파일만 선택하도록
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        console.log('Document picking cancelled');
        Alert.alert('알림', '파일 선택이 취소되었습니다.');
        return;
      }

      const csvFileUri = result.assets[0].uri;
      console.log('Selected CSV file URI:', csvFileUri);

      // CSV 파일 내용 읽기
      const csvString = await FileSystem.readAsStringAsync(csvFileUri);
      
      // CSV 내용 파싱 (구현 필요)
      const parseCsv = (csvText) => {
          const lines = csvText.trim().split('\n');
          if (lines.length === 0) return [];

          const headers = lines[0].split(',').map(h => h.trim());
          const data = lines.slice(1);

          const requiredHeaders = ['날짜', '종목명', '구분', '수량', '단가'];
          const headerMap = {};
          requiredHeaders.forEach(reqHeader => {
              const index = headers.indexOf(reqHeader);
              if (index === -1) {
                  throw new Error(`필수 헤더 '${reqHeader}'가 CSV 파일에 없습니다.`);
              }
              headerMap[reqHeader] = index;
          });

          return data.map(line => {
              const values = line.split(',').map(v => v.trim());
              if (values.length !== headers.length) {
                  console.warn('CSV 파싱: 헤더 수와 값의 수가 일치하지 않는 행이 있습니다.', line);
                  return null; // 유효하지 않은 행은 건너뜜
              }

              const tradeTypeRaw = values[headerMap['구분']];
              let tradeType;
              if (tradeTypeRaw === '매수') {
                  tradeType = 'BUY';
              } else if (tradeTypeRaw === '매도') {
                  tradeType = 'SELL';
              } else {
                  console.warn(`알 수 없는 매매 구분: ${tradeTypeRaw}. BUY로 기본 설정합니다.`);
                  tradeType = 'BUY'; // 또는 에러 처리
              }

              return {
                  stockName: values[headerMap['종목명']],
                  tradeDate: values[headerMap['날짜']],
                  tradeType: tradeType, // 'BUY' or 'SELL'
                  executedQuantity: parseInt(values[headerMap['수량']], 10),
                  executionPrice: parseFloat(values[headerMap['단가']]),
                  reason: '', // CSV에 매매 이유 필드가 없으므로 빈 문자열로 설정
              };
          }).filter(item => item !== null); // 유효하지 않은 행 필터링
      };

      const parsedTradeLogs = parseCsv(csvString);
      console.log('Parsed trade logs:', parsedTradeLogs);

      if (parsedTradeLogs.length === 0) {
        Alert.alert('알림', '파싱할 매매일지 데이터가 없습니다.');
        return;
      }

      // 파싱된 데이터를 서버로 전송
      await importTradeLogs(parsedTradeLogs);
      Alert.alert('성공', `${parsedTradeLogs.length}개의 매매일지가 성공적으로 임포트되었습니다.`);
      
    } catch (err) {
      console.error('Error importing CSV:', err);
      Alert.alert('오류', `매매일지 임포트 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setIsImportCSVModalVisible(false); // 모달 닫기
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>설정 화면</Text>
      <TouchableOpacity 
        style={styles.importButton} 
        onPress={() => setIsImportCSVModalVisible(true)}
      >
        <Text style={styles.importButtonText}>매매일지 불러오기 (CSV)</Text>
      </TouchableOpacity>

      <ImportCSVModal
        visible={isImportCSVModalVisible}
        onClose={() => setIsImportCSVModalVisible(false)}
        onImport={handleImportCSV}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: TossLightGray,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TossDarkGray,
  },
  importButton: {
    marginTop: 20,
    backgroundColor: '#3182F6', // Colors.accentBlue
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  importButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;