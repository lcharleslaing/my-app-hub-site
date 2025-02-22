import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from '../../services/firebaseConfig';

export const InitialSetup: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  });

  useEffect(() => {
    checkForExistingSuperAdmin();
  }, []);

  const checkForExistingSuperAdmin = async () => {
    try {
      console.log('Checking for existing super admin...');
      const usersSnapshot = await getDocs(collection(firestore, 'users'));
      const superAdminExists = usersSnapshot.docs.some(doc => doc.data().role === 'superAdmin');

      console.log('Super admin exists:', superAdminExists);
      if (superAdminExists) {
        window.location.href = '/'; // Redirect to home if super admin exists
        return;
      }

      setLoading(false);
    } catch (err) {
      console.error('Error checking for super admin:', err);
      setError('Error checking for existing super admin');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await setDoc(doc(firestore, 'users', userCredential.user.uid), {
        email: formData.email,
        displayName: formData.displayName || formData.email.split('@')[0],
        role: 'superAdmin',
        createdAt: new Date().toISOString()
      });

      window.location.href = '/';
    } catch (err) {
      console.error('Error creating super admin:', err);
      setError('Failed to create super admin account');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
      <div className="p-4 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Create Super Admin</h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Display Name:</label>
          <input
            type="text"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Create Super Admin
        </button>
      </form>
    </div>
  );
};