


import React, { useEffect, useState } from 'react';
import { auth } from '../../firebase/config';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { signInWithGoogleCredential } from '../../firebase/firebaseAuth';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type AuthStackParamList = {
  CreateAccount: undefined;
  Login: undefined;
  ForgotPassword: undefined;
};

type CreateAccountScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'CreateAccount'
>;

export default function CreateAccountScreen() {
  const navigation = useNavigation<CreateAccountScreenNavigationProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: 'WEB_CLIENT_ID',        // Web client ID
    // NOTE: THIS NEEDS TO BE UPDATED PRIORT TO DOING THE STANDALONE BUILDS BEFORE PRODUCTION
    // iosClientId: '226890021802-8u66pgm0odjb294a4uvlb8vsuqm44l60.apps.googleusercontent.com',
    // androidClientId: '226890021802-d6p8jkg4udoap47ff5en9aijdho6081j.apps.googleusercontent.com',
  });
  

    // 2️⃣ Handle Google response
    useEffect(() => {
      if (response?.type === 'success') {
        const { id_token } = response.params;
        signInWithGoogleCredential(id_token)
          .then((user) => {
            console.log('Signed in with Google:', user);
            // TODO: Navigate to app's main screen
          })
          .catch((err) => console.error(err));
      }
    }, [response]);

  const validatePassword = (pwd: string) => {
    const minLength = pwd.length >= 8;
    const hasNumberOrSymbol = /[0-9!@#$%^&*(),.?":{}|<>]/.test(pwd);
    return minLength && hasNumberOrSymbol;
  };

  const handleCreateAccount = async () => {
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!validatePassword(password)) {
      setErrorMessage(
        'Password must be at least 8 characters and include a number or symbol.'
      );
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Account created:', user);

      if (user) {
        await sendEmailVerification(user);
        setErrorMessage('A verification email has been sent. Please check your inbox.');
        await signOut(auth);
      }
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('An account already exists with this email.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('The email address is not valid.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('Password should be at least 6 characters.');
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#FFFCF1' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>

          {/* Title */}
          <Text style={styles.title}>Create account</Text>

          {/* Google Sign Up */}
          {/* <TouchableOpacity style={styles.authButton}>
            <Ionicons name="logo-google" size={20} color="black" />
            <Text style={styles.authText}>Sign up with Google</Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            style={styles.authButton}
            disabled={!request}
            onPress={() => {
              promptAsync();
            }}
          >
            <Ionicons name="logo-google" size={20} color="black" />
            <Text style={styles.authText}>Sign up with Google</Text>
          </TouchableOpacity>

          {/* Facebook Sign Up */}
          <TouchableOpacity style={styles.authButton}>
            <Ionicons name="logo-facebook" size={20} color="#1877F2" />
            <Text style={styles.authText}>Sign up with Facebook</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.line} />
          </View>

          {/* Email Input */}
          <Text style={styles.label}>Email*</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password Input */}
          <Text style={styles.label}>Password*</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="********"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color="gray"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm Password*</Text>
          <TextInput
            style={styles.passwordInput}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="********"
            secureTextEntry
          />

          {/* Password rules (real-time) */}
          {password.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  color: password.length >= 8 ? 'green' : 'red',
                  fontSize: 12,
                }}
              >
                • At least 8 characters
              </Text>
              <Text
                style={{
                  color: /[0-9!@#$%^&*(),.?":{}|<>]/.test(password)
                    ? 'green'
                    : 'red',
                  fontSize: 12,
                }}
              >
                • Includes a number or symbol
              </Text>
              <Text
                style={{
                  color:
                    confirmPassword.length > 0 && password === confirmPassword
                      ? 'green'
                      : 'red',
                  fontSize: 12,
                }}
              >
                • Passwords match
              </Text>
            </View>
          )}

          {errorMessage !== '' && (
            <Text style={{ color: 'red', marginBottom: 12 }}>{errorMessage}</Text>
          )}

          {/* Create Account Button */}
          <TouchableOpacity style={styles.createButton} onPress={handleCreateAccount}>
            <Text style={styles.createText}>Create Account</Text>
          </TouchableOpacity>

          {/* Footer */}
          <Text style={styles.footer}>
            Already have an account?{' '}
            <Text
              style={styles.loginText}
              onPress={() => navigation.navigate('Login')}
            >
              Log in
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFCF1',
  },
  backIcon: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#0F6B5B',
    fontFamily: 'Poppins-Bold',
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'white',
    marginBottom: 12,
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  authText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#CCC',
  },
  orText: {
    marginHorizontal: 12,
    color: '#999',
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
    color: '#1F1F1F',
    fontFamily: 'Poppins-Regular',
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#FFF',
  },
  passwordContainer: {
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 16,
  },
  passwordInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#FFF',
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
  },
  createButton: {
    backgroundColor: '#0F6B5B',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 35,
  },
  createText: {
    color: '#fff',
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
    color: '#F3AF1D',
    fontWeight: '500',
    fontFamily: 'Poppins-SemiBold',
  },
});
