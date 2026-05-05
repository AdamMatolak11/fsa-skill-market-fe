export interface Project {
  id: string;
  clientId: string;
  title: string;
  description: string;
  budget: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedFreelancerId?: string;
  createdAt: string;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  budget: number;
}

export interface UpdateProjectRequest {
  title: string;
  description: string;
  budget: number;
}