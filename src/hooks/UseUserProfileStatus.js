// hooks/useUserProfileStatus.ts
import { useEffect, useState } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase/config'; // update path as needed

export default function useUserProfileStatus() {
  const [isComplete, setIsComplete] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const user = auth.currentUser;
      if (!user) return setIsComplete(false);

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsComplete(data?.profileComplete ?? false);
      } else {
        setIsComplete(false);
      }
    };

    fetchStatus();
  }, []);

  return isComplete;
}
