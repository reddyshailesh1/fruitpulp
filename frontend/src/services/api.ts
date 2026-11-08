import type {
  IVerifyData,
  IBoxesData,
  ISelectBoxData,
  IGameStatusData,
} from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.port === '5173'
    ? `http://${window.location.hostname}:5000/api`
    : '/api');

const TOKEN_KEY = 'orange_pulp_token';
const ROLL_KEY = 'orange_pulp_roll';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string, rollNumber?: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  if (rollNumber) {
    localStorage.setItem(ROLL_KEY, rollNumber);
  }
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLL_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

export function getStoredRollNumber(): string | null {
  return localStorage.getItem(ROLL_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-participation-token'] = token;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = json.error || `HTTP error! status: ${response.status}`;
    const error = new Error(errorMsg);
    (error as any).code = json.code;
    (error as any).status = response.status;
    throw error;
  }

  return json.data;
}

export const api = {
  verifyStudent: async (rollNumber: string, campaignId?: string): Promise<IVerifyData> => {
    const data = await request<IVerifyData>('/student/verify', {
      method: 'POST',
      body: JSON.stringify({ rollNumber, campaignId }),
    });
    if (data.token) {
      setStoredToken(data.token, data.rollNumber);
    }
    return data;
  },

  getBoxes: async (): Promise<IBoxesData> => {
    return request<IBoxesData>('/game/boxes', {
      method: 'GET',
    });
  },

  selectBox: async (boxNumber: number): Promise<ISelectBoxData> => {
    return request<ISelectBoxData>('/game/select', {
      method: 'POST',
      body: JSON.stringify({ boxNumber }),
    });
  },

  claimCurrent: async (): Promise<{
    finalDiscount: number;
    finalRewardCode: string;
    status: 'COMPLETED';
    rewards: any[];
  }> => {
    return request('/game/claim-current', {
      method: 'POST',
    });
  },

  getStatus: async (): Promise<IGameStatusData> => {
    return request<IGameStatusData>('/game/status', {
      method: 'GET',
    });
  },

  getRewards: async () => {
    return request<{
      rewards: any[];
      finalDiscount: number | null;
      finalRewardCode: string | null;
      status: string;
    }>('/game/rewards', {
      method: 'GET',
    });
  },
};
