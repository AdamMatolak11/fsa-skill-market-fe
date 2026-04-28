import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Freelancer } from './freelancer.model';
import { KeycloakService } from '../keycloak.service';

@Injectable({
  providedIn: 'root'
})
export class FreelancerService {
  private apiUrl = 'http://localhost:8080/api/v1/freelancers';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  searchFreelancers(skill?: string): Observable<Freelancer[]> {
    const headers = this.getAuthHeaders();
    let url = this.apiUrl;
    if (skill) {
      url += `?skill=${encodeURIComponent(skill)}`;
    }
    return this.http.get<Freelancer[]>(url, { headers });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.keycloakService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
