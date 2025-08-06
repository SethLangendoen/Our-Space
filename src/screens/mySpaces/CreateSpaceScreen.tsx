


import React from 'react';
import SpaceForm from './SpaceForm';
import { addDoc, Timestamp, collection } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function CreateSpaceScreen() {
  const handleCreate = async (data: any) => {
    await addDoc(collection(db, 'spaces'), {
      ...data,
      createdAt: Timestamp.now(),
    });
    alert('Post created successfully!');
  };

  return <SpaceForm mode="create" onSubmit={handleCreate} />;
}


