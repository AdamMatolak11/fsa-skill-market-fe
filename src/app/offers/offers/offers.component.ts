import { Component, Input, inject, OnInit, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OfferService } from '../offer.service';
import { KeycloakService } from '../../keycloak.service';
import { Offer } from '../offer.model';
import { Project } from '../../projects/project.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.scss'
})
export class OffersComponent implements OnInit {
  @Input() project: Project | null = null;
  @Output() offerAccepted = new EventEmitter<void>();

  private offerService = inject(OfferService);
  private keycloakService = inject(KeycloakService);

  offers = signal<Offer[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    if (this.project) {
      this.loadOffers();
    }
  }

  loadOffers(): void {
    if (!this.project) return;

    this.loading.set(true);
    this.error.set(null);

    this.offerService.getProjectOffers(this.project.id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.offers.set(data);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to load offers');
        }
      });
  }

  acceptOffer(offer: Offer): void {
    if (!this.project || !this.keycloakService.hasRole('CLIENT')) return;

    if (!confirm('Are you sure you want to accept this offer?')) return;

    this.loading.set(true);
    this.offerService.acceptOffer(this.project.id, offer.id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.offerAccepted.emit();
          this.loadOffers();
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to accept offer');
        }
      });
  }

  rejectOffer(offer: Offer): void {
    if (!this.project || !this.keycloakService.hasRole('CLIENT')) return;

    if (!confirm('Are you sure you want to reject this offer?')) return;

    this.loading.set(true);
    this.offerService.rejectOffer(this.project.id, offer.id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.loadOffers();
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to reject offer');
        }
      });
  }

  cancelOffer(offer: Offer): void {
    if (!this.project) return;

    if (!confirm('Are you sure you want to cancel this offer?')) return;

    this.loading.set(true);
    this.offerService.cancelOffer(this.project.id, offer.id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.loadOffers();
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to cancel offer');
        }
      });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-success';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-danger';
      case 'PENDING':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  }

  isClient(): boolean {
    return this.keycloakService.hasRole('CLIENT');
  }

  isFreelancer(): boolean {
    return this.keycloakService.hasRole('FREELANCER');
  }
}
