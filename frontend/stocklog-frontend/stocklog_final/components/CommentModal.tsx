import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, SafeAreaView, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { X, Heart, MessageSquare } from 'lucide-react-native';

const Colors = {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    textPrimary: '#191F28',
    textSecondary: '#6B7684',
    accentRed: '#F04452',
    border: '#E5E8EB',
};

const CommentItem = ({ comment, onLike, onReply }) => {
    const [isLiked, setIsLiked] = useState(false);
  
    return (
      <View style={styles.commentContainer}>
        {comment.user && comment.user.avatar ? (
          <Image source={{ uri: comment.user.avatar }} style={styles.commentAvatar} />
        ) : (
          <View style={[styles.commentAvatar, { backgroundColor: Colors.surface }]} /> // Placeholder for missing avatar
        )}
        <View style={styles.commentBody}>
          <Text style={styles.commentUser}>{comment.user?.name || '익명'}</Text>
          <Text style={styles.commentText}>{comment.text}</Text>
          <View style={styles.commentActions}>
            <TouchableOpacity onPress={() => setIsLiked(!isLiked)} style={styles.actionButton}>
              <Heart size={16} color={isLiked ? Colors.accentRed : Colors.textSecondary} fill={isLiked ? Colors.accentRed : 'transparent'} />
              <Text style={styles.actionText}>{isLiked ? comment.likes + 1 : comment.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onReply(comment)} style={styles.actionButton}>
              <MessageSquare size={16} color={Colors.textSecondary} />
              <Text style={styles.actionText}>답글</Text>
            </TouchableOpacity>
          </View>
          {comment.replies && comment.replies.length > 0 && (
            <View style={styles.repliesContainer}>
              {comment.replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} onLike={onLike} onReply={onReply} />
              ))}
            </View>
          )}
        </View>
      </View>
    );
};

const CommentModal = ({ visible, onClose, comments }) => {
    const [newComment, setNewComment] = useState('');

    const handlePostComment = () => {
        if (newComment.trim()) {
            console.log('Posting comment:', newComment);
            // Here you would typically add the new comment to your data source
            setNewComment('');
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
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>댓글</Text>
                    <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                        <X size={28} color={Colors.textPrimary} />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={comments}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <CommentItem
                            comment={item}
                            onLike={(commentId) => console.log('Liking comment', commentId)}
                            onReply={(comment) => console.log('Replying to comment', comment)}
                        />
                    )}
                    style={styles.list}
                />
                <View style={styles.commentInputContainer}>
                    <TextInput
                        style={styles.commentInput}
                        placeholder="댓글을 입력하세요..."
                        value={newComment}
                        onChangeText={setNewComment}
                    />
                    <TouchableOpacity style={styles.postButton} onPress={handlePostComment}>
                        <Text style={styles.postButtonText}>게시</Text>
                    </TouchableOpacity>
                </View>
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
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    modalCloseButton: {
        padding: 4,
    },
    list: {
        flex: 1,
    },
    commentContainer: {
        flexDirection: 'row',
        padding: 16,
    },
    commentAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    commentBody: {
        flex: 1,
    },
    commentUser: {
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    commentText: {
        marginTop: 4,
        color: Colors.textPrimary,
        lineHeight: 20,
    },
    commentActions: {
        flexDirection: 'row',
        marginTop: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    actionText: {
        marginLeft: 4,
        color: Colors.textSecondary,
        fontSize: 12,
    },
    repliesContainer: {
        marginTop: 12,
        borderLeftWidth: 1,
        borderLeftColor: Colors.border,
        paddingLeft: 12,
    },
    commentInputContainer: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        backgroundColor: Colors.background,
    },
    commentInput: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 12,
    },
    postButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    postButtonText: {
        color: Colors.accentBlue,
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default CommentModal;
