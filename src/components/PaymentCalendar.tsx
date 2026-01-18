import React, { useMemo, useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';

type BlockedTime = { start: string; end: string };

interface PaymentCalendarProps {
  startDate: Date;
  endDate?: Date;
  blockedTimes?: BlockedTime[];
  reservedTimes?: BlockedTime[];
  selectableEndDate?: boolean;
  onSelectEndDate?: (date: Date) => void;
}

const COLORS = {
  TERM_BG: '#E8EFFF',
  TERM_TEXT: '#2C3E50',
  BLOCKED: '#FF6B6B',
  SELECTED: '#2ECC71',
};

const normalizeDate = (d: Date) => {
  const n = new Date(d);
  n.setHours(0, 0, 0, 0);
  return n;
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const toDateString = (d: Date) => d.toISOString().split('T')[0];
const fromDateStringLocal = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const PaymentCalendar: React.FC<PaymentCalendarProps> = ({
  startDate,
  endDate,
  blockedTimes = [],
  reservedTimes = [],
  selectableEndDate = false,
  onSelectEndDate,
}) => {
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    const start = normalizeDate(startDate);
    const today = normalizeDate(new Date());
    const maxEndDate = endDate ? normalizeDate(endDate) : addDays(start, 365);

    /* Disable past dates */
    let pastCursor = new Date(start);
    while (pastCursor < today) {
      const d = toDateString(pastCursor);
      marks[d] = { disabled: true, disableTouchEvent: true };
      pastCursor.setDate(pastCursor.getDate() + 1);
    }

    /* Booking term background */
    let cursor = new Date(start);
    while (cursor <= maxEndDate) {
      const d = toDateString(cursor);
      if (!marks[d]) marks[d] = {};
      marks[d].customStyles = {
        container: { backgroundColor: COLORS.TERM_BG, borderRadius: 8 },
        text: { color: COLORS.TERM_TEXT },
      };
      cursor.setDate(cursor.getDate() + 1);
    }

    /* Blocked / reserved */
    [...blockedTimes, ...reservedTimes].forEach(({ start, end }) => {
      let b = normalizeDate(new Date(start));
      const e = normalizeDate(new Date(end));
      while (b <= e) {
        const d = toDateString(b);
        marks[d] = {
          disabled: true,
          disableTouchEvent: true,
          customStyles: { container: { backgroundColor: COLORS.BLOCKED, borderRadius: 8 }, text: { color: 'white' } },
        };
        b.setDate(b.getDate() + 1);
      }
    });

    /* Selected end */
    if (selectedEnd) {
      marks[selectedEnd] = {
        ...(marks[selectedEnd] || {}),
        customStyles: { container: { backgroundColor: COLORS.SELECTED, borderRadius: 8 }, text: { color: 'white', fontWeight: '700' } },
      };
    }

    return marks;
  }, [startDate, endDate, blockedTimes, reservedTimes, selectedEnd]);

  return (
    <View style={styles.container}>
      <Calendar
        markingType="custom"
        markedDates={markedDates}
        theme={{ calendarBackground: 'transparent' }}
        onDayPress={(day) => {
          if (!selectableEndDate) return;
          const selected = fromDateStringLocal(day.dateString);
          if (selected < normalizeDate(new Date())) {
            Alert.alert('Invalid date', 'You cannot select a past date.');
            return;
          }
          if (markedDates[day.dateString]?.disabled) {
            Alert.alert('Unavailable', 'This date is reserved.');
            return;
          }
          setSelectedEnd(day.dateString);
          onSelectEndDate?.(selected);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({ container: { padding: 10 } });

export default PaymentCalendar;
