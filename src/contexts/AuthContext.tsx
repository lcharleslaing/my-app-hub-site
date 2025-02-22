import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../services/firebaseConfig';

interface UserDetails {
  displayName: string;
  email: string;
  role: string;
  createdAt: string;
  isEmailVerified: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  userDetails: UserDetails | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userDetails: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email);
      setCurrentUser(user);

      if (user) {
        try {
          console.log('Fetching user details for:', user.uid);
          const userDoc = await getDoc(doc(firestore, 'users', user.uid));
          if (userDoc.exists()) {
            console.log('User details found:', userDoc.data());
            setUserDetails(userDoc.data() as UserDetails);
          } else {
            console.log('No user details found');
            setUserDetails(null);
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
          setUserDetails(null);
        }
      } else {
        setUserDetails(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userDetails,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};