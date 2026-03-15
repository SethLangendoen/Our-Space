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
import { COLORS } from '../Styles/theme';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from 'src/firebase/config';

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

  const handlePasswordReset = async () => {
    if (!email) {
      alert('Please enter your email.');
      return;
    }
  
    setLoading(true);
  
    try {
      await sendPasswordResetEmail(auth, email);
      alert(`Password reset email sent to ${email}. Check your inbox.`);
      setEmail(''); // clear input
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/user-not-found') {
        alert('No account found with that email.');
      } else if (error.code === 'auth/invalid-email') {
        alert('Please enter a valid email address.');
      } else {
        alert('Error sending password reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Arrow */}
      {/* <Pressable style={styles.backIcon} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={28} color="#334E35" />
      </Pressable> */}

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
      <TouchableOpacity 
        style={styles.resetButton} 
        onPress={handlePasswordReset} 
        disabled={loading || !email.trim()}
      >
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
    backgroundColor: COLORS.lighterGrey,
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
    color: '#0F6B5B', // Emerald Green headline
    fontFamily: 'Poppins-Bold',
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
    color: '#1F1F1F', // Dark text for readability
    fontFamily: 'Poppins-Regular',
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  resetButton: {
    backgroundColor: '#0F6B5B', // Emerald Green primary CTA
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  resetText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-Bold',
  },
  footer: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: '#555',
    fontFamily: 'Poppins-Regular',
  },
  loginText: {
    color: '#F3AF1D', // Mustard Yellow for accents
    fontWeight: '500',
    fontFamily: 'Poppins-SemiBold',
  },
});
