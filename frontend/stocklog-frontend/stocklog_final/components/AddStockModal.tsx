import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, SafeAreaView, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { X } from 'lucide-react-native';

const Colors = {
    background: '#FFFFFF',
    textPrimary: '#191F28',
    textSecondary: '#6B7684',
    accentBlue: '#3182F6',
    border: '#E5E8EB',
    surface: '#F8F9FA',
    error: '#D93636',
};

// 데이터 타입을 정의합니다.
type StockData = {
    stockName: string;
    executedQuantity: number;
    executionPrice: number;
    buyDate: string;
};

// Props 타입을 정의합니다.
interface AddStockModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: StockData) => void;
    isLoading: boolean;
    stockToEdit?: any; // Keep this for now, it's used for initial state
    onDelete: (portfolioId: number) => void;
    isEditing: boolean;
}

const AddStockModal = ({ visible, onClose, onSave, isLoading, stockToEdit, onDelete, isEditing }: AddStockModalProps) => {
    const [stockName, setStockName] = useState('');
    const [executedQuantity, setExecutedQuantity] = useState('');
    const [executionPrice, setExecutionPrice] = useState('');
    const [buyDate, setBuyDate] = useState('');

    useEffect(() => {
        if (visible) {
            if (isEditing) {
                setStockName(stockToEdit.stockName || '');
                setExecutedQuantity(stockToEdit.executedQuantity?.toString() || '');
                setExecutionPrice(stockToEdit.executionPrice?.toString() || '');
                setBuyDate(stockToEdit.buyDate || '');
            } else {
                setStockName('');
                setExecutedQuantity('');
                setExecutionPrice('');
                setBuyDate('');
            }
        }
    }, [visible, stockToEdit, isEditing]);

    const handleSave = () => {
        if (isLoading) return;

        if (!stockName.trim() || !executedQuantity.trim() || !executionPrice.trim() || !buyDate.trim()) {
            alert('필수 항목(종목명, 보유수량, 주당 평균 단가, 매수일)을 모두 입력해주세요.');
            return;
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(buyDate)) {
            alert('매수일 형식을 YYYY-MM-DD에 맞게 입력해주세요.');
            return;
        }

        const stockData: StockData = {
            stockName,
            executedQuantity: parseFloat(executedQuantity),
            executionPrice: parseFloat(executionPrice),
            buyDate,
        };
        
        if (typeof onSave === 'function') {
            onSave(stockData);
        } else {
            console.error("onSave prop is not a function!");
        }
    };

    const handleDelete = () => {
        if (isLoading) return;
        if (stockToEdit?.portfolioId) {
            onDelete(stockToEdit.portfolioId);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={visible}
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={onClose}>
                            <X size={28} color={Colors.textPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>{isEditing ? '종목 수정' : '새 종목 추가'}</Text>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isLoading}>
                            {isLoading ? (
                                <ActivityIndicator size="small" color={Colors.background} />
                            ) : (
                                <Text style={styles.saveButtonText}>{isEditing ? '수정' : '저장'}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalContent}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>종목명</Text>
                            <Text style={styles.warningText}>
                                현재가가 표시되지 않는 경우 티커를 입력해주세요 예 NVDA
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="예: 삼성전자"
                                placeholderTextColor={Colors.textSecondary}
                                value={stockName}
                                onChangeText={setStockName}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>보유수량</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="예: 10.5"
                                placeholderTextColor={Colors.textSecondary}
                                value={executedQuantity}
                                onChangeText={setExecutedQuantity}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>주당 평균 단가 (원)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="예: 75000.50"
                                placeholderTextColor={Colors.textSecondary}
                                value={executionPrice}
                                onChangeText={setExecutionPrice}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>매수일</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={Colors.textSecondary}
                                value={buyDate}
                                onChangeText={setBuyDate}
                            />
                        </View>
                        {isEditing && (
                            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={isLoading}>
                                {isLoading ? (
                                    <ActivityIndicator size="small" color={Colors.delete} />
                                ) : (
                                    <Text style={styles.deleteButtonText}>삭제</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.background },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary },
    saveButton: {
        backgroundColor: Colors.accentBlue,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        minWidth: 60,
        alignItems: 'center',
    },
    saveButtonText: { color: Colors.background, fontSize: 14, fontWeight: 'bold' },
    modalContent: { padding: 20 },
    inputGroup: { marginBottom: 24 },
    label: { fontSize: 16, color: Colors.textPrimary, marginBottom: 8, fontWeight: '600' },
    input: {
        fontSize: 16,
        color: Colors.textPrimary,
        borderBottomWidth: 1.5,
        borderBottomColor: Colors.border,
        paddingVertical: 10,
    },
    warningText: {
        fontSize: 12, // Smaller font size for the warning
        color: Colors.textSecondary, // Gray color
        marginBottom: 4, // A little space between warning and input
    },
    deleteButton: {
        backgroundColor: Colors.delete, // Use the new delete color
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    deleteButtonText: {
        color: Colors.background,
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default AddStockModal;