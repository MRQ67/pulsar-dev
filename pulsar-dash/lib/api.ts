const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('pulsar_token')
}

function setToken(token: string): void {
  localStorage.setItem('pulsar_token', token)
}

function clearToken(): void {
  localStorage.removeItem('pulsar_token')
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string>),
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

export interface User {
  id: string
  email: string
  github_id: string
  github_username: string
  avatar_url: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface Integration {
  id: string
  project_id: string
  type: 'github' | 'vercel' | 'railway'
  config: Record<string, unknown>
  enabled: boolean
  last_synced_at: string | null
  created_at: string
  updated_at: string
}

export interface PullRequest {
  id: string
  project_id: string
  integration_id: string
  pr_number: number
  title: string
  state: 'open' | 'closed' | 'merged'
  author: string
  author_avatar: string | null
  url: string
  created_at: string
  updated_at: string
  merged_at: string | null
}

export interface WorkflowRun {
  id: string
  project_id: string
  integration_id: string
  run_id: number
  name: string
  status: 'queued' | 'in_progress' | 'completed'
  conclusion: 'success' | 'failure' | 'cancelled' | null
  workflow_name: string
  branch: string | null
  commit_sha: string | null
  url: string
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export const api = {
  auth: {
    me: () => request<User>('/api/auth/me'),
    logout: () => request<void>('/api/auth/logout', { method: 'POST' }),
  },

  projects: {
    list: () => request<Project[]>('/api/projects'),
    create: (data: { name: string; description?: string }) =>
      request<Project>('/api/projects', { method: 'POST', body: JSON.stringify(data) }),
    get: (id: string) => request<Project>(`/api/projects/${id}`),
    update: (id: string, data: Partial<Project>) =>
      request<Project>(`/api/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/api/projects/${id}`, { method: 'DELETE' }),
  },

  integrations: {
    list: (projectId: string) =>
      request<Integration[]>(`/api/projects/${projectId}/integrations`),
    add: (projectId: string, data: { type: string; config: Record<string, unknown> }) =>
      request<Integration>(`/api/projects/${projectId}/integrations`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    get: (projectId: string, type: string) =>
      request<Integration>(`/api/projects/${projectId}/integrations/${type}`),
    update: (projectId: string, type: string, data: Partial<Integration>) =>
      request<Integration>(`/api/projects/${projectId}/integrations/${type}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (projectId: string, type: string) =>
      request<void>(`/api/projects/${projectId}/integrations/${type}`, { method: 'DELETE' }),
    sync: (projectId: string, type: string) =>
      request<{ status: string }>(`/api/projects/${projectId}/integrations/${type}/sync`, {
        method: 'POST',
      }),
  },

  pullRequests: {
    list: (projectId: string) =>
      request<PullRequest[]>(`/api/projects/${projectId}/pull-requests`),
  },

  workflows: {
    list: (projectId: string) =>
      request<WorkflowRun[]>(`/api/projects/${projectId}/workflows`),
  },

  metrics: {
    get: (projectId: string) =>
      request<Record<string, unknown>>(`/api/projects/${projectId}/metrics`),
  },

  activity: {
    get: (projectId: string) =>
      request<Record<string, unknown>[]>(`/api/projects/${projectId}/activity`),
  },
}

export const auth = {
  getToken,
  setToken,
  clearToken,
  getGithubAuthUrl: () => `${API_URL}/api/auth/github`,
  isAuthenticated: () => !!getToken(),
}
