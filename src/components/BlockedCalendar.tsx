import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';

type BlockedTime = { start: string; end: string };

type ReservedTime = {
  end: any;
  start: any;
  startDate: any; // Firestore Timestamp
  endDate: any;
  renterId: string;
  reservationId: string;
};
  
interface BlockedCalendarProps {
	blockedTimes: BlockedTime[];
  reservedTimes?: ReservedTime[]; 
	onAddBlockedTime?: (time: BlockedTime) => void;
	onRemoveBlockedTime?: (index: number) => void;
	onSelectRange?: (range: { start: Date | null; end: Date | null }) => void;
	editable?: boolean;
  singleSelect?: boolean;

}


  const BlockedCalendar: React.FC<BlockedCalendarProps> = ({
    blockedTimes,
    reservedTimes = [],
    onAddBlockedTime,
    onRemoveBlockedTime,
    onSelectRange,  
    editable = false,
    singleSelect
  }) => {
    const [rangeStart, setRangeStart] = useState<string | null>(null);
    const [rangeEnd, setRangeEnd] = useState<string | null>(null);
    const [isOpenEnded, setIsOpenEnded] = useState(false);
    const [needsEndDateWarning, setNeedsEndDateWarning] = useState(false); // <-- new state

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

    // Normalize reservedTimes to BlockedTime shape
    const normalizedReservedTimes: BlockedTime[] = reservedTimes.map(rt => ({
      start:
        typeof rt.start === 'string'
          ? rt.start
          : rt.startDate.toDate().toISOString().split('T')[0],
      end:
        typeof rt.end === 'string'
          ? rt.end
          : rt.endDate.toDate().toISOString().split('T')[0],
    }));

  
    // Merge blocked + reserved
    const allBlockedTimes: BlockedTime[] = [
      ...blockedTimes,
      ...normalizedReservedTimes,
    ];  
    // Build marked dates
    const markedDates = allBlockedTimes.reduce((acc, bt) => {
      const range = getRangeDates(bt.start, bt.end);
      range.forEach((date, idx) => {
        acc[date] = {
          startingDay: idx === 0,
          endingDay: idx === range.length - 1,
          color: '#FF6B6B', // red = unavailable
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
          color: '#FFBA00', // blue = currently selecting
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
              fontSize: 30,          // 👈 bigger arrows
              color: '#FFBA00',      // 👈 same yellow
              fontWeight: '900',
              paddingHorizontal: 10,
            }}
          >
            {direction === 'left' ? '‹' : '›'}
          </Text>
        )}

        // onDayPress={(day) => {
        //   const selectedDate = day.dateString;
        
        //   // ✅ SINGLE-DAY MODE (Change End Date)
        //   if (singleSelect) {
        //     const isBlocked = allBlockedTimes.some(bt => {
        //       const dates = getRangeDates(bt.start, bt.end);
        //       return dates.includes(selectedDate);
        //     });
        
        //     if (isBlocked) {
        //       Alert.alert('Blocked Date', 'This date is unavailable.');
        //       return;
        //     }
        
        //     setRangeStart(selectedDate);
        //     setRangeEnd(selectedDate);
        //     onSelectRange?.({
        //       start: null,
        //       end: new Date(selectedDate),
        //     });
        //     return;
        //   }
        
        //   // ⬇️ EXISTING RANGE LOGIC (unchanged)
        //   if (rangeStart && rangeEnd) {
        //     setRangeStart(day.dateString);
        //     setRangeEnd(null);
        //     setIsOpenEnded(true);
        //     onSelectRange?.({ start: new Date(day.dateString), end: null });
        //     return;
        //   }
        
        //   if (!rangeStart) {
        //     setRangeStart(day.dateString);
        //     setRangeEnd(null);
        //     setIsOpenEnded(true);
        //     onSelectRange?.({ start: new Date(day.dateString), end: null });
        //     return;
        //   }
        
        //   if (!rangeEnd) {
        //     let start = rangeStart;
        //     let end = day.dateString;
        
        //     if (end < start) [start, end] = [end, start];
        
        //     const tempRange = getRangeDates(start, end);
        //     const overlapsBlocked = tempRange.some(
        //       date => markedDates[date]?.color === '#FF6B6B'
        //     );
        
        //     if (overlapsBlocked) {
        //       Alert.alert('Blocked Date', 'Your selected range overlaps a blocked date.');
        //       setRangeStart(null);
        //       setRangeEnd(null);
        //       setIsOpenEnded(false);
        //       onSelectRange?.({ start: null, end: null });
        //       return;
        //     }
        
        //     setRangeStart(start);
        //     setRangeEnd(end);
        //     setIsOpenEnded(false);
        //     onSelectRange?.({ start: new Date(start), end: new Date(end) });
        //   }
        // }}
        
        onDayPress={(day) => {
          const selectedDate = day.dateString;

          const isBlocked = allBlockedTimes.some(bt => {
            const dates = getRangeDates(bt.start, bt.end);
            return dates.includes(selectedDate);
          });

          if (isBlocked) {
            Alert.alert('Blocked Date', 'This date is unavailable.');
            return;
          }

          setRangeStart(selectedDate);
          setRangeEnd(null);

          onSelectRange?.({
            start: new Date(selectedDate),
            end: null, // always null
          });
        }}



      />

      {editable && !singleSelect && (
        <>

          <TouchableOpacity
            style={{ padding: 10, backgroundColor: '#eee', marginTop: 10 }}
            onPress={() => {
              if (!rangeStart || !rangeEnd) {
                Alert.alert('Invalid range', 'Please select a start and end date.');
                return;
              }

              const newRangeDates = getRangeDates(rangeStart, rangeEnd);

              // Check for overlap with existing blockedTimes + reservedTimes
              const allBlockedTimes: BlockedTime[] = [...blockedTimes, ...reservedTimes];
              const overlap = allBlockedTimes.some(bt => {
                const btDates = getRangeDates(bt.start, bt.end);
                return newRangeDates.some(d => btDates.includes(d));
              });

              if (overlap) {
                Alert.alert('Overlap', 'Your selected range overlaps an existing blocked or reserved time.');
                return;
              }

              // Safe to add
              onAddBlockedTime?.({ start: rangeStart, end: rangeEnd });
              setRangeStart(null);
              setRangeEnd(null);
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
