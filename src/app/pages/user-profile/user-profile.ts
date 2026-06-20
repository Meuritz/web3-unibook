import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';

import { FollowService } from '../../core/users/follow.service';
import { UserPostsService } from '../../core/users/user-posts.service';
import { PostCard } from '../../shared/post-card/post-card';
import { UserAvatar } from '../../shared/user-avatar/user-avatar';
import { UserProfileService } from './user-profile.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.html',
  imports: [PostCard, UserAvatar],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfile {
  private readonly userProfileService = inject(UserProfileService);
  private readonly userPostsService = inject(UserPostsService);
  private readonly followService = inject(FollowService);

  readonly id = input.required<string>();

  protected readonly user = this.userProfileService.user;
  protected readonly isLoading = this.userProfileService.isLoading;
  protected readonly error = this.userProfileService.error;
  protected readonly posts = this.userPostsService.posts;
  protected readonly isPostsEmpty = this.userPostsService.isEmpty;
  protected readonly isFollowPending = this.followService.isPending;
  protected readonly followError = this.followService.error;

  protected readonly fullName = computed(() => {
    const user = this.user();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });

  constructor() {
    effect(() => {
      const userId = this.id();
      this.userProfileService.load(userId);
      this.userPostsService.load(userId);
    });
  }

  protected toggleFollow(): void {
    const user = this.user();
    if (!user) {
      return;
    }
    const following = !user.isFollowing;
    this.followService.setFollowing(user.id, following, () =>
      this.userProfileService.applyFollowChange(following),
    );
  }
}
