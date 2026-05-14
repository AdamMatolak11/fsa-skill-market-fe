import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Project } from '../project.model';
import { ProjectService } from '../project.service';
import { finalize } from 'rxjs';
import { ProjectDetailComponent } from './project-detail.component';

@Component({
  selector: 'app-project-detail-page',
  standalone: true,
  imports: [CommonModule, ProjectDetailComponent],
  template: `
    <app-project-detail
      [project]="project()"
      (backClicked)="goBack()"
      (projectUpdated)="refreshProject()">
    </app-project-detail>
  `
})
export class ProjectDetailPageComponent implements OnInit {
  private projectService = inject(ProjectService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  project = signal<Project | null>(null);

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('projectId');
    if (projectId) {
      this.loadProject(projectId);
    }
  }

  loadProject(projectId: string): void {
    this.projectService.getProjectDetail(projectId)
      .subscribe({
        next: (project) => {
          this.project.set(project);
        },
        error: (err) => {
          console.error('Failed to load project', err);
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }

  refreshProject(): void {
    const currentProject = this.project();
    if (currentProject) {
      this.loadProject(currentProject.id);
    }
  }
}
