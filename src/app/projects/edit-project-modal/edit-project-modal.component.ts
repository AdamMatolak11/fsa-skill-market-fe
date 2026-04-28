import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../project.service';
import { Project, UpdateProjectRequest } from '../project.model';

@Component({
  selector: 'app-edit-project-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal fade" id="editProjectModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Project</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Title</label>
              <input type="text" class="form-control" [(ngModel)]="formData.title" />
            </div>
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea class="form-control" [(ngModel)]="formData.description" rows="3"></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">Budget</label>
              <input type="number" class="form-control" [(ngModel)]="formData.budget" />
            </div>
            @if (error()) {
              <div class="alert alert-danger">{{ error() }}</div>
            }
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" (click)="save()" [disabled]="loading()">
              @if (loading()) {
                <span class="spinner-border spinner-border-sm me-2"></span>
              }
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EditProjectModalComponent {
  private projectService = inject(ProjectService);

  formData = signal({ title: '', description: '', budget: 0 });
  loading = signal(false);
  error = signal<string | null>(null);
  projectId: string | null = null;

  onSave?: (project: Project) => void;

  openModal(project: Project): void {
    this.projectId = project.id;
    this.formData.set({
      title: project.title,
      description: project.description,
      budget: project.budget
    });
    this.error.set(null);
    const modal = new (window as any).bootstrap.Modal(document.getElementById('editProjectModal'));
    modal.show();
  }

  save(): void {
    if (!this.projectId) return;

    this.loading.set(true);
    this.error.set(null);

    const request: UpdateProjectRequest = this.formData();

    this.projectService.updateProject(this.projectId, request).subscribe({
      next: (project) => {
        this.loading.set(false);
        const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('editProjectModal'));
        modal?.hide();
        if (this.onSave) this.onSave(project);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to update project');
      }
    });
  }
}
