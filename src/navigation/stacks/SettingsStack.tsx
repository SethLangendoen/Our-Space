import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SettingsScreen from '../../screens/Settings/SettingsScreen';
import BillingAccount from '../../screens/Settings/BillingAccount';
import ChangePassword from '../../screens/Settings/ChangePassword';
import VerifyID from '../../screens/Settings/VerifyID';
import RequestForViews from '../../screens/Settings/RequestForViews';
import Earnings from '../../screens/Settings/Earnings';
import TermsAndConditions from '../../screens/Settings/TermsAndConditions';
import Version from '../../screens/Settings/Version';
import Language from '../../screens/Settings/Language';
import WhatsNew from '../../screens/Settings/WhatsNew';

const Stack = createNativeStackNavigator();

export default function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="BillingAccount" component={BillingAccount} options={{ title: 'Billing Account' }} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} options={{ title: 'Change Password' }} />
      <Stack.Screen name="VerifyID" component={VerifyID} options={{ title: 'Verify ID' }} />
      <Stack.Screen name="RequestForViews" component={RequestForViews} options={{ title: 'Request for Views' }} />
      <Stack.Screen name="Earnings" component={Earnings} options={{ title: 'Earnings' }} />
      <Stack.Screen name="TermsAndConditions" component={TermsAndConditions} options={{ title: 'Terms & Conditions' }} />
      <Stack.Screen name="Version" component={Version} options={{ title: 'Version' }} />
      <Stack.Screen name="Language" component={Language} options={{ title: 'Language' }} />
      <Stack.Screen name="WhatsNew" component={WhatsNew} options={{ title: "What's New?" }} />
      {/* add Logout and DeleteAccount if they have screens, else handle them in SettingsScreen */}
    </Stack.Navigator>
  );
}
