import React, { useState } from 'react';
// import { loginWithEmail } from 'src/firebase/firebaseAuth';
import { auth } from '../../firebase/config'; // from our config file. 
import { signInWithEmailAndPassword } from 'firebase/auth';
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

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');




  const handleLogin = async () => {
    setErrorMessage(''); // Reset error
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Logged in:', userCredential.user);
      // Navigate to a different screen or show success UI if needed
    } catch (error: any) {
  
      // Firebase error handling
      switch (error.code) {
        case 'auth/invalid-email':
          setErrorMessage('The email address is not valid.');
          break;
        case 'auth/user-disabled':
          setErrorMessage('This user has been disabled.');
          break;
        case 'auth/user-not-found':
          setErrorMessage('No account found with this email.');
          break;
        case 'auth/wrong-password':
          setErrorMessage('Incorrect password.');
          break;
        default:
          setErrorMessage('Login failed. Please try again.');
      }
    }
  };
  



  return (
    <View style={styles.container}>

      {/* Title */}
      <Text style={styles.title}>Log in</Text>

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

      {/* Password Input */}

      <Text style={styles.label}>Password</Text>
      {/* <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={password}
          onChangeText={setPassword}
          placeholder="********"
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color="gray"
          />
        </TouchableOpacity>
      </View> */}


{/* Password Input */}
{/* <Text style={styles.label}>Password</Text> */}
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



      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}






      {/* Log In Button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Log In</Text>
      </TouchableOpacity>

      {/* Forgot Password */}
      <Text
        style={styles.forgotPassword}
        onPress={() => navigation.navigate('ForgotPassword')}
      >
        Forgot password?
      </Text>

      {/* Footer */}
      <Text style={styles.footer}>
        Don’t have an account?{' '}
        <Text
          style={styles.signupText}
          onPress={() => navigation.navigate('CreateAccount')}
        >
          Sign up
        </Text>
      </Text>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFFCF1', // Wheat/Cream background for warmth and consistency
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
    color: '#0F6B5B', // Emerald Green for headlines
    fontFamily: 'Poppins-Bold',
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
    color: '#1F1F1F', // Near black for body text readability
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


passwordContainer: {
  width: '100%', // full width like email input
  position: 'relative', // for absolute positioning of the eye icon
  marginBottom: 16,
},
passwordInput: {
  width: '100%',          // full width
  padding: 12,
  paddingRight: 40,       // make space for the eye icon
  borderWidth: 1,
  borderColor: '#DDD',
  borderRadius: 8,
  backgroundColor: '#FFF',
  fontSize: 16,
  fontFamily: 'Poppins-Regular',
},
eyeIcon: {
  position: 'absolute',
  right: 12,
  top: '50%',
  transform: [{ translateY: -13 }], // vertically center
  padding: 4, // increases touch area
},



  forgotPassword: {
    alignSelf: 'center',
    marginBottom: 0,
    color: '#F3AF1D', // Mustard Yellow for CTA highlight
    // fontWeight: '600',
    // fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  loginButton: {
    backgroundColor: '#0F6B5B', // Emerald Green primary button
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  loginText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
  },
  footer: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: '#555',
    fontFamily: 'Poppins-Regular',
  },
  signupText: {
    color: '#F3AF1D', // Mustard Yellow accent for signup text
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  errorText: {
    color: '#F44336', // Use a consistent, accessible red tone
    marginBottom: 12,
    textAlign: 'left',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
});




