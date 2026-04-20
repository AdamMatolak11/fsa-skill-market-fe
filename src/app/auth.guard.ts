import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { KeycloakService } from './keycloak.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private keycloakService: KeycloakService) {}

  async canActivate(): Promise<boolean> {
    // Since we use 'login-required' in app initialization,
    // users will be automatically redirected to Keycloak if not authenticated
    return this.keycloakService.isLoggedIn();
  }
}