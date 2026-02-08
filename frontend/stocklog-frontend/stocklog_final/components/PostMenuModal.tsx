import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, SafeAreaView, TouchableWithoutFeedback } from 'react-native';

const Colors = {
  background: '#FFFFFF',
  textPrimary: '#191F28',
  textSecondary: '#6B7684',
  accentRed: '#F04452',
  overlay: 'rgba(0, 0, 0, 0.4)',
  border: '#E5E8EB',
};

const PostMenuModal = ({ visible, onClose, isAuthor, onEdit, onDelete, onBlock, onReport }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {isAuthor ? (
                <>
                  <TouchableOpacity style={styles.menuItem} onPress={onEdit}>
                    <Text style={styles.menuText}>수정하기</Text>
                  </TouchableOpacity>
                  <View style={styles.separator} />
                  <TouchableOpacity style={styles.menuItem} onPress={onDelete}>
                    <Text style={[styles.menuText, styles.destructiveText]}>삭제하기</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={styles.menuItem} onPress={onReport}>
                    <Text style={[styles.menuText, styles.destructiveText]}>신고하기</Text>
                  </TouchableOpacity>
                  <View style={styles.separator} />
                  <TouchableOpacity style={styles.menuItem} onPress={onBlock}>
                    <Text style={styles.menuText}>이 사용자의 글 보지 않기 (차단)</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableWithoutFeedback>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
             <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
    padding: 16,
    paddingBottom: 34,
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    fontSize: 17,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  destructiveText: {
    color: Colors.accentRed,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});

export default PostMenuModal;
