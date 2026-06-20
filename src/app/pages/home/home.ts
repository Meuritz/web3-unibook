import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';

import { AuthService } from '../../core/auth/auth.service';
import { Post } from '../../core/api/models/post.types';
import { LikeService } from '../../core/posts/like.service';
import { PostCard } from '../../shared/post-card/post-card';
import { FeedService } from './feed.service';
import { PostComposer } from './post-composer/post-composer';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  imports: [PostCard, PostComposer],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly feedService = inject(FeedService);
  private readonly likeService = inject(LikeService);

  protected readonly currentUser = this.authService.currentUser;
  protected readonly feedPosts = this.feedService.posts;
  protected readonly isFeedLoading = this.feedService.isLoading;
  protected readonly feedError = this.feedService.error;
  protected readonly isFeedEmpty = this.feedService.isEmpty;
  protected readonly likePendingId = this.likeService.pendingId;
  protected readonly likeError = this.likeService.error;

  ngOnInit(): void {
    this.feedService.loadFeed();
  }

  protected reloadFeed(): void {
    this.feedService.loadFeed();
  }

  protected onPostCreated(post: Post): void {
    this.feedService.prependPost(post);
  }

  protected onToggleLike(post: Post): void {
    const like = !post.isLiked;
    this.likeService.setLiked(post.id, like, () =>
      this.feedService.applyLikeChange(post.id, like),
    );
  }
}
