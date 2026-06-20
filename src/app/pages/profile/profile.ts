import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';

import { AuthService } from '../../core/auth/auth.service';
import { PostCard } from '../../shared/post-card/post-card';
import { UserAvatar } from '../../shared/user-avatar/user-avatar';
import { ProfileService } from './profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  imports: [PostCard, UserAvatar],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);

  protected readonly currentUser = this.authService.currentUser;
  protected readonly posts = this.profileService.posts;
  protected readonly isLoading = this.profileService.isLoading;
  protected readonly error = this.profileService.error;
  protected readonly isEmpty = this.profileService.isEmpty;

  protected readonly fullName = computed(() => {
    const user = this.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });

  ngOnInit(): void {
    const user = this.currentUser();
    if (user) {
      this.profileService.loadPosts(user.id);
    }
  }

  protected reloadPosts(): void {
    const user = this.currentUser();
    if (user) {
      this.profileService.loadPosts(user.id);
    }
  }
}
