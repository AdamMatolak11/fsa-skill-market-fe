import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../profile.service';
import { KeycloakService } from '../../keycloak.service';
import { UserProfile, UpdateProfileRequest } from '../profile.model';

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

  profile: UserProfile | null = null;
  loading = false;
  error: string | null = null;
  success: string | null = null;
  editMode = false;

  formData: UpdateProfileRequest = {
    displayName: '',
    bio: '',
    skills: []
  };

  skillInput = '';

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.error = null;

    const userId = this.keycloakService.getUserId();
    if (!userId) {
      this.error = 'User ID not found';
      this.loading = false;
      return;
    }

    this.profileService.getProfile(userId).subscribe({
      next: (data) => {
        this.profile = data;
        this.formData = {
          displayName: data.displayName,
          bio: data.bio,
          skills: [...data.skills]
        };
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load profile';
        this.loading = false;
      }
    });
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    this.error = null;
    this.success = null;
  }

  addSkill(): void {
    if (this.skillInput.trim() && !this.formData.skills.includes(this.skillInput.trim())) {
      this.formData.skills.push(this.skillInput.trim());
      this.skillInput = '';
    }
  }

  removeSkill(skill: string): void {
    this.formData.skills = this.formData.skills.filter(s => s !== skill);
  }

  saveProfile(): void {
    if (!this.profile) return;

    this.loading = true;
    this.error = null;
    this.success = null;

    this.profileService.updateProfile(this.profile.id, this.formData).subscribe({
      next: (data) => {
        this.profile = data;
        this.loading = false;
        this.success = 'Profile updated successfully';
        this.editMode = false;
        setTimeout(() => (this.success = null), 3000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to update profile';
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
