// src/navigation/types.ts
export type RootStackParamList = {
	SplashScreen: undefined;
	MainTabs: undefined;
	Onboarding: undefined;

  };
  
// src/types/types.ts
export type MySpacesStackParamList = {
	MySpacesMain: undefined;
	CreateSpaceScreen: undefined;
	EditSpaceScreen: { spaceId: string };
	RequestDetailScreen: { reservationId: string };
	ConfirmedReservationScreen: { reservationId: string };
	RulesScreen: { reservationId: string; role: 'owner' | 'requester' };
  };
  