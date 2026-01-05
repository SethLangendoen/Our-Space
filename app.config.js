import 'dotenv/config'; 

export default {
  expo: {
    name: "OurSpaceExpo",
    slug: "OurSpaceExpo",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.slangend.OurSpaceExpo",
      // Fixes the encryption warning from your previous build attempt
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        GMSApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.slangend.OurSpaceExpo",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      // 1. ADDED: Build properties to resolve Stripe Pod conflicts
      [
        "expo-build-properties",
        {
          "ios": {
            "deploymentTarget": "15.1",
            "useFrameworks": "static"
          }
        }
      ],
      // 2. Your existing Stripe plugin
      [
        "@stripe/stripe-react-native",
        {
          merchantIdentifier: "merchant.com.ourspaceexpo",
          enableGooglePay: true,
        },
      ],
      "expo-web-browser",
      "expo-font",
      "expo-asset",
    ],
    extra: {
      GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      eas: {
        projectId: "d75f2f2b-5e31-48e1-b51a-f0efc294ea0e"
      }
    }
  }
};