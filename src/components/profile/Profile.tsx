import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { updateEmail, updatePassword } from 'firebase/auth';
import { firestore } from '../../services/firebaseConfig';

export const Profile: React.FC = () => {
  const { currentUser, userDetails } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    displayName: userDetails?.displayName || '',
    email: currentUser?.email || '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!currentUser) throw new Error('No user logged in');

      // Update display name in Firestore
      if (formData.displayName !== userDetails?.displayName) {
        await updateDoc(doc(firestore, 'users', currentUser.uid), {
          displayName: formData.displayName
        });
      }

      // Update email if changed
      if (formData.email !== currentUser.email) {
        await updateEmail(currentUser, formData.email);
        await updateDoc(doc(firestore, 'users', currentUser.uid), {
          email: formData.email
        });
      }

      // Update password if provided
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await updatePassword(currentUser, formData.newPassword);
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        {!isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="font-medium">Display Name</label>
              <p className="mt-1">{userDetails?.displayName}</p>
            </div>
            <div>
              <label className="font-medium">Email</label>
              <p className="mt-1">{currentUser?.email}</p>
            </div>
            <div>
              <label className="font-medium">Role</label>
              <p className="mt-1">{userDetails?.role}</p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Display Name</label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">New Password (optional)</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Leave blank to keep current password"
              />
            </div>
            {formData.newPassword && (
              <div>
                <label className="block font-medium mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 text-white rounded ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};