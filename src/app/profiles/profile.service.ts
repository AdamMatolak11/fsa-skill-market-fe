import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile, UpdateProfileRequest } from './profile.model';
import { KeycloakService } from '../keycloak.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:8080/api/v1/profiles';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  getProfile(userId: string): Observable<UserProfile> {
    const headers = this.getAuthHeaders();
    return this.http.get<UserProfile>(`${this.apiUrl}/${userId}`, { headers });
  }

  updateProfile(userId: string, data: UpdateProfileRequest): Observable<UserProfile> {
    const headers = this.getAuthHeaders();
    return this.http.put<UserProfile>(`${this.apiUrl}/${userId}`, data, { headers });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.keycloakService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
