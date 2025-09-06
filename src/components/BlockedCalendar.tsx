import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';

type BlockedTime = { start: string; end: string };

interface BlockedCalendarProps {
  blockedTimes: BlockedTime[];
  onAddBlockedTime?: (time: BlockedTime) => void;
  onRemoveBlockedTime?: (index: number) => void;
  editable?: boolean;
}

const BlockedCalendar: React.FC<BlockedCalendarProps> = ({
  blockedTimes,
  onAddBlockedTime,
  onRemoveBlockedTime,
  editable = false,
}) => {
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);

  // Helper: get all dates between start and end
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

  // Build marked dates
  const markedDates = blockedTimes.reduce((acc, bt) => {
    const range = getRangeDates(bt.start, bt.end);
    range.forEach((date, idx) => {
      acc[date] = {
        startingDay: idx === 0,
        endingDay: idx === range.length - 1,
        color: '#FF6B6B',
        textColor: 'white',
      };
    });
    return acc;
  }, {} as Record<string, any>);

  // Add temporary selection
  if (rangeStart) {
    const tempRange = rangeEnd ? getRangeDates(rangeStart, rangeEnd) : [rangeStart];
    tempRange.forEach((date, idx) => {
      markedDates[date] = {
        startingDay: idx === 0,
        endingDay: idx === tempRange.length - 1,
        color: '#6B83FF',
        textColor: 'white',
      };
    });
  }

  return (
    <View>
      <Calendar
        markingType="period"
        markedDates={markedDates}
        onDayPress={(day) => {
          if (!editable) return;

          if (!rangeStart) {
            setRangeStart(day.dateString);
            setRangeEnd(null);
          } else if (!rangeEnd) {
            if (day.dateString < rangeStart) {
              setRangeEnd(rangeStart);
              setRangeStart(day.dateString);
            } else {
              setRangeEnd(day.dateString);
            }
          } else {
            // Reset selection if already both set
            setRangeStart(day.dateString);
            setRangeEnd(null);
          }
        }}
      />

      {editable && (
        <>
          <TouchableOpacity
            style={{ padding: 10, backgroundColor: '#eee', marginTop: 10 }}
            onPress={() => {
              if (rangeStart && rangeEnd) {
                onAddBlockedTime?.({ start: rangeStart, end: rangeEnd });
                setRangeStart(null);
                setRangeEnd(null);
              } else {
                Alert.alert('Invalid range', 'Please select a start and end date.');
              }
            }}
          >
            <Text style={{ textAlign: 'center' }}>Add Blocked Range</Text>
          </TouchableOpacity>

          {blockedTimes.map((bt, index) => (
            <View
              key={index}
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}
            >
              <Text>
                {bt.start} → {bt.end}
              </Text>
              {onRemoveBlockedTime && (
                <TouchableOpacity onPress={() => onRemoveBlockedTime(index)}>
                  <Text style={{ color: 'red' }}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </>
      )}
    </View>
  );
};

export default BlockedCalendar;
