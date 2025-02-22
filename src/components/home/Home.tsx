import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, writeBatch } from 'firebase/firestore';
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

interface App {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  allowedRoles: string[];
  isActive: boolean;
  order?: number;
}

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
  const { userDetails } = useAuth();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);

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
        const q = query(
          collection(firestore, 'apps'),
          where('isActive', '==', true),
          where('allowedRoles', 'array-contains', userDetails?.role || 'user')
        );

        const querySnapshot = await getDocs(q);
        const appData: App[] = [];
        querySnapshot.forEach((doc) => {
          appData.push({ id: doc.id, ...doc.data() } as App);
        });

        const sortedApps = appData.sort((a, b) => {
          if (a.order === undefined && b.order === undefined) return 0;
          if (a.order === undefined) return 1;
          if (b.order === undefined) return -1;
          return a.order - b.order;
        });

        setApps(sortedApps);
      } catch (err) {
        console.error('Error fetching apps:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userDetails) {
      fetchApps();
    }
  }, [userDetails]);

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
        const appRef = doc(firestore, 'apps', app.id);
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