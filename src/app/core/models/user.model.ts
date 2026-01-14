export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
}

export interface UserBranch {
  id: number;
  code: string;
  location: string;
}


export interface UserProfile {
  id: number;
  birthdate: string;
  phone: string;
  address: string;
  nik: string;
  isComplete: boolean;
  ktpUrl: string | null;
  kkUrl: string | null;
  npwpUrl: string | null;
  // Bank account information
  bankName?: string | null;
  accountNumber?: string | null;
  accountHolderName?: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  userType: 'CUSTOMER' | 'INTERNAL';
  isActive: boolean;
  roles: string[];
  branch?: UserBranch;
  profile?: UserProfile;
  createdAt?: string;
}

export interface Permission {
  id: number;
  code: string;
  description: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  roleId: number;
  branchId?: number;
}
