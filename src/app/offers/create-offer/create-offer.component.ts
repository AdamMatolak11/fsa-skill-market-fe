import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OfferService } from '../offer.service';
import { KeycloakService } from '../../keycloak.service';
import { CreateOfferRequest } from '../offer.model';
import { Project } from '../../projects/project.model';

@Component({
  selector: 'app-create-offer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-offer.component.html',
  styleUrl: './create-offer.component.scss'
})
export class CreateOfferComponent {
  @Input() project: Project | null = null;

  private offerService = inject(OfferService);
  private keycloakService = inject(KeycloakService);

  showForm = false;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  formData: CreateOfferRequest = {
    freelancerId: '',
    amount: 0,
    message: ''
  };

  openOfferForm(): void {
    this.formData.freelancerId = this.keycloakService.getUserId();
    this.showForm = true;
    this.error = null;
  }

  submitOffer(): void {
    if (!this.project || !this.formData.amount || !this.formData.message.trim()) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.error = null;

    this.offerService.createOffer(this.project.id, this.formData).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Offer submitted successfully';
        this.showForm = false;
        this.formData = {
          freelancerId: '',
          amount: 0,
          message: ''
        };
        setTimeout(() => (this.success = null), 3000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to submit offer';
      }
    });
  }

  closeForm(): void {
    this.showForm = false;
    this.error = null;
  }

  canSubmitOffer(): boolean {
    return (
      this.keycloakService.hasRole('FREELANCER') &&
      this.project?.status === 'OPEN'
    );
  }
}
