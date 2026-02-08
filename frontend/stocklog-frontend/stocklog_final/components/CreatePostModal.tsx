import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, SafeAreaView, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { X, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import ImportTradeLogModal from './ImportTradeLogModal';

const Colors = {
// ... (existing code)
    background: '#FFFFFF',
    textPrimary: '#191F28',
    textSecondary: '#6B7684',
    accentRed: '#F04452',
    accentBlue: '#3182F6',
    border: '#E5E8EB',
    surface: '#F8F9FA',
};

const CreatePostModal = ({ visible, onClose, onSave, isLoading, postToEdit }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null); // New state for selected image
    const [selectedTradeLog, setSelectedTradeLog] = useState<any | null>(null); // New state for selected trade log
    const [isImportModalVisible, setIsImportModalVisible] = useState(false); // New state for import modal

    useEffect(() => {
        if (visible) {
            if (postToEdit) {
                setTitle(postToEdit.title || '');
                setContent(postToEdit.content || '');
            } else {
                setTitle('');
                setContent('');
            }
        }
    }, [visible, postToEdit]);

    const handleSave = () => {
        if (isLoading) return;
        
        if (!title.trim() || !content.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }
        onSave({ title, content, imageUrl: selectedImageUri, tradeLogId: selectedTradeLog?.logId });
        // Don't clear state here immediately if loading, but on close/success it will reset via useEffect
    };
    
    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result); // For debugging

        if (!result.canceled) {
            setSelectedImageUri(result.assets[0].uri);
        }
    };

    // Function to handle selection from ImportTradeLogModal
    const handleTradeLogSelect = (tradeLog) => {
        setSelectedTradeLog(tradeLog); // 선택된 매매일지 객체 저장
        
        // content에 플레이스홀더 추가
        const placeholder = `[TRADELOG_ID_${tradeLog.logId}]`;
        setContent(prevContent => {
            return prevContent.trim().length > 0 ? prevContent + '\n\n' + placeholder : placeholder;
        });

        setIsImportModalVisible(false); // Close the import modal
    };

        return (
            <>
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={visible}
                    onRequestClose={onClose}
                >
                    <SafeAreaView style={styles.safeArea}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={onClose}>
                                <X size={28} color={Colors.textPrimary} />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>{postToEdit ? '게시글 수정' : '새 게시물'}</Text>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isLoading}>
                                {isLoading ? (
                                    <ActivityIndicator size="small" color={Colors.background} />
                                ) : (
                                    <Text style={styles.saveButtonText}>{postToEdit ? '수정하기' : '저장하기'}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalContent}>
                            <TextInput
                                style={styles.titleInput}
                                placeholder="제목"
                                placeholderTextColor={Colors.textSecondary}
                                value={title}
                                onChangeText={setTitle}
                            />
                                                <TextInput
                                                    style={styles.contentInput}
                                                    placeholder="내용을 입력하세요..."
                                                    placeholderTextColor={Colors.textSecondary}
                                                    value={content}
                                                    onChangeText={setContent}
                                                    multiline
                                                />
                                                {selectedImageUri && (
                                                    <Image source={{ uri: selectedImageUri }} style={styles.previewImage} />
                                                )}
                                                                    <View style={styles.optionsContainer}>
                                                                        <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                                                                            <ImageIcon size={24} color={Colors.textSecondary} />
                                                                            <Text style={styles.addPhotoButtonText}>사진 추가</Text>
                                                                        </TouchableOpacity>
                                                                        <TouchableOpacity
                                                                            style={styles.importTradeLogButton}
                                                                            onPress={() => setIsImportModalVisible(true)}
                                                                        >
                                                                            <Text style={styles.importTradeLogButtonText}>거래내역 가져오기</Text>
                                                                        </TouchableOpacity>
                                                                    </View>
                                                
                                                                                            </ScrollView>
                    </SafeAreaView>
                </Modal>
    
                <ImportTradeLogModal
                    visible={isImportModalVisible}
                    onClose={() => setIsImportModalVisible(false)}
                    onSelect={handleTradeLogSelect}
                />
            </>
        );};

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
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    saveButton: {
        backgroundColor: Colors.accentBlue,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    saveButtonText: {
        color: Colors.background,
        fontSize: 14,
        fontWeight: 'bold',
    },
    modalContent: {
        padding: 16,
    },
    titleInput: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    contentInput: {
        fontSize: 16,
        color: Colors.textPrimary,
        lineHeight: 24,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        marginTop: 16,
        marginBottom: 20,
        minHeight: 300, // Make content input even larger
        textAlignVertical: 'top',
    },
    addPhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 8,
        padding: 12,
        alignSelf: 'flex-start',
    },
    addPhotoButtonText: {
        marginLeft: 8,
        fontSize: 16,
        color: Colors.textSecondary,
    },
    optionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        justifyContent: 'flex-start', // Align items to the start
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginTop: 10,
        marginBottom: 20,
        resizeMode: 'cover',
    },
    importTradeLogButton: {
        backgroundColor: Colors.surface,
        borderRadius: 8,
        padding: 12,
        marginLeft: 10, // Add some space between buttons
    },
    importTradeLogButtonText: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
});

export default CreatePostModal;
