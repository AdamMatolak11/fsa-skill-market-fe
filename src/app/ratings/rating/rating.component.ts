import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RatingService } from '../rating.service';
import { KeycloakService } from '../../keycloak.service';
import { CreateRatingRequest } from '../rating.model';
import { Project } from '../../projects/project.model';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.scss'
})
export class RatingComponent {
  @Input() project: Project | null = null;

  private ratingService = inject(RatingService);
  private keycloakService = inject(KeycloakService);

  showForm = false;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  formData: CreateRatingRequest = {
    clientId: '',
    freelancerId: '',
    score: 5,
    comment: ''
  };

  openRatingForm(): void {
    if (!this.project) return;

    this.formData.clientId = this.keycloakService.getUserId();
    this.formData.freelancerId = this.project.assignedFreelancerId || '';
    this.showForm = true;
    this.error = null;
  }

  submitRating(): void {
    if (!this.project) return;

    this.loading = true;
    this.error = null;

    this.ratingService.createRating(this.project.id, this.formData).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Rating submitted successfully';
        this.showForm = false;
        setTimeout(() => (this.success = null), 3000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to submit rating';
      }
    });
  }

  closeForm(): void {
    this.showForm = false;
    this.error = null;
  }

  canRate(): boolean {
    return (
      this.keycloakService.hasRole('CLIENT') &&
      this.project?.status === 'COMPLETED' &&
      !!this.project?.assignedFreelancerId
    );
  }
}
