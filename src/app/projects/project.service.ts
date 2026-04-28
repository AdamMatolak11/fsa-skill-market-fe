import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, CreateProjectRequest, UpdateProjectRequest } from './project.model';
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

  getProject(projectId: string): Observable<Project> {
    const headers = this.getAuthHeaders();
    return this.http.get<Project>(`${this.apiUrl}/${projectId}`, { headers });
  }

  createProject(data: CreateProjectRequest): Observable<Project> {
    const headers = this.getAuthHeaders();
    return this.http.post<Project>(this.apiUrl, data, { headers });
  }

  updateProject(projectId: string, data: UpdateProjectRequest): Observable<Project> {
    const headers = this.getAuthHeaders();
    return this.http.put<Project>(`${this.apiUrl}/${projectId}`, data, { headers });
  }

  cancelProject(projectId: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${projectId}`, { headers });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.keycloakService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}