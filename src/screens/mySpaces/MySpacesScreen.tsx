import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

type RootStackParamList = {
	MySpacesScreen: undefined;
	CreateSpaceScreen: undefined;
  };

  type MySpacesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MySpacesScreen'
>;
  

export default function MySpacesScreen() {
  const navigation = useNavigation<MySpacesScreenNavigationProp>();
  const [selectedTab, setSelectedTab] = useState<'Awaiting' | 'Ongoing' | 'Favourited'>('Ongoing');

  const renderContent = () => {
    switch (selectedTab) {
      case 'Awaiting':
        return <Text style={styles.message}>No awaiting posts</Text>;
      case 'Favourited':
        return <Text style={styles.message}>No favourited posts</Text>;
      default:
        return <Text style={styles.message}>No ongoing posts</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {['Awaiting', 'Ongoing', 'Favourited'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              selectedTab === tab && styles.activeTabButton,
            ]}
            onPress={() => setSelectedTab(tab as typeof selectedTab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateSpaceScreen')}
      >
        <Text style={styles.createButtonText}>Create Post</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
	container: {
	  flex: 1,
	  paddingTop: 30,
	  paddingHorizontal: 5,
	  justifyContent: 'space-between',
	},
	tabContainer: {
	  flexDirection: 'row',
	  justifyContent: 'space-around',
	  marginBottom: 20,
	},
	tabButton: {
	  paddingVertical: 10,
	  paddingHorizontal: 20,
	  borderRadius: 8,
	  borderWidth: 1,
	  borderColor: '#7b7b7b',
	  backgroundColor: 'transparent',
	},
	activeTabButton: {
	  backgroundColor: '#7b7b7b',
	},
	tabText: {
	  color: '#7b7b7b',
	  fontWeight: '500',
	},
	activeTabText: {
	  color: '#fff',
	},
	content: {
	  alignItems: 'center',
	  justifyContent: 'center',
	  flex: 1,
	},
	message: {
	  fontSize: 18,
	  color: '#666',
	},
	createButton: {
	  backgroundColor: '#000',
	  paddingVertical: 15,
	  borderRadius: 6,
	  alignItems: 'center',
	  marginBottom: 30,
	},
	createButtonText: {
	  color: '#fff',
	  fontSize: 16,
	  fontWeight: 'bold',
	},
  });
  
