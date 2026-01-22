
  

import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase/config'; // adjust import

interface BadgesProps {
  isVerified: boolean;
  createdAt: Date | null;
}



const badgeList = [
	{
	  id: '5StarStreak',
	  title: '5 Star Streak',
	  description: 'Receive three 5-star reviews.',
	  isCompleted: false,
	  iconCompleted: require('../../../assets/badges/complete/5StarStreak.png'),
	  iconIncomplete: require('../../../assets/badges/incomplete/5StarStreak.png'),
	},
	{
	  id: '10XHost',
	  title: '10X Host',
	  description: 'Host 10 unique guests on your listings.',
	  isCompleted: false,
	  iconCompleted: require('../../../assets/badges/complete/10XHost.png'),
	  iconIncomplete: require('../../../assets/badges/incomplete/10XHost.png'),
	},
	{
	  id: '100DayMVP',
	  title: '100 Day MVP',
	  description: 'Be a member for over 100 days.',
	  isCompleted: true,
	  iconCompleted: require('../../../assets/badges/complete/100DayMVP.png'),
	  iconIncomplete: require('../../../assets/badges/incomplete/100DayMVP.png'),
	},
	{
	  id: 'firstHost',
	  title: 'First Host',
	  description: 'Successfully host your first guest.',
	  isCompleted: false,
	  iconCompleted: require('../../../assets/badges/complete/firstHost.png'),
	  iconIncomplete: require('../../../assets/badges/incomplete/firstHost.png'),
	},
	{
	  id: 'firstStash',
	  title: 'First Stash',
	  description: 'Start your first storage booking.',
	  isCompleted: false,
	  iconCompleted: require('../../../assets/badges/complete/firstStash.png'),
	  iconIncomplete: require('../../../assets/badges/incomplete/firstStash.png'),
	},
	// {
	//   id: 'fullHouse',
	//   title: 'Full House',
	//   description: 'Have 100% occupancy for a full week.',
	//   isCompleted: false,
	//   iconCompleted: require('../../../assets/badges/complete/fullHouse.png'),
	//   iconIncomplete: require('../../../assets/badges/incomplete/fullHouse.png'),
	// },
	{
	  id: 'respectedRoyalty',
	  title: 'Respected Royalty',
	  description: 'Get over 30 days booked on a space',
	  isCompleted: false,
	  iconCompleted: require('../../../assets/badges/complete/respectedRoyalty.png'),
	  iconIncomplete: require('../../../assets/badges/incomplete/respectedRoyalty.png'),
	},
	{
	  id: 'socialStar',
	  title: 'Social Star',
	  description: 'Engage actively on social platforms.',
	  isCompleted: false,
	  iconCompleted: require('../../../assets/badges/complete/socialStar.png'),
	  iconIncomplete: require('../../../assets/badges/incomplete/socialStar.png'),
	},
	{
	  id: 'speedyReplier',
	  title: 'Speedy Replier',
	  description: 'Respond to guest inquiries in under an hour.',
	  isCompleted: false,
	  iconCompleted: require('../../../assets/badges/complete/speedyReplier.png'),
	  iconIncomplete: require('../../../assets/badges/incomplete/speedyReplier.png'),
	},
	{
	  id: 'verifiedHero',
	  title: 'Verified Hero',
	  description: 'Verify your identity and payment method.',
	  isCompleted: false,
	  iconCompleted: require('../../../assets/badges/complete/verifiedHero.png'),
	  iconIncomplete: require('../../../assets/badges/incomplete/verifiedHero.png'),
	},
  ];
  
  
const getInitialBadges = () => {
  const obj: { [key: string]: boolean } = {};
  badgeList.forEach(b => {
    obj[b.id] = b.isCompleted || false;
  });
  return obj;
};

const has100DayMVP = (createdAt: Date | null) => {
  if (!createdAt) return false;
  const now = new Date();
  const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 100;
};

const Badges: React.FC<BadgesProps> = ({ isVerified, createdAt }) => {
	const [userBadges, setUserBadges] = useState<{ [key: string]: boolean }>({});

  // Ensure user doc has badges
  useEffect(() => {
    const ensureBadges = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        if (!data.badges) {
          await updateDoc(userRef, {
            badges: getInitialBadges()
          });
          console.log('Initialized badges for user.');
        }
      } else {
        // If user doc doesn’t exist yet, create it with badges
        await setDoc(userRef, {
          firstName: user.displayName || '',
          createdAt: serverTimestamp(),
          badges: getInitialBadges()
        });
        console.log('Created user with badges.');
      }
    };

    ensureBadges();
  }, []);

  useEffect(() => {
    const fetchUserBadges = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        // Initialize badges if missing
        if (!data.badges) {
          const initialBadges = getInitialBadges();
          await updateDoc(userRef, { badges: initialBadges });
          setUserBadges(initialBadges);
        } else {
          setUserBadges(data.badges);
        }
      }
    };

    fetchUserBadges();
  }, []);

  // Merge Firestore badges with props-based badges
  const updatedBadgeList = badgeList.map(badge => {
    let isCompleted = badge.isCompleted;

    // Apply Firestore badge if available
    if (userBadges[badge.id] !== undefined) isCompleted = userBadges[badge.id];

    // Override verifiedHero and 100DayMVP from props
    if (badge.id === 'verifiedHero') isCompleted = isVerified;
    if (badge.id === '100DayMVP') isCompleted = has100DayMVP(createdAt);

    return { ...badge, isCompleted };
  });



  return (
    <View style={styles.container}>
      {updatedBadgeList.map(badge => (
        <TouchableOpacity key={badge.id} style={styles.badgeSingleItem} onPress={() => Alert.alert(badge.title, badge.description)}>
          <Image
            source={badge.isCompleted ? badge.iconCompleted : badge.iconIncomplete}
            style={styles.badgeIcon}
          />
		<Text
		style={[
			styles.badgeTitle,
			badge.isCompleted && { fontWeight: 'bold' }, // <-- make bold if completed
		]}
		>
		{badge.title}
		</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default Badges;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  badgeSingleItem: {
    width: '33.333%',
    alignItems: 'center',
    marginBottom: 20,
  },
  badgeIcon: {
    width: 100,
    height: 100,
    marginBottom: 6,
    resizeMode: 'contain',
  },
  badgeTitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#333',
  },
});






