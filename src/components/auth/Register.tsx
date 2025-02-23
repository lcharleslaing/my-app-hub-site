import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, firestore } from '../../services/firebaseConfig';
import { Invitation } from '../admin/UserManagement';

export const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  });

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    const fetchInvitation = async () => {
      try {
        const invitationsRef = collection(firestore, 'invitations');
        const q = query(invitationsRef, where('token', '==', token));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError('Invalid or expired invitation');
          setLoading(false);
          return;
        }

        const invitationDoc = querySnapshot.docs[0];
        const invitationData = invitationDoc.data() as Invitation;

        if (invitationData.status !== 'pending') {
          setError('This invitation has already been used or expired');
          setLoading(false);
          return;
        }

        setInvitation({ ...invitationData, id: invitationDoc.id });
        setFormData(prev => ({ ...prev, email: invitationData.email }));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching invitation:', err);
        setError('Error fetching invitation details');
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!invitation) {
      setError('Invalid invitation');
      return;
    }

    try {
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Create user document
      await setDoc(doc(firestore, 'users', userCredential.user.uid), {
        email: formData.email,
        displayName: formData.displayName,
        role: invitation.role,
        createdAt: new Date().toISOString()
      });

      // Update invitation status
      await updateDoc(doc(firestore, 'invitations', invitation.id), {
        status: 'accepted'
      });

      navigate('/');
    } catch (err) {
      console.error('Error registering:', err);
      setError('Failed to create account');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Complete Registration</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full px-3 py-2 border rounded-md bg-gray-100"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Display Name</label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Complete Registration
        </button>
      </form>
    </div>
  );
};