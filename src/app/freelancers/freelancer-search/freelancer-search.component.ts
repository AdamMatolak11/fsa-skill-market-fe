import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FreelancerService } from '../freelancer.service';
import { Freelancer } from '../freelancer.model';

@Component({
  selector: 'app-freelancer-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './freelancer-search.component.html',
  styleUrl: './freelancer-search.component.scss'
})
export class FreelancerSearchComponent implements OnInit {
  private freelancerService = inject(FreelancerService);

  freelancers: Freelancer[] = [];
  loading = false;
  error: string | null = null;
  searchSkill = '';

  ngOnInit(): void {
    this.loadFreelancers();
  }

  loadFreelancers(): void {
    this.loading = true;
    this.error = null;

    this.freelancerService.searchFreelancers(this.searchSkill || undefined).subscribe({
      next: (data) => {
        this.freelancers = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load freelancers';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.loadFreelancers();
  }

  getRatingBadgeClass(rating: number): string {
    if (rating >= 4.5) return 'bg-success';
    if (rating >= 4) return 'bg-info';
    if (rating >= 3.5) return 'bg-warning';
    return 'bg-danger';
  }
}
