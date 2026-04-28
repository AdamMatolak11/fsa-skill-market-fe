export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  bio: string;
  role: 'CLIENT' | 'FREELANCER' | 'ADMIN';
  skills: string[];
  averageRating: number;
  ratingCount: number;
  createdAt: string;
}

export interface UpdateProfileRequest {
  displayName: string;
  bio: string;
  skills: string[];
}
