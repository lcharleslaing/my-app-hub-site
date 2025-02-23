import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { firestore } from '../../services/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import type { SubscriptionPlan, AppCategory } from '../../types/app';

export const SubscriptionPlans: React.FC = () => {
  const { userDetails } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Partial<SubscriptionPlan>>({
    name: '',
    description: '',
    price: 0,
    interval: 'monthly',
    features: [],
    categories: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    fetchCategories();
  }, []);

  useEffect(() => {
    console.log('Categories loaded:', categories);
  }, [categories]);

  const fetchPlans = async () => {
    try {
      const plansRef = collection(firestore, 'subscriptionPlans');
      const snapshot = await getDocs(plansRef);
      const plansData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SubscriptionPlan[];
      setPlans(plansData);
    } catch (err) {
      setError('Failed to fetch subscription plans');
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesRef = collection(firestore, 'appCategories');
      const snapshot = await getDocs(categoriesRef);
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppCategory[];
      setCategories(categoriesData.filter(cat => cat.type === 'Pro'));
    } catch (err) {
      setError('Failed to fetch categories');
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentPlan.id) {
        const planRef = doc(firestore, 'subscriptionPlans', currentPlan.id);
        await updateDoc(planRef, {
          ...currentPlan,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(firestore, 'subscriptionPlans'), {
          ...currentPlan,
          createdAt: new Date().toISOString()
        });
      }
      setShowModal(false);
      fetchPlans();
    } catch (err) {
      setError('Failed to save subscription plan');
      console.error(err);
    }
  };

  const handleDelete = async (planId: string) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await deleteDoc(doc(firestore, 'subscriptionPlans', planId));
        fetchPlans();
      } catch (err) {
        setError('Failed to delete subscription plan');
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
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <button
          onClick={() => {
            setIsEditing(false);
            setCurrentPlan({
              name: '',
              description: '',
              price: 0,
              interval: 'monthly',
              features: [],
              categories: []
            });
            setShowModal(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Plan
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan.id} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
            <p className="text-gray-600 mb-4">{plan.description}</p>
            <div className="mb-4">
              <span className="text-2xl font-bold">${plan.price}</span>
              <span className="text-gray-500">/{plan.interval}</span>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Features:</h3>
              <ul className="list-disc list-inside">
                {plan.features.map((feature, index) => (
                  <li key={index} className="text-gray-600">{feature}</li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setCurrentPlan(plan);
                  setShowModal(true);
                }}
                className="text-blue-500 hover:text-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(plan.id)}
                className="text-red-500 hover:text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {isEditing ? 'Edit Plan' : 'Add New Plan'}
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Form fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={currentPlan.name}
                    onChange={(e) => setCurrentPlan(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={currentPlan.description}
                    onChange={(e) => setCurrentPlan(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    value={currentPlan.price}
                    onChange={(e) => setCurrentPlan(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Interval</label>
                  <select
                    value={currentPlan.interval}
                    onChange={(e) => setCurrentPlan(prev => ({ ...prev, interval: e.target.value as 'monthly' | 'yearly' }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Features</label>
                  <div className="mt-1 space-y-2">
                    {currentPlan.features?.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => {
                            const newFeatures = [...(currentPlan.features || [])];
                            newFeatures[index] = e.target.value;
                            setCurrentPlan(prev => ({ ...prev, features: newFeatures }));
                          }}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newFeatures = currentPlan.features?.filter((_, i) => i !== index);
                            setCurrentPlan(prev => ({ ...prev, features: newFeatures }));
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPlan(prev => ({
                          ...prev,
                          features: [...(prev.features || []), '']
                        }));
                      }}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      Add Feature
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={currentPlan.categories?.includes(category.id)}
                          onChange={(e) => {
                            const newCategories = e.target.checked
                              ? [...(currentPlan.categories || []), category.id]
                              : (currentPlan.categories || []).filter(id => id !== category.id);
                            setCurrentPlan(prev => ({ ...prev, categories: newCategories }));
                          }}
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">{category.name}</span>
                      </label>
                    ))}
                  </div>
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
                  {isEditing ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};