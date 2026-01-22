import React from "react";
import { View, Text, StyleSheet } from "react-native";

const STATUS_STEPS = [
  { key: 'requested', label: 'Requested' },
  { key: 'awaiting_acceptance', label: 'Awaiting Acceptance' },
  { key: 'confirmed', label: 'Confirmed' },
];

type Props = {
  status: string;
  userRole: 'host' | 'renter';
};

const ReservationStatusStepper = ({ status, userRole }: Props) => {
  const isCancelled =
    status === 'cancelled_by_renter' || status === 'cancelled_by_host';

  const isCompleted =
    status === 'completed';

  

  /* -------------------- CANCELLED VIEW -------------------- */
  if (isCancelled) {
    return (
      <View>
        <View style={styles.cancelledContainer}>
          <Text style={styles.cancelledTitle}>
            Reservation Cancelled
          </Text>
          <Text style={styles.cancelledSubtitle}>
            {status === 'cancelled_by_renter'
              ? 'Cancelled by renter'
              : 'Cancelled by host'}
          </Text>
        </View>

        <Text style={styles.descriptionText}>
          {status === 'cancelled_by_renter'
            ? 'This reservation was cancelled by the renter. Cancellation fees may have applied.'
            : 'This reservation was cancelled by the host. No charges were applied.'}
        </Text>
      </View>
    );
  }

  if (isCompleted) {
    return (
      <View>
        <View style={styles.completedContainer}>
          <Text style={styles.completedTitle}>
            Reservation Completed
          </Text>
        </View>
      </View>
    );
  }

  /* -------------------- ACTIVE STEPPER -------------------- */
  const currentIndex = STATUS_STEPS.findIndex(step => step.key === status);

  const getStatusDescription = () => {
    if (status === 'requested') {
      return userRole === 'host'
        ? 'By confirming this reservation, you allow the requester to review and accept the booking.'
        : 'Your request is awaiting confirmation from the owner.';
    }

    if (status === 'awaiting_acceptance') {
      return userRole === 'renter'
        ? "You've confirmed this reservation. Now waiting on the requester to accept."
        : 'The owner has confirmed your reservation. Accepting will finalize payment.';
    }

    if (status === 'confirmed') {
      return 'This reservation is confirmed. Both parties can prepare for move-in and storage.';
    }

    return '';
  };

  return (
    <View style={styles.stepperAndText}>
      {/* Stepper */}
      <View style={styles.stepperContainer}>
        {STATUS_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <View key={step.key} style={styles.stepWrapper}>
              {index < STATUS_STEPS.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    isCompleted && styles.stepLineCompleted,
                  ]}
                />
              )}

              <View
                style={[
                  styles.stepCircle,
                  isCompleted && styles.stepCompleted,
                  isActive && styles.stepActive,
                ]}
              >
                <Text style={styles.stepNumber}>{index + 1}</Text>
              </View>

              <Text
                style={[
                  styles.stepLabel,
                  isActive && styles.stepLabelActive,
                ]}
              >
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>
          {getStatusDescription()}
        </Text>
      </View>
    </View>
  );
};

export default ReservationStatusStepper;

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({

	stepperAndText: {
		marginVertical: 20,
	},

  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 0,
    paddingHorizontal: 0,
  },

  stepWrapper: {
    alignItems: 'center',
    flex: 1,
  },

  stepCircle: {
    width: 50,
    height: 50,
    borderRadius: 17,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },

  stepCompleted: {
    backgroundColor: '#34D399',
  },

  stepActive: {
    backgroundColor: '#111827',
  },

  stepNumber: {
    color: '#fff',
    fontWeight: '600',
  },

  stepLabel: {
	marginTop: 6,
	fontSize: 12,
	color: '#6B7280',
	textAlign: 'center',
	minHeight: 32,     // 👈 THIS fixes alignment
	lineHeight: 16,   // keeps spacing tight
  },
  

  stepLabelActive: {
    color: '#111827',
    fontWeight: '600',
  },

  stepLine: {
    position: 'absolute',
    top: 25,
    left: '50%',
    width: '100%',
    height: 2,
    backgroundColor: '#E5E7EB',
    zIndex: 0,
  },

  stepLineCompleted: {
    backgroundColor: '#34D399',
  },

  descriptionContainer: {
    paddingHorizontal: 16,
    marginTop: 0,
  },

  descriptionText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'left',
    lineHeight: 20,
  },

  cancelledContainer: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  completedContainer: {
    backgroundColor: '#E5E7EB',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  cancelledTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#B91C1C',
  },
  completedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34D399',
  },

  cancelledSubtitle: {
    marginTop: 4,
    color: '#7F1D1D',
  },
});
