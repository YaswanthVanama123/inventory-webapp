import api from './api';
import { wrap } from './_factory';

const adminPermission = 'You need administrator privileges to view users.';

const userService = {
  getAll: wrap((params = {}) => api.get('/users', { params }), {
    permission: adminPermission,
    network: 'Unable to load users. Please check your connection.',
  }),

  getById: wrap((id) => api.get(`/users/${id}`), {
    notfound: 'User not found. They may have been deleted.',
    permission: 'You need administrator privileges to view user details.',
  }),

  create: wrap((userData) => api.post('/users', userData), {
    validation: 'Please check all required fields and try again.',
    conflict: 'A user with this username or email already exists.',
    permission: 'You need administrator privileges to create users.',
  }),

  update: wrap((id, userData) => api.put(`/users/${id}`, userData), {
    notfound: 'User not found. They may have been deleted.',
    validation: 'Please check the user information and try again.',
    conflict: 'This email is already in use by another user.',
    permission: 'You need administrator privileges to update users.',
  }),

  delete: wrap((id) => api.delete(`/users/${id}`), {
    notfound: 'User not found. They may have already been deleted.',
    permission: 'You need administrator privileges to delete users.',
    conflict: 'This user cannot be deleted at this time.',
  }),

  resetPassword: wrap((id, newPassword) => api.post(`/users/${id}/reset-password`, { newPassword }), {
    notfound: 'User not found.',
    validation: 'The password does not meet security requirements.',
    permission: 'You need administrator privileges to reset passwords.',
  }),

  getByRole: wrap((role) => api.get('/users', { params: { role } }), {
    permission: adminPermission,
  }),

  getActive: wrap(() => api.get('/users', { params: { isActive: true } }), {
    permission: adminPermission,
  }),

  getInactive: wrap(() => api.get('/users', { params: { isActive: false } }), {
    permission: adminPermission,
  }),

  deactivateOwnAccount: wrap(() => api.post('/users/me/deactivate'), {
    network: 'Unable to deactivate account right now. Please try again.',
  }),
};

export default userService;
