import { auth, firestore } from './firebaseConfig';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface SuperAdminData {
  email: string;
  password: string;
  displayName: string;
}

export const createSuperAdmin = async ({ email, password, displayName }: SuperAdminData) => {
  try {
    // Check if super admin already exists
    const superAdminDoc = await getDoc(doc(firestore, 'system', 'superAdmin'));
    if (superAdminDoc.exists()) {
      throw new Error('Super admin already exists');
    }

    // Create the user in Firebase Auth
    console.log('Creating super admin user...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Send email verification
    await sendEmailVerification(user);

    // Create user document in Firestore
    await setDoc(doc(firestore, 'users', user.uid), {
      email,
      displayName,
      role: 'superAdmin',
      createdAt: new Date().toISOString(),
      isEmailVerified: false
    });

    // Create system document to mark super admin creation
    await setDoc(doc(firestore, 'system', 'superAdmin'), {
      uid: user.uid,
      createdAt: new Date().toISOString()
    });

    console.log('Super admin created successfully');
    return user;

  } catch (error) {
    console.error('Error creating super admin:', error);
    throw error;
  }
};

export const isSuperAdmin = async (uid: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(firestore, 'users', uid));
    return userDoc.exists() && userDoc.data()?.role === 'superAdmin';
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return false;
  }
};