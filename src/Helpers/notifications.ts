// notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// export async function registerForPushNotifications() {
// 	console.log('reached here')
// 	// if (!Device.isDevice) {
// 	//   console.log('Must use physical device');
// 	//   return null;
// 	// }
  
// 	const { status: existingStatus } = await Notifications.getPermissionsAsync();
// 	let finalStatus = existingStatus;
// 	if (existingStatus !== 'granted') {
// 	  const { status } = await Notifications.requestPermissionsAsync();
// 	  finalStatus = status;
// 	}
  
// 	if (finalStatus !== 'granted') {
// 	  console.log('Permission not granted');
// 	  return null;
// 	}
  
// 	// Ok, I have confirmed that the code works and actually gets the correct projectId. 
// 	const projectId = Constants.expoConfig?.extra?.eas?.projectId; 
// 	console.log(projectId)
// 	if (!projectId) return null; 
// 	console.log('did not return')
// 	const tokenData = await Notifications.getExpoPushTokenAsync({ projectId, });
// 	console.log('made it here')
// 	console.log(tokenData)
// 	return tokenData.data;
  
// }

export async function registerForPushNotifications() {
	console.log('reached here');
  
	// if (!Device.isDevice) {
	//   console.log('Must use physical device');
	//   return null;
	// }
  
	// 👇 ADD IT HERE (before anything else)
	const perms = await Notifications.getPermissionsAsync();
	console.log('INITIAL PERMISSIONS:', perms);
  
	const { status: existingStatus } =
	  await Notifications.getPermissionsAsync();
  
	let finalStatus = existingStatus;
  
	if (existingStatus !== 'granted') {
	  const { status } =
		await Notifications.requestPermissionsAsync();
  
	  console.log('REQUESTED PERMISSION RESULT:', status);
  
	  finalStatus = status;
	}
  
	console.log('FINAL PERMISSION STATUS:', finalStatus);
  
	if (finalStatus !== 'granted') {
	  console.log('Permission not granted');
	  return null;
	}
  
	const projectId =
	  Constants.expoConfig?.extra?.eas?.projectId;
  
	console.log('projectId:', projectId);
  
	if (!projectId) return null;
  
	console.log('requesting token...');
  
	const tokenData =
	  await Notifications.getExpoPushTokenAsync({ projectId });
  
	console.log('TOKEN RESULT:', tokenData);
  
	return tokenData.data;
  }