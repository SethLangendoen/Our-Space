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

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}


      {/* Forgot Password */}
      <Text
        style={styles.forgotPassword}
        onPress={() => navigation.navigate('ForgotPassword')}
      >
        Forgot password?
      </Text>

      {/* Log In Button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Log In</Text>
      </TouchableOpacity>

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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    color: '#6A5ACD',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  loginText: {
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
  signupText: {
    color: '#6A5ACD',
    fontWeight: '500',
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'left',
    fontSize: 14,
  },
  
});









// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Pressable,
// } from 'react-native';

// import { useNavigation } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { loginWithEmail } from '../../firebase/auth'; // ✅ make sure path is correct

// type AuthStackParamList = {
//   CreateAccount: undefined;
//   Login: undefined;
//   ForgotPassword: undefined;
// };

// type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

// export default function LoginScreen() {
//   const navigation = useNavigation<LoginScreenNavigationProp>();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [errorMsg, setErrorMsg] = useState('');

//   const handleLogin = async () => {
//     try {

//       // causing an error. 
//       // const user = await loginWithEmail(email, password);
//       // console.log('Logged in as:', user.email);

//       setErrorMsg('');
//       // ✅ Navigate to home screen or dashboard
//       // navigation.navigate('Home'); // Uncomment and update with your route name
//     } catch (error) {
//       if (error instanceof Error) {
//         setErrorMsg(error.message);
//       } else {
//         setErrorMsg('Unexpected login error.');
//       }
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Pressable style={styles.backIcon} onPress={() => navigation.goBack()}>
//         <Ionicons name="chevron-back" size={28} color="#334E35" />
//       </Pressable>

//       <Text style={styles.title}>Log in</Text>

//       <Text style={styles.label}>Email</Text>
//       <TextInput
//         style={styles.input}
//         value={email}
//         onChangeText={setEmail}
//         placeholder="you@example.com"
//         keyboardType="email-address"
//         autoCapitalize="none"
//       />

//       <Text style={styles.label}>Password</Text>
//       <View style={styles.passwordContainer}>
//         <TextInput
//           style={[styles.input, { flex: 1 }]}
//           value={password}
//           onChangeText={setPassword}
//           placeholder="********"
//           secureTextEntry={!showPassword}
//         />
//         <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//           <Ionicons
//             name={showPassword ? 'eye-off' : 'eye'}
//             size={20}
//             color="gray"
//           />
//         </TouchableOpacity>
//       </View>

//       {/* 🔴 Error message */}
//       {errorMsg !== '' && <Text style={{ color: 'red', marginBottom: 10 }}>{errorMsg}</Text>}

//       <Text
//         style={styles.forgotPassword}
//         onPress={() => navigation.navigate('ForgotPassword')}
//       >
//         Forgot password?
//       </Text>

//       <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
//         <Text style={styles.loginText}>Log In</Text>
//       </TouchableOpacity>

//       <Text style={styles.footer}>
//         Don’t have an account?{' '}
//         <Text
//           style={styles.signupText}
//           onPress={() => navigation.navigate('CreateAccount')}
//         >
//           Sign up
//         </Text>
//       </Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 24,
//     backgroundColor: '#fff',
//   },
//   backIcon: {
//     position: 'absolute',
//     top: 20,
//     left: 20,
//     zIndex: 1,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: '700',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 14,
//     marginBottom: 6,
//     fontWeight: '500',
//   },
//   input: {
//     padding: 12,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     marginBottom: 16,
//   },
//   passwordContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   forgotPassword: {
//     alignSelf: 'flex-end',
//     marginBottom: 20,
//     color: '#6A5ACD',
//     fontWeight: '500',
//   },
//   loginButton: {
//     backgroundColor: '#000',
//     padding: 16,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   loginText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   footer: {
//     textAlign: 'center',
//     marginTop: 20,
//     fontSize: 14,
//     color: '#555',
//   },
//   signupText: {
//     color: '#6A5ACD',
//     fontWeight: '500',
//   },
// });
