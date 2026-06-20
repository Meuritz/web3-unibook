import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';

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
  protected readonly isAvatarUpdating = this.profileService.isAvatarUpdating;
  protected readonly avatarError = this.profileService.avatarError;
  protected readonly isBioUpdating = this.profileService.isBioUpdating;
  protected readonly bioError = this.profileService.bioError;

  protected readonly isEditingBio = signal(false);
  protected readonly bioDraft = signal('');

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

  protected onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.profileService.updateAvatar(file);
    }
    input.value = '';
  }

  protected startEditBio(): void {
    this.bioDraft.set(this.currentUser()?.bio ?? '');
    this.isEditingBio.set(true);
  }

  protected cancelEditBio(): void {
    this.isEditingBio.set(false);
  }

  protected saveBio(): void {
    this.profileService.updateBio(this.bioDraft(), () => this.isEditingBio.set(false));
  }
}
