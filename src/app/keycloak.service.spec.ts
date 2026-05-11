import { describe, it, expect } from 'vitest';
import { KeycloakService } from './keycloak.service';

describe('KeycloakService', () => {
  it('should extract roles from realm_access', () => {
    const service = new KeycloakService();
    // Simulate initialized keycloak object
    (service as any).keycloak = {
      tokenParsed: {
        realm_access: {
          roles: ['CLIENT', 'USER']
        },
        resource_access: {
          'skill-market-client': {
            roles: ['OLD_CLIENT_ROLE']
          }
        }
      }
    };

    const roles = service.getRoles();
    expect(roles).toContain('CLIENT');
    expect(roles).toContain('USER');
    expect(roles).not.toContain('OLD_CLIENT_ROLE');
  });

  it('should return empty array if realm_access is missing', () => {
    const service = new KeycloakService();
    (service as any).keycloak = {
      tokenParsed: {}
    };

    const roles = service.getRoles();
    expect(roles).toEqual([]);
  });
});
