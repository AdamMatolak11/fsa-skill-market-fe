import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rating, CreateRatingRequest } from './rating.model';
import { KeycloakService } from '../keycloak.service';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private apiUrl = 'http://localhost:8080/api/v1/projects';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  createRating(projectId: string, data: CreateRatingRequest): Observable<Rating> {
    const headers = this.getAuthHeaders();
    return this.http.post<Rating>(`${this.apiUrl}/${projectId}/ratings`, data, { headers });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.keycloakService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
