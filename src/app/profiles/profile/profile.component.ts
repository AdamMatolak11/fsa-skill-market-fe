import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../profile.service';
import { KeycloakService } from '../../keycloak.service';
import { UserProfile, UpdateProfileRequest } from '../profile.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private profileService = inject(ProfileService);
  private keycloakService = inject(KeycloakService);
  private route = inject(ActivatedRoute);

  profile = signal<UserProfile | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  editMode = signal(false);
  isOwnProfile = signal(true);

  formData: UpdateProfileRequest = {
    displayName: '',
    bio: '',
    skills: []
  };

  skillInput = signal('');

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const userId = params['userId'];
      if (userId) {
        this.isOwnProfile.set(userId === this.keycloakService.getUserId());
        this.loadProfile(userId);
      } else {
        this.isOwnProfile.set(true);
        this.loadProfile();
      }
    });
  }

  loadProfile(userId?: string): void {
    this.loading.set(true);
    this.error.set(null);

    const targetUserId = userId || this.keycloakService.getUserId();
    if (!targetUserId) {
      this.error.set('User ID not found');
      this.loading.set(false);
      return;
    }

    this.profileService.getProfile(targetUserId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.profile.set(data);
          this.formData = {
            displayName: data.displayName,
            bio: data.bio,
            skills: [...data.skills]
          };
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to load profile');
        }
      });
  }

  toggleEditMode(): void {
    this.editMode.set(!this.editMode());
    this.error.set(null);
    this.success.set(null);
  }

  addSkill(): void {
    if (this.skillInput().trim() && !this.formData.skills.includes(this.skillInput().trim())) {
      this.formData.skills.push(this.skillInput().trim());
      this.skillInput.set('');
    }
  }

  removeSkill(skill: string): void {
    this.formData.skills = this.formData.skills.filter(s => s !== skill);
  }

  saveProfile(): void {
    const currentProfile = this.profile();
    if (!currentProfile) return;

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    this.profileService.updateProfile(currentProfile.id, this.formData)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.profile.set(data);
          this.success.set('Profile updated successfully');
          this.editMode.set(false);
          setTimeout(() => (this.success.set(null)), 3000);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to update profile');
        }
      });
  }

  getRatingColor(rating: number): string {
    if (rating >= 4.5) return 'success';
    if (rating >= 4) return 'info';
    if (rating >= 3.5) return 'warning';
    return 'danger';
  }
}
