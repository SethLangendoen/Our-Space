import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { auth } from '../../../firebase/config';
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState<
    'weak' | 'medium' | 'strong'
  >('weak');

  // Requirement tracking
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Check if passwords match
  useEffect(() => {
    setPasswordsMatch(newPassword === confirmPassword);
  }, [newPassword, confirmPassword]);

  // Check password strength + requirements
  useEffect(() => {
    const strength = calculateStrength(newPassword);
    setPasswordStrength(strength);

    setRequirements({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[!@#$%^&*]/.test(newPassword),
    });
  }, [newPassword]);

  const calculateStrength = (
    password: string
  ): 'weak' | 'medium' | 'strong' => {
    if (!password) return 'weak';

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    const hasLength = password.length >= 8;

    const conditionsMet = [
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      hasLength,
    ].filter(Boolean).length;

    if (conditionsMet <= 2) return 'weak';
    if (conditionsMet <= 4) return 'medium';
    return 'strong';
  };

  const handleChange = async () => {
    const user = auth.currentUser;
    if (!user || !user.email) return;

    if (!passwordsMatch) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    if (passwordStrength === 'weak') {
      Alert.alert(
        'Error',
        'Password is too weak. Please improve it before continuing.'
      );
      return;
    }

    setLoading(true);

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);

      Alert.alert('Success', 'Password updated successfully!');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error(error);

      if (error.code === 'auth/wrong-password') {
        Alert.alert('Error', 'Current password is incorrect.');
      } else if (error.code === 'auth/requires-recent-login') {
        Alert.alert('Error', 'Please log in again and try.');
      } else {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderRequirement = (label: string, met: boolean) => (
    <Text
      style={[
        styles.requirementText,
        { color: met ? '#0F6B5B' : '#999' },
      ]}
    >
      {met ? '✓' : '•'} {label}
    </Text>
  );

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

      {/* Only show once user starts typing */}
      {newPassword.length > 0 && (
        <View style={styles.passwordFeedbackBox}>
          <Text
            style={[
              styles.feedback,
              passwordStrength === 'weak' && styles.weak,
              passwordStrength === 'medium' && styles.medium,
              passwordStrength === 'strong' && styles.strong,
            ]}
          >
            Password strength: {passwordStrength}
          </Text>

          <View style={styles.requirementsContainer}>
            {renderRequirement('At least 8 characters', requirements.length)}
            {renderRequirement(
              'One uppercase letter',
              requirements.uppercase
            )}
            {renderRequirement(
              'One lowercase letter',
              requirements.lowercase
            )}
            {renderRequirement('One number', requirements.number)}
            {renderRequirement(
              'One special character (!@#$%^&*)',
              requirements.special
            )}
          </View>
        </View>
      )}

      <TextInput
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
      />

      {!passwordsMatch && confirmPassword.length > 0 && (
        <Text style={[styles.feedback, styles.errorText]}>
          Passwords do not match
        </Text>
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
  container: {
    padding: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#fff',
  },

  passwordFeedbackBox: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  feedback: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },

  weak: {
    color: 'red',
  },

  medium: {
    color: 'orange',
  },

  strong: {
    color: 'green',
  },

  requirementsContainer: {
    gap: 4,
  },

  requirementText: {
    fontSize: 13,
  },

  errorText: {
    color: 'red',
    marginBottom: 8,
  },

  button: {
    backgroundColor: '#0F6B5B',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});