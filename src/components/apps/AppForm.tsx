import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Form } from '../ui/form';
import type { AppCategory } from '../../types/app';

interface AppFormData {
  name: string;
  description: string;
  url: string;
  categories: string[];
  allowedRoles: string[];
  isActive: boolean;
  order: number | null;
}

const validationSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  description: yup.string().required('Description is required'),
  url: yup.string().url('Must be a valid URL').required('URL is required'),
  categories: yup.array().of(yup.string()).min(1, 'At least one category must be selected'),
  allowedRoles: yup.array().of(yup.string()).min(1, 'At least one role must be selected'),
  isActive: yup.boolean().required(),
  order: yup.number().nullable()
}) as yup.ObjectSchema<AppFormData>;

interface AppFormProps {
  initialValues?: Partial<AppFormData>;
  onSubmit: (data: AppFormData) => void;
  roles?: string[];
  categories?: AppCategory[];
  isEdit?: boolean;
}

export const AppForm: React.FC<AppFormProps> = ({
  initialValues,
  onSubmit,
  roles = [],
  categories = [],
  isEdit = false
}) => {
  const defaultValues: AppFormData = {
    name: '',
    description: '',
    url: '',
    categories: [],
    allowedRoles: ['user'],
    isActive: true,
    order: null,
    ...initialValues,
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AppFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues
  });

  const onSubmitForm = (data: AppFormData) => {
    onSubmit(data);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmitForm)}>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            {...register('name')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            {...register('description')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700">
            URL
          </label>
          <input
            type="url"
            id="url"
            {...register('url')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.url && (
            <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Categories</label>
          <div className="mt-2 space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`category-${category.id}`}
                  value={category.id}
                  {...register('categories')}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={`category-${category.id}`} className="ml-2 text-sm text-gray-900">
                  {category.name} ({category.type})
                </label>
              </div>
            ))}
          </div>
          {errors.categories && (
            <p className="mt-1 text-sm text-red-600">{errors.categories.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Allowed Roles</label>
          <div className="mt-2 space-y-2">
            {roles.map((role) => (
              <div key={role} className="flex items-center">
                <input
                  type="checkbox"
                  id={role}
                  value={role}
                  {...register('allowedRoles')}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={role} className="ml-2 text-sm text-gray-900">
                  {role}
                </label>
              </div>
            ))}
          </div>
          {errors.allowedRoles && (
            <p className="mt-1 text-sm text-red-600">{errors.allowedRoles.message}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            {...register('isActive')}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
            Active
          </label>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isEdit ? 'Update' : 'Create'} App
          </button>
        </div>
      </div>
    </Form>
  );
};