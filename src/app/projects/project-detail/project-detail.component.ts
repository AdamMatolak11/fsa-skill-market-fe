import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Project } from '../project.model';
import { OffersComponent } from '../../offers/offers/offers.component';
import { CreateOfferComponent } from '../../offers/create-offer/create-offer.component';
import { RatingComponent } from '../../ratings/rating/rating.component';
import { KeycloakService } from '../../keycloak.service';
import { ProjectService } from '../project.service';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, OffersComponent, CreateOfferComponent, RatingComponent],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss'
})
export class ProjectDetailComponent {
  @Input() project: Project | null = null;
  @Output() backClicked = new EventEmitter<void>();
  @Output() projectUpdated = new EventEmitter<Project>();

  private keycloakService = inject(KeycloakService);
  private projectService = inject(ProjectService);

  editMode = false;
  loading = false;
  error: string | null = null;

  editData = { title: '', description: '', budget: 0 };

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

  isClient(): boolean {
    return this.keycloakService.hasRole('CLIENT');
  }

  isProjectOwner(): boolean {
    return this.project?.clientId === this.keycloakService.getUserId();
  }

  canEdit(): boolean {
    return this.isProjectOwner() && ['OPEN', 'IN_PROGRESS'].includes(this.project?.status || '');
  }

  canCancel(): boolean {
    return this.isProjectOwner() && ['OPEN', 'IN_PROGRESS'].includes(this.project?.status || '');
  }

  toggleEditMode(): void {
    if (this.project) {
      this.editData = {
        title: this.project.title,
        description: this.project.description,
        budget: this.project.budget
      };
    }
    this.editMode = !this.editMode;
    this.error = null;
  }

  saveProject(): void {
    if (!this.project) return;

    this.loading = true;
    this.error = null;

    this.projectService.updateProject(this.project.id, this.editData).subscribe({
      next: (updatedProject) => {
        this.loading = false;
        this.project = updatedProject;
        this.projectUpdated.emit(updatedProject);
        this.editMode = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to update project';
      }
    });
  }

  cancelProject(): void {
    if (!this.project) return;

    if (!confirm('Are you sure you want to cancel this project?')) return;

    this.loading = true;
    this.error = null;

    this.projectService.cancelProject(this.project.id).subscribe({
      next: () => {
        this.loading = false;
        this.goBack();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to cancel project';
      }
    });
  }
}
