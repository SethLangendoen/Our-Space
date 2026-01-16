import { Alert } from "react-native";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase/config";

/**
 * Cancels a reservation before the start date and applies
 * early cancellation fees if applicable.
 *
 * @param {string} reservationId
 */

export const handleCancelReservation = (reservationId) => {
  console.log("handleCancelReservation called with reservationId:", reservationId);

  if (!reservationId) {
    console.warn("No reservationId passed to handleCancelReservation!");
    Alert.alert("Error", "Reservation ID is required.");
    return;
  }

  Alert.alert(
    "Cancel reservation",
    "Cancelling may incur a fee depending on how close the start date is.",
    [
      {
        text: "Back",
        style: "cancel",
      },
      {
        text: "Confirm cancellation",
        style: "destructive",
        onPress: async () => {
          console.log("Confirm cancellation pressed for reservationId:", reservationId);

          try {
            const cancelFn = httpsCallable(
              functions,
              "cancelReservationEarly"
            );

            // Log what you are sending to Firebase
            console.log("Calling cancelReservationEarly with data:", { reservationId });

            const result = await cancelFn({
              reservationId,
            });

            console.log("cancelReservationEarly result:", result);

            const baseAmount = result?.data?.baseAmount || 0;

            Alert.alert(
              "Reservation cancelled",
              baseAmount > 0
                ? "A cancellation fee was charged."
                : "No cancellation fee applied."
            );
          } catch (err) {
            console.error("Cancellation error:", err);

            Alert.alert(
              "Error",
              err?.message || "Cancellation failed"
            );
          }
        },
      },
    ]
  );
};
