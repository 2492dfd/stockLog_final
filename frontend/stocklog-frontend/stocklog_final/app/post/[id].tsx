import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Heart, MessageCircle, Bookmark, Share2, Send, MoreVertical, X, Check } from 'lucide-react-native';
import { getPostById, updatePost, deletePost, toggleHeart, toggleCommentHeart, createComment, updateComment, deleteComment, reportPost, blockUser, deleteUser } from '../../src/api';
import AppStorage from '../../src/utils/storage';
import { parseJwt } from '../../src/utils/jwt';
import PostMenuModal from '../../components/PostMenuModal';
import CreatePostModal from '../../components/CreatePostModal';
import TradingCertificationCard from '../../components/TradingCertificationCard';

const { width } = Dimensions.get('window');

const Colors = {
  background: '#F2F4F6',
  surface: '#F8F9FA',
  textPrimary: '#191F28',
  textSecondary: '#6B7684',
  accentRed: '#F04452',
  accentBlue: '#3182F6',
  border: '#E5E8EB',
  white: '#FFFFFF',
};

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const commentInputRef = React.useRef(null);
  
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPost = async () => {
    try {
      setLoading(true);
      
      // 1. Get Current User ID from Token
      const token = await AppStorage.getItem('userToken');
      let myId = null;
      if (token) {
          const decoded = parseJwt(token);
          myId = decoded?.userId || decoded?.id || decoded?.sub;
      }

      // 2. Fetch Post with userId param
      const response = await getPostById(Number(id), myId ? Number(myId) : null);
      
      // Normalize data: Use heartCount for likes
      const serverData = response.data;
      const normalizedPost = {
          ...serverData,
          interactions: {
              ...serverData.interactions,
              likes: serverData.heartCount ?? serverData.interactions?.likes ?? 0
          }
      };
      
      setPost(normalizedPost);
      
      // Map server's 'isHearted' to local 'isLiked' state
      if (serverData.isHearted !== undefined) {
        setIsLiked(serverData.isHearted);
      } else if (serverData.isLiked !== undefined) {
        setIsLiked(serverData.isLiked);
      }
    } catch (err) {
      console.error("Error fetching post details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPost();
    }
    
    const checkUser = async () => {
        try {
            const token = await AppStorage.getItem('userToken');
            if (token) {
                const decoded = parseJwt(token);
                if (decoded) {
                     const uid = decoded.userId || decoded.id || decoded.sub;
                     if (uid) setCurrentUserId(Number(uid));
                }
            }
        } catch (e) {
            console.error("Failed to decode token", e);
        }
    };
    checkUser();
  }, [id]);

  const handleHeart = async () => {
    const previousLiked = isLiked;
    // Optimistic update
    setIsLiked(!previousLiked);
    setPost(prev => ({
      ...prev,
      interactions: {
        ...prev.interactions,
        likes: (prev.interactions?.likes ?? 0) + (previousLiked ? -1 : 1)
      }
    }));

    try {
      const response = await toggleHeart(Number(id));
      // Update with actual count from server
      setPost(prev => ({
        ...prev,
        interactions: {
          ...prev.interactions,
          likes: response.data // Server returns updated Long count
        }
      }));
    } catch (err) {
      console.error("Failed to toggle heart:", err);
      // Revert on error
      setIsLiked(previousLiked);
      setPost(prev => ({
        ...prev,
        interactions: {
          ...prev.interactions,
          likes: (prev.interactions?.likes ?? 0) + (previousLiked ? 1 : -1)
        }
      }));
    }
  };

  const handleCommentHeart = async (commentId, index) => {
    const targetComment = post.comments[index];
    const previousLiked = targetComment.isLiked || false;
    
    // Optimistic update
    setPost(prev => {
      const newComments = [...prev.comments];
      newComments[index] = {
        ...targetComment,
        isLiked: !previousLiked,
        likes: (targetComment.likes || 0) + (previousLiked ? -1 : 1)
      };
      return { ...prev, comments: newComments };
    });

    try {
      const response = await toggleCommentHeart(commentId);
      // Update with actual count from server
      setPost(prev => {
        const newComments = [...prev.comments];
        newComments[index] = {
          ...newComments[index],
          likes: response.data // Server returns updated Long count
        };
        return { ...prev, comments: newComments };
      });
    } catch (err) {
      console.error("Failed to toggle comment heart:", err);
      // Revert on error
      setPost(prev => {
        const newComments = [...prev.comments];
        newComments[index] = targetComment; // Revert to original object
        return { ...prev, comments: newComments };
      });
    }
  };

  const handleReply = (nickname) => {
    setCommentText(`@${nickname} `);
    commentInputRef.current?.focus();
  };

  const handleCommentAction = (comment) => {
    Alert.alert(
      "댓글 관리",
      "옵션을 선택해주세요.",
      [
        { text: "취소", style: "cancel" },
        { 
          text: "수정", 
          onPress: () => {
            setEditingCommentId(comment.id);
            setCommentText(comment.text || comment.content);
            commentInputRef.current?.focus();
          } 
        },
        { 
          text: "삭제", 
          style: "destructive",
          onPress: () => handleDeleteComment(comment.id)
        }
      ]
    );
  };

  const handleDeleteComment = async (commentId) => {
    try {
      // API signature updated: deleteComment(postId, commentId, userId)
      await deleteComment(Number(id), commentId, currentUserId);
      setPost(prev => ({
        ...prev,
        comments: prev.comments.filter(c => c.id !== commentId)
      }));
      Alert.alert("성공", "댓글이 삭제되었습니다.");
    } catch (err) {
      console.error("Error deleting comment:", err);
      Alert.alert("오류", "댓글 삭제에 실패했습니다.");
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      
      if (editingCommentId) {
        // Update existing comment
        await updateComment(Number(id), editingCommentId, { 
            postId: Number(id),
            text: commentText,
            content: commentText // Send both for compatibility
        });
        
        // Update local state
        setPost(prev => ({
          ...prev,
          comments: prev.comments.map(c => 
            c.id === editingCommentId ? { ...c, text: commentText, content: commentText } : c
          )
        }));
        setEditingCommentId(null);
        Alert.alert("성공", "댓글이 수정되었습니다.");
      } else {
        // Create new comment
        await createComment(Number(id), { 
          postId: Number(id),
          text: commentText,
          content: commentText // Send both for compatibility
        });
        await fetchPost();
      }
      setCommentText('');
    } catch (err) {
      console.error("Error posting/updating comment:", err);
      alert(editingCommentId ? "댓글 수정에 실패했습니다." : "댓글 작성에 실패했습니다.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setCommentText('');
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/community');
    }
  };

  const handleEditPost = () => {
    setMenuVisible(false);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async (updatedData) => {
    try {
      await updatePost(Number(id), updatedData);
      setPost(prev => ({ ...prev, ...updatedData }));
      setEditModalVisible(false);
      Alert.alert("성공", "게시글이 수정되었습니다.");
    } catch (e) {
      console.error("Failed to update post:", e);
      Alert.alert("오류", "게시글 수정에 실패했습니다.");
    }
  };

  const handleDeletePost = () => {
    if (isDeleting) return;
    
    setMenuVisible(false);

    const executeDelete = () => {
        setIsDeleting(true);
        console.log("🚀 [Client] 삭제 요청 시작 - ID:", id);
        
        deletePost(Number(id))
            .then(response => {
                console.log("✅ [Client] 삭제 성공:", response);
                router.replace('/(tabs)/community');
            })
            .catch(error => {
                setIsDeleting(false);
                console.error("❌ [Client] 삭제 실패:", error);
                if (error.response) {
                    console.error("📊 [Server Response Data]:", error.response.data);
                }
                
                // 409 Conflict 에러 처리
                if (error.response?.status === 409) {
                    const serverMsg = error.response.data?.message || "이미 삭제 중이거나 처리할 수 없는 상태입니다.";
                    Alert.alert("알림", serverMsg);
                } else if (error.message?.includes("No token")) {
                    Alert.alert("알림", "로그인이 만료되었습니다. 다시 로그인해주세요.");
                } else {
                    Alert.alert("오류", "게시글 삭제에 실패했습니다. 다시 시도해주세요.");
                }
            });
    };

    if (Platform.OS === 'web') {
        if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
            executeDelete();
        }
    } else {
        Alert.alert("게시글 삭제", "정말로 이 게시글을 삭제하시겠습니까?", [
          { text: "취소", style: "cancel" },
          { 
            text: "삭제", 
            style: "destructive", 
            onPress: executeDelete
          }
        ]);
    }
  };

  const handleBlockUser = () => {
    setMenuVisible(false);
    Alert.alert("차단 확인", "이 사용자를 차단하시겠습니까? 더 이상 이 사용자의 글이 보이지 않습니다.", [
        { text: "취소", style: "cancel" },
        { text: "차단", style: "destructive", onPress: async () => {
            try {
                if (post?.userId) {
                    await blockUser(post.userId);
                    Alert.alert("차단 완료", "사용자가 차단되었습니다.");
                    router.replace('/(tabs)/community');
                }
            } catch (e) {
                 Alert.alert("알림", "차단 기능이 처리되었습니다.");
            }
        }}
    ]);
  };

  const handleReportPost = () => {
      setMenuVisible(false);
      Alert.alert("신고 접수", "게시글을 신고하시겠습니까?", [
          { text: "취소", style: "cancel" },
          { text: "신고", onPress: async () => {
              try {
                  await reportPost(Number(id));
                  Alert.alert("신고 완료", "신고가 정상적으로 접수되었습니다. 검토 후 조치하겠습니다.");
              } catch (e) {
                  Alert.alert("알림", "신고가 접수되었습니다.");
              }
          }}
      ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.accentBlue} />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>게시글을 찾을 수 없습니다.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonInline}>
          <Text style={styles.backButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const authorName = post.nickname || post.nick_name || '익명';
  const authorAvatarUri = post.profileImageUrl || post.avatarUrl;
  const profitRate = post.trade?.profitRate ?? 0;
  const profitColor = profitRate >= 0 ? Colors.accentRed : Colors.accentBlue;
  
  const postUserId = post.userId || post.user_id;
  const isAuthor = currentUserId && postUserId && (Number(currentUserId) === Number(postUserId));

    // content 문자열을 파싱하여 React Native 요소 배열을 반환하는 함수
    const renderContentWithTradeLog = (contentString, sharedTradeLogData) => {
        if (!contentString) return null;

        // 플레이스홀더와 텍스트를 모두 유지하면서 분리
        const parts = contentString.split(/(\[TRADELOG_ID_(\d+)\])/g);
        
        return parts.map((part, index) => {
            if (part && part.startsWith('[TRADELOG_ID_') && part.endsWith(']')) {
                // 플레이스홀더인 경우
                const tradeLogId = part.match(/\[TRADELOG_ID_(\d+)\]/)?.[1];
                if (tradeLogId && sharedTradeLogData && String(sharedTradeLogData.logId) === tradeLogId) {
                    return <TradingCertificationCard key={`${post.id}-tradelog-${index}`} transactionData={sharedTradeLogData} />;
                } else {
                    // 매칭되는 데이터가 없거나 플레이스홀더 형식이 아니면 일반 텍스트로 렌더링
                    return <Text key={`${post.id}-text-${index}`} style={styles.content}>{part}</Text>;
                }
            } else if (part) { // 빈 문자열이 아닌 경우에만 텍스트 렌더링
                return <Text key={`${post.id}-text-${index}`} style={styles.content}>{part}</Text>; // 일반 텍스트
            }
            return null; // 빈 문자열 파트는 렌더링하지 않음
        });
    };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleBack} 
            style={styles.iconButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            activeOpacity={0.6}
          >
            <ChevronLeft size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>게시글</Text>
          <TouchableOpacity 
            style={styles.iconButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            onPress={() => setMenuVisible(true)}
          >
            <MoreVertical size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* User Info Section */}
          <View style={styles.userInfoSection}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => post.userId && router.push(`/profile/${post.userId}`)}
            >
              {authorAvatarUri ? (
                <Image source={{ uri: authorAvatarUri }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]} />
              )}
            </TouchableOpacity>
            <View style={styles.userTextContainer}>
              <Text style={styles.userName}>{authorName}</Text>
              <Text style={styles.timestamp}>방금 전</Text>
            </View>
          </View>

          {/* Content Section */}
          <View style={styles.contentSection}>
            {post.title && <Text style={styles.title}>{post.title}</Text>}
            
            {/* Trade Summary Banner */}
            {post.trade && (
              <View style={styles.tradeBanner}>
                <View>
                  <Text style={styles.stockLabel}>수익률</Text>
                  <Text style={[styles.profitRate, { color: profitColor }]}>
                    {post.trade?.profitRate !== null && post.trade?.profitRate !== undefined
                    ? `${post.trade.profitRate >= 0 ? '+' : ''}${post.trade.profitRate.toFixed(2)}%`
                    : "-"}
                  </Text>
                </View>
                <View style={styles.dividerV} />
                <View>
                  <Text style={styles.stockLabel}>종목명</Text>
                  <Text style={styles.stockName}>{post.trade.stockName}</Text>
                </View>
                <View style={styles.dividerV} />
                <View>
                  <Text style={styles.stockLabel}>보유기간</Text>
                  <Text style={styles.holdingPeriod}>{post.trade.holdingPeriod}일</Text>
                </View>
              </View>
            )}

            {renderContentWithTradeLog(post.content, post.sharedTradeLog)}
            {post.imageUrl && (
                <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
            )}
            {post.imageUrl && ( // Add this block
                <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
            )}
          </View>

          {/* Interaction Bar */}
          <View style={styles.interactionBar}>
            <TouchableOpacity 
              style={styles.interactionItem} 
              onPress={handleHeart}
            >
              <Heart 
                size={24} 
                color={isLiked ? Colors.accentRed : Colors.textSecondary} 
                fill={isLiked ? Colors.accentRed : 'none'} 
              />
              <Text style={[styles.interactionText, isLiked && { color: Colors.accentRed }]}>
                {post.interactions?.likes ?? 0}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.interactionItem}>
              <MessageCircle size={24} color={Colors.textSecondary} />
              <Text style={styles.interactionText}>{post.comments?.length ?? 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.interactionItem}>
              <Share2 size={24} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.interactionItem, { marginLeft: 'auto' }]}
              onPress={() => setIsBookmarked(!isBookmarked)}
            >
              <Bookmark 
                size={24} 
                color={isBookmarked ? Colors.accentBlue : Colors.textSecondary} 
                fill={isBookmarked ? Colors.accentBlue : 'none'} 
              />
            </TouchableOpacity>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsHeader}>댓글</Text>
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment, index) => {
                const commentUserId = comment.userId || comment.user_id;
                const commentAvatar = comment.profileImageUrl || comment.imageUrl || comment.avatarUrl;
                const isMyComment = currentUserId && commentUserId && (Number(currentUserId) === Number(commentUserId));
                
                return (
                  <View key={comment.id || index} style={styles.commentItem}>
                    <TouchableOpacity 
                      onPress={() => commentUserId && router.push(`/profile/${commentUserId}`)}
                      activeOpacity={0.7}
                    >
                      {commentAvatar ? (
                        <Image source={{ uri: commentAvatar }} style={styles.commentAvatar} />
                      ) : (
                        <View style={[styles.commentAvatar, styles.avatarPlaceholder]} />
                      )}
                    </TouchableOpacity>
                    <View style={styles.commentContent}>
                      <View style={styles.commentHeader}>
                        <TouchableOpacity 
                          onPress={() => commentUserId && router.push(`/profile/${commentUserId}`)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.commentAuthor}>{comment.nickname || '익명'}</Text>
                        </TouchableOpacity>
                        <Text style={styles.commentDate}>방금 전</Text>
                        {isMyComment && (
                          <TouchableOpacity 
                            style={styles.moreButton} 
                            onPress={() => handleCommentAction(comment)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <MoreVertical size={16} color={Colors.textSecondary} />
                          </TouchableOpacity>
                        )}
                      </View>
                      <Text style={styles.commentText}>{comment.text || comment.content}</Text>
                      
                      <View style={styles.commentActions}>
                        <TouchableOpacity 
                          style={styles.commentActionBtn} 
                          onPress={() => handleCommentHeart(comment.id, index)}
                        >
                          <Heart 
                            size={14} 
                            color={comment.isLiked ? Colors.accentRed : Colors.textSecondary} 
                            fill={comment.isLiked ? Colors.accentRed : 'none'} 
                          />
                          <Text style={[styles.commentActionText, comment.isLiked && { color: Colors.accentRed }]}>
                            {comment.likes || 0}
                          </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={styles.commentActionBtn} 
                          onPress={() => handleReply(comment.nickname || '익명')}
                        >
                          <MessageCircle size={14} color={Colors.textSecondary} />
                          <Text style={styles.commentActionText}>답글달기</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyComments}>
                <Text style={styles.noCommentsText}>첫 번째 댓글을 남겨보세요.</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Comment Input Area */}
        <View style={styles.commentInputArea}>
          {editingCommentId && (
            <View style={styles.editingBanner}>
              <Text style={styles.editingText}>댓글 수정 중...</Text>
              <TouchableOpacity onPress={cancelEdit} style={styles.cancelEditButton}>
                 <X size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.commentInputContainer}>
            <TextInput
              ref={commentInputRef}
              style={styles.commentInput}
              placeholder={editingCommentId ? "댓글 수정..." : "댓글을 입력하세요..."}
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]} 
              onPress={handlePostComment}
              disabled={!commentText.trim() || isSubmittingComment}
            >
              {isSubmittingComment ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                editingCommentId ? (
                   <Check size={20} color={Colors.white} />
                ) : (
                   <Send size={20} color={Colors.white} />
                )
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Modal */}
        <PostMenuModal 
          visible={isMenuVisible}
          onClose={() => setMenuVisible(false)}
          isAuthor={isAuthor}
          onEdit={handleEditPost}
          onDelete={handleDeletePost}
          onBlock={handleBlockUser}
          onReport={handleReportPost}
        />

        {/* Edit Post Modal */}
        <CreatePostModal
            visible={isEditModalVisible}
            onClose={() => setEditModalVisible(false)}
            onSave={handleSaveEdit}
            postToEdit={post}
            isLoading={loading}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    zIndex: 10,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  iconButton: {
    padding: 8,
  },
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  userInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    backgroundColor: '#E5E8EB',
  },
  userTextContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  timestamp: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  followButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accentBlue,
  },
  contentSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 16,
    lineHeight: 30,
  },
  content: {
    fontSize: 17,
    lineHeight: 28,
    color: '#333D4B',
  },
  postImage: { // New style
    width: '100%',
    height: 250, // Adjust height as needed
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  tradeBanner: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stockLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  stockName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  profitRate: {
    fontSize: 18,
    fontWeight: '800',
  },
  holdingPeriod: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  dividerV: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  interactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  interactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    gap: 6,
  },
  interactionText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  commentsSection: {
    padding: 16,
    paddingBottom: 40,
  },
  commentsHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    justifyContent: 'space-between', // Changed for right-aligning the more button
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: 8,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333D4B',
  },
  commentDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginRight: 'auto', // Pushes the date to the left, keeping more button on the right
    marginLeft: 8,
  },
  moreButton: {
    padding: 4,
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
  },
  commentActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 4,
  },
  commentActionText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
    fontWeight: '600',
  },
  emptyComments: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noCommentsText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  commentInputArea: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  editingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  editingText: {
    fontSize: 12,
    color: Colors.accentBlue,
    fontWeight: '600',
  },
  cancelEditButton: {
    padding: 4,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.surface,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  commentInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxHeight: 100,
    color: Colors.textPrimary,
  },
  sendButton: {
    backgroundColor: Colors.accentBlue,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E8EB',
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  backButtonInline: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.accentBlue,
    fontWeight: '600',
  },
});