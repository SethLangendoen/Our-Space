import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { auth, db } from '../../../firebase/config';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { COLORS } from '../../Styles/theme';

const { width } = Dimensions.get('window');

const STEPS = [
  {
    image: 'https://via.placeholder.com/400x300',
    text: 'Welcome to renting. Here’s how to get started safely.',
  },
  {
    image: 'https://via.placeholder.com/400x300',
    text: 'Always review listings carefully before booking.',
  },
  {
    image: 'https://via.placeholder.com/400x300',
    text: 'Keep communication clear with hosts.',
  },
];

export default function RentersGuide({ navigation }: any) {
  const [step, setStep] = useState(0);

  const isLastStep = step === STEPS.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setStep((prev) => prev + 1);
    }
  };

  const handleDone = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      await updateDoc(doc(db, 'users', uid), {
        'onboarding.renter.guideComplete': true,
        'onboarding.renter.guideCompletedAt': serverTimestamp(),
      });

      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Could not complete guide.');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: STEPS[step].image }} style={styles.image} />

      <Text style={styles.text}>{STEPS[step].text}</Text>

      <View style={styles.footer}>
        <Text style={styles.progress}>
          {step + 1} / {STEPS.length}
        </Text>

        {!isLastStep ? (
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleDone}>
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },

  image: {
    width: width - 40,
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
  },

  text: {
    fontSize: 16,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 30,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  progress: {
    fontSize: 14,
    color: '#6B7280',
  },

  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});