import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../project.service';

@Component({
  selector: 'app-create-project-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-project-modal.component.html',
  styleUrl: './create-project-modal.component.scss'
})
export class CreateProjectModalComponent {
  @Output() projectCreated = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();

  private projectService = inject(ProjectService);

  isOpen = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);

  title = signal('');
  description = signal('');
  budget = signal<number | null>(null);

  open(): void {
    this.isOpen.set(true);
    this.resetForm();
  }

  close(): void {
    this.isOpen.set(false);
    this.resetForm();
    this.modalClosed.emit();
  }

  submitForm(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    const projectData = {
      title: this.title(),
      description: this.description(),
      budget: this.budget()!
    };

    this.projectService.createProject(projectData).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.close();
        this.projectCreated.emit();
      },
      error: (error) => {
        console.error('Error creating project:', error);
        this.error.set(error.error?.message || 'Failed to create project. Please try again.');
        this.isSubmitting.set(false);
      }
    });
  }

  private validateForm(): boolean {
    if (!this.title().trim()) {
      this.error.set('Title is required');
      return false;
    }

    if (!this.description().trim()) {
      this.error.set('Description is required');
      return false;
    }

    if (!this.budget() || this.budget()! < 0.01) {
      this.error.set('Budget must be at least $0.01');
      return false;
    }

    return true;
  }

  private resetForm(): void {
    this.title.set('');
    this.description.set('');
    this.budget.set(null);
    this.error.set(null);
  }
}
