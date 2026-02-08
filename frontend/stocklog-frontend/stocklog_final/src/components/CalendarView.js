import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// Define Toss colors
const TossBlue = '#3182F6';
const TossLightGray = '#F2F4F6';
const TossDarkGray = '#191F28';
const White = '#FFFFFF';

// Configure Korean locale
LocaleConfig.locales['ko'] = {
  monthNames: [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ],
  monthNamesShort: [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ],
  dayNames: [
    '일요일',
    '월요일',
    '화요일',
    '수요일',
    '목요일',
    '금요일',
    '토요일',
  ],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

const CalendarView = ({ onDayPress, markedDates }) => {
  return (
    <View style={styles.calendarContainer}>
      <Calendar
        onDayPress={onDayPress}
        markedDates={markedDates}
        markingType={'multi-dot'} // Added for multi-dot marking
        // Custom styling for the calendar
        monthFormat={'yyyy년 MM월'}
        theme={{
          backgroundColor: White,
          calendarBackground: White,
          textSectionTitleColor: TossDarkGray, // Day names (Mon, Tue...)
          // selectedDayBackgroundColor and selectedDayTextColor removed to allow customStyles to take full control
          todayTextColor: TossBlue,
          dayTextColor: TossDarkGray,
          textDisabledColor: '#D9D9D9',
          arrowColor: TossDarkGray,
          monthTextColor: TossDarkGray,
          textDayFontFamily: 'sans-serif',
          textMonthFontFamily: 'sans-serif',
          textDayHeaderFontFamily: 'sans-serif',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
          dotStyle: { // Added to slightly lower the dots
            marginBottom: -2,
          },
          'stylesheet.calendar.header': {
            week: {
              marginTop: 5,
              flexDirection: 'row',
              justifyContent: 'space-around',
              paddingHorizontal: 0, // Remove default padding
            },
            dayHeader: {
                width: 32, // Make day headers a fixed width
                textAlign: 'center',
                fontSize: 14,
                color: '#666',
            },
          },
        }}
        // Style for the calendar itself
        style={styles.calendar}
        // Hide month and year if preferred, but user requested 'clean' so keeping them for now
        // hideArrows={true}
        // hideExtraDays={true}
        // disableMonthChange={true}
        // firstDay={1} // Start week on Monday
        // showWeekNumbers={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: White,
    borderRadius: 12,
    width: '100%', // Fixed width
    paddingHorizontal: 16, // Maintain inner spacing
    marginBottom: 10,
    overflow: 'hidden', // Ensures rounded corners
    alignSelf: 'center', // Added for centering
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  calendar: {
    // borderRadius: 12, // Removed, handled by calendarContainer
    paddingBottom: 10,
  },
});

export default CalendarView;
