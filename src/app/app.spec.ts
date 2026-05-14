import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { KeycloakService } from './keycloak.service';

describe('App', () => {
  let mockKeycloakService: any;

  beforeEach(async () => {
    mockKeycloakService = {
      getUsername: () => 'test-user',
      hasRole: (role: string) => false,
      logout: () => Promise.resolve()
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: KeycloakService, useValue: mockKeycloakService }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
