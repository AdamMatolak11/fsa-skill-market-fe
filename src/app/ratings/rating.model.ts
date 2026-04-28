export interface Rating {
  id: string;
  projectId: string;
  clientId: string;
  freelancerId: string;
  score: number;
  comment: string;
  createdAt: string;
}

export interface CreateRatingRequest {
  clientId: string;
  freelancerId: string;
  score: number;
  comment: string;
}
