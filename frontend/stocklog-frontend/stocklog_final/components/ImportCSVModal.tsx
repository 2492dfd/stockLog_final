import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { X } from 'lucide-react-native';

const Colors = {
    background: '#FFFFFF',
    textPrimary: '#191F28',
    textSecondary: '#6B7684',
    border: '#E5E8EB',
    primary: '#007AFF',
};

const ImportCSVModal = ({ visible, onClose, onImport }) => {
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
                        <Text style={styles.modalTitle}>매매일지 불러오기 (CSV)</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={Colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalBody}>
                        <Text style={styles.descriptionText}>
                            그동안 노션이나 엑셀에 기록했던 매매일지를 한 번에 불러오세요.
                        </Text>
                        <Text style={styles.descriptionText}>
                            방법: 노션/엑셀에서 파일을 CSV 형식으로 저장 후 업로드해 주세요.
                        </Text>
                        <Text style={styles.descriptionText}>
                            주의: 파일에 [날짜, 종목명, 매수/매도, 수량, 가격] 정보가 반드시 포함되어야 합니다.
                        </Text>
                        <Text style={styles.descriptionText}>
                            오류 해결: 파일 업로드 후 데이터가 보이지 않는다면, 파일의 첫 줄(제목)을 아래 이름으로 수정하면 정확히 인식됩니다.
                        </Text>
                        <Text style={styles.descriptionTextBold}>
                            날짜, 종목명, 구분, 수량, 단가
                        </Text>
                    </View>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.importButton} onPress={onImport}>
                            <Text style={styles.importButtonText}>파일 선택 및 불러오기</Text>
                        </TouchableOpacity>
                    </View>
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
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
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

export default ImportCSVModal;
