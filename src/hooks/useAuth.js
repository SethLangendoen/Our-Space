// // src/hooks/useAuth.ts
// import { useEffect, useState } from 'react';
// import { auth } from '../firebase/config';
// import { User } from 'firebase/auth';

// export function useAuth() {
//   const [user, setUser] = useState<User | null>(auth.currentUser);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
//       setUser(firebaseUser);
//       setLoading(false);
//     });

//     return unsubscribe; // cleanup
//   }, []);

//   return { user, loading };
// }