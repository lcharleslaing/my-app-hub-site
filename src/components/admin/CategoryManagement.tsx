import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { firestore } from '../../services/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import type { AppCategory } from '../../types/app';

export const CategoryManagement: React.FC = () => {
  const { userDetails } = useAuth();
  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<AppCategory>>({
    name: '',
    description: '',
    type: 'Public',
    order: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const categoriesRef = collection(firestore, 'appCategories');
      const snapshot = await getDocs(categoriesRef);
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppCategory[];
      setCategories(categoriesData.sort((a, b) => a.order - b.order));
    } catch (err) {
      setError('Failed to fetch categories');
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentCategory.id) {
        const categoryRef = doc(firestore, 'appCategories', currentCategory.id);
        await updateDoc(categoryRef, {
          ...currentCategory,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(firestore, 'appCategories'), {
          ...currentCategory,
          createdAt: new Date().toISOString()
        });
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      setError('Failed to save category');
      console.error(err);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteDoc(doc(firestore, 'appCategories', categoryId));
        fetchCategories();
      } catch (err) {
        setError('Failed to delete category');
        console.error(err);
      }
    }
  };

  if (userDetails?.role !== 'superAdmin') {
    return <div className="p-4 text-red-600">Access denied</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">App Categories</h1>
        <button
          onClick={() => {
            setIsEditing(false);
            setCurrentCategory({
              name: '',
              description: '',
              type: 'Public',
              order: categories.length
            });
            setShowModal(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Category
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">{category.name}</h3>
            <p className="text-gray-600">{category.description}</p>
            <p className="text-sm text-gray-500">Type: {category.type}</p>
            <p className="text-sm text-gray-500">Order: {category.order}</p>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => {
                  setCurrentCategory(category);
                  setIsEditing(true);
                  setShowModal(true);
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? 'Edit Category' : 'Add New Category'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={currentCategory.name}
                    onChange={(e) => setCurrentCategory(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={currentCategory.description}
                    onChange={(e) => setCurrentCategory(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={currentCategory.type}
                    onChange={(e) => setCurrentCategory(prev => ({ ...prev, type: e.target.value as 'Public' | 'Private' | 'Pro' }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                    <option value="Pro">Pro</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {isEditing ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};