import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc as firestoreDoc, writeBatch, updateDoc, getDoc } from 'firebase/firestore';
import { firestore } from '../../services/firebaseConfig';
import { useSettings } from '../../hooks/useSettings';
import { useAuth } from '../../contexts/AuthContext';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getWebsiteMetadata } from '../../services/metadata';
import type { App, AppCategory } from '../../types/app';
import { getFavicon } from '../../utils/url';

const SortableItem = ({ app }: { app: App }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-md p-6 touch-none select-none
        ${isDragging ? 'shadow-xl ring-2 ring-blue-500 z-50' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div
          className="flex-1 cursor-pointer"
          onClick={() => window.open(app.url, '_blank', 'noopener,noreferrer')}
        >
          <div className="flex items-center mb-4">
            {app.icon && (
              <img
                src={app.icon}
                alt=""
                className="w-10 h-10 mr-3"
                draggable={false}
              />
            )}
            <h2 className="text-xl font-semibold">{app.name}</h2>
          </div>
          <p className="text-gray-600">{app.description}</p>
        </div>
        <div
          {...attributes}
          {...listeners}
          className="ml-4 p-2 cursor-move rounded hover:bg-gray-100 touch-none"
          style={{ touchAction: 'none' }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-gray-400"
          >
            <circle cx="12" cy="4" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="20" r="2" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export const Home: React.FC = () => {
  const { settings, loading: settingsLoading } = useSettings();
  const { userDetails, currentUser } = useAuth();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [categories, setCategories] = useState<AppCategory[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchApps = async () => {
      try {
        // First fetch categories
        const categoriesRef = collection(firestore, 'appCategories');
        const categoriesSnapshot = await getDocs(categoriesRef);
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AppCategory[];
        setCategories(categoriesData);

        // Then fetch apps
        const q = query(
          collection(firestore, 'apps'),
          where('isActive', '==', true)
        );

        const querySnapshot = await getDocs(q);

        // Get user's active subscription if any
        const userSubscriptionQuery = query(
          collection(firestore, 'userSubscriptions'),
          where('userId', '==', currentUser?.uid),
          where('status', '==', 'active')
        );
        const userSubscriptionSnapshot = await getDocs(userSubscriptionQuery);
        const userSubscription = userSubscriptionSnapshot.docs[0]?.data();

        // Get the subscription plan details if user has an active subscription
        let allowedCategories: string[] = [];
        if (userSubscription) {
          const planDoc = await getDoc(firestoreDoc(firestore, 'subscriptionPlans', userSubscription.planId));
          const planData = planDoc.data();
          allowedCategories = planData?.categories || [];
        }

        // Filter apps based on role, categories, and subscription
        const appsPromises = querySnapshot.docs.map(async (docSnapshot) => {
          const data = { ...docSnapshot.data() as Omit<App, 'id'>, id: docSnapshot.id };

          // Check if user has access to this app
          const hasRoleAccess = data.allowedRoles.includes(userDetails?.role || 'user');
          const hasSubscriptionAccess = userDetails?.role === 'superAdmin' || data.categories.every(category =>
            categoriesData.find(c => c.id === category)?.type === 'Public' ||
            allowedCategories.includes(category)
          );

          if (hasRoleAccess && hasSubscriptionAccess) {
            if (!data.icon && data.url) {
              try {
                const metadata = await getWebsiteMetadata(data.url);
                if (metadata?.icon || metadata?.image) {
                  data.icon = metadata.icon || metadata.image;
                  const appRef = firestoreDoc(firestore, 'apps', data.id);
                  await updateDoc(appRef, { icon: data.icon });
                } else {
                  data.icon = getFavicon(data.url);
                }
              } catch (error) {
                console.error('Error fetching metadata for:', data.url, error);
                data.icon = getFavicon(data.url);
              }
            }
            return data;
          }
          return null;
        });

        const resolvedApps = (await Promise.all(appsPromises)).filter((app): app is App => app !== null);
        const sortedApps = resolvedApps.sort((a, b) => {
          const orderA = a.order ?? Infinity;
          const orderB = b.order ?? Infinity;
          return orderA - orderB;
        });

        console.log('User role:', userDetails?.role);
        console.log('Apps before filtering:', querySnapshot.docs.length);
        console.log('Apps after filtering:', resolvedApps.length);
        console.log('Categories loaded:', categoriesData);

        setApps(sortedApps);
      } catch (err) {
        console.error('Error fetching apps:', err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchApps();
    }
  }, [currentUser, userDetails]);

  const handleDragStart = (event: any) => {
    if (window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    }
  };

  const handleDragEnd = async (event: any) => {
    document.body.style.overflow = '';

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setApps((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);

      const batch = writeBatch(firestore);
      newItems.forEach((app, index) => {
        const appRef = firestoreDoc(firestore, 'apps', app.id);
        batch.update(appRef, { order: index });
      });
      batch.commit().catch(err => console.error('Error updating order:', err));

      return newItems;
    });
  };

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center pt-10">
      <h1 className="text-4xl font-bold mb-4">
        {settings?.welcomeMessage || `Welcome to ${settings?.siteName || 'our site'}!`}
      </h1>

      {settings?.maintenanceMode && (
        <p className="text-yellow-600 font-semibold mb-4">
          ⚠️ Site is currently in maintenance mode
        </p>
      )}

      <div className="w-full max-w-6xl mx-auto mt-10 px-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={apps}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apps.map((app) => (
                <SortableItem key={app.id} app={app} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {settings?.showSupportEmail && settings?.supportEmail && (
        <p className="text-gray-600 mt-8">
          Need help? Contact us at{' '}
          <a
            href={`mailto:${settings.supportEmail}`}
            className="text-blue-600 hover:text-blue-800"
          >
            {settings.supportEmail}
          </a>
        </p>
      )}
    </div>
  );
};