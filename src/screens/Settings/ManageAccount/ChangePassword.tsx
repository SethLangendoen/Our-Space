

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { auth } from '../../../firebase/config';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  // Check if passwords match
  useEffect(() => {
    setPasswordsMatch(newPassword === confirmPassword);
  }, [newPassword, confirmPassword]);

  // Check password strength
  useEffect(() => {
    const strength = calculateStrength(newPassword);
    setPasswordStrength(strength);
  }, [newPassword]);

  const calculateStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    if (password.length < 6) return 'weak';
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    const conditionsMet = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

    if (conditionsMet <= 2) return 'weak';
    if (conditionsMet === 3) return 'medium';
    return 'strong';
  };

  const handleChange = async () => {
    const user = auth.currentUser;
    if (!user || !user.email) return;

    if (!passwordsMatch) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }

    if (passwordStrength === 'weak') {
      Alert.alert("Error", "Password is too weak. Include uppercase, number, and special character.");
      return;
    }

    setLoading(true);

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);
      Alert.alert("Success", "Password updated successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/wrong-password') {
        Alert.alert("Error", "Current password is incorrect.");
      } else if (error.code === 'auth/requires-recent-login') {
        Alert.alert("Error", "Please log in again and try.");
      } else {
        Alert.alert("Error", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Current Password"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
        style={styles.input}
      />

      <TextInput
        placeholder="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        style={styles.input}
      />
      <Text style={[styles.feedback, passwordStrength === 'weak' && { color: 'red' },
                                  passwordStrength === 'medium' && { color: 'orange' },
                                  passwordStrength === 'strong' && { color: 'green' }]}>
        Password strength: {passwordStrength}
      </Text>

      <TextInput
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
      />
      {!passwordsMatch && confirmPassword.length > 0 && (
        <Text style={[styles.feedback, { color: 'red' }]}>Passwords do not match</Text>
      )}

      <TouchableOpacity
        onPress={handleChange}
        disabled={loading}
        style={[styles.button, loading && { opacity: 0.6 }]}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Updating...' : 'Change Password'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  feedback: {
    fontSize: 13,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#0F6B5B',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});