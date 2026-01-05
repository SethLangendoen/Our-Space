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

// Payments group in settings
import PaymentMethods from '../../screens/Settings/PaymentsAndPayouts/PaymentMethods';
import PayoutAccounts from '../../screens/Settings/PaymentsAndPayouts/PayoutAccounts';
import TransactionHistory from '../../screens/Settings/PaymentsAndPayouts/TransactionHistory';
import BillingReceipts from '../../screens/Settings/PaymentsAndPayouts/BillingReceipts';
import TaxForms from '../../screens/Settings/PaymentsAndPayouts/TaxForms';
import StripeOnboarding from '../../screens/Settings/PaymentsAndPayouts/StripeOnboarding';

const Stack = createNativeStackNavigator();

export default function SettingsStack() {
  return (
    <Stack.Navigator>

      <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{ title: 'Settings' }} />
     
      {/* Payments and Payouts screen */}
      <Stack.Screen
        name="StripeOnboarding"
        component={StripeOnboarding}
        options={{ title: 'Get Started / Onboarding' }}
      />

      <Stack.Screen
        name="PaymentMethods"
        component={PaymentMethods}
        options={{ title: 'Payment Methods' }}
      />

      <Stack.Screen
        name="PayoutAccounts"
        component={PayoutAccounts}
        options={{ title: 'Payout Accounts' }}
      />

      <Stack.Screen
        name="TransactionHistory"
        component={TransactionHistory}
        options={{ title: 'Transaction History' }}
      />

      <Stack.Screen
        name="BillingReceipts"
        component={BillingReceipts}
        options={{ title: 'Billing & Receipts' }}
      />

      <Stack.Screen
        name="TaxForms"
        component={TaxForms}
        options={{ title: 'Tax Forms' }}
      />
     
     
      <Stack.Screen name="BillingAccount" component={BillingAccount} options={{ title: 'Billing Account' }} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} options={{ title: 'Change Password' }} />
      <Stack.Screen name="VerifyID" component={VerifyID} options={{ title: 'Verify ID' }} />
      <Stack.Screen name="RequestForViews" component={RequestForViews} options={{ title: 'Request for Views' }} />
      <Stack.Screen name="Earnings" component={Earnings} options={{ title: 'Earnings' }} />
      <Stack.Screen name="TermsAndConditions" component={TermsAndConditions} options={{ title: 'Terms & Conditions' }} />
      <Stack.Screen name="Version" component={Version} options={{ title: 'Version' }} />
      <Stack.Screen name="Language" component={Language} options={{ title: 'Language' }} />
      <Stack.Screen name="WhatsNew" component={WhatsNew} options={{ title: "What's New?" }} />
    </Stack.Navigator>
  );
}
