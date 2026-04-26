// notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

export async function registerForPushNotifications() {
	console.log('reached here')
	if (!Device.isDevice) {
	  console.log('Must use physical device');
	  return null;
	}
  
	const { status: existingStatus } = await Notifications.getPermissionsAsync();
	let finalStatus = existingStatus;
  
	if (existingStatus !== 'granted') {
	  const { status } = await Notifications.requestPermissionsAsync();
	  finalStatus = status;
	}
  
	if (finalStatus !== 'granted') {
	  console.log('Permission not granted');
	  return null;
	}
  
	// ADDED THIS PROJECTID SINCE LAST UPDATE TO FIX NOTIFICATIONS
	// CHECK FOR THE TOKEN IN THE USER DOC
	const projectId = Constants.expoConfig?.extra?.eas?.projectId; 
	if (!projectId) return null; 
	const tokenData = await Notifications.getExpoPushTokenAsync({ projectId, });
	return tokenData.data;
  
}