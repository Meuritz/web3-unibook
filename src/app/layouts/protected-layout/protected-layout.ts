import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { UserAvatar } from '../../shared/user-avatar/user-avatar';

@Component({
  selector: 'app-protected-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, UserAvatar],
  templateUrl: './protected-layout.html',
})
export class ProtectedLayout {
  private readonly authService = inject(AuthService);

  protected readonly currentUser = this.authService.currentUser;

  protected async logout(): Promise<void> {
    await this.authService.logout();
  }
}
