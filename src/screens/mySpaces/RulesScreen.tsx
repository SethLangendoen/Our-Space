
// src/screens/mySpaces/RulesScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MySpacesStackParamList } from 'src/types/types';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from 'src/firebase/config';

type Rule = {
  id: string;
  text: string;
};

type Props = NativeStackScreenProps<MySpacesStackParamList, 'RulesScreen'>;

export default function RulesScreen({ navigation, route }: Props) {
  const { reservationId, role } = route.params;

  // Define rules for each role
  const ownerRules: Rule[] = [
    { id: '1', text: 'Check the space for cleanliness before confirming.' },
    { id: '2', text: 'Ensure payment terms are clear with requester.' },
    { id: '3', text: 'Confirm the reservation dates are correct.' },
  ];

  const requesterRules: Rule[] = [
    { id: '1', text: 'Read and agree to the host rules before confirming.' },
    { id: '2', text: 'Ensure payment method is valid and ready.' },
    { id: '3', text: 'Check reservation dates are correct.' },
  ];

  const rules = role === 'owner' ? ownerRules : requesterRules;

  const [checkedRules, setCheckedRules] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleRule = (id: string) => {
    if (checkedRules.includes(id)) {
      setCheckedRules(checkedRules.filter(r => r !== id));
    } else {
      setCheckedRules([...checkedRules, id]);
    }
  };

  const generateSecurityCode = () =>
  Math.floor(1000 + Math.random() * 9000).toString();


  const handleConfirm = async () => {
    if (checkedRules.length !== rules.length) {
      Alert.alert('Please check all rules before proceeding.');
      return;
    }

    setLoading(true);

    try {
      const reservationRef = doc(db, 'reservations', reservationId);

      if (role === 'owner') {
        // Owner confirms: update status to awaiting_acceptance

        await updateDoc(reservationRef, {
          status: 'awaiting_acceptance',
          updatedAt: serverTimestamp(),
        });


        Alert.alert('Success', 'Reservation confirmed! Waiting for requester to accept.');
      
	
	} else {
		// Requester confirms: finalize booking
	  
		const reservationRef = doc(db, 'reservations', reservationId);
		const snap = await getDoc(reservationRef);
	  
		if (!snap.exists()) {
		  throw new Error('Reservation not found');
		}
	  
		const reservation = snap.data();
	  
		const updateData: any = {
		  status: 'confirmed',
		  lastPaymentDate: null,
		  nextPaymentDate: reservation.startDate,
		  isProcessing: false,
		  updatedAt: serverTimestamp(),
		};
	  
		// Only create security if it doesn't exist
		if (!reservation.security) {
		  updateData.security = {
			code: generateSecurityCode(),
			codeVerified: false,
			photoUrl: null,
			photoUploaded: false,
			completed: false,
		  };
		}
	  
		await updateDoc(reservationRef, updateData);
	  
		Alert.alert('Success', 'Booking finalized and confirmed!');
	  }
	  


      // Navigate back to RequestDetailScreen after confirming
      navigation.navigate('RequestDetailScreen', { reservationId });
    } catch (err) {
      console.error('Failed to update reservation status', err);
      Alert.alert('Error', 'Failed to update reservation status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {role === 'owner' ? 'Host Rules & Regulations' : 'Requester Rules & Regulations'}
      </Text>

      {rules.map(rule => (
        <View key={rule.id} style={styles.ruleRow}>
          <Text
            style={[
              styles.checkbox,
              checkedRules.includes(rule.id) && styles.checkedBox
            ]}
            onPress={() => toggleRule(rule.id)}
          >
            {checkedRules.includes(rule.id) ? '✓' : ''}
          </Text>
          <Text style={styles.ruleText}>{rule.text}</Text>
        </View>
      ))}

      <TouchableOpacity
        style={[
          styles.confirmButton,
          checkedRules.length !== rules.length && styles.disabledButton
        ]}
        onPress={handleConfirm}
        disabled={checkedRules.length !== rules.length || loading}
      >
        <Text style={styles.confirmButtonText}>
          {role === 'owner' ? 'Confirm Reservation' : 'Finalize Booking'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFCF1', // Wheat/Cream
    flexGrow: 1,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
    color: '#0F6B5B',
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#0F6B5B',
    borderRadius: 4,
    marginRight: 12,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: 'bold',
  },
  checkedBox: {
    backgroundColor: '#0F6B5B',
    color: '#FFF',
  },
  ruleText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    flexShrink: 1,
  },
  confirmButton: {
    backgroundColor: '#0F6B5B',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 30,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
