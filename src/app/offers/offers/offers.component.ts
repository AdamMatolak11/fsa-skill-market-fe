import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OfferService } from '../offer.service';
import { KeycloakService } from '../../keycloak.service';
import { Offer } from '../offer.model';
import { Project } from '../../projects/project.model';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.scss'
})
export class OffersComponent implements OnInit {
  @Input() project: Project | null = null;

  private offerService = inject(OfferService);
  private keycloakService = inject(KeycloakService);

  offers: Offer[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    if (this.project) {
      this.loadOffers();
    }
  }

  loadOffers(): void {
    if (!this.project) return;

    this.loading = true;
    this.error = null;

    this.offerService.getProjectOffers(this.project.id).subscribe({
      next: (data) => {
        this.offers = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load offers';
        this.loading = false;
      }
    });
  }

  acceptOffer(offer: Offer): void {
    if (!this.project || !this.keycloakService.hasRole('CLIENT')) return;

    if (!confirm('Are you sure you want to accept this offer?')) return;

    this.offerService.acceptOffer(this.project.id, offer.id).subscribe({
      next: () => {
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

    this.offerService.rejectOffer(this.project.id, offer.id).subscribe({
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

    this.offerService.cancelOffer(this.project.id, offer.id).subscribe({
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
