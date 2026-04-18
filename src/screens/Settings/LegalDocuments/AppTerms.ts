export type LegalBlock =
  | {
      type: "heading";
      text: string;
    }
  | {
      type: "subheading";
      text: string;
    }
  | {
      type: "sectionTitle";
      text: string;
    }
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "bulletList";
      items: string[];
    };


export const appTerms: LegalBlock[] = [
	{
		type: "heading",
		text: "OURSPACE APP TERMS & CONDITIONS",
	},
	{
		type: "subheading",
		text: "Effective Date: 04-15-2026",
	},
	{
		type: "subheading",
		text: "Last Updated: 04-15-2026",
	},
	{
		type: "paragraph",
		text:
		"These App Terms & Conditions govern your access to and use of the OurSpace mobile application, related mobile services, and any features, content, or functionality made available through the app.",
	},
	{
		type: "paragraph",
		text:
		"The App is owned and operated by OurSpace Technologies Inc. By using the App, you agree to these Terms. If you do not agree, you must not use the App.",
	},
	
	{
		type: "sectionTitle",
		text: "1. Purpose of the App",
	},
	{
		type: "paragraph",
		text:
		"The App is a digital marketplace that enables users to create accounts, browse listings, request bookings, and manage storage spaces.",
	},
	{
		type: "paragraph",
		text:
		"OurSpace provides the App as a technology platform only. Hosts provide storage spaces and Renters choose whether to use them.",
	},
	
	{
		type: "sectionTitle",
		text: "2. Eligibility",
	},
	{
		type: "bulletList",
		items: [
		"You must be at least 18 years old.",
		"You must be legally able to enter a binding contract.",
		"You must provide accurate and complete information.",
		"You must comply with all applicable laws.",
		],
	},
	
	{
		type: "sectionTitle",
		text: "3. Account Registration and Security",
	},
	{
		type: "bulletList",
		items: [
		"Keep your login credentials secure.",
		"You are responsible for all activity on your account.",
		"Do not share or impersonate accounts.",
		"Notify us of unauthorized access.",
		],
	},
	
	{
		type: "sectionTitle",
		text: "4. Role-Based Use of the App",
	},
	{
		type: "paragraph",
		text:
		"If you use the App as a Host or Renter, you agree to the respective agreements governing those roles.",
	},
	
	{
		type: "sectionTitle",
		text: "5. What the App Allows You to Do",
	},
	{
		type: "bulletList",
		items: [
		"Create and manage listings",
		"Request and manage bookings",
		"Upload photos and content",
		"Communicate with users",
		"Process payments and payouts",
		],
	},
	
	{
		type: "sectionTitle",
		text: "6. Mobile Permissions",
	},
	{
		type: "paragraph",
		text:
		"The App may request access to location, photos, and notifications to enable core functionality.",
	},
	
	{
		type: "sectionTitle",
		text: "7. Limited Licence to Use the App",
	},
	{
		type: "paragraph",
		text:
		"You are granted a limited, non-transferable licence to use the App for its intended purpose only.",
	},
	
	{
		type: "sectionTitle",
		text: "8. Marketplace Role",
	},
	{
		type: "paragraph",
		text:
		"OurSpace is a marketplace only and does not own, operate, or store items in any listing.",
	},
	
	{
		type: "sectionTitle",
		text: "9. Payments, Billing, and Payouts",
	},
	{
		type: "paragraph",
		text:
		"Payments are processed through third-party providers such as Stripe and Stripe Connect.",
	},
	{
		type: "paragraph",
		text:
		"Billing and payout rules depend on booking status and platform policies.",
	},
	
	// =========================
	// NEW SECTIONS (10–27)
	// =========================
	
	{
		type: "sectionTitle",
		text: "10. User Content",
	},
	{
		type: "paragraph",
		text:
		"The App may allow you to submit, upload, send, store, publish, or display content, including profile information, listings, photos, messages, reviews, support requests, dispute submissions, and other content.",
	},
	{
		type: "paragraph",
		text:
		"You are solely responsible for your User Content and must ensure it is accurate, lawful, and does not infringe the rights of others.",
	},
	{
		type: "paragraph",
		text:
		"You grant OurSpace a licence to use your User Content as necessary to operate and improve the App, subject to our Privacy Policy.",
	},
	
	{
		type: "sectionTitle",
		text: "11. Community Standards and Prohibited Conduct",
	},
	{
		type: "bulletList",
		items: [
		"Do not provide false or misleading information.",
		"Do not impersonate others or misrepresent identity.",
		"Do not post fraudulent listings or requests.",
		"Do not attempt to bypass platform rules or fees.",
		"Do not harass, threaten, or abuse other users.",
		"Do not discriminate or engage in unlawful conduct.",
		"Do not upload malware or attempt to harm the App.",
		"Do not misuse messaging, reviews, or disputes.",
		"Do not collect user data without permission.",
		"Do not store prohibited or illegal items.",
		],
	},
	
	{
		type: "sectionTitle",
		text: "12. Messaging, Reviews, and User Interactions",
	},
	{
		type: "paragraph",
		text:
		"The App may include messaging and review features that may be monitored, moderated, or removed where necessary for safety, compliance, or dispute resolution.",
	},
	
	{
		type: "sectionTitle",
		text: "13. Prohibited Items and Safety",
	},
	{
		type: "paragraph",
		text:
		"You may not use the App to store or facilitate storage of prohibited or unsafe items as defined in the Prohibited Items Policy.",
	},
	
	{
		type: "sectionTitle",
		text: "14. Cancellations, Refunds, and End of Booking",
	},
	{
		type: "paragraph",
		text:
		"All cancellations, refunds, and booking termination rules are governed by the applicable policies and booking terms shown in the App.",
	},
	{
		type: "sectionTitle",
		text: "15. Account Suspension, Listing Removal, and Enforcement",
	},
	{
		type: "bulletList",
		items: [
		"Suspend or terminate accounts",
		"Remove listings or content",
		"Cancel or restrict bookings",
		"Freeze or adjust payments",
		"Require additional verification",
		"Report illegal activity to authorities",
		],
	},
	{
		type: "sectionTitle",
		text: "16. Intellectual Property",
	},
	{
		type: "paragraph",
		text:
		"All App content and intellectual property is owned by or licensed to OurSpace and protected by law.",
	},
	
	{
		type: "sectionTitle",
		text: "17. Third-Party Services and App Stores",
	},
	{
		type: "paragraph",
		text:
		"The App may rely on third-party services such as payment processors, analytics, and app stores, each governed by their own terms.",
	},
	
	{
		type: "sectionTitle",
		text: "18. App Availability, Updates, and Compatibility",
	},
	{
		type: "paragraph",
		text:
		"We may update or discontinue the App at any time and do not guarantee uninterrupted service or compatibility.",
	},
	
	{
		type: "sectionTitle",
		text: "19. Account Deletion",
	},
	{
		type: "paragraph",
		text:
		"You may request account deletion, but we may retain certain data as required by law or for legitimate business purposes.",
	},
	
	{
		type: "sectionTitle",
		text: "20. Privacy",
	},
	{
		type: "paragraph",
		text:
		"Your use of the App is subject to our Privacy Policy, which explains how we handle personal information.",
	},
	
	{
		type: "sectionTitle",
		text: "21. No Warranties",
	},
	{
		type: "paragraph",
		text:
		"The App is provided on an “as is” and “as available” basis without warranties of any kind.",
	},
	
	{
		type: "sectionTitle",
		text: "22. Limitation of Liability",
	},
	{
		type: "paragraph",
		text:
		"OurSpace is not liable for indirect, incidental, or consequential damages arising from use of the App or platform services.",
	},
	
	{
		type: "sectionTitle",
		text: "23. Indemnity",
	},
	{
		type: "paragraph",
		text:
		"You agree to indemnify OurSpace against claims arising from your use of the App, your content, or your violation of these Terms.",
	},
	
	{
		type: "sectionTitle",
		text: "24. Compliance With Laws",
	},
	{
		type: "paragraph",
		text:
		"You must comply with all applicable laws when using the App, including those relating to storage, payments, privacy, and consumer protection.",
	},
	
	{
		type: "sectionTitle",
		text: "25. Changes to These Terms",
	},
	{
		type: "paragraph",
		text:
		"We may update these Terms from time to time and will notify users where required by law.",
	},
	
	{
		type: "sectionTitle",
		text: "26. Governing Law",
	},
	{
		type: "paragraph",
		text:
		"These Terms are governed by the laws of the Province of Alberta, Canada, subject to mandatory legal rights.",
	},
	
	{
		type: "sectionTitle",
		text: "27. Contact Us",
	},
	{
		type: "bulletList",
		items: [
		"OurSpace Technologies Inc.",
		"support@ourspacetech.com",
		"https://ourspacetech.com/",
		"https://ourspacetech.com/help-centre/",
		],
	},
	];

	export const privacyPolicy: LegalBlock[] = [
		{
		  type: "heading",
		  text: "OURSPACE APP PRIVACY POLICY",
		},
		{
		  type: "subheading",
		  text: "Effective Date: 04-15-2026",
		},
		{
		  type: "subheading",
		  text: "Last Updated: 04-15-2026",
		},
		{
		  type: "paragraph",
		  text:
			"At OurSpace, we value privacy, transparency, and trust. This Privacy Policy explains how OurSpace Technologies Inc. collects, uses, discloses, stores, and protects personal information through the App.",
		},
		{
		  type: "paragraph",
		  text:
			"This Privacy Policy applies to personal information collected when you use the App, including account creation, bookings, messaging, payments, and support features.",
		},
	  
		{
		  type: "sectionTitle",
		  text: "1. Who This Policy Applies To",
		},
		{
		  type: "paragraph",
		  text:
			"This Privacy Policy applies to users in Canada who use the App as renters, hosts, or both. The App is intended for users 18 years or older.",
		},
	  
		{
		  type: "sectionTitle",
		  text: "2. Information We Collect",
		},
	  
		{
		  type: "subheading",
		  text: "Account and Profile Information",
		},
		{
		  type: "bulletList",
		  items: [
			"Name, email, phone number",
			"Profile photo and login credentials",
			"Location and verification information",
			"Account preferences and role type",
		  ],
		},
	  
		{
		  type: "subheading",
		  text: "Booking and Listing Information",
		},
		{
		  type: "bulletList",
		  items: [
			"Listing details and photos",
			"Booking history and status",
			"Storage location and access details",
			"Drop-off and pick-up records",
		  ],
		},
	  
		{
		  type: "subheading",
		  text: "Messages and User Content",
		},
		{
		  type: "bulletList",
		  items: [
			"In-app messages and communications",
			"Reviews and ratings",
			"Support and dispute submissions",
			"Uploaded photos and evidence",
		  ],
		},
	  
		{
		  type: "subheading",
		  text: "Payment Information",
		},
		{
		  type: "bulletList",
		  items: [
			"Payment methods and billing details",
			"Payout information for hosts",
			"Transaction and refund history",
			"Fraud prevention data",
		  ],
		},
	  
		{
		  type: "subheading",
		  text: "Device and Technical Information",
		},
		{
		  type: "bulletList",
		  items: [
			"Device type and operating system",
			"App usage and session data",
			"IP address and identifiers",
			"Crash and diagnostic data",
		  ],
		},
	  
		{
		  type: "subheading",
		  text: "Location, Photos, and Notifications",
		},
		{
		  type: "bulletList",
		  items: [
			"Location data (if enabled)",
			"Photo library access (if enabled)",
			"Push notification preferences",
		  ],
		},
	  
		{
		  type: "sectionTitle",
		  text: "3. How We Use Your Information",
		},
		{
		  type: "bulletList",
		  items: [
			"Operate and improve the App",
			"Process bookings, payments, and payouts",
			"Provide support and resolve disputes",
			"Prevent fraud and enforce policies",
			"Send service and account notifications",
			"Comply with legal obligations",
		  ],
		},
	  
		{
		  type: "sectionTitle",
		  text: "4. How We Share Information",
		},
		{
		  type: "bulletList",
		  items: [
			"With other users for bookings and messaging",
			"With service providers (e.g. hosting, analytics)",
			"With payment providers like Stripe",
			"With legal or regulatory authorities when required",
		  ],
		},
	  
		{
		  type: "sectionTitle",
		  text: "5. Data Storage and Retention",
		},
		{
		  type: "paragraph",
		  text:
			"Your data may be stored in Canada or other jurisdictions. We retain information only as long as necessary for operations, legal compliance, fraud prevention, and dispute resolution.",
		},
	  
		{
		  type: "sectionTitle",
		  text: "6. Your Rights and Choices",
		},
		{
		  type: "bulletList",
		  items: [
			"Access your personal information",
			"Request corrections",
			"Withdraw consent where applicable",
			"Manage notifications and marketing",
			"Request account deletion",
		  ],
		},
	  
		{
		  type: "sectionTitle",
		  text: "7. Account Deletion",
		},
		{
		  type: "paragraph",
		  text:
			"You may request account deletion through the App. Some data may be retained for legal, tax, or security reasons.",
		},
	  
		{
		  type: "sectionTitle",
		  text: "8. Children’s Privacy",
		},
		{
		  type: "paragraph",
		  text:
			"The App is intended for users 18 years and older. We do not knowingly collect data from minors.",
		},
	  
		{
		  type: "sectionTitle",
		  text: "9. Security",
		},
		{
		  type: "paragraph",
		  text:
			"We use reasonable safeguards to protect your personal information, but no system is completely secure.",
		},
	  
		{
		  type: "sectionTitle",
		  text: "10. Contact Us",
		},
		{
		  type: "paragraph",
		  text:
			"If you have questions, contact support@ourspacetech.com or visit our Help Centre.",
		},
	  ];