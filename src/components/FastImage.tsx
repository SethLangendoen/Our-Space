// // src/components/FastImage.tsx
// import React from 'react';
// import { StyleProp, ImageStyle } from 'react-native';
// import { Image } from 'expo-image';

// // src/components/FastImage.tsx
// interface FastImageProps {
// 	uri: string | undefined | null;
// 	style?: StyleProp<ImageStyle>;
// 	placeholder?: any; // local image for placeholder
// 	resizeMode?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
// }

// const FastImage: React.FC<FastImageProps> = ({
//   uri,
//   style,
//   placeholder,
//   resizeMode = 'cover',
// }) => {
//   if (!uri) {
//     // fallback if uri is missing
//     return placeholder ? <Image source={placeholder} style={style} contentFit={resizeMode} /> : null;
//   }

//   return (
//     <Image
//       source={{ uri }}
//       style={style}
//       contentFit={resizeMode}
//       placeholder={placeholder}
//       cachePolicy="memory-disk" // caches in memory + disk
//     />
//   );
// };

// export default FastImage;