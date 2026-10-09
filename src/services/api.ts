import type {
  Project,
  Post,
  Skill,
  Service,
  Experience,
  Education,
  Profile,
  ContactMessage,
  SiteSettings,
  DashboardStats,
  MediaItem,
  AdminUser,
} from '../types.ts';

const TOKEN_KEY = 'auth_token';
const LEGACY_TOKEN_KEY = 'devportfolio_admin_token';
const USER_KEY = 'auth_user';
const LEGACY_USER_KEY = 'devportfolio_admin_user';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

export function removeAuthToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  } catch {}
}

export function getCachedUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY) || localStorage.getItem(LEGACY_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCachedUser(user: AdminUser) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {}
}

export function removeCachedUser() {
  try {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
  } catch {}
}

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = `Erreur ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData?.error) {
        errorMsg = errorData.error;
      }
    } catch {
      // fallback
    }
    throw new ApiError(errorMsg, res.status);
  }

  return res.json();
}

export const api = {
  // Public
  getProfile: () => fetchJson<Profile>('/api/profile'),
  getSettings: () => fetchJson<SiteSettings>('/api/settings'),
  getProjects: (params?: { category?: string; tech?: string; year?: string; search?: string; featured?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.tech) query.set('tech', params.tech);
    if (params?.year) query.set('year', params.year);
    if (params?.search) query.set('search', params.search);
    if (params?.featured) query.set('featured', 'true');
    const qs = query.toString();
    return fetchJson<Project[]>(`/api/projects${qs ? `?${qs}` : ''}`);
  },
  getProjectBySlug: (slug: string) => fetchJson<Project>(`/api/projects/${slug}`),
  getPosts: (params?: { category?: string; tag?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.tag) query.set('tag', params.tag);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    return fetchJson<Post[]>(`/api/posts${qs ? `?${qs}` : ''}`);
  },
  getPostBySlug: (slug: string) => fetchJson<{ post: Post; related: Post[] }>(`/api/posts/${slug}`),
  getSkills: () => fetchJson<Skill[]>('/api/skills'),
  getServices: () => fetchJson<Service[]>('/api/services'),
  getExperiences: () => fetchJson<Experience[]>('/api/experiences'),
  getEducations: () => fetchJson<Education[]>('/api/educations'),
  sendContactMessage: (data: { name: string; email: string; subject: string; message: string }) =>
    fetchJson<{ success: boolean; message: string }>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Admin Auth
  login: (email: string, password: string) =>
    fetchJson<{ token: string; user: { id: string; email: string; name: string; role: string } }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () => fetchJson<{ success: boolean }>('/api/admin/logout', { method: 'POST' }),
  getCurrentUser: () => fetchJson<{ user: { id: string; email: string; name: string; role: string } }>('/api/admin/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    fetchJson<{ success: boolean; message: string }>('/api/admin/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Admin Stats
  getStats: () => fetchJson<DashboardStats>('/api/admin/stats'),

  // Admin Projects CRUD
  getAdminProjects: () => fetchJson<Project[]>('/api/admin/projects'),
  createProject: (project: Partial<Project>) =>
    fetchJson<Project>('/api/admin/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    }),
  updateProject: (id: string, project: Partial<Project>) =>
    fetchJson<Project>(`/api/admin/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    }),
  toggleProjectStatus: (id: string) =>
    fetchJson<{ success: boolean; status: 'published' | 'draft' }>(`/api/admin/projects/${id}/toggle-status`, {
      method: 'PATCH',
    }),
  deleteProject: (id: string) =>
    fetchJson<{ success: boolean; message: string }>(`/api/admin/projects/${id}`, {
      method: 'DELETE',
    }),

  // Admin Posts CRUD
  getAdminPosts: () => fetchJson<Post[]>('/api/admin/posts'),
  createPost: (post: Partial<Post>) =>
    fetchJson<Post>('/api/admin/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    }),
  updatePost: (id: string, post: Partial<Post>) =>
    fetchJson<Post>(`/api/admin/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(post),
    }),
  togglePostStatus: (id: string) =>
    fetchJson<{ success: boolean; status: 'published' | 'draft' }>(`/api/admin/posts/${id}/toggle-status`, {
      method: 'PATCH',
    }),
  deletePost: (id: string) =>
    fetchJson<{ success: boolean; message: string }>(`/api/admin/posts/${id}`, {
      method: 'DELETE',
    }),

  // Admin Skills CRUD
  getAdminSkills: () => fetchJson<Skill[]>('/api/admin/skills'),
  createSkill: (skill: Partial<Skill>) =>
    fetchJson<Skill>('/api/admin/skills', {
      method: 'POST',
      body: JSON.stringify(skill),
    }),
  updateSkill: (id: string, skill: Partial<Skill>) =>
    fetchJson<Skill>(`/api/admin/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(skill),
    }),
  deleteSkill: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/admin/skills/${id}`, {
      method: 'DELETE',
    }),

  // Admin Services CRUD
  getAdminServices: () => fetchJson<Service[]>('/api/admin/services'),
  createService: (service: Partial<Service>) =>
    fetchJson<Service>('/api/admin/services', {
      method: 'POST',
      body: JSON.stringify(service),
    }),
  updateService: (id: string, service: Partial<Service>) =>
    fetchJson<Service>(`/api/admin/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(service),
    }),
  deleteService: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/admin/services/${id}`, {
      method: 'DELETE',
    }),

  // Admin Experiences & Educations CRUD
  getAdminExperiences: () => fetchJson<Experience[]>('/api/admin/experiences'),
  createExperience: (exp: Partial<Experience>) =>
    fetchJson<Experience>('/api/admin/experiences', {
      method: 'POST',
      body: JSON.stringify(exp),
    }),
  updateExperience: (id: string, exp: Partial<Experience>) =>
    fetchJson<Experience>(`/api/admin/experiences/${id}`, {
      method: 'PUT',
      body: JSON.stringify(exp),
    }),
  deleteExperience: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/admin/experiences/${id}`, {
      method: 'DELETE',
    }),

  getAdminEducations: () => fetchJson<Education[]>('/api/admin/educations'),
  createEducation: (edu: Partial<Education>) =>
    fetchJson<Education>('/api/admin/educations', {
      method: 'POST',
      body: JSON.stringify(edu),
    }),
  updateEducation: (id: string, edu: Partial<Education>) =>
    fetchJson<Education>(`/api/admin/educations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(edu),
    }),
  deleteEducation: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/admin/educations/${id}`, {
      method: 'DELETE',
    }),

  // Admin Profile & Settings
  updateProfile: (profile: Partial<Profile>) =>
    fetchJson<Profile>('/api/admin/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),
  updateSettings: (settings: Partial<SiteSettings>) =>
    fetchJson<SiteSettings>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  // Admin Messages
  getAdminMessages: () => fetchJson<ContactMessage[]>('/api/admin/messages'),
  updateMessageStatus: (id: string, status: 'unread' | 'read' | 'resolved') =>
    fetchJson<ContactMessage>(`/api/admin/messages/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  deleteMessage: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/admin/messages/${id}`, {
      method: 'DELETE',
    }),

  // Media Manager
  getAdminMedia: () => fetchJson<MediaItem[]>('/api/admin/media'),
  uploadMedia: (data: { fileName: string; fileData: string; mimeType: string }) =>
    fetchJson<MediaItem>('/api/admin/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteMedia: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/admin/media/${id}`, {
      method: 'DELETE',
    }),

  // Database Reset
  resetDatabase: () =>
    fetchJson<{ success: boolean; message: string }>('/api/admin/reset-data', {
      method: 'POST',
    }),
};
