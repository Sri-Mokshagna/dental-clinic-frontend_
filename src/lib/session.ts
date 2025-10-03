import { User, UserRole } from '../types';

export function getCurrentUser(): User | undefined {
  if (typeof window === 'undefined') {
    console.log('getCurrentUser: Server side, returning undefined');
    return undefined;
  }
  
  const userJson = localStorage.getItem('currentUser');
  console.log('getCurrentUser: localStorage value:', userJson);
  
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      console.log('getCurrentUser: Parsed user:', user);
      return user;
    } catch (error) {
      console.error('getCurrentUser: Error parsing user JSON:', error);
      return undefined;
    }
  }
  
  console.log('getCurrentUser: No user found in localStorage');
  return undefined;
}

export function logout() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('currentUser');
    }
}

export function checkPermission(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}
