import { Component, Input, inject, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OfferService } from '../offer.service';
import { KeycloakService } from '../../keycloak.service';
import { CreateOfferRequest } from '../offer.model';
import { Project } from '../../projects/project.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-create-offer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-offer.component.html',
  styleUrl: './create-offer.component.scss'
})
export class CreateOfferComponent {
  @Input() project: Project | null = null;
  @Output() offerCreated = new EventEmitter<void>();

  private offerService = inject(OfferService);
  private keycloakService = inject(KeycloakService);

  showForm = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  formData: CreateOfferRequest = {
    freelancerId: '',
    amount: 0,
    message: ''
  };

  openOfferForm(): void {
    this.formData.freelancerId = this.keycloakService.getUserId();
    this.showForm.set(true);
    this.error.set(null);
  }

  submitOffer(): void {
    if (!this.project || !this.formData.amount || !this.formData.message.trim()) {
      this.error.set('Please fill in all fields');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.offerService.createOffer(this.project.id, this.formData)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.success.set('Offer submitted successfully');
          this.showForm.set(false);
          this.offerCreated.emit();
          this.formData = {
            freelancerId: '',
            amount: 0,
            message: ''
          };
          setTimeout(() => (this.success.set(null)), 3000);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to submit offer');
        }
      });
  }

  closeForm(): void {
    this.showForm.set(false);
    this.error.set(null);
  }

  canSubmitOffer(): boolean {
    return (
      this.keycloakService.hasRole('FREELANCER') &&
      this.project?.status === 'OPEN'
    );
  }
}
