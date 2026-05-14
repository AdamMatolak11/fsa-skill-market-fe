import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'projects',
    loadComponent: () => import('./projects/projects.component').then(m => m.ProjectsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'projects/:projectId',
    loadComponent: () => import('./projects/project-detail/project-detail-page.component').then(m => m.ProjectDetailPageComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'freelancers',
    loadComponent: () => import('./freelancers/freelancer-search/freelancer-search.component').then(m => m.FreelancerSearchComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./profiles/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile/:userId',
    loadComponent: () => import('./profiles/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  }
];
