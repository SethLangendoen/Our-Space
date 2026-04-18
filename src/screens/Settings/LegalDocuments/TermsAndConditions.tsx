import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { auth, db } from "../../../firebase/config";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { appTerms, LegalBlock } from "./AppTerms";

export default function TermsAndConditions() {
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
        "legal.termsAndConditions": true,
        "legal.termsSignedAt": serverTimestamp(),
      });

      Alert.alert("Success", "Terms and Conditions accepted.");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save Terms and Conditions.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderLegalBlock = (block: LegalBlock, index: number) => {
    switch (block.type) {
      case "heading":
        return (
          <Text key={index} style={styles.agreementHeading}>
            {block.text}
          </Text>
        );

      case "subheading":
        return (
          <Text key={index} style={styles.agreementSubheading}>
            {block.text}
          </Text>
        );

      case "sectionTitle":
        return (
          <Text key={index} style={styles.legalSectionTitle}>
            {block.text}
          </Text>
        );

      case "paragraph":
        return (
          <Text key={index} style={styles.body}>
            {block.text}
          </Text>
        );

      case "bulletList":
        return (
          <View key={index} style={styles.bulletList}>
            {block.items.map((item, i) => (
              <Text key={i} style={styles.bullet}>
                • {item}
              </Text>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* AGREEMENT BOX */}
      <View style={styles.fullAgreementBox}>
        <ScrollView
          contentContainerStyle={styles.fullAgreementScroll}
          showsVerticalScrollIndicator
        >
          {appTerms.map((block, index) => renderLegalBlock(block, index))}
        </ScrollView>
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
          I have read and agree to the Terms and Conditions.
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 20,
  },

  fullAgreementBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    backgroundColor: "#FAFAFA",
    overflow: "hidden",
    marginBottom: 20,
  },

  fullAgreementScroll: {
    padding: 16,
    paddingBottom: 40,
  },

  agreementHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
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

  body: {
    fontSize: 14,
    lineHeight: 22,
    color: "#374151",
    marginBottom: 10,
  },

  bulletList: {
    marginBottom: 10,
  },

  bullet: {
    fontSize: 14,
    lineHeight: 22,
    color: "#374151",
    marginBottom: 6,
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
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
});