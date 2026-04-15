
  

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
	  id: 'socialStar',
	  title: 'Social Star',
	  description: 'Engage actively on social platforms.',
	  isCompleted: false,
	  iconCompleted: require('../../../assets/badges/complete/RegSocialStar.png'),
	  iconIncomplete: require('../../../assets/badges/incomplete/FDSocialStar.png'),
	},
  {
	  id: 'firstMilestone',
	  title: 'First Milestone',
	  description: 'Complete Your First Milestone',
	  isCompleted: false,
	  iconCompleted: require('../../../assets/badges/complete/Reg1stMilestone.png'),
	  iconIncomplete: require('../../../assets/badges/incomplete/FD1stMilestone.png'),
	},
	{
	  id: 'RegVerifiedHero',
	  title: 'Verified Hero',
	  description: 'Verify your identity and payment method.',
	  isCompleted: false,
	  iconCompleted: require('../../../assets/badges/complete/RegVerifiedHero.png'),
	  iconIncomplete: require('../../../assets/badges/incomplete/FDVerifiedHero.png'),
	},

  {
	  id: '5StarStreak',
	  title: '5 Star Streak',
	  description: 'Receive 3 five-star reviews.',
	  isCompleted: false,
	  iconCompleted: require('../../../assets/badges/complete/Reg5StarStreak.png'),
	  iconIncomplete: require('../../../assets/badges/incomplete/FD5StarStreak.png'),
	},
  {
	  id: 'speedyReplier',
	  title: 'Speedy Replier',
	  description: 'Respond to guest inquiries in under an hour.',
	  isCompleted: false,
	  iconCompleted: require('../../../assets/badges/complete/RegSpeedyReplier.png'),
	  iconIncomplete: require('../../../assets/badges/incomplete/FDSpeedyReplier.png'),
	},
  {
	  id: 'Reg100DayMVP',
	  title: '100 Day MVP',
	  description: 'Be a member for over 100 days.',
	  isCompleted: true,
	  iconCompleted: require('../../../assets/badges/complete/Reg100DayMVP.png'),
	  iconIncomplete: require('../../../assets/badges/incomplete/FD100DayMVP.png'),
	},
	{
	  id: '5XSpacer',
	  title: '5X Spacer',
	  description: 'complete 5 successful bookings',
	  isCompleted: false,
	  iconCompleted: require('../../../assets/badges/complete/Reg5XSpacer.png'),
	  iconIncomplete: require('../../../assets/badges/incomplete/FD5XSpacer.png'),
	},

	{
	  id: 'allStarTier',
	  title: 'All Star Tier',
	  description: 'Receive 10 five-star reviews',
	  isCompleted: false,
	  iconCompleted: require('../../../assets/badges/complete/RegAllStarTier.png'),
	  iconIncomplete: require('../../../assets/badges/incomplete/FDAllStarTier.png'),
	},
	{
	  id: '30DayStreak',
	  title: '30 Day Streak',
	  description: 'Get over 30 days booked on a space',
	  isCompleted: false,
	  iconCompleted: require('../../../assets/badges/complete/Reg30DayStreak.png'),
	  iconIncomplete: require('../../../assets/badges/incomplete/FD30DayStreak.png'),
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
    if (badge.id === 'RegVerifiedHero') isCompleted = isVerified;
    if (badge.id === 'Reg100DayMVP') isCompleted = has100DayMVP(createdAt);

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
    marginBottom: 0,
    resizeMode: 'contain',
  },
  badgeTitle: {
    fontSize: 10,
    textAlign: 'center',
    color: '#333',
  },
});






