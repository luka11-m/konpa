import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, query, where, Timestamp } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export async function createUser(uid, userData) {
  return await addDoc(collection(db, 'users'), {
    uid,
    ...userData,
    createdAt: Timestamp.now()
  });
}

export async function getUserData(uid) {
  const q = query(collection(db, 'users'), where('uid', '==', uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.length > 0 ? snapshot.docs[0].data() : null;
}

export async function createGroup(groupName, leader, gender) {
  return await addDoc(collection(db, 'groups'), {
    groupName,
    leader,
    members: [leader],
    gender,
    status: 'forming',
    createdAt: Timestamp.now()
  });
}

export async function addGroupMember(groupId, uid) {
  const groupRef = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupRef);
  const members = groupSnap.data().members || [];
  await updateDoc(groupRef, { members: [...members, uid] });
}

export async function getUserGroups(uid) {
  const q = query(collection(db, 'groups'), where('members', 'array-contains', uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getGroupById(groupId) {
  const docSnap = await getDoc(doc(db, 'groups', groupId));
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

export async function saveMatchingConditions(groupId, dates, area, budget) {
  return await addDoc(collection(db, 'matchingConditions'), {
    groupId,
    preferredDates: dates,
    preferredArea: area,
    budget,
    status: 'pending',
    createdAt: Timestamp.now()
  });
}

export async function getMatchesByUser(uid) {
  const userGroups = await getUserGroups(uid);
  const groupIds = userGroups.map(g => g.id);

  if (groupIds.length === 0) return [];

  const q = query(collection(db, 'matches'),
    where('maleGroupId', 'in', groupIds || [''])
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getStoreById(storeId) {
  const docSnap = await getDoc(doc(db, 'stores', storeId));
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}
