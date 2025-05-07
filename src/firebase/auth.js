import auth from '@react-native-firebase/auth';

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';






// google sign in configuration and function
GoogleSignin.configure({
  webClientId: '77403695391-b86sqo60ehguuo54g6l7pmoomjd304q1.apps.googleusercontent.com', // From Firebase console
});

export const loginWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const { idToken } = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const userCredential = await auth().signInWithCredential(googleCredential);
    return userCredential.user;
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
};

// sign-in facebook configuration and function

export const loginWithFacebook = async () => {
  try {
    const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

    if (result.isCancelled) {
      throw 'User cancelled the login process';
    }

    const data = await AccessToken.getCurrentAccessToken();

    if (!data) {
      throw 'Something went wrong obtaining access token';
    }

    const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);
    const userCredential = await auth().signInWithCredential(facebookCredential);
    return userCredential.user;
  } catch (error) {
    console.error('Facebook login error:', error);
    throw error;
  }
};



// Sign up with email
export const signUpWithEmail = async (email, password) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Sign up error:", error);
    throw error;
  }
};

// Log in with email
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Log out
export const logout = async () => {
  try {
    await auth().signOut();
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};
