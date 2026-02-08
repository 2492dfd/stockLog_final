import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

// 각 탭의 아이콘을 매핑합니다.
const iconMapping: { [key: string]: React.ComponentProps<typeof MaterialCommunityIcons>['name'] } = {
  'index': 'notebook-edit',      // 매매일지
  'community': 'forum',           // 커뮤니티
  'setting': 'cog',               // 설정
  'settlement': 'chart-bar', // 결산 (막대 그래프 아이콘)
};

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    // 하단에 위치시키기 위한 래퍼 뷰
    <View style={styles.wrapper}>
      <View style={styles.tabBarContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          
          // 탭의 라벨 설정 (options.tabBarLabel이 있으면 사용, 없으면 title, 그것도 없으면 route.name)
          const label =
            options.tabBarLabel !== undefined
              ? (options.tabBarLabel as string)
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;
          const color = isFocused ? '#333D4B' : '#B0B8C1'; // 활성/비활성 색상

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, { merge: true });
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
            >
              <MaterialCommunityIcons
                name={iconMapping[route.name] || 'help-circle'}
                size={24}
                color={color}
              />
              <Text style={{ color, fontSize: 11, marginTop: 4 }}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center', // 탭 바를 중앙 정렬
  },
  tabBarContainer: {
    width: '92%', // 화면 너비의 92% 차지
    flexDirection: 'row',
    height: 80, // 세로 폭 확장
    backgroundColor: '#FFFFFF',
    borderRadius: 40, // 둥근 알약 형태 강조
    marginBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingHorizontal: 10,
    // 더 부드러운 그림자 효과
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2, // 그림자 수직 오프셋 줄임
    },
    shadowOpacity: 0.08, // 그림자 투명도 감소
    shadowRadius: 12,   // 그림자 반경 확장
    elevation: 8,       // Android용 그림자 조정
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
