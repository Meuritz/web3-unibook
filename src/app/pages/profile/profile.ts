import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import { AuthService } from '../../core/auth/auth.service';
import { Post } from '../../core/api/models/post.types';
import { UsersApiService } from '../../core/api/users-api.service';
import { LikeService } from '../../core/posts/like.service';
import { UserPostsService } from '../../core/users/user-posts.service';
import { PostCard } from '../../shared/post-card/post-card';
import { UserAvatar } from '../../shared/user-avatar/user-avatar';
import { ProfileEditService } from './profile-edit.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  imports: [PostCard, UserAvatar, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly userPostsService = inject(UserPostsService);
  private readonly profileEditService = inject(ProfileEditService);
  private readonly likeService = inject(LikeService);
  private readonly usersApiService = inject(UsersApiService);

  protected readonly currentUser = this.authService.currentUser;
  protected readonly posts = this.userPostsService.posts;
  protected readonly isLoading = this.userPostsService.isLoading;
  protected readonly error = this.userPostsService.error;
  protected readonly isEmpty = this.userPostsService.isEmpty;
  protected readonly likePendingId = this.likeService.pendingId;
  protected readonly likeError = this.likeService.error;
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
    // ponytail: rinfresca i contatori (la sessione non li aggiorna su follow)
    this.usersApiService.getMe().subscribe((me) => this.authService.updateCurrentUser(me));
  }

  protected reloadPosts(): void {
    const user = this.currentUser();
    if (user) {
      this.userPostsService.load(user.id);
    }
  }

  protected onToggleLike(post: Post): void {
    const like = !post.isLiked;
    this.likeService.setLiked(post.id, like, () =>
      this.userPostsService.applyLikeChange(post.id, like),
    );
  }

  protected onEditAvatar(): void {
    const url = prompt('URL della nuova immagine del profilo:', this.currentUser()?.avatarUrl ?? '');
    if (url !== null) {
      this.profileEditService.updateAvatar(url);
    }
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
