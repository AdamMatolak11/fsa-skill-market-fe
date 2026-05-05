export interface Freelancer {
  id: string;
  email: string;
  displayName: string;
  bio: string;
  role: 'FREELANCER';
  skills: string[];
  averageRating: number;
  ratingCount: number;
  createdAt: string;
}
