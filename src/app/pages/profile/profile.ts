import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import { AuthService } from '../../core/auth/auth.service';
import { UserPostsService } from '../../core/users/user-posts.service';
import { PostCard } from '../../shared/post-card/post-card';
import { UserAvatar } from '../../shared/user-avatar/user-avatar';
import { ProfileEditService } from './profile-edit.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  imports: [PostCard, UserAvatar],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly userPostsService = inject(UserPostsService);
  private readonly profileEditService = inject(ProfileEditService);

  protected readonly currentUser = this.authService.currentUser;
  protected readonly posts = this.userPostsService.posts;
  protected readonly isLoading = this.userPostsService.isLoading;
  protected readonly error = this.userPostsService.error;
  protected readonly isEmpty = this.userPostsService.isEmpty;
  protected readonly isAvatarUpdating = this.profileEditService.isAvatarUpdating;
  protected readonly avatarError = this.profileEditService.avatarError;
  protected readonly isBioUpdating = this.profileEditService.isBioUpdating;
  protected readonly bioError = this.profileEditService.bioError;

  protected readonly isEditingBio = signal(false);
  protected readonly bioDraft = signal('');

  protected readonly fullName = computed(() => {
    const user = this.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });

  ngOnInit(): void {
    const user = this.currentUser();
    if (user) {
      this.userPostsService.load(user.id);
    }
  }

  protected reloadPosts(): void {
    const user = this.currentUser();
    if (user) {
      this.userPostsService.load(user.id);
    }
  }

  protected onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.profileEditService.updateAvatar(file);
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
    this.profileEditService.updateBio(this.bioDraft(), () => this.isEditingBio.set(false));
  }
}
