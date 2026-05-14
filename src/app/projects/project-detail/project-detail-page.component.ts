import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Project } from '../project.model';
import { OffersComponent } from '../../offers/offers/offers.component';
import { CreateOfferComponent } from '../../offers/create-offer/create-offer.component';
import { RatingComponent } from '../../ratings/rating/rating.component';
import { KeycloakService } from '../../keycloak.service';
import { ProjectService } from '../project.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-project-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, OffersComponent, CreateOfferComponent, RatingComponent],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss'
})
export class ProjectDetailPageComponent implements OnInit {
  private keycloakService = inject(KeycloakService);
  private projectService = inject(ProjectService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  project = signal<Project | null>(null);
  editMode = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);

  editData = { title: '', description: '', budget: 0 };

  // Computed properties for access control
  isProjectOwner = computed(() => 
    this.project()?.clientId === this.keycloakService.getUserId()
  );

  canEdit = computed(() =>
    this.isProjectOwner() && 
    this.keycloakService.hasRole('CLIENT') && 
    ['OPEN', 'IN_PROGRESS'].includes(this.project()?.status || '')
  );

  canCancel = computed(() =>
    this.isProjectOwner() && 
    this.keycloakService.hasRole('CLIENT') && 
    ['OPEN', 'IN_PROGRESS'].includes(this.project()?.status || '')
  );

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('projectId');
    if (projectId) {
      this.loadProject(projectId);
    }
  }

  loadProject(projectId: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.projectService.getProjectDetail(projectId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (project) => {
          this.project.set(project);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to load project');
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-success';
      case 'in_progress':
        return 'bg-primary';
      case 'completed':
        return 'bg-secondary';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-light text-dark';
    }
  }

  toggleEditMode(): void {
    if (this.project()) {
      this.editData = {
        title: this.project()!.title,
        description: this.project()!.description,
        budget: this.project()!.budget
      };
    }
    this.editMode.set(!this.editMode());
    this.error.set(null);
  }

  saveProject(): void {
    if (!this.project()) return;

    this.loading.set(true);
    this.error.set(null);

    this.projectService.updateProject(this.project()!.id, this.editData)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (updatedProject) => {
          this.project.set(updatedProject);
          this.editMode.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to update project');
        }
      });
  }

  cancelProject(): void {
    if (!this.project()) return;

    if (!confirm('Are you sure you want to cancel this project?')) return;

    this.loading.set(true);
    this.error.set(null);

    this.projectService.cancelProject(this.project()!.id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.goBack();
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to cancel project');
        }
      });
  }

  refreshProject(): void {
    if (!this.project()) return;
    this.loadProject(this.project()!.id);
  }
}
