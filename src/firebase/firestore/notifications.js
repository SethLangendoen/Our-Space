import { auth } from '../config';

export const sendNotification = async ({
  targetUserId,
  title,
  body,
  data = {},
}) => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const idToken = await user.getIdToken();

    await fetch(
      "https://us-central1-our-space-8b8cd.cloudfunctions.net/sendPushNotification",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          targetUserId,
          title,
          body,
          data,
        }),
      }
    );
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};