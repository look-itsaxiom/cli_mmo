export interface ApiResponse<T> {
  data?: T;
  success: boolean;
  error?: string;
  tick?: number;
  serverTime?: string;
}

export interface LoginRequest {
  deviceCode?: string;
}

export interface LoginResponse {
  token: string;
  playerId: string;
  nationId: string;
}
