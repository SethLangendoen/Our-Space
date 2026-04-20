import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SettingsScreen from '../../screens/Settings/SettingsScreen';
import BillingAccount from '../../screens/Settings/BillingAccount';
import VerifyID from '../../screens/Settings/VerifyID';
import RequestForViews from '../../screens/Settings/RequestForViews';
import Version from '../../screens/Settings/Version';
import Language from '../../screens/Settings/Language';
import WhatsNew from '../../screens/Settings/WhatsNew';

// Payments group in settings
import PaymentMethods from '../../screens/Settings/PaymentsAndPayouts/PaymentMethods';
import PayoutAccounts from '../../screens/Settings/PaymentsAndPayouts/PayoutAccounts';
import TransactionHistory from '../../screens/Settings/PaymentsAndPayouts/TransactionHistory';
import BillingReceipts from '../../screens/Settings/PaymentsAndPayouts/BillingReceipts';
import TaxForms from '../../screens/Settings/PaymentsAndPayouts/TaxForms';
import Earnings from '../../screens/Settings/PaymentsAndPayouts/Earnings';


// HOST ONBOARDING
import StripeOnboarding from '../../screens/Settings/HostOnboarding/StripeOnboarding';
import HostUserAgreements from '../../screens/Settings/HostOnboarding/HostUserAgreements';

// RENTER ONBOARDING
import RenterUserAgreements from '../../screens/Settings/RenterOnboarding/RenterUserAgreements';

// LEGAL 
import TermsAndConditions from '../../screens/Settings/LegalDocuments/TermsAndConditions';
import PrivacyPolicy from '../../screens/Settings/LegalDocuments/PrivacyPolicy';

// SUPPORT
import HelpCentre from '../../screens/Settings/Support/HelpCentre';
import ContactUs from '../../screens/Settings/Support/ContactUs';
import ResolutionCentre from '../../screens/Settings/Support/ResolutionCentre';
import Feedback from '../../screens/Settings/Support/Feedback';

// MANAGE ACCOUNT
import ChangePassword from '../../screens/Settings/ManageAccount/ChangePassword';
import DeleteAccount from '../../screens/Settings/ManageAccount/DeleteAccount';


const Stack = createNativeStackNavigator();

export default function SettingsStack() {
  return (
    <Stack.Navigator>

      <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{ title: 'Settings' }} />
     
      <Stack.Screen
        name="TermsAndConditions"
        component={TermsAndConditions}
        options={{ title: 'Terms And Conditions' }}
      />

      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicy}
        options={{ title: 'Privacy Policy' }}
      />

      <Stack.Screen
        name="HelpCentre"
        component={HelpCentre}
        options={{ title: 'Help Centre' }}
      />


      <Stack.Screen
        name="ContactUs"
        component={ContactUs}
        options={{ title: 'Contact Us' }}
      />

      <Stack.Screen
        name="ResolutionCentre"
        component={ResolutionCentre}
        options={{ title: 'Resolution Centre' }}
      />

      <Stack.Screen
        name="Feedback"
        component={Feedback}
        options={{ title: 'Feedback' }}
      />

      <Stack.Screen
        name="HostUserAgreements"
        component={HostUserAgreements}
        options={{ title: 'Host User Agreements' }}
      />

      <Stack.Screen
        name="RenterUserAgreements"
        component={RenterUserAgreements}
        options={{ title: 'Renter User Agreements' }}
      />

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

      <Stack.Screen 
        name="Earnings" 
        component={Earnings} 
        options={{ title: 'Earnings' }} 
      />
     
      <Stack.Screen name="BillingAccount" component={BillingAccount} options={{ title: 'Billing Account' }} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} options={{ title: 'Change Password' }} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccount} options={{ title: 'Delete Account' }} />

      <Stack.Screen name="VerifyID" component={VerifyID} options={{ title: 'Verify ID' }} />
      <Stack.Screen name="Version" component={Version} options={{ title: 'Version' }} />
      <Stack.Screen name="Language" component={Language} options={{ title: 'Language' }} />
      <Stack.Screen name="WhatsNew" component={WhatsNew} options={{ title: "What's New?" }} />
    </Stack.Navigator>
  );
}
