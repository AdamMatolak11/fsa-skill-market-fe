import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from './project.model';
import { KeycloakService } from '../keycloak.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = 'http://localhost:8080/api/v1/projects';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  getProjects(): Observable<Project[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Project[]>(this.apiUrl, { headers });
  }

  createProject(data: { title: string; description: string; budget: number }): Observable<Project> {
    const headers = this.getAuthHeaders();
    return this.http.post<Project>(this.apiUrl, data, { headers });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.keycloakService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}