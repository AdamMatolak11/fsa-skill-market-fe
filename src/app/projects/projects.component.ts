import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from './project.service';
import { Project } from './project.model';
import { KeycloakService } from '../keycloak.service';
import { CreateProjectModalComponent } from './create-project-modal/create-project-modal.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';

@Component({
  selector: 'app-projects',
  imports: [CommonModule, FormsModule, CreateProjectModalComponent, ProjectDetailComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements OnInit {
  @ViewChild(CreateProjectModalComponent) createProjectModal!: CreateProjectModalComponent;

  private projectService = inject(ProjectService);
  private keycloakService = inject(KeycloakService);

  // Data
  projects = signal<Project[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  isClientRole = computed(() => this.keycloakService.hasRole('CLIENT'));

  // View mode
  viewMode = signal<'list' | 'detail'>('list');
  selectedProject = signal<Project | null>(null);

  // Filters
  filterTitle = signal('');
  filterBudgetFrom = signal<number | null>(null);
  filterBudgetTo = signal<number | null>(null);
  filterStatus = signal('');

  // Sorting
  sortBy = signal<'budget' | 'status' | 'createdAt'>('createdAt');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Pagination
  pageSize = signal(10);
  currentPage = signal(1);

  // Computed values
  filteredAndSortedProjects = computed(() => {
    let filtered = this.projects().filter(project => {
      const titleMatch = project.title.toLowerCase().includes(this.filterTitle().toLowerCase());
      const budgetFromMatch = this.filterBudgetFrom() === null || project.budget >= this.filterBudgetFrom()!;
      const budgetToMatch = this.filterBudgetTo() === null || project.budget <= this.filterBudgetTo()!;
      const statusMatch = this.filterStatus() === '' || project.status.toLowerCase() === this.filterStatus().toLowerCase();

      return titleMatch && budgetFromMatch && budgetToMatch && statusMatch;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[this.sortBy()];
      let bVal: any = b[this.sortBy()];

      if (this.sortBy() === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (aVal < bVal) return this.sortDirection() === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortDirection() === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  });

  totalPages = computed(() => Math.ceil(this.filteredAndSortedProjects().length / this.pageSize()));

  paginatedProjects = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredAndSortedProjects().slice(start, end);
  });

  ngOnInit(): void {
    this.loadProjects();
  }

  openCreateModal(): void {
    this.createProjectModal.open();
  }

  onProjectCreated(): void {
    this.currentPage.set(1);
    this.loadProjects();
  }

  viewProjectDetail(project: Project): void {
    this.selectedProject.set(project);
    this.viewMode.set('detail');
  }

  goBackToList(): void {
    this.viewMode.set('list');
    this.selectedProject.set(null);
  }

  private loadProjects(): void {
    this.loading.set(true);
    this.error.set(null);

    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects.set(projects);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.error.set('Failed to load projects. Please try again later.');
        this.loading.set(false);
      }
    });
  }

  clearFilters(): void {
    this.filterTitle.set('');
    this.filterBudgetFrom.set(null);
    this.filterBudgetTo.set(null);
    this.filterStatus.set('');
    this.currentPage.set(1);
  }

  setSortBy(field: 'budget' | 'status' | 'createdAt'): void {
    if (this.sortBy() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortDirection.set('asc');
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  trackByProjectId(index: number, project: Project): string {
    return project.id;
  }
}