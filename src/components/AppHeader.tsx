

// // // import { View, TouchableOpacity, Image } from 'react-native';
// // // import React from 'react';
// // // import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// // // type AppHeaderProps = {
// // //   navigation: NativeStackNavigationProp<any>; 
// // // };

// // // export default function AppHeader({ navigation }: AppHeaderProps) {
// // //   const canGoBack = navigation.canGoBack();

// // //   return (
// // //     <View
// // //       style={{
// // //         flexDirection: 'row',
// // //         alignItems: 'center',
// // //         justifyContent: 'space-between',
// // //         height: 90,
// // //         paddingTop: 40,
// // //         paddingHorizontal: 15,
// // //         backgroundColor: 'white', // optional
// // //       }}
// // //     >
// // //       {/* Left: Back button */}
// // //       {canGoBack ? (
// // //         <TouchableOpacity onPress={() => navigation.goBack()}>
// // //           <Image
// // //             source={require('../../assets/backArrow.png')}
// // //             style={{ width: 28, height: 28 }}
// // //             resizeMode="contain"
// // //           />
// // //         </TouchableOpacity>
// // //       ) : (
// // //         <View style={{ width: 28 }} /> // placeholder keeps spacing consistent
// // //       )}

// // //       {/* Center: Logo */}
// // //       <Image
// // //         source={require('../../assets/ourSpaceLogos/ourSpaceHorizontal.png')}
// // //         style={{ width: 220, height: 140 }} // bump up size
// // //         resizeMode="contain"
// // //       />

// // //       {/* Right: Spacer (balances the arrow on the left) */}
// // //       <View style={{ width: 28 }} />
// // //     </View>
// // //   );
// // // }

// // import { View, TouchableOpacity, Image, Text } from 'react-native';
// // import React from 'react';
// // import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// // import { useRoute } from '@react-navigation/native';

// // type AppHeaderProps = {
// //   navigation: NativeStackNavigationProp<any>; 
// // };

// // export default function AppHeader({ navigation }: AppHeaderProps) {
// //   const route = useRoute();
// //   const routeName = route.name;

// //   // Screens where we want the logo replaced with the title
// //   const titleScreens: string[] = ['Filters', 'SomeOtherScreen']; // add as needed
// //   const showTitleInsteadOfLogo = titleScreens.includes(routeName);

// //   // Determine if back button should show
// //   const hideBackButtonOnMainTabs = ['Spaces', 'Profile', 'Bookings'].includes(routeName); // main tab screens
// //   const showBackButton = navigation.canGoBack() && !hideBackButtonOnMainTabs;

// //   return (
// //     <View
// //       style={{
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         justifyContent: 'space-between',
// //         height: 90,
// //         paddingTop: 40,
// //         paddingHorizontal: 15,
// //         backgroundColor: 'white',
// //       }}
// //     >
// //       {/* Left: Back button */}
// //       {showBackButton ? (
// //         <TouchableOpacity onPress={() => navigation.goBack()}>
// //           <Image
// //             source={require('../../assets/backArrow.png')}
// //             style={{ width: 28, height: 28 }}
// //             resizeMode="contain"
// //           />
// //         </TouchableOpacity>
// //       ) : (
// //         <View style={{ width: 28 }} />
// //       )}

// //       {/* Center: Logo or title */}
// //       {showTitleInsteadOfLogo ? (
// //         <Text style={{ fontSize: 20, fontWeight: '600' }}>{routeName}</Text>
// //       ) : (
// //         <Image
// //           source={require('../../assets/ourSpaceLogos/ourSpaceHorizontal.png')}
// //           style={{ width: 220, height: 140 }}
// //           resizeMode="contain"
// //         />
// //       )}

// //       {/* Right: Spacer */}
// //       <View style={{ width: 28 }} />
// //     </View>
// //   );
// // }





// import { View, TouchableOpacity, Image, Text } from 'react-native';
// import React from 'react';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { useRoute } from '@react-navigation/native';

// type AppHeaderProps = {
//   navigation: NativeStackNavigationProp<any>;
// };

// export default function AppHeader({ navigation }: AppHeaderProps) {
//   const route = useRoute();
//   const routeName = route.name;
//   console.log(routeName); 

//   // Screens where the logo should be replaced with the screen title
//   const titleScreens: string[] = ['Filters', 'SpaceDetail', 'UserProfile', 'EditSpaceScreen', 'ConfirmedReservationScreen', 'MessagesScreen', 'EditProfile']; // add more screens as needed
//   const showTitleInsteadOfLogo = titleScreens.includes(routeName);

//   // Main tab screens where back button should never show
//   const mainTabScreens: string[] = ['SpacesMain', 'Profile', 'Bookings']; // adjust to your tab names
//   const showBackButton = navigation.canGoBack() && !mainTabScreens.includes(routeName);

//   return (
//     <View
//       style={{
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         height: 90,
//         paddingTop: 40,
//         paddingHorizontal: 15,
//         backgroundColor: 'white',
//       }}
//     >
//       {/* Left: Back button */}
//       {showBackButton ? (
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Image
//             source={require('../../assets/backArrow.png')}
//             style={{ width: 28, height: 28 }}
//             resizeMode="contain"
//           />
//         </TouchableOpacity>
//       ) : (
//         <View style={{ width: 28 }} /> // placeholder keeps spacing
//       )}

//       {/* Center: Logo or Title */}
//       {showTitleInsteadOfLogo ? (
//         <Text style={{ fontSize: 20, fontWeight: '600' }}>{routeName}</Text>
//       ) : (
//         <Image
//           source={require('../../assets/ourSpaceLogos/ourSpaceHorizontal.png')}
//           style={{ width: 220, height: 140 }}
//           resizeMode="contain"
//         />
//       )}

//       {/* Right: Spacer */}
//       <View style={{ width: 28 }} />
//     </View>
//   );
// }



import { View, TouchableOpacity, Image, Text } from 'react-native';
import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute } from '@react-navigation/native';

type AppHeaderProps = {
  navigation: NativeStackNavigationProp<any>;
  showSettings?: boolean; // 👈 new prop
};

export default function AppHeader({ navigation, showSettings }: AppHeaderProps) {
  const route = useRoute();
  const routeName = route.name;

  const titleScreens: string[] = [
    'Filters',
    'SpaceDetail',
    'UserProfile',
    'EditSpaceScreen',
    'ConfirmedReservationScreen',
    'MessagesScreen',
    'EditProfile',
  ];
  const showTitleInsteadOfLogo = titleScreens.includes(routeName);

  const mainTabScreens: string[] = ['SpacesMain', 'Profile', 'Bookings'];
  const showBackButton = navigation.canGoBack() && !mainTabScreens.includes(routeName);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 90,
        paddingTop: 40,
        paddingHorizontal: 15,
        backgroundColor: 'white',
      }}
    >
      {/* Left: Back button */}
      {showBackButton ? (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../../assets/backArrow.png')}
            style={{ width: 28, height: 28 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 28 }} />
      )}

      {/* Center: Logo or Title */}
      {showTitleInsteadOfLogo ? (
        <Text style={{ fontSize: 20, fontWeight: '600' }}>{routeName}</Text>
      ) : (
        <Image
          source={require('../../assets/ourSpaceLogos/ourSpaceHorizontal.png')}
          style={{ width: 220, height: 140 }}
          resizeMode="contain"
        />
      )}

      {/* Right: Settings or Spacer */}
      {showSettings ? (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('SettingsStack', { screen: 'SettingsScreen' })
          }
        >
          <Image
            source={require('../../assets/settings.png')}
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 28 }} />
      )}
    </View>
  );
}
