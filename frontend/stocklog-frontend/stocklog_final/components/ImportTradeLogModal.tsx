import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, FlatList } from 'react-native';
import { X } from 'lucide-react-native';
import { getMyTradeLogs } from '../src/api/index'; // postApi의 getMyTradeLogs 함수를 import

const Colors = {
    background: '#FFFFFF',
    textPrimary: '#191F28',
    textSecondary: '#6B7684',
    border: '#E5E8EB',
    primary: '#007AFF',
};

const ImportTradeLogModal = ({ visible, onClose, onSelect }) => { // onImport -> onSelect 변경
    const [tradeLogs, setTradeLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (visible) {
            const fetchTradeLogs = async () => {
                setLoading(true);
                setError(null);
                try {
                    // getMyTradeLogs API 호출
                    const response = await getMyTradeLogs();
                    // 최근 기록 순서대로 정렬 (가정: response.data에 tradeDate 필드가 있음)
                    const sortedLogs = response.data.sort((a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime());
                    setTradeLogs(sortedLogs);
                } catch (err) {
                    console.error("Failed to fetch trade logs:", err);
                    setError('매매일지를 불러오는데 실패했습니다.');
                } finally {
                    setLoading(false);
                }
            };
            fetchTradeLogs();
        }
    }, [visible]);
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>매매일지 불러오기</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={Colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
                    ) : error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : tradeLogs.length === 0 ? (
                        <Text style={styles.emptyText}>가져올 매매일지가 없습니다.</Text>
                    ) : (
                        <FlatList
                            data={tradeLogs}
                            keyExtractor={(item, index) => item.logId ? String(item.logId) : String(index)}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.tradeLogItem} onPress={() => onSelect(item)}>
                                    <View style={styles.itemLeft}>
                                        <Text style={styles.itemStockName}>{item.stockName}</Text>
                                        <View style={styles.itemMeta}>
                                            <Text style={[
                                                styles.itemTradeType,
                                                item.tradeType === 'BUY' ? styles.tradeTypeBuy : styles.tradeTypeSell
                                            ]}>
                                                {item.tradeType === 'BUY' ? '매수' : '매도'}
                                            </Text>
                                            <Text style={styles.itemDate}>{item.tradeDate}</Text>
                                        </View>
                                        {item.reason && <Text style={styles.itemReason}>{item.reason}</Text>}
                                    </View>
                                    <View style={styles.itemRight}>
                                        <Text style={styles.itemQuantity}>{item.executedQuantity}주</Text>
                                        <Text style={styles.itemPrice}>{item.executionPrice?.toLocaleString()}원</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: Colors.background,
        borderRadius: 20,
        width: '90%',
        height: '80%', // Add a fixed height or max-height to the modal itself
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        flex: 1, // Add flex: 1 here
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        paddingBottom: 16,
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    closeButton: {
        padding: 4,
    },
    modalBody: {
        marginBottom: 24,
    },
    descriptionText: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginBottom: 8,
        lineHeight: 24,
    },
    descriptionTextBold: {
        fontSize: 16,
        color: Colors.textPrimary,
        fontWeight: 'bold',
        marginBottom: 8,
        lineHeight: 24,
    },
    errorText: {
        textAlign: 'center',
        color: Colors.textPrimary,
        fontSize: 16,
        marginTop: 20,
    },
    emptyText: {
        textAlign: 'center',
        color: Colors.textSecondary,
        fontSize: 16,
        marginTop: 20,
    },
    tradeLogItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    itemLeft: {
        flex: 1,
        marginRight: 10,
    },
    itemRight: {
        alignItems: 'flex-end',
    },
    itemStockName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    itemMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    itemTradeType: {
        fontSize: 12,
        fontWeight: 'bold',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 8,
    },
    tradeTypeBuy: {
        backgroundColor: '#E0F2F7', // Light Blue
        color: Colors.primary, // Darker Blue
    },
    tradeTypeSell: {
        backgroundColor: '#FFE5E5', // Light Red
        color: Colors.accentRed, // Darker Red
    },
    itemDate: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    itemReason: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    itemQuantity: {
        fontSize: 14,
        color: Colors.textPrimary,
    },
    itemPrice: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    itemStockName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    itemDate: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    itemDetails: {
        alignItems: 'flex-end',
    },
    itemQuantity: {
        fontSize: 14,
        color: Colors.textPrimary,
    },
    itemPrice: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    modalFooter: {
        alignItems: 'center',
    },
    importButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        elevation: 2,
        width: '100%',
    },
    importButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
});

export default ImportTradeLogModal;
