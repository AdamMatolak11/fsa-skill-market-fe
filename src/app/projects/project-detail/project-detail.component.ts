import { Component, EventEmitter, Input, Output, inject, signal, computed, OnInit } from '@angular/core';
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
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, OffersComponent, CreateOfferComponent, RatingComponent],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss'
})
export class ProjectDetailComponent implements OnInit {
  project = signal<Project | null>(null);
  @Input() loading = false;
  @Input() error: string | null = null;

  @Input('project') set projectInput(value: Project | null) {
    this.project.set(value);
  }
  @Output() backClicked = new EventEmitter<void>();
  @Output() projectUpdated = new EventEmitter<Project>();

  private keycloakService = inject(KeycloakService);
  private projectService = inject(ProjectService);

  editMode = signal(false);

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
    // Ensure edit mode is always false when component initializes
    this.editMode.set(false);
    this.error = null;
  }

  loadProject(): void {
    const currentProject = this.project();
    if (!currentProject) return;
    this.projectService.getProjectDetail(currentProject.id)
      .subscribe({
        next: (project) => {
          this.project.set(project);
          this.projectUpdated.emit(project);
        },
        error: (err) => {
          // Suppress 405 error from offer creation refresh
          if (err.status !== 405) {
            this.error = err.error?.message || 'Failed to refresh project';
          }
        }
      });
  }

  refreshProject(): void {
    this.loadProject();
  }

  goBack(): void {
    this.backClicked.emit();
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
    const currentProject = this.project();
    if (currentProject) {
      this.editData = {
        title: currentProject.title,
        description: currentProject.description,
        budget: currentProject.budget
      };
    }
    this.editMode.set(!this.editMode());
    this.error = null;
  }

  saveProject(): void {
    const currentProject = this.project();
    if (!currentProject) return;

    this.error = null;

    this.projectService.updateProject(currentProject.id, this.editData)
      .subscribe({
        next: (updatedProject) => {
          this.project.set(updatedProject);
          this.projectUpdated.emit(updatedProject);
          this.editMode.set(false);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to update project';
        }
      });
  }

  cancelProject(): void {
    const currentProject = this.project();
    if (!currentProject) return;

    if (!confirm('Are you sure you want to cancel this project?')) return;

    this.error = null;

    this.projectService.cancelProject(currentProject.id)
      .subscribe({
        next: () => {
          this.projectUpdated.emit({ ...currentProject, status: 'CANCELLED' } as Project);
          this.goBack();
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to cancel project';
        }
      });
  }
}
