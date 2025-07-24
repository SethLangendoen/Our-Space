import React, { useState } from 'react';
// import { signUpWithEmail } from '../../firebase/auth';  // Adjust the path as needed

// we are attempting to create the function directly in thies file instead. 
import { auth } from '../../firebase/config'; // from our config file. 
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';



import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Pressable,
} from 'react-native';
// import { useNavigation } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type AuthStackParamList = {
  CreateAccount: undefined;
  Login: undefined;
  ForgotPassword: undefined;
};

type CreateAccountScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'CreateAccount'>;

export default function CreateAccountScreen() {
  // Use navigation with proper typing
  const navigation = useNavigation<CreateAccountScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');



  
  const handleCreateAccount = async () => {
    setErrorMessage(''); // Clear previous errors
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Account created:', user);
  
      if (user) {
        await sendEmailVerification(user);
        console.log('Verification email sent.');
        setErrorMessage('A verification email has been sent. Please check your inbox.');
  
        // Optional: Sign the user out until they verify
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
  

  // const handleCreateAccount = async () => {
  //   setErrorMessage(''); // Clear previous errors
  
  //   try {
  //     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  //     console.log('Account created:', userCredential.user);
  
  //     // Optionally, navigate or show success UI here
  //   } catch (error: any) {
  //     if (error.code === 'auth/email-already-in-use') {
  //       setErrorMessage('An account already exists with this email.');
  //     } else if (error.code === 'auth/invalid-email') {
  //       setErrorMessage('The email address is not valid.');
  //     } else if (error.code === 'auth/weak-password') {
  //       setErrorMessage('Password should be at least 6 characters.');
  //     } else {
  //       setErrorMessage('An unexpected error occurred. Please try again.');
  //     }
  //   }
  // };
  


  return (
    <View style={styles.container}>
      {/* Back Arrow */}
      <Pressable style={styles.backIcon} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={28} color="#334E35" />
      </Pressable>

      {/* Logo */}
      {/* <Image
        source={require('../../assets/logo.png')} // replace with actual path
        style={styles.logo}
      /> */}

      {/* Title */}
      <Text style={styles.title}>Create account</Text>

      {/* Google Sign Up */}
      <TouchableOpacity style={styles.authButton}>
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
      <View style={styles.passwordContainer}>
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
      </View>

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
          onPress={() => navigation.navigate('Login')} // Navigate to Login
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
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginBottom: 12,
    justifyContent: 'center',
  },
  authText: {
    marginLeft: 8,
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  orText: {
    marginHorizontal: 12,
    color: '#999',
    fontWeight: '500',
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  createText: {
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
