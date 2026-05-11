import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { FreelancerService } from '../freelancer.service';
import { Freelancer } from '../freelancer.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-freelancer-search',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterModule, RouterLink],
  templateUrl: './freelancer-search.component.html',
  styleUrl: './freelancer-search.component.scss'
})
export class FreelancerSearchComponent implements OnInit {
  private freelancerService = inject(FreelancerService);

  freelancers = signal<Freelancer[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  searchSkill = signal('');

  ngOnInit(): void {
    this.loadFreelancers();
  }

  loadFreelancers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.freelancerService.searchFreelancers(this.searchSkill() || undefined)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.freelancers.set(data);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to load freelancers');
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
