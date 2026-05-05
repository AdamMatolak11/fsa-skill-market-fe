export interface Offer {
  id: string;
  projectId: string;
  freelancerId: string;
  amount: number;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
}

export interface CreateOfferRequest {
  freelancerId: string;
  amount: number;
  message: string;
}
