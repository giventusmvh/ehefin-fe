export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  userType: 'CUSTOMER' | 'INTERNAL';
  isActive: boolean;
  roles: string[];
  branchId?: number;
  branchName?: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: string[];
}

export interface Permission {
  id: number;
  name: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  roleId: number;
  branchId?: number;
}
