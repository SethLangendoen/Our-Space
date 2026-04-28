
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { auth, db } from "../../../firebase/config";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";

export default function HostUserAgreements() {

  const [accepted, setAccepted] = useState(false);
  const [alreadyAccepted, setAlreadyAccepted] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showFullAgreement, setShowFullAgreement] = useState(false);

  useEffect(() => {
    const checkAgreementStatus = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          setCheckingStatus(false);
          return;
        }

        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const signed =
            userData?.legal?.host?.userAgreementSigned === true;

          if (signed) {
            setAlreadyAccepted(true);
            setAccepted(true);
          }
        }
      } catch (error) {
        console.error("Failed to check agreement status:", error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkAgreementStatus();
  }, []);


  
  const handleAgree = async () => {
    if (!accepted) {
      Alert.alert(
        "Agreement Required",
        "You must confirm that you agree before continuing."
      );
      return;
    }

    try {
      setSubmitting(true);

      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("Not signed in");

      await updateDoc(doc(db, "users", uid), {
        "legal.host.userAgreementSigned": true,
        "legal.host.userAgreementSignedAt": serverTimestamp(),
      });

      Alert.alert("Success", "Host User Agreement accepted.");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save agreement.");
    } finally {
      setSubmitting(false);
    }
  };

  function AgreementSection({
	title,
	items,
  }: {
	title: string;
	items: string[];
  }) {
	return (
	  <View style={{ marginBottom: 18 }}>
		<Text style={styles.agreementHeading}>{title}</Text>
  
		{items.map((item, index) => (
		  <View key={index} style={styles.bulletRow}>
			<Text style={styles.bullet}>•</Text>
			<Text style={styles.bulletText}>{item}</Text>
		  </View>
		))}
	  </View>
	);
  }



  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Host User Agreements</Text>

	  <Text style={styles.sectionTitle}>OurSpace Host Agreement Summary</Text>

<Text style={styles.introText}>
  By continuing, you confirm that you understand and agree to the following:
</Text>

<AgreementSection
  title="Using OurSpace"
  items={[
    "OurSpace connects hosts with renters seeking storage.",
    "You are responsible for the space you list and provide.",
    "Listings must be accurate, safe, lawful, and suitable for storage.",
  ]}
/>

<AgreementSection
  title="Eligibility"
  items={[
    "You must be 18+ years old.",
    "You must own the property or have legal authority to host.",
    "You must provide accurate account, identity, and payout info.",
    "You must comply with all laws and property restrictions.",
  ]}
/>

<AgreementSection
  title="Your Space"
  items={[
    "Listings must accurately describe the space.",
    "You must disclose known issues or hazards.",
    "Space must remain safe and as described.",
  ]}
/>

<AgreementSection
  title="Permitted Items"
  items={[
    "Only permitted items may be stored.",
    "Prohibited, illegal, or hazardous items are not allowed.",
    "Unsafe items must be reported.",
  ]}
/>

<AgreementSection
  title="Booking and Billing"
  items={[
    "Renters are charged 48h before booking starts.",
    "Daily, weekly, or monthly billing cycles may apply.",
    "Charges continue until items are removed and booking is completed.",
  ]}
/>

<AgreementSection
  title="Cancellations"
  items={[
    "Before storage begins, you may decline or cancel requests.",
    "Active bookings generally require 2 billing cycles notice to end.",
  ]}
/>

<AgreementSection
  title="Access and Renter Property"
  items={[
    "You must provide access as agreed.",
    "You may not interfere with renter property except where allowed.",
  ]}
/>

<AgreementSection
  title="Payouts and Taxes"
  items={[
    "You set pricing subject to platform rules.",
    "You are responsible for your own taxes.",
  ]}
/>

<AgreementSection
  title="Damage / Insurance"
  items={[
    "Maintain proper insurance.",
    "You may be liable for negligence-related damage.",
  ]}
/>

<AgreementSection
  title="Disputes"
  items={[
    "Problems must be reported through Resolution Centre.",
  ]}
/>



{/* FULL AGREEMENT SLIDER */}
<View style={styles.fullAgreementWrapper}>




	
    <Text style={styles.sectionTitle}>Full Host Agreement</Text>
    <View style={styles.fullAgreementBox}>
      <ScrollView nestedScrollEnabled style={styles.fullAgreementScroll}>







	  <Text style={styles.agreementHeading}>
  OURSPACE HOST AGREEMENT
</Text>

<Text style={styles.agreementSubheading}>
  Last Updated: [Insert Date]
</Text>

<Text style={styles.agreementSubheading}>
  Effective Date: [Insert Date]
</Text>

<Text style={styles.body}>
  This Host Agreement ("Agreement") is a legally binding agreement between
  OurSpace Technologies Inc. ("OurSpace," "we," "us," or "our") and the
  individual or entity using the OurSpace platform as a host ("Host," "you,"
  or "your").
</Text>

<Text style={styles.body}>
  This Agreement governs your use of the OurSpace mobile application,
  website, and related services to create listings, accept bookings,
  provide storage space, coordinate access, and otherwise host renters
  through the platform.
</Text>

<Text style={styles.body}>
  By creating an account, clicking to accept this Agreement, listing a
  Space, accepting a booking, or otherwise using the platform as a Host,
  you agree to be bound by this Agreement, our Terms & Conditions,
  Privacy Policy, Help Centre, Resolution Centre, Prohibited Items Policy,
  and any additional policies or booking terms made available through the
  platform.
</Text>

<Text style={styles.legalSectionTitle}>1. Nature of the Platform</Text>

<Text style={styles.body}>
  OurSpace operates an online marketplace that enables Hosts and Renters
  to connect for storage arrangements.
</Text>

<Text style={styles.bullet}>
  • is not the owner, operator, lessor, warehouseman, bailee in possession,
  insurer, broker, carrier, or mover of any listed Space or Stored Items
</Text>

<Text style={styles.bullet}>
  • does not take physical possession, custody, or control of items placed
  in a Space
</Text>

<Text style={styles.bullet}>
  • does not inspect every Space, supervise every exchange, or guarantee
  the conduct of any user
</Text>

<Text style={styles.bullet}>
  • is not a party to the physical storage arrangement except where
  expressly stated
</Text>

<Text style={styles.body}>
  You, as the Host, are the party offering the Space and are responsible
  for providing the Space in accordance with your listing, accepted booking
  terms, platform rules, and applicable law.
</Text>

<Text style={styles.legalSectionTitle}>2. Definitions</Text>

<Text style={styles.body}>In this Agreement:</Text>

<Text style={styles.bullet}>
  • "Platform" means the OurSpace website, mobile application,
  communication tools, payment flows, support channels, and related services.
</Text>

<Text style={styles.bullet}>
  • "Host" means a registered user who lists or provides a Space.
</Text>

<Text style={styles.bullet}>
  • "Renter" means a registered user who requests, books, or uses a Host’s
  Space to store items.
</Text>

<Text style={styles.bullet}>
  • "Space" means the area listed by the Host for storage.
</Text>

<Text style={styles.bullet}>
  • "Booking" means a storage arrangement between a Host and Renter.
</Text>

<Text style={styles.bullet}>
  • "Storage Period" means the approved booking period for item storage.
</Text>

<Text style={styles.bullet}>
  • "Stored Items" means goods or personal property placed by a Renter.
</Text>

<Text style={styles.bullet}>
  • "Billing Cycle" means the recurring storage period selected.
</Text>

<Text style={styles.bullet}>
  • "Policies" means the Terms & Conditions, Privacy Policy, Help Centre,
  Resolution Centre, Prohibited Items Policy, and related policies.
</Text>

<Text style={styles.legalSectionTitle}>3. Eligibility and Authority</Text>

<Text style={styles.body}>To act as a Host, you must:</Text>

<Text style={styles.bullet}>
  • be at least 18 years old and capable of entering into a binding contract
</Text>

<Text style={styles.bullet}>
  • own the property or have legal authority to offer the Space
</Text>

<Text style={styles.bullet}>
  • provide current, complete, and accurate account and payout information
</Text>

<Text style={styles.bullet}>
  • complete required verification steps
</Text>

<Text style={styles.bullet}>
  • provide the Space in a safe and lawful manner
</Text>

<Text style={styles.bullet}>
  • comply with all applicable laws and obligations
</Text>

<Text style={styles.body}>
  If you list on behalf of a business or organization, you represent that
  you have authority to bind that entity.
</Text>

<Text style={styles.body}>
  You further represent that offering the Space does not violate:
</Text>

<Text style={styles.bullet}>
  • lease, mortgage, insurance, condo, HOA, or property restrictions
</Text>

<Text style={styles.bullet}>
  • zoning, fire, building, access, or occupancy rules
</Text>

<Text style={styles.bullet}>
  • any agreement or law prohibiting storage hosting
</Text>

<Text style={styles.legalSectionTitle}>
  4. Account, Verification, and Electronic Consent
</Text>

<Text style={styles.body}>
  You are responsible for maintaining the confidentiality of your account
  credentials and for all activity under your account.
</Text>

<Text style={styles.body}>
  You authorize OurSpace and its service providers to carry out verification,
  fraud prevention, payout authentication, identity confirmation, and risk
  screening.
</Text>

<Text style={styles.body}>You agree that:</Text>

<Text style={styles.bullet}>
  • electronic acceptance of this Agreement is legally valid
</Text>

<Text style={styles.bullet}>
  • electronic records satisfy legal writing requirements where permitted
</Text>

<Text style={styles.bullet}>
  • notices and confirmations may be delivered electronically
</Text>

<Text style={styles.legalSectionTitle}>
  5. Listings and Contract Formation
</Text>

<Text style={styles.body}>
  A listing is an invitation for Renters to request a Booking.
  You are responsible for ensuring listings are accurate and complete.
</Text>

<Text style={styles.body}>
  You must disclose all material information including:
</Text>

<Text style={styles.bullet}>• size and type of Space</Text>
<Text style={styles.bullet}>• access method and schedule</Text>
<Text style={styles.bullet}>• indoor or outdoor conditions</Text>
<Text style={styles.bullet}>• climate control status</Text>
<Text style={styles.bullet}>• security features</Text>
<Text style={styles.bullet}>• hazards or limitations</Text>
<Text style={styles.bullet}>• stairs / narrow access / shared areas</Text>
<Text style={styles.bullet}>• item restrictions</Text>

<Text style={styles.body}>
  A Booking is formed only when:
</Text>

<Text style={styles.bullet}>• the Renter submits a request</Text>
<Text style={styles.bullet}>• you accept the request</Text>
<Text style={styles.bullet}>
  • payment authorization and booking requirements are satisfied
</Text>

<Text style={styles.legalSectionTitle}>
  6. Host Representations and Warranties
</Text>

<Text style={styles.body}>You represent that:</Text>

<Text style={styles.bullet}>
  • the Space is lawfully available for storage use
</Text>

<Text style={styles.bullet}>
  • your listing is accurate and not misleading
</Text>

<Text style={styles.bullet}>
  • the Space is reasonably safe and suitable
</Text>

<Text style={styles.bullet}>
  • known defects / hazards are disclosed
</Text>

<Text style={styles.bullet}>
  • prohibited or unlawful storage is not knowingly permitted
</Text>

<Text style={styles.bullet}>
  • you comply with platform policies and reduce foreseeable risks
</Text>

<Text style={styles.legalSectionTitle}>7. Host Obligations</Text>

<Text style={styles.body}>As a Host, you agree to:</Text>

<Text style={styles.bullet}>
  • provide a safe and suitable storage Space
</Text>

<Text style={styles.bullet}>
  • maintain property conditions and access systems
</Text>

<Text style={styles.bullet}>
  • provide access as agreed
</Text>

<Text style={styles.bullet}>
  • respect renter property and not interfere improperly
</Text>

<Text style={styles.legalSectionTitle}>8. Host Prohibitions</Text>

<Text style={styles.body}>You agree not to:</Text>

<Text style={styles.bullet}>
  • misrepresent your Space
</Text>

<Text style={styles.bullet}>
  • permit prohibited / illegal / unsafe items
</Text>

<Text style={styles.bullet}>
  • discriminate unlawfully
</Text>

<Text style={styles.bullet}>
  • operate unlawfully or bypass the platform
</Text>

<Text style={styles.bullet}>
  • harass, threaten, intimidate, or retaliate against Renters
</Text>

<Text style={styles.bullet}>
  • seize, sell, or dispose of Stored Items unlawfully
</Text>

<Text style={styles.legalSectionTitle}>
  9. Permitted and Prohibited Items
</Text>

<Text style={styles.body}>
  You may impose listing restrictions, but may not authorize storage of
  prohibited items.
</Text>

<Text style={styles.body}>
  Unless expressly permitted, prohibited items include:
</Text>

<Text style={styles.bullet}>• illegal items or stolen property</Text>
<Text style={styles.bullet}>• cash / negotiable instruments / bullion</Text>
<Text style={styles.bullet}>• firearms / ammunition / explosives</Text>
<Text style={styles.bullet}>• flammable / toxic / hazardous materials</Text>
<Text style={styles.bullet}>• propane / gasoline / fuels / chemicals</Text>
<Text style={styles.bullet}>• perishable food / plants</Text>
<Text style={styles.bullet}>• unlawful drugs / paraphernalia</Text>
<Text style={styles.bullet}>• living creatures</Text>
<Text style={styles.bullet}>• odour / contamination risk items</Text>
<Text style={styles.bullet}>
  • temperature-sensitive items unless expressly supported
</Text>

<Text style={styles.body}>
  You must promptly report suspected prohibited or unsafe items through the
  platform.
</Text>


<Text style={styles.legalSectionTitle}>
  10. Fees, Billing, Payouts, and Taxes
</Text>

<Text style={styles.body}>
  You agree to all platform fees, payout rules, and payment terms disclosed
  by OurSpace.
</Text>

<Text style={styles.body}>
  Unless otherwise stated in the booking flow or payout materials:
</Text>

<Text style={styles.bullet}>
  • you set the base storage price for your listing, subject to platform rules
</Text>
<Text style={styles.bullet}>
  • Bookings may use a daily, weekly, or monthly Billing Cycle
</Text>
<Text style={styles.bullet}>
  • the Renter is not charged when they first submit a Booking request
</Text>
<Text style={styles.bullet}>
  • the initial renter charge is processed 48 hours before the Booking start
  time if the Booking remains active
</Text>
<Text style={styles.bullet}>
  • once storage begins, each Billing Cycle is charged at the start of that cycle
</Text>
<Text style={styles.bullet}>
  • if a Renter ends storage during an active Billing Cycle, that cycle remains
  their final payable cycle
</Text>
<Text style={styles.bullet}>
  • charges generally continue until Stored Items are removed and the Booking is
  properly ended or verified through the platform
</Text>
<Text style={styles.bullet}>
  • Host payouts may be delayed, adjusted, held, offset, or reversed where
  permitted for refunds, disputes, chargebacks, fraud prevention, or policy
  enforcement
</Text>

<Text style={styles.body}>
  You authorize OurSpace and its payment providers to collect applicable fees,
  make payout adjustments, and offset amounts owed by you against future payouts
  where permitted.
</Text>

<Text style={styles.body}>
  You are solely responsible for:
</Text>

<Text style={styles.bullet}>
  • reporting and remitting taxes arising from hosting activity
</Text>
<Text style={styles.bullet}>
  • determining whether you must register for or collect GST/HST
</Text>
<Text style={styles.bullet}>
  • understanding tax impacts on your personal, business, or property obligations
</Text>
<Text style={styles.bullet}>
  • obtaining your own tax advice
</Text>

<Text style={styles.body}>
  OurSpace may provide transaction records or earnings summaries, but does not
  provide tax advice.
</Text>

<Text style={styles.legalSectionTitle}>
  11. Cancellations, Refunds, and Booking Changes
</Text>

<Text style={styles.body}>
  Cancellation and refund rights are governed by booking terms presented at
  checkout, this Agreement, applicable law, and related policies.
</Text>

<Text style={styles.legalSectionTitle}>
  11.1 Before Storage Begins
</Text>

<Text style={styles.body}>
  Before a Booking becomes active, you may decline or cancel a request through
  the platform, subject to platform standards.
</Text>

<Text style={styles.body}>
  If you cancel after the Renter has been charged:
</Text>

<Text style={styles.bullet}>
  • the Renter may be entitled to a full refund
</Text>
<Text style={styles.bullet}>
  • you may be subject to payout adjustment, account action, or listing restrictions
</Text>

<Text style={styles.legalSectionTitle}>
  11.2 Active Booking Notice Requirement
</Text>

<Text style={styles.body}>
  Once a Booking is active, you are generally expected to provide at least two
  full Billing Cycles’ notice before ending storage.
</Text>

<Text style={styles.body}>
  Notice periods:
</Text>

<Text style={styles.bullet}>• Daily Booking: two full daily cycles</Text>
<Text style={styles.bullet}>• Weekly Booking: two full weekly cycles</Text>
<Text style={styles.bullet}>• Monthly Booking: two full monthly cycles</Text>

<Text style={styles.legalSectionTitle}>
  11.3 If You Give Less Than Required Notice
</Text>

<Text style={styles.body}>
  If you end an active Booking without proper notice:
</Text>

<Text style={styles.bullet}>
  • the Renter may not owe for the final Billing Cycle
</Text>
<Text style={styles.bullet}>
  • previously charged amounts may be refunded or credited
</Text>
<Text style={styles.bullet}>
  • you may be financially responsible for refunded amounts
</Text>

<Text style={styles.legalSectionTitle}>
  11.4 Exceptions
</Text>

<Text style={styles.body}>
  Shorter notice may be permitted where reasonably necessary, including for:
</Text>

<Text style={styles.bullet}>• prohibited or illegal items</Text>
<Text style={styles.bullet}>• safety concerns</Text>
<Text style={styles.bullet}>• property damage / contamination risk</Text>
<Text style={styles.bullet}>• non-payment</Text>
<Text style={styles.bullet}>• fraud</Text>
<Text style={styles.bullet}>• serious policy violations</Text>
<Text style={styles.bullet}>• emergency property issues</Text>
<Text style={styles.bullet}>• legal / regulatory compliance reasons</Text>

<Text style={styles.body}>
  OurSpace may determine what refund or adjustment is appropriate.
</Text>

<Text style={styles.legalSectionTitle}>
  12. End of Storage and Item Removal
</Text>

<Text style={styles.body}>
  When a Booking is ending:
</Text>

<Text style={styles.bullet}>
  • the Renter is expected to remove all Stored Items by the end date
</Text>
<Text style={styles.bullet}>
  • you must cooperate with the agreed pick-up process
</Text>
<Text style={styles.bullet}>
  • you must not falsely confirm items remain if removed
</Text>
<Text style={styles.bullet}>
  • you must not interfere with proper booking completion
</Text>

<Text style={styles.body}>
  A Booking is not fully ended until item removal is completed and verified
  through the platform.
</Text>

<Text style={styles.body}>
  If removal is disputed, OurSpace may determine the Booking end date based on
  available evidence.
</Text>

<Text style={styles.legalSectionTitle}>
  13. Unclaimed, Overstayed, or Abandoned Items
</Text>

<Text style={styles.body}>
  If a Renter fails to remove Stored Items on time:
</Text>

<Text style={styles.bullet}>
  • additional charges may continue as disclosed
</Text>
<Text style={styles.bullet}>
  • you must notify the issue through the platform
</Text>
<Text style={styles.bullet}>
  • you must not take unilateral action outside platform procedures/law
</Text>
<Text style={styles.bullet}>
  • applicable legal recovery/disposal rights may apply where permitted
</Text>

<Text style={styles.body}>
  If items appear abandoned, unsafe, prohibited, or unlawfully stored,
  OurSpace and/or the Host may take steps permitted by law and policy.
</Text>

<Text style={styles.body}>
  Any sale, disposal, or lien enforcement must comply with applicable law.
</Text>

<Text style={styles.body}>
  You must not seize or retain items for personal gain.
</Text>

<Text style={styles.legalSectionTitle}>
  14. Damage, Liability, and Risk Allocation
</Text>

<Text style={styles.legalSectionTitle}>
  14.1 Your Responsibility as Host
</Text>

<Text style={styles.body}>You are responsible for:</Text>

<Text style={styles.bullet}>
  • damage caused by your negligence or misconduct
</Text>
<Text style={styles.bullet}>
  • damage from undisclosed hazards or preventable property issues
</Text>
<Text style={styles.bullet}>
  • complying with property, safety, and fire requirements
</Text>
<Text style={styles.bullet}>
  • acts/omissions of household members, employees, contractors, or agents
</Text>

<Text style={styles.legalSectionTitle}>
  14.2 Renter Responsibility
</Text>

<Text style={styles.body}>Renters are generally responsible for:</Text>

<Text style={styles.bullet}>
  • damage their Stored Items cause to property or third parties
</Text>
<Text style={styles.bullet}>
  • storing only permitted items
</Text>
<Text style={styles.bullet}>
  • properly packing and protecting their items
</Text>
<Text style={styles.bullet}>
  • complying with Booking terms and platform rules
</Text>

<Text style={styles.legalSectionTitle}>
  14.3 Marketplace Role
</Text>

<Text style={styles.body}>
  OurSpace is not responsible for:
</Text>

<Text style={styles.bullet}>
  • theft or damage involving Stored Items except where liability cannot be excluded
</Text>
<Text style={styles.bullet}>
  • damage to your property caused by Renters
</Text>
<Text style={styles.bullet}>
  • inspecting/verifying every Space or item
</Text>
<Text style={styles.bullet}>
  • ensuring your legal/insurance/property compliance
</Text>
<Text style={styles.bullet}>
  • guaranteeing Host or Renter performance
</Text>

<Text style={styles.body}>
  OurSpace acts solely as a marketplace intermediary.
</Text>

<Text style={styles.legalSectionTitle}>
  15. Insurance and Protection
</Text>

<Text style={styles.body}>
  You are solely responsible for determining whether your insurance permits and
  covers storage of third-party belongings.
</Text>

<Text style={styles.body}>
  OurSpace strongly recommends maintaining appropriate insurance.
</Text>

<Text style={styles.body}>
  Any optional guarantee or claims program is subject to separate terms and is
  not a substitute for your own insurance.
</Text>

<Text style={styles.legalSectionTitle}>
  16. Disputes and Evidence
</Text>

<Text style={styles.body}>
  If a problem occurs, you must report it promptly through the Resolution Centre
  and follow Help Centre instructions.
</Text>

<Text style={styles.body}>
  Disputes may include:
</Text>

<Text style={styles.bullet}>• cancellations</Text>
<Text style={styles.bullet}>• refund eligibility</Text>
<Text style={styles.bullet}>• denied access</Text>
<Text style={styles.bullet}>• pickup confirmation</Text>
<Text style={styles.bullet}>• Booking end dates</Text>
<Text style={styles.bullet}>• duplicate billing</Text>
<Text style={styles.bullet}>• early termination</Text>
<Text style={styles.bullet}>• listing accuracy</Text>
<Text style={styles.bullet}>• property condition</Text>
<Text style={styles.bullet}>• damage claims</Text>

<Text style={styles.body}>
  You agree to cooperate by providing evidence reasonably requested.
</Text>

<Text style={styles.body}>
  OurSpace may review evidence and make platform decisions regarding refunds,
  credits, fees, payout adjustments, Booking end dates, account measures, or
  claims handling.
</Text>

<Text style={styles.legalSectionTitle}>
  17. Privacy and Personal Information
</Text>

<Text style={styles.body}>
  OurSpace collects, uses, discloses, stores, and safeguards personal
  information in accordance with our Privacy Policy and applicable privacy law.
</Text>

<Text style={styles.body}>
  Personal information may be used for:
</Text>

<Text style={styles.bullet}>• account administration</Text>
<Text style={styles.bullet}>• identity verification</Text>
<Text style={styles.bullet}>• payment and payout processing</Text>
<Text style={styles.bullet}>• fraud prevention and security</Text>
<Text style={styles.bullet}>• customer support</Text>
<Text style={styles.bullet}>• dispute investigation/resolution</Text>
<Text style={styles.bullet}>• legal compliance</Text>
<Text style={styles.bullet}>• service improvement</Text>
<Text style={styles.bullet}>• communications regarding Bookings/account</Text>

<Text style={styles.body}>
  Personal information may be shared with third parties where reasonably
  necessary and permitted by law.
</Text>

<Text style={styles.legalSectionTitle}>
  18. Suspension, Restrictions, and Termination
</Text>

<Text style={styles.body}>
  OurSpace may suspend, restrict, cancel, or terminate your account, listing,
  Booking, payout access, or use of the platform where reasonably necessary if you:
</Text>

<Text style={styles.bullet}>• breach this Agreement or any policy;</Text>
<Text style={styles.bullet}>• fail verification checks;</Text>
<Text style={styles.bullet}>• provide misleading or incomplete listing information;</Text>
<Text style={styles.bullet}>• create safety, fraud, legal, financial, or reputational risk;</Text>
<Text style={styles.bullet}>• fail to pay amounts due to OurSpace;</Text>
<Text style={styles.bullet}>• repeatedly cancel Bookings without justification;</Text>
<Text style={styles.bullet}>• store or permit prohibited or unsafe items;</Text>
<Text style={styles.bullet}>• misuse the platform or messaging tools; or</Text>
<Text style={styles.bullet}>• engage in harassment, deception, abuse, or unlawful conduct.</Text>

<Text style={styles.body}>
  You may close your account at any time, but closure does not affect existing
  payment obligations, active Bookings, unresolved disputes, payout holds,
  chargebacks, open claims, or rights and obligations that by their nature
  survive termination.
</Text>

<Text style={styles.legalSectionTitle}>19. Indemnity</Text>

<Text style={styles.body}>
  To the maximum extent permitted by law, you will defend, indemnify, and hold
  harmless OurSpace, its affiliates, and their respective directors, officers,
  employees, contractors, and agents from and against any claims, demands,
  losses, damages, liabilities, judgments, penalties, fines, costs, and
  expenses, including reasonable legal fees, arising out of or related to:
</Text>

<Text style={styles.bullet}>• your Space or property conditions;</Text>
<Text style={styles.bullet}>• your hosting activity;</Text>
<Text style={styles.bullet}>• your breach of this Agreement or any policy;</Text>
<Text style={styles.bullet}>• your breach of law or third-party rights;</Text>
<Text style={styles.bullet}>
  • damage, contamination, injury, or access issues caused by your acts,
  omissions, or property;
</Text>
<Text style={styles.bullet}>• your misrepresentation in a listing; or</Text>
<Text style={styles.bullet}>
  • any false, misleading, or incomplete information you provide.
</Text>

<Text style={styles.legalSectionTitle}>20. Limitation of Liability</Text>

<Text style={styles.body}>
  To the maximum extent permitted by law:
</Text>

<Text style={styles.bullet}>
  • OurSpace will not be liable for any indirect, incidental, special,
  consequential, exemplary, or punitive damages, including lost profits, lost
  business, lost data, emotional distress, or loss of opportunity;
</Text>

<Text style={styles.bullet}>
  • OurSpace will not be liable for damage to property, loss of Stored Items,
  or disputes between Hosts and Renters except to the extent such liability
  cannot be excluded by law; and
</Text>

<Text style={styles.bullet}>
  • if OurSpace is found liable to you for any claim arising from the platform
  or this Agreement, OurSpace’s aggregate liability will be limited to the
  greater of:
</Text>

<Text style={styles.bullet}>
  &nbsp;&nbsp;(a) the total host service fees paid by you to OurSpace for the
  specific Booking giving rise to the claim in the 12 months before the event; or
</Text>

<Text style={styles.bullet}>
  &nbsp;&nbsp;(b) CAD $250.
</Text>

<Text style={styles.body}>
  This section applies regardless of the legal theory of claim and even if a
  remedy fails of its essential purpose, subject always to applicable law.
</Text>

<Text style={styles.legalSectionTitle}>21. Compliance With Laws</Text>

<Text style={styles.body}>
  You must comply with all applicable laws, regulations, bylaws, orders, and
  safety requirements, including those relating to:
</Text>

<Text style={styles.bullet}>• fire and building safety;</Text>
<Text style={styles.bullet}>• zoning and land-use rules;</Text>
<Text style={styles.bullet}>• privacy;</Text>
<Text style={styles.bullet}>• tax reporting;</Text>
<Text style={styles.bullet}>• dangerous goods;</Text>
<Text style={styles.bullet}>• property rights;</Text>
<Text style={styles.bullet}>• consumer protection;</Text>
<Text style={styles.bullet}>
  • condominium, HOA, lease, or mortgage restrictions; and
</Text>
<Text style={styles.bullet}>
  • transportation, handling, and storage of goods.
</Text>

<Text style={styles.body}>
  Where any provision of this Agreement conflicts with non-excludable rights or
  obligations under applicable law, that provision will be interpreted and
  enforced to the minimum extent necessary to comply with applicable law, and
  the remainder of the Agreement will continue in full force.
</Text>

<Text style={styles.legalSectionTitle}>22. Notices</Text>

<Text style={styles.body}>
  You consent to receiving notices, disclosures, and communications
  electronically through the platform, by email, or by other contact
  information you provide.
</Text>

<Text style={styles.body}>
  You are responsible for keeping your contact details current.
</Text>

<Text style={styles.body}>
  Legal notices to OurSpace must be sent to:
</Text>

<Text style={styles.bullet}>OurSpace Technologies Inc.</Text>
<Text style={styles.bullet}>[Insert Registered Business Address]</Text>
<Text style={styles.bullet}>Email: [Insert Legal/Support Email]</Text>

<Text style={styles.legalSectionTitle}>
  23. Governing Law and Dispute Forum
</Text>

<Text style={styles.body}>
  This Agreement is governed by the laws of the Province of Alberta and the
  federal laws of Canada applicable therein, without regard to conflict of law
  principles, except where mandatory law requires otherwise.
</Text>

<Text style={styles.body}>
  Subject to applicable law, the courts of Alberta shall have exclusive
  jurisdiction over disputes arising from this Agreement.
</Text>

<Text style={styles.legalSectionTitle}>24. Changes to This Agreement</Text>

<Text style={styles.body}>
  OurSpace may update this Agreement from time to time.
</Text>

<Text style={styles.body}>
  Where required by law, we will provide notice of material changes. Your
  continued use of the platform after the effective date of an updated Agreement
  constitutes acceptance of the revised version, unless applicable law requires
  a different form of consent.
</Text>

<Text style={styles.legalSectionTitle}>
  25. Entire Agreement and Severability
</Text>

<Text style={styles.body}>
  This Agreement, together with the Terms & Conditions, Privacy Policy,
  booking-specific terms, and the policies incorporated by reference, forms the
  entire agreement between you and OurSpace regarding your use of the platform
  as a Host.
</Text>

<Text style={styles.body}>
  If any provision is held invalid, illegal, or unenforceable, that provision
  will be severed or limited to the minimum extent necessary, and the remaining
  provisions will remain in full force and effect.
</Text>

<Text style={styles.legalSectionTitle}>26. Contact and Support</Text>

<Text style={styles.body}>
  For support, disputes, or policy information, please visit:
</Text>

<Text style={styles.bullet}>• [Help Centre]</Text>
<Text style={styles.bullet}>• [Resolution Centre]</Text>
<Text style={styles.bullet}>• [Prohibited Items Policy]</Text>

<Text style={styles.body}>
  General support contact:
</Text>

<Text style={styles.bullet}>OurSpace Technologies Inc.</Text>
<Text style={styles.bullet}>Email: [Insert Support Email]</Text>









      </ScrollView>
    </View>



</View>



      {/* ACCEPTANCE */}
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setAccepted(!accepted)}
      >
        <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
          {accepted && <Text style={styles.checkmark}>✓</Text>}
        </View>

        <Text style={styles.checkboxText}>
          I have read and agree to the Host User Agreements.
        </Text>
      </TouchableOpacity>

      {/* SUBMIT */}
      <TouchableOpacity
        style={[
          styles.button,
          (!accepted || submitting) && styles.buttonDisabled,
        ]}
        onPress={handleAgree}
        disabled={!accepted || submitting}
      >
        <Text style={styles.buttonText}>
          {submitting ? "Saving..." : "Agree & Continue"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
    color: "#111827",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 20,
    color: "#0F6B5B",
  },

  body: {
    fontSize: 14,
    lineHeight: 22,
    color: "#374151",
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 28,
    marginBottom: 20,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#0F6B5B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },

  checkboxChecked: {
    backgroundColor: "#0F6B5B",
  },

  checkmark: {
    color: "#FFF",
    fontWeight: "700",
  },

  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },

  button: {
    backgroundColor: "#0F6B5B",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonDisabled: {
    backgroundColor: "#A7B0AE",
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },

  agreementHeading: {
	fontSize: 16,
	fontWeight: "700",
	color: "#111827",
	marginBottom: 8,
  },
  
  introText: {
	fontSize: 14,
	color: "#374151",
	marginBottom: 18,
	lineHeight: 22,
  },
  
  bulletRow: {
	flexDirection: "row",
	alignItems: "flex-start",
	marginBottom: 6,
  },
  

  bulletText: {
	flex: 1,
	fontSize: 14,
	lineHeight: 22,
	color: "#374151",
  },


  fullAgreementWrapper: {
	marginTop: 24,
  },
  
  agreementToggle: {
	flexDirection: "row",
	justifyContent: "space-between",
	alignItems: "center",
  },
  
  chevron: {
	fontSize: 14,
	color: "#6B7280",
  },
  
  fullAgreementBox: {
	marginTop: 12,
	borderWidth: 1,
	borderColor: "#E5E7EB",
	borderRadius: 14,
	backgroundColor: "#FAFAFA",
	maxHeight: 400,
	overflow: "hidden",
  },
  
  fullAgreementScroll: {
	padding: 16,
  },
  
  
  agreementSubheading: {
	fontSize: 13,
	color: "#6B7280",
	marginBottom: 4,
  },
  
  legalSectionTitle: {
	fontSize: 15,
	fontWeight: "700",
	marginTop: 18,
	marginBottom: 8,
	color: "#111827",
  },
  
  bullet: {
	fontSize: 14,
	lineHeight: 22,
	color: "#374151",
	marginBottom: 6,
	paddingLeft: 4,
  },




});


