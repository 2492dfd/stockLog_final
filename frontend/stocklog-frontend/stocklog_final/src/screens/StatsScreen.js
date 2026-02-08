import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TossLightGray = '#F2F4F6';
const TossDarkGray = '#191F28';

const StatsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>통계 화면</Text>
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
});

export default StatsScreen;
