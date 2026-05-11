import { Component, Input, inject, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RatingService } from '../rating.service';
import { KeycloakService } from '../../keycloak.service';
import { CreateRatingRequest } from '../rating.model';
import { Project } from '../../projects/project.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.scss'
})
export class RatingComponent {
  @Input() project: Project | null = null;
  @Output() ratingSubmitted = new EventEmitter<void>();

  private ratingService = inject(RatingService);
  private keycloakService = inject(KeycloakService);

  showForm = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

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
    this.showForm.set(true);
    this.error.set(null);
  }

  submitRating(): void {
    if (!this.project) return;

    this.loading.set(true);
    this.error.set(null);

    this.ratingService.createRating(this.project.id, this.formData)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.success.set('Rating submitted successfully');
          this.showForm.set(false);
          this.ratingSubmitted.emit();
          setTimeout(() => (this.success.set(null)), 3000);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to submit rating');
        }
      });
  }

  closeForm(): void {
    this.showForm.set(false);
    this.error.set(null);
  }

  canRate(): boolean {
    return (
      this.keycloakService.hasRole('CLIENT') &&
      this.project?.status === 'COMPLETED' &&
      !!this.project?.assignedFreelancerId
    );
  }
}
