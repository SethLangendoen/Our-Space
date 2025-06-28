import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useRoute } from '@react-navigation/native';
import SpaceForm from './SpaceForm';
import { Text } from 'react-native';

export default function EditSpaceScreen() {
  const route = useRoute();
  const { spaceId } = route.params as { spaceId: string };
  const [spaceData, setSpaceData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      const docRef = doc(db, 'spaces', spaceId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) setSpaceData(snapshot.data());
    };
    loadData();
  }, [spaceId]);

  const handleEdit = async (data: any) => {
    const docRef = doc(db, 'spaces', spaceId);
    await updateDoc(docRef, data);
    alert('Post updated successfully!');
  };

  return spaceData ? (
    <SpaceForm mode="edit" initialData={spaceData} onSubmit={handleEdit} />
  ) : (
    <Text>Loading...</Text>
  );
}
