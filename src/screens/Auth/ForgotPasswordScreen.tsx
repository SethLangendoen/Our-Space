import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Pressable,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type AuthStackParamList = {
  CreateAccount: undefined;
  Login: undefined;
  ForgotPassword: undefined;
};

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = () => {
    setLoading(true);
    // TODO: Add Firebase password reset logic here
    console.log('Password reset email sent to:', email);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* Back Arrow */}
      <Pressable style={styles.backIcon} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={28} color="#334E35" />
      </Pressable>

      {/* Logo */}
      {/* <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
      /> */}

      {/* Title */}
      <Text style={styles.title}>Forgot Password</Text>

      {/* Email Input */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Reset Password Button */}
      <TouchableOpacity style={styles.resetButton} onPress={handlePasswordReset} disabled={loading}>
        <Text style={styles.resetText}>
          {loading ? 'Sending...' : 'Reset Password'}
        </Text>
      </TouchableOpacity>

      {/* Footer */}
      <Text style={styles.footer}>
        Remembered your password?{' '}
        <Text
          style={styles.loginText}
          onPress={() => navigation.navigate('Login')}
        >
          Log in
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  backIcon: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  logo: {
    width: 64,
    height: 64,
    alignSelf: 'center',
    marginTop: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
  },
  resetButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: '#555',
  },
  loginText: {
    color: '#6A5ACD',
    fontWeight: '500',
  },
});
