
import 'dotenv/config';

export default {
  expo: {
    name: "OurSpaceExpo",
    slug: "OurSpaceExpo",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true, // Disable New Architecture for stability
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.slangend.OurSpaceExpo",
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY || "YOUR_FALLBACK_KEY"
      },
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSLocationWhenInUseUsageDescription:
          "OurSpace needs your location to show nearby spaces.",
        NSLocationAlwaysAndWhenInUseUsageDescription:
          "OurSpace needs your location to show nearby spaces.",
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
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_FALLBACK_KEY"
        },
      },
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-build-properties",
        {
          ios: {
            deploymentTarget: "15.1",
            useFrameworks: "static"
          }
        }
      ],

      // ✅ THIS is what actually installs Google Maps natively
      [
        // "react-native-maps",
        // {
        //   iosGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        // }
        "react-native-maps",
        {
          iosGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY || "YOUR_FALLBACK_KEY"
        }
      ],

      [
        "@stripe/stripe-react-native",
        {
          merchantIdentifier: "merchant.com.ourspaceexpo",
          enableGooglePay: true
        }
      ],

      "expo-web-browser",
      "expo-font",
      "expo-asset"
    ],
    extra: {
      GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_FALLBACK_KEY",
      GOOGLE_MAPS_IOS_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY || "YOUR_FALLBACK_KEY",
      GOOGLE_PLACES_KEY: process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY || "YOUR_FALLBACK_KEY",
      eas: {
        projectId: "d75f2f2b-5e31-48e1-b51a-f0efc294ea0e"
      }
    }
  }
};

