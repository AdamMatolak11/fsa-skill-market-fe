import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Offer, CreateOfferRequest } from './offer.model';
import { KeycloakService } from '../keycloak.service';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private apiUrl = 'http://localhost:8080/api/v1/projects';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  getProjectOffers(projectId: string): Observable<Offer[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Offer[]>(`${this.apiUrl}/${projectId}/offers`, { headers });
  }

  createOffer(projectId: string, data: CreateOfferRequest): Observable<Offer> {
    const headers = this.getAuthHeaders();
    return this.http.post<Offer>(`${this.apiUrl}/${projectId}/offers`, data, { headers });
  }

  acceptOffer(projectId: string, offerId: string): Observable<Offer> {
    const headers = this.getAuthHeaders();
    return this.http.post<Offer>(`${this.apiUrl}/${projectId}/offers/${offerId}/accept`, {}, { headers });
  }

  rejectOffer(projectId: string, offerId: string): Observable<Offer> {
    const headers = this.getAuthHeaders();
    return this.http.post<Offer>(`${this.apiUrl}/${projectId}/offers/${offerId}/reject`, {}, { headers });
  }

  cancelOffer(projectId: string, offerId: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${projectId}/offers/${offerId}`, { headers });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.keycloakService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
