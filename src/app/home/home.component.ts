import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  template: `
    <div class="home-container">
      <h2>Welcome to the Skill Market!</h2>
      <p>This is your protected homepage. You can only see this if you're logged in.</p>
    </div>
  `,
  styles: [`
    .home-container {
      padding: 2rem;
      text-align: center;
    }
  `]
})
export class HomeComponent {}