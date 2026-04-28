import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {
  private keycloak: Keycloak | undefined;

  constructor() { }

  async init(options?: Keycloak.KeycloakInitOptions): Promise<boolean> {
    this.keycloak = new Keycloak({
      url: 'http://localhost:8081',
      realm: 'skill-market',
      clientId: 'skill-market-client'
    });

    try {
      const authenticated = await this.keycloak.init(options);
      return authenticated;
    } catch (error) {
      console.error('Keycloak initialization failed', error);
      return false;
    }
  }

  logout(options?: Keycloak.KeycloakLogoutOptions): Promise<void> {
    return this.keycloak?.logout(options) || Promise.reject('Keycloak not initialized');
  }

  isLoggedIn(): boolean {
    return this.keycloak?.authenticated ?? false;
  }

  getToken(): string | undefined {
    return this.keycloak?.token;
  }

  getUsername(): string | undefined {
    return this.keycloak?.tokenParsed?.['preferred_username'];
  }

  getUserId(): string {
    return this.keycloak?.tokenParsed?.['sub'] || '';
  }

  updateToken(minValidity: number = 5): Promise<boolean> {
    return this.keycloak?.updateToken(minValidity) || Promise.resolve(false);
  }

  getRoles(): string[] {
    const tokenParsed = this.keycloak?.tokenParsed as any;
    const clientRoles = tokenParsed?.['resource_access']?.['skill-market-client']?.['roles'] || [];
    return clientRoles;
  }

  hasRole(role: string): boolean {
    console.log('User roles:', this.getRoles());
    return this.getRoles().includes(role);
  }
}