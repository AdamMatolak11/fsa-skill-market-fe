import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KeycloakService } from './keycloak.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('skill-market');

  private keycloakService = inject(KeycloakService);

  get isLoggedIn(): boolean {
    return this.keycloakService.isLoggedIn();
  }

  get username(): string | undefined {
    return this.keycloakService.getUsername();
  }

  async logout(): Promise<void> {
    try {
      await this.keycloakService.logout();
    } catch (error) {
      console.error('Logout failed', error);
    }
  }
}
