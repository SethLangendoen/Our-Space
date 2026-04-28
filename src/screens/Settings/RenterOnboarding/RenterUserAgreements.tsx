
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

export default function RenterUserAgreements() {
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showFullAgreement, setShowFullAgreement] = useState(false);
  const [alreadyAccepted, setAlreadyAccepted] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

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
            userData?.legal?.renter?.userAgreementSigned === true;

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
        "legal.renter.userAgreementSigned": true,
        "legal.renter.userAgreementSignedAt": serverTimestamp(),
      });

      Alert.alert("Success", "Renter User Agreement accepted.");
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
		<Text style={styles.pageTitle}>Renter User Agreements</Text>

		<Text style={styles.sectionTitle}>OurSpace Renter Agreement Summary</Text>

		<Text style={styles.introText}>
		By continuing, you confirm that you understand and agree to the following:
		</Text>

		<AgreementSection
		title="Using OurSpace"
		items={[
			"OurSpace is a platform that connects renters with independent hosts offering storage space.",
			"Hosts, not OurSpace, provide the actual storage space.",
			"You are responsible for reviewing listings and ensuring the space meets your needs.",
		]}
		/>

		<AgreementSection
		title="Eligibility"
		items={[
			"You must be at least 18 years old to use OurSpace as a renter.",
			"You must provide accurate account, identity, and payment information.",
			"You must have the legal right to store and remove the items you place in a space.",
		]}
		/>

		<AgreementSection
		title="Permitted Items"
		items={[
			"You may only store legal, safe, and properly packed items.",
			"You must not store prohibited, hazardous, illegal, flammable, perishable, or high-risk items unless explicitly allowed.",
			"You are responsible for ensuring your items do not damage the host’s property or create safety risks.",
		]}
		/>

		<AgreementSection
		title="Booking and Billing"
		items={[
			"You are not charged when you first request a booking.",
			"You are charged 48 hours before the booking starts if the booking remains active.",
			"If you cancel more than 48 hours before the start time, you will not be charged.",
			"If you cancel within 48 hours of the booking start time, the booking may be non-refundable.",
			"Bookings may renew on a daily, weekly, or monthly billing cycle depending on your selection.",
		]}
		/>

		<AgreementSection
		title="Ending Storage"
		items={[
			"Once your items are stored, the current billing cycle may be non-refundable.",
			"If you end a booking during a billing cycle, that cycle is your final payment.",
			"Charges stop only after your items are fully removed and the end-of-booking process is completed or verified.",
			"If your items remain in the space, charges may continue.",
		]}
		/>

		<AgreementSection
		title="Host Changes"
		items={[
			"A host may decline or cancel a request before storage begins.",
			"If a host cancels after you have been charged but before storage begins, you may be eligible for a refund.",
			"If a host ends an active booking, they may be required to provide notice unless there is a safety, legal, or policy issue.",
		]}
		/>

		<AgreementSection
		title="Access and Conduct"
		items={[
			"You must follow the host’s access instructions and respect their property.",
			"You may only access the approved storage area.",
			"You must communicate respectfully and use the platform appropriately.",
		]}
		/>

		<AgreementSection
		title="Damage, Risk, and Insurance"
		items={[
			"You store items at your own risk.",
			"You are responsible for properly packing and protecting your items.",
			"OurSpace is not responsible for loss, theft, or damage except where required by law.",
			"You are responsible for any damage your items cause to a host’s property or others.",
		]}
		/>

		<AgreementSection
		title="Disputes and Support"
		items={[
			"If there is a problem, you must report it through the Resolution Centre as soon as possible.",
			"You may need to provide photos, messages, receipts, or other evidence.",
			"Refunds or credits may apply only in certain situations under OurSpace policies.",
		]}
		/>

		<AgreementSection
		title="Important Legal Terms"
		items={[
			"Your booking is a storage arrangement only and does not create a lease or tenancy.",
			"You agree to follow OurSpace policies and applicable laws.",
			"By continuing, you agree to the full Renter Agreement, Terms & Conditions, Privacy Policy, Help Centre, Resolution Centre, and Prohibited Items Policy.",
		]}
		/>










<Text style={styles.sectionTitle}>Full Renter Agreement</Text>

<View style={styles.fullAgreementWrapper}>
  <View style={styles.fullAgreementBox}>
    <ScrollView nestedScrollEnabled style={styles.fullAgreementScroll}>

      <Text style={styles.agreementHeading}>
        OURSPACE RENTER AGREEMENT
      </Text>

      <Text style={styles.agreementSubheading}>
        Last Updated: [Insert Date]
      </Text>

      <Text style={styles.agreementSubheading}>
        Effective Date: [Insert Date]
      </Text>

      <Text style={styles.body}>
        This Renter Agreement ("Agreement") is a legally binding agreement
        between OurSpace Technologies Inc. ("OurSpace," "we," "us," or "our")
        and the individual or entity using the OurSpace platform as a renter
        ("Renter," "you," or "your").
      </Text>

      <Text style={styles.body}>
        This Agreement governs your use of the OurSpace mobile application,
        website, and related services to search for, request, book, access,
        and use storage space offered by independent third-party hosts ("Hosts").
      </Text>

      <Text style={styles.body}>
        By creating an account, clicking to accept this Agreement, requesting
        or confirming a booking, storing items in a Space, or otherwise using
        the platform as a Renter, you agree to be bound by this Agreement,
        our Terms & Conditions, Privacy Policy, Help Centre, Resolution Centre,
        Prohibited Items Policy, and any additional policies or booking terms
        made available through the platform, each as updated from time to time.
      </Text>

      <Text style={styles.body}>
        If you do not agree, you must not use OurSpace as a Renter.
      </Text>

      <Text style={styles.legalSectionTitle}>1. Nature of the Platform</Text>

      <Text style={styles.body}>
        OurSpace operates an online marketplace that enables Renters and Hosts
        to connect for storage arrangements.
      </Text>

      <Text style={styles.bullet}>
        • is not the owner, operator, lessor, warehouseman, bailee in possession,
        insurer, broker, carrier, or mover of any listed Space or Stored Items
      </Text>

      <Text style={styles.bullet}>
        • does not take physical possession, custody, or control of your items
      </Text>

      <Text style={styles.bullet}>
        • does not inspect every Space, supervise every exchange, or guarantee
        the conduct of any user
      </Text>

      <Text style={styles.bullet}>
        • is not a party to the physical storage arrangement between you and the Host
        except to the limited extent stated in this Agreement or platform policies
      </Text>

      <Text style={styles.body}>
        The storage service itself is provided by the Host, subject to listing
        details, booking terms, and applicable law.
      </Text>

      <Text style={styles.legalSectionTitle}>2. Definitions</Text>

      <Text style={styles.body}>
        "Platform" means the OurSpace website, mobile application, communication
        tools, payment flows, support channels, and related services.
      </Text>

      <Text style={styles.body}>
        "Renter" means a registered user who requests, books, or uses a Space to store items.
      </Text>

      <Text style={styles.body}>
        "Host" means an independent third party who lists a Space on the platform.
      </Text>

      <Text style={styles.body}>
        "Space" means the area offered by a Host for storage, including garages,
        basements, closets, sheds, rooms, or similar spaces.
      </Text>

      <Text style={styles.body}>
        "Booking" means a storage arrangement between a Renter and a Host
        facilitated through the platform.
      </Text>

      <Text style={styles.body}>
        "Storage Period" means the approved booking period during which your items
        are authorized to remain in the Space.
      </Text>

      <Text style={styles.body}>
        "Stored Items" means the goods, belongings, boxes, containers, or other
        personal property you place in a Space.
      </Text>

      <Text style={styles.body}>
        "Billing Cycle" means the recurring storage period selected for the Booking,
        which may be daily, weekly, or monthly.
      </Text>

      <Text style={styles.body}>
        "Policies" means the OurSpace Terms & Conditions, Privacy Policy, Help Centre,
        Resolution Centre, Prohibited Items Policy, and other policies we publish.
      </Text>

      <Text style={styles.legalSectionTitle}>3. Eligibility and Authority</Text>

      <Text style={styles.body}>
        To use OurSpace as a Renter, you must:
      </Text>

      <Text style={styles.bullet}>• be at least 18 years old and capable of entering into a binding contract</Text>
      <Text style={styles.bullet}>• provide accurate account, identity, and payment information</Text>
      <Text style={styles.bullet}>• complete required verification steps</Text>
      <Text style={styles.bullet}>• have the legal right to store and remove your items</Text>
      <Text style={styles.bullet}>• comply with all applicable laws</Text>
      <Text style={styles.bullet}>• use the platform only for lawful purposes</Text>

      <Text style={styles.body}>
        If you are using the platform on behalf of an entity, you confirm you have authority to bind it.
      </Text>

	  <Text style={styles.legalSectionTitle}>4. Account, Verification, and Electronic Consent</Text>

<Text style={styles.body}>
You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.
</Text>

<Text style={styles.body}>
You authorize OurSpace and its service providers to carry out verification, fraud prevention, payment authentication, identity confirmation, and risk screening measures reasonably required to operate the platform.
</Text>

<Text style={styles.body}>
You agree that:
</Text>

<Text style={styles.bullet}>
• electronic acceptance of this Agreement is legally valid and enforceable
</Text>

<Text style={styles.bullet}>
• electronic records, notices, communications, and confirmations satisfy legal writing requirements where permitted by law
</Text>

<Text style={styles.bullet}>
• booking confirmations, receipts, and policy updates may be delivered electronically through the app or email
</Text>


<Text style={styles.legalSectionTitle}>5. Booking Requests and Contract Formation</Text>

<Text style={styles.body}>
A listing on the platform is an invitation to request a Booking, not a guaranteed offer of storage.
</Text>

<Text style={styles.body}>
A Booking is formed only when:
</Text>

<Text style={styles.bullet}>
• you submit a booking request
</Text>

<Text style={styles.bullet}>
• the Host accepts your request
</Text>

<Text style={styles.bullet}>
• all required payment and platform conditions are successfully completed
</Text>

<Text style={styles.body}>
Each Booking may include additional listing-specific terms such as access rules, location details, environmental conditions, and billing cycle settings. You are responsible for reviewing these before booking.
</Text>


<Text style={styles.legalSectionTitle}>6. Renter Representations and Warranties</Text>

<Text style={styles.body}>
You represent, warrant, and agree that:
</Text>

<Text style={styles.bullet}>
• you own or have legal authority over all Stored Items
</Text>

<Text style={styles.bullet}>
• your Stored Items are lawful and safe to store
</Text>

<Text style={styles.bullet}>
• your Stored Items will not damage the Space or property
</Text>

<Text style={styles.bullet}>
• your Stored Items do not violate any laws, rights, or regulations
</Text>

<Text style={styles.bullet}>
• you will promptly remove any item deemed unsafe or prohibited
</Text>


<Text style={styles.legalSectionTitle}>7. Permitted and Prohibited Items</Text>

<Text style={styles.body}>
You may only store lawful, safe, properly packed items that comply with this Agreement, listing terms, and the Prohibited Items Policy.
</Text>

<Text style={styles.body}>
Unless explicitly approved in writing, you must not store:
</Text>

<Text style={styles.bullet}>
• illegal items or stolen property
</Text>

<Text style={styles.bullet}>
• cash, bullion, negotiable instruments, or highly valuable collectibles
</Text>

<Text style={styles.bullet}>
• firearms, ammunition, explosives, fireworks, or weapons
</Text>

<Text style={styles.bullet}>
• hazardous, flammable, corrosive, or toxic materials
</Text>

<Text style={styles.bullet}>
• propane, fuel, solvents, chemicals, or pressurized containers
</Text>

<Text style={styles.bullet}>
• perishable food or items that may rot or attract pests
</Text>

<Text style={styles.bullet}>
• drugs or controlled substances unless lawfully permitted
</Text>

<Text style={styles.bullet}>
• living animals of any kind
</Text>

<Text style={styles.bullet}>
• items producing odours, leaks, or contamination risks
</Text>

<Text style={styles.bullet}>
• items requiring temperature control unless explicitly stated
</Text>


<Text style={styles.legalSectionTitle}>8. Packing, Inventory, and Condition of Items</Text>

<Text style={styles.body}>
You are solely responsible for properly packing, securing, and protecting your Stored Items.
</Text>

<Text style={styles.body}>
You agree to:
</Text>

<Text style={styles.bullet}>
• use appropriate packaging for all items
</Text>

<Text style={styles.bullet}>
• protect fragile, sensitive, or moisture-vulnerable items
</Text>

<Text style={styles.bullet}>
• ensure items do not leak, attract pests, or create hazards
</Text>

<Text style={styles.bullet}>
• maintain an accurate inventory of stored items
</Text>

<Text style={styles.bullet}>
• provide photos or documentation when requested for disputes or claims
</Text>

<Text style={styles.body}>
Neither the Host nor OurSpace is responsible for damage caused by improper packing, inherent item fragility, or ordinary environmental conditions.
</Text>


<Text style={styles.legalSectionTitle}>9. Access, Conduct, and Property Rules</Text>

<Text style={styles.body}>
You agree to follow Host instructions and property rules at all times when accessing a Space.
</Text>

<Text style={styles.body}>
You must:
</Text>

<Text style={styles.bullet}>
• communicate respectfully through the platform
</Text>

<Text style={styles.bullet}>
• attend drop-off and pick-up appointments on time
</Text>

<Text style={styles.bullet}>
• only access the approved storage area
</Text>

<Text style={styles.bullet}>
• not interfere with Host property or other stored items
</Text>

<Text style={styles.bullet}>
• not duplicate keys, codes, or access credentials without permission
</Text>

<Text style={styles.bullet}>
• not allow unauthorized third-party access
</Text>

<Text style={styles.body}>
The Host may deny or delay access where reasonably necessary for safety, legal compliance, unpaid balances, or policy enforcement.
</Text>

<Text style={styles.legalSectionTitle}>10. Fees, Billing, Renewals, and Taxes</Text>

<Text style={styles.body}>
You agree to pay all amounts associated with your Booking, including storage fees, service fees, applicable taxes, add-ons, and any other charges disclosed in the platform or listing.
</Text>

<Text style={styles.body}>
Unless otherwise stated:
</Text>

<Text style={styles.bullet}>
• you are not charged when you first submit a Booking request
</Text>

<Text style={styles.bullet}>
• the initial charge is processed 48 hours before the Booking start time if active
</Text>

<Text style={styles.bullet}>
• Bookings may renew on a daily, weekly, or monthly Billing Cycle
</Text>

<Text style={styles.bullet}>
• each Billing Cycle is charged at the start of that cycle once storage begins
</Text>

<Text style={styles.bullet}>
• if you end storage mid-cycle, that cycle remains your final payable cycle
</Text>

<Text style={styles.bullet}>
• charges continue until items are fully removed and the Booking is completed or verified
</Text>

<Text style={styles.body}>
You authorize OurSpace and its payment processors to charge your selected payment method for all valid amounts due.
</Text>


<Text style={styles.legalSectionTitle}>11. Cancellations, Refunds, and Booking Issues</Text>

<Text style={styles.body}>
Cancellation and refund rights are governed by this Agreement, checkout terms, applicable law, and platform policies.
</Text>


<Text style={styles.legalSectionTitle}>11.1 Renter Cancellations Before Storage Begins</Text>

<Text style={styles.body}>
If you cancel more than 48 hours before the Booking start time, you will not be charged.
</Text>

<Text style={styles.body}>
If you cancel within 48 hours of the Booking start time, the Booking is non-refundable.
</Text>


<Text style={styles.legalSectionTitle}>11.2 Ending a Booking After Storage Begins</Text>

<Text style={styles.body}>
Once storage begins, the current Billing Cycle is generally non-refundable.
</Text>

<Text style={styles.bullet}>
• that Billing Cycle remains your final payable cycle
</Text>

<Text style={styles.bullet}>
• no prorated refunds apply unless required by law
</Text>

<Text style={styles.bullet}>
• no further charges apply once items are removed and verified
</Text>


<Text style={styles.legalSectionTitle}>11.3 Charges Continue Until Items Are Removed</Text>

<Text style={styles.body}>
A Booking is not considered ended until your Stored Items are fully removed and verified through the platform.
</Text>

<Text style={styles.body}>
If items remain in the Space, charges may continue.
</Text>


<Text style={styles.legalSectionTitle}>11.4 Host Cancellation or Early Ending</Text>

<Text style={styles.body}>
If a Host cancels before storage begins after you have been charged, you may receive a full refund.
</Text>

<Text style={styles.body}>
Hosts are generally expected to provide notice before ending an active Booking unless safety, legal, or policy issues apply.
</Text>

<Text style={styles.body}>
If a Host ends a Booking without required notice, you may be eligible for a refund, credit, or adjustment.
</Text>


<Text style={styles.legalSectionTitle}>11.5 Other Refund Situations</Text>

<Text style={styles.body}>
Refunds or credits may be available where:
</Text>

<Text style={styles.bullet}>
• the Space is materially misrepresented
</Text>

<Text style={styles.bullet}>
• access is denied without valid reason
</Text>

<Text style={styles.bullet}>
• the Space is unsafe or unusable
</Text>

<Text style={styles.bullet}>
• duplicate or incorrect charges occur
</Text>

<Text style={styles.bullet}>
• a dispute is resolved in your favour
</Text>

<Text style={styles.body}>
Refunds are not guaranteed for change of mind or minor dissatisfaction unless required by law.
</Text>


<Text style={styles.legalSectionTitle}>12. No Tenancy or Residential Rights</Text>

<Text style={styles.body}>
Your Booking is a limited licence to store items only. It does not create a tenancy or lease.
</Text>

<Text style={styles.bullet}>
• no residential tenancy rights
</Text>

<Text style={styles.bullet}>
• no lease or ownership interest
</Text>

<Text style={styles.bullet}>
• no right to occupy or reside in the Space
</Text>

<Text style={styles.body}>
You may only access the Space for approved storage, drop-off, and pick-up purposes.
</Text>


<Text style={styles.legalSectionTitle}>13. Risk of Loss and Insurance</Text>

<Text style={styles.body}>
You store all items at your own risk.
</Text>

<Text style={styles.body}>
You are responsible for deciding whether to insure your Stored Items against loss, theft, or damage.
</Text>

<Text style={styles.body}>
OurSpace strongly recommends maintaining appropriate insurance for your belongings.
</Text>


<Text style={styles.legalSectionTitle}>14. Damage to Space or Property</Text>

<Text style={styles.body}>
You are responsible for any damage or loss caused by your Stored Items, packing materials, or access conduct.
</Text>

<Text style={styles.bullet}>
• damage to Host property or structure
</Text>

<Text style={styles.bullet}>
• damage to neighbouring or third-party property
</Text>

<Text style={styles.bullet}>
• infestation, contamination, or cleanup costs
</Text>

<Text style={styles.body}>
You authorize OurSpace to charge your payment method for valid damage claims or dispute outcomes where permitted.
</Text>


<Text style={styles.legalSectionTitle}>15. Host Responsibility and Platform Role</Text>

<Text style={styles.body}>
Hosts are responsible for providing the Space as described and maintaining safe access conditions.
</Text>

<Text style={styles.body}>
OurSpace may assist with payments, communication, and disputes but does not guarantee Host performance or Space condition.
</Text>


<Text style={styles.legalSectionTitle}>16. OurSpace Disclaimers</Text>

<Text style={styles.body}>
The platform is provided on an “as is” and “as available” basis.
</Text>

<Text style={styles.body}>
We do not guarantee:
</Text>

<Text style={styles.bullet}>
• accuracy of listings
</Text>

<Text style={styles.bullet}>
• uninterrupted access
</Text>

<Text style={styles.bullet}>
• Host performance or behaviour
</Text>

<Text style={styles.bullet}>
• safety or suitability of any Space
</Text>

<Text style={styles.bullet}>
• protection against loss, theft, or damage
</Text>


<Text style={styles.legalSectionTitle}>17. Overstay, Non-Removal, and Unclaimed Items</Text>

<Text style={styles.body}>
You must remove all Stored Items by the end of the Storage Period unless extended through the platform.
</Text>

<Text style={styles.body}>
If you fail to remove items on time:
</Text>

<Text style={styles.bullet}>
• additional fees may continue to apply
</Text>

<Text style={styles.bullet}>
• access may be restricted where necessary
</Text>

<Text style={styles.bullet}>
• the Booking may remain active until items are removed
</Text>

<Text style={styles.bullet}>
• legal or policy-based recovery actions may apply where permitted
</Text>

<Text style={styles.body}>
If removal is disputed or unconfirmed, OurSpace may determine the Booking end date based on available evidence.
</Text>

<Text style={styles.legalSectionTitle}>10. Fees, Billing, Renewals, and Taxes</Text>

<Text style={styles.body}>
  You agree to pay all amounts associated with your Booking, including storage fees set by the Host,
  OurSpace service fees, applicable taxes, approved add-ons, extension fees, late fees, overstay fees,
  and any other charges disclosed in the listing or platform flows.
</Text>

<Text style={styles.body}>
  Unless otherwise stated, you are not charged when you first submit a Booking request. The initial
  charge is processed 48 hours before the Booking start time if the Booking remains active.
</Text>

<Text style={styles.body}>
  Bookings may renew automatically based on the Billing Cycle selected at checkout (daily, weekly, or monthly).
  Once storage begins, each Billing Cycle is charged at the start of that cycle.
</Text>

<Text style={styles.body}>
  If you end storage during an active Billing Cycle, that cycle remains your final payable cycle. Charges continue
  until your items are fully removed and the Booking is verified as completed in the platform.
</Text>

<Text style={styles.legalSectionTitle}>11. Cancellations, Refunds, and Booking Issues</Text>

<Text style={styles.body}>
  Cancellation and refund rights are governed by checkout terms, this Agreement, applicable law, and platform policies.
</Text>

<Text style={styles.body}>
  If you cancel more than 48 hours before the Booking start time, you will not be charged. If you cancel within
  48 hours, the Booking is non-refundable.
</Text>

<Text style={styles.body}>
  Once storage begins, the current Billing Cycle is generally non-refundable. Charges stop only when your items are
  fully removed and the Booking is completed or verified.
</Text>

<Text style={styles.body}>
  If a Host cancels before storage begins after you have been charged, you may be eligible for a refund.
</Text>

<Text style={styles.legalSectionTitle}>12. No Tenancy Rights</Text>

<Text style={styles.body}>
  Your Booking is a licence to store items only. It does not create a tenancy, lease, or residential right.
</Text>

<Text style={styles.body}>
  You may not use the Space for living, sleeping, or ongoing occupation.
</Text>

<Text style={styles.legalSectionTitle}>13. Risk of Loss and Insurance</Text>

<Text style={styles.body}>
  You store items at your own risk and are responsible for ensuring appropriate insurance coverage.
</Text>

<Text style={styles.body}>
  OurSpace does not insure Stored Items and strongly recommends maintaining adequate personal property insurance.
</Text>

<Text style={styles.legalSectionTitle}>14. Damage and Responsibility</Text>

<Text style={styles.body}>
  You are responsible for any damage caused by your Stored Items, packaging, access conduct, or breach of this Agreement.
</Text>

<Text style={styles.body}>
  This includes damage to the Host’s property, building areas, or third-party property.
</Text>

<Text style={styles.legalSectionTitle}>15. Host Responsibilities and Platform Role</Text>

<Text style={styles.body}>
  Hosts are responsible for providing the Space as described, maintaining access, and following required notice rules.
</Text>

<Text style={styles.body}>
  OurSpace acts only as a marketplace and does not guarantee Host performance or condition of any Space.
</Text>

<Text style={styles.legalSectionTitle}>16. Disclaimers</Text>

<Text style={styles.body}>
  The platform is provided on an “as is” and “as available” basis. We do not guarantee accuracy of listings,
  uninterrupted service, or safety of any Space.
</Text>

<Text style={styles.legalSectionTitle}>17. Overstay and Unclaimed Items</Text>

<Text style={styles.body}>
  You must remove all items by the end of your Storage Period. If you fail to do so, additional charges may apply.
</Text>

<Text style={styles.body}>
  Items may be treated as abandoned where permitted by law, and Hosts or OurSpace may take lawful steps including
  storage, notice, disposal, or sale procedures.
</Text>

<Text style={styles.legalSectionTitle}>18. Disputes and Evidence</Text>

<Text style={styles.body}>
  Disputes must be reported through the Resolution Centre. You agree to provide evidence such as photos,
  messages, receipts, and other relevant documentation.
</Text>

<Text style={styles.legalSectionTitle}>19. Privacy</Text>

<Text style={styles.body}>
  Your personal information is handled in accordance with our Privacy Policy and applicable privacy laws.
</Text>

<Text style={styles.legalSectionTitle}>20. Suspension and Termination</Text>

<Text style={styles.body}>
  We may suspend or terminate your account for violations of this Agreement, safety concerns, fraud,
  misuse of the platform, or other serious issues.
</Text>

<Text style={styles.legalSectionTitle}>21. Indemnity</Text>

<Text style={styles.body}>
  You agree to indemnify OurSpace against claims arising from your use of the platform, your Stored Items,
  or your breach of this Agreement.
</Text>

<Text style={styles.legalSectionTitle}>22. Limitation of Liability</Text>

<Text style={styles.body}>
  OurSpace’s liability is limited to the maximum extent permitted by law and generally does not exceed
  the fees paid for the applicable Booking or CAD $250.
</Text>

<Text style={styles.legalSectionTitle}>23. Compliance With Laws</Text>

<Text style={styles.body}>
  You must comply with all applicable laws, including those related to storage of goods, safety,
  consumer protection, and privacy.
</Text>

<Text style={styles.legalSectionTitle}>24. Notices</Text>

<Text style={styles.body}>
  Notices may be delivered electronically through the platform or email. You are responsible for keeping your contact
  information up to date.
</Text>

<Text style={styles.legalSectionTitle}>25. Governing Law</Text>

<Text style={styles.body}>
  This Agreement is governed by the laws of the Province of Alberta and applicable federal laws of Canada.
</Text>

<Text style={styles.legalSectionTitle}>26. Changes to This Agreement</Text>

<Text style={styles.body}>
  We may update this Agreement from time to time. Continued use of the platform constitutes acceptance of changes.
</Text>

<Text style={styles.legalSectionTitle}>27. Entire Agreement</Text>

<Text style={styles.body}>
  This Agreement, together with our policies, forms the entire agreement between you and OurSpace as a Renter.
</Text>

<Text style={styles.legalSectionTitle}>28. Contact and Support</Text>

<Text style={styles.body}>
  For support or disputes, please use the Help Centre or Resolution Centre. Legal notices should be sent
  to the contact information provided by OurSpace.
</Text>

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
          I have read and agree to the Renter User Agreements.
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


