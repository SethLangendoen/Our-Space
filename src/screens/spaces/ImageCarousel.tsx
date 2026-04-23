import React, { useRef, useState } from 'react';
import {
  View,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import ImageViewing from 'react-native-image-viewing';

const { width: screenWidth } = Dimensions.get('window');

type ImageCarouselProps = {
  images: string[];
};

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const flatListRef = useRef<FlatList<string>>(null);
  const dotSize = 8;
  const dotMargin = 4;
  
  const paginationWidth = images.length * (dotSize + dotMargin * 2); // total width of dots
  const paginationContainerStyle: StyleProp<ViewStyle> = {
    position: 'absolute',
    bottom: 10,
    left: '50%', // string % is fine
    transform: [{ translateX: (-paginationWidth / 2) - 20}],
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 4,
    borderRadius: 10,
  };
  if (!images || images.length === 0) return null;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / screenWidth
    );
    setActiveIndex(index);
  };

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => setIsViewerVisible(true)}
    >
      <Image source={{ uri: item }} style={styles.image} />
    </TouchableOpacity>
  );

  return (
    <View style={{ width: screenWidth }}>
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {/* Pagination Dots */}
      {images.length > 1 && (
      <View style={paginationContainerStyle}>
      {images.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === activeIndex ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>

      )}

      {/* Fullscreen Viewer */}
      <ImageViewing
        images={images.map((uri) => ({ uri }))}
        imageIndex={activeIndex}
        visible={isViewerVisible}
        onRequestClose={() => setIsViewerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: screenWidth,
    height: 200,
    resizeMode: 'cover',
    paddingRight: 40
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,

  },
  activeDot: {
    backgroundColor: '#ffba00',
  },
  inactiveDot: {
    backgroundColor: '#ccc',
  },
});