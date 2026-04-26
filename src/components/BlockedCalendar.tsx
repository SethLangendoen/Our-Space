
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Calendar } from 'react-native-calendars';

interface CalendarProps {
  onSelectRange?: (range: { start: Date | null; end: Date | null }) => void;
  singleSelect?: boolean;
}

const BlockedCalendar: React.FC<CalendarProps> = ({
  onSelectRange,
  singleSelect = false,
}) => {
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);

  const getRangeDates = (start: string, end: string) => {
    const dates: string[] = [];
    let current = new Date(start);
    const last = new Date(end);

    while (current <= last) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const markedDates: Record<string, any> = {};

  // Highlight selected range
  if (rangeStart) {
    const tempRange = rangeEnd
      ? getRangeDates(rangeStart, rangeEnd)
      : [rangeStart];

    tempRange.forEach((date, idx) => {
      markedDates[date] = {
        startingDay: idx === 0,
        endingDay: idx === tempRange.length - 1,
        color: '#FFBA00',
        textColor: 'white',
      };
    });
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <View>
      <Calendar
        markingType="period"
        markedDates={markedDates}
        minDate={today}
        renderArrow={(direction) => (
          <Text
            style={{
              fontSize: 30,
              color: '#FFBA00',
              fontWeight: '900',
              paddingHorizontal: 0,
            }}
          >
            {direction === 'left' ? '‹' : '›'}
          </Text>
        )}
        onDayPress={(day) => {
          const selectedDate = day.dateString;

          // ✅ SINGLE SELECT MODE
          if (singleSelect) {
            setRangeStart(selectedDate);
            setRangeEnd(null);

            onSelectRange?.({
              start: new Date(selectedDate),
              end: null,
            });
            return;
          }

          // ✅ RANGE MODE
          if (!rangeStart || (rangeStart && rangeEnd)) {
            setRangeStart(selectedDate);
            setRangeEnd(null);
            onSelectRange?.({
              start: new Date(selectedDate),
              end: null,
            });
            return;
          }

          if (!rangeEnd) {
            let start = rangeStart;
            let end = selectedDate;

            if (end < start) [start, end] = [end, start];

            setRangeStart(start);
            setRangeEnd(end);

            onSelectRange?.({
              start: new Date(start),
              end: new Date(end),
            });
          }
        }}
      />
    </View>
  );
};

export default BlockedCalendar;