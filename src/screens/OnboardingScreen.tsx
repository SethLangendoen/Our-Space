



import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  SplashScreen: undefined;
  Onboarding: undefined;
  Auth: undefined;
  MainTabs: undefined;
};

type Slide = {
  key: string;
  title: string;
  description: string;
  image: any;
  isFinal?: boolean;
};

type OnboardingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Onboarding'
>;

const onboardingSlides: Slide[] = [
  {
    key: '1',
    title: 'Welcome to Our Space!',
    description: 'Discover the easiest way to store your stuff or earn from unused space - right in your neighbourhood',
    image: require('../../assets/Onboarding/onboarding1.webp'),
  },
  {
    key: '2',
    title: 'Find storage near you',
    description: 'Quickly search, compare, and book trusted spaces nearby.',
    image: require('../../assets/Onboarding/onboarding2.webp'),
  },
  {
    key: '3',
    title: 'Earn money from your unused space.',
    description: 'List your garage, basement, closet, shed and more - start earning in minutes.',
    image: require('../../assets/Onboarding/onboarding3.webp'),
  },
  {
    key: '4',
    title: 'Affordable, local, and personal.',
    description: 'No more overpriced, far-away storage units. OURSPACE brings the community together.',
    image: require('../../assets/Onboarding/onboarding5.webp'),
  },
  {
    key: '5',
    title: 'Secure and stress-free.',
    description: 'In-app messaging, payments, reviews, and insurance options keep everyone protected',
    image: require('../../assets/Onboarding/onboarding6.webp'),
  },
  {
    key: '6',
    title: 'Get started and earn a bonus.',
    description: 'List your first space or book storage to unlock launch rewards',
    image: require('../../assets/Onboarding/onboarding7.webp'),
  },
  {
    key: '7',
    title: 'You are all set!',
    description: 'Join the OURSPACE community and make storage simpler.',
    image: require('../../assets/Onboarding/onboarding8.webp'),
    isFinal: true,
  },
];

const OnboardingScreen = () => {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const flatListRef = useRef<FlatList<Slide>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const titleAnimations = useRef(onboardingSlides.map(() => new Animated.Value(0))).current;
  const descAnimations = useRef(onboardingSlides.map(() => new Animated.Value(0))).current;
  const buttonAnimations = useRef(onboardingSlides.map(() => new Animated.Value(0))).current;

  const animateSlideIn = (index: number) => {
    Animated.parallel([
      Animated.timing(titleAnimations[index], {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(descAnimations[index], {
        toValue: 1,
        duration: 500,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnimations[index], {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    animateSlideIn(currentIndex);
  }, [currentIndex]);

  

  const handleNext = () => {
    if (flatListRef.current && currentIndex < onboardingSlides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    }
  };



  const renderItem = ({ item, index }: { item: Slide; index: number }) => (
    <View style={styles.slide}>
      <View style={styles.topContent}>
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: titleAnimations[index],
              transform: [
                {
                  translateY: titleAnimations[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {item.title}
        </Animated.Text>

        <Animated.Text
          style={[
            styles.description,
            {
              opacity: descAnimations[index],
              transform: [
                {
                  translateY: descAnimations[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {item.description}
        </Animated.Text>

        <Image source={item.image} style={styles.image} />
      </View>

      <Animated.View
        style={[
          styles.buttonContainer,
          { opacity: buttonAnimations[index] },
        ]}
      >
        {item.isFinal ? (
          <>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Auth')}
            >
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.navigate('MainTabs')}
            >
              <Text style={styles.secondaryButtonText}>Explore First</Text>
            </TouchableOpacity>
          </>
        ) : index === 0 ? (
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );



  
  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={onboardingSlides}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      <View style={styles.dotsContainer}>
        {onboardingSlides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { opacity: i === currentIndex ? 1 : 0.3 },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default OnboardingScreen;









// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff' },
//   slide: {
//     width,
//     flex: 1,
//     paddingHorizontal: 30,
//     paddingVertical: 40,
//   },
//   topContent: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'flex-start',
//     paddingTop: 60,
//   },
//   title: {
//     fontSize: 40,
//     fontWeight: 'bold',
//     marginBottom: 12,
//     textAlign: 'center',
//   },
//   description: {
//     fontSize: 18,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 40,
//   },
//   image: {
//     width: width,
//     height: width,
//     resizeMode: 'contain',
//   },
//   buttonContainer: {
//     width: '100%',
//     marginBottom: 10,
//   },
//   button: {
//     backgroundColor: '#007bff',
//     paddingVertical: 15,
//     borderRadius: 10,
//     width: '100%',
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 18,
//   },
//   secondaryButton: {
//     backgroundColor: '#f0f0f0',
//     marginTop: 12,
//   },
//   secondaryButtonText: {
//     color: '#007bff',
//     fontWeight: 'bold',
//     fontSize: 18,
//   },
//   dotsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginBottom: 20,
//   },
//   dot: {
//     width: 10,
//     height: 10,
//     backgroundColor: '#007bff',
//     borderRadius: 5,
//     marginHorizontal: 6,
// 	marginBottom: 10
//   },
// });



const styles = StyleSheet.create({
	container: {
	  flex: 1,
	  backgroundColor: '#FFFCF1', // Wheat/Cream background
	},
	slide: {
	  width,
	  flex: 1,
	  paddingHorizontal: 30,
	  paddingVertical: 40,
	  justifyContent: 'space-between',
	},
	topContent: {
	  flex: 1,
	  alignItems: 'center',
	  justifyContent: 'flex-start',
	  paddingTop: 100,
	},
	title: {
	  fontSize: 46,
	  fontFamily: 'Poppins-Bold',
	  fontWeight: '700',
	  color: '#0F6B5B', // Emerald Green
	  marginBottom: 12,
	  textAlign: 'left',
	},
	description: {
	  fontSize: 20,
	  fontFamily: 'Poppins-bold',
	  fontWeight: '400',
	  color: '#1F1F1F', // Near-black for paragraph text
	  textAlign: 'left',
	  marginBottom: 0,
	  lineHeight: 24,
	},
	image: {
	  width: width,
	  height: width,
	  resizeMode: 'contain',
	  marginVertical: 0,	  
	},
	buttonContainer: {
	  width: '100%',
	  marginBottom: 20,
	},

	button: {
	  backgroundColor: '#0F6B5B', // Emerald Green
	  paddingVertical: 15,
	  borderRadius: 12,
	  alignItems: 'center',
	  width: '100%',
	  shadowColor: '#000',
	  shadowOffset: { width: 0, height: 2 },
	  shadowOpacity: 0.1,
	  shadowRadius: 3,
	  elevation: 3,
	},
	buttonText: {
	  fontSize: 16,
	  fontFamily: 'Poppins-Bold',
	  color: '#FFFFFF',
	  fontWeight: '600',
	},
	secondaryButton: {
	  backgroundColor: '#FFFFFF',
	  borderColor: '#0F6B5B',
	  borderWidth: 2,
	  paddingVertical: 15,
	  borderRadius: 12,
	  alignItems: 'center',
	  marginTop: 12,
	},
	secondaryButtonText: {
	  color: '#0F6B5B',
	  fontSize: 16,
	  fontFamily: 'Poppins-Bold',
	  fontWeight: '600',
	},
	dotsContainer: {
	  flexDirection: 'row',
	  justifyContent: 'center',
	  alignItems: 'center',
	  marginBottom: 30,
	},
	dot: {
	  width: 10,
	  height: 10,
	  backgroundColor: '#629447', // Earthy Green for progress dots
	  borderRadius: 5,
	  marginHorizontal: 6,
	  opacity: 0.4,
	},
  });
  