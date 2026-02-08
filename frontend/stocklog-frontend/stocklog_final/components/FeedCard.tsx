import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Heart, MessageCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import CommentModal from './CommentModal'; // Import CommentModal
import TradingCertificationCard from './TradingCertificationCard';
import { postApi } from '../src/api';

// --- Color Constants ---
const Colors = {
  background: '#FFFFFF',
  surface: '#F8F9FA',
  textPrimary: '#191F28',
  textSecondary: '#6B7684',
  accentRed: '#F04452',
  accentBlue: '#3182F6',
  border: '#E5E8EB',
  gold: '#FFD700',
};

const FeedCard = ({ item }) => {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(item.isHearted ?? item.isLiked ?? false); // Initialize with server's isHearted
  const [likeCount, setLikeCount] = useState(item.heartCount ?? item.interactions?.likes ?? 0); // Prioritize heartCount

  const [isCommentModalVisible, setCommentModalVisible] = useState(false);

  const handleHeart = async () => {
    const previousLiked = isLiked;
    const previousCount = likeCount;

    // Optimistic Update
    setIsLiked(!previousLiked);
    setLikeCount(previousLiked ? previousCount - 1 : previousCount + 1);

    try {
      const response = await postApi.toggleHeart(item.id);
      // Update with actual count from server
      setLikeCount(response.data);
    } catch (error) {
      console.error("Failed to toggle heart:", error);
      // Revert on error
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
    }
  };

  // --- Data from item, based on user's confirmation of the DTO ---
  const authorName = item.nickname || item.nick_name;
  const authorId = item.userId || item.user_id;
  const authorAvatarUri = item.profileImageUrl || item.avatarUrl;

  const profitRate = item.trade?.profitRate ?? 0;
  const profitColor = profitRate >= 0 ? Colors.accentRed : Colors.accentBlue;

  const handlePress = () => {
    if (item.id) {
      router.push(`/post/${item.id}`);
    }
  };

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
                    return <TradingCertificationCard key={`${item.id}-tradelog-${index}`} transactionData={sharedTradeLogData} />;
                } else {
                    // 매칭되는 데이터가 없거나 플레이스홀더 형식이 아니면 일반 텍스트로 렌더링
                    return <Text key={`${item.id}-text-${index}`} style={styles.content} numberOfLines={3} ellipsizeMode="tail">{part}</Text>;
                }
            } else if (part) { // 빈 문자열이 아닌 경우에만 텍스트 렌더링
                return <Text key={`${item.id}-text-${index}`} style={styles.content} numberOfLines={3} ellipsizeMode="tail">{part}</Text>; // 일반 텍스트
            }
            return null; // 빈 문자열 파트는 렌더링하지 않음
        });
    };

  return (
    <>
      <TouchableOpacity activeOpacity={0.9} onPress={handlePress} style={styles.card}>
        {/* User Info */}
        {authorName && (
          <View style={styles.userInfoContainer}>
            <TouchableOpacity 
              onPress={() => {
                if (authorId) {
                  router.push(`/profile/${authorId}`);
                }
              }}
            >
              {authorAvatarUri ? (
                <Image source={{ uri: authorAvatarUri }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]} />
              )}
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{authorName}</Text>
            </View>
          </View>
        )}

        {/* Trade Summary Banner */}
        {item.trade && (
          <View style={styles.tradeBanner}>
            <Text style={styles.stockName}>{item.trade.stockName}</Text>
            <View style={styles.tradeStats}>
              <Text style={[styles.profitRate, { color: profitColor }]}>
                {item.trade?.profitRate !== null && item.trade?.profitRate !== undefined
              ? `${item.trade.profitRate >= 0 ? '+' : ''}${item.trade.profitRate.toFixed(1)}%`
              : "-"}
              </Text>
              <Text style={styles.holdingPeriod}>{item.trade.holdingPeriod}일 보유</Text>
            </View>
          </View>
        )}

        {/* Title */}
        {item.title && (
            <Text style={styles.title}>{item.title}</Text>
        )}

        {/* Content */}
        {/* Content */}
        {renderContentWithTradeLog(item.content, item.sharedTradeLog)}
        {item.imageUrl && ( // Add this block
            <Image source={{ uri: item.imageUrl }} style={styles.feedImage} />
        )}
        <TouchableOpacity onPress={handlePress}>
          <Text style={styles.seeMoreText}>더보기</Text>
        </TouchableOpacity>

        {/* Interaction Bar */}
        <View style={styles.interactionBar}>
          <TouchableOpacity style={styles.interactionButton} onPress={handleHeart}>
            <Heart size={20} color={isLiked ? Colors.accentRed : Colors.textSecondary} fill={isLiked ? Colors.accentRed : 'none'} />
            <Text style={styles.interactionText}>{likeCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.interactionButton} onPress={() => setCommentModalVisible(true)}>
            <MessageCircle size={20} color={Colors.textSecondary} />
            <Text style={styles.interactionText}>
              {item.comments?.length ?? item.interactions?.commentsCount ?? 0}
            </Text>
          </TouchableOpacity>

        </View>
      </TouchableOpacity>
      <CommentModal
        visible={isCommentModalVisible}
        onClose={() => setCommentModalVisible(false)}
        comments={item.comments ?? []}
      />
    </>
  );
};
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  avatarPlaceholder: {
    backgroundColor: '#E5E8EB',
  },
  userName: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  tierText: { fontSize: 12, fontWeight: 'bold', color: Colors.textPrimary },
  tradeBanner: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stockName: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
  tradeStats: { alignItems: 'flex-end' },
  profitRate: { fontSize: 20, fontWeight: 'bold' },
  holdingPeriod: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  feedImage: { // New style
    width: '100%',
    height: 150, // Adjust height as needed
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  seeMoreText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 15,
  },
  interactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  interactionButton: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  interactionText: { marginLeft: 6, fontSize: 14, color: Colors.textSecondary },
});

export default FeedCard;
