import { computed, inject, Injectable, signal } from '@angular/core';
import { EMPTY } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { FeedApiService } from '../../core/api/feed-api.service';
import { Post } from '../../core/api/models/post.types';
import { extractHttpErrorMessage } from '../../core/http/extract-http-error-message';

@Injectable({ providedIn: 'root' })
export class FeedService {
  private readonly feedApiService = inject(FeedApiService);
  private readonly postsState = signal<Post[]>([]);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly posts = this.postsState.asReadonly();
  readonly isLoading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly isEmpty = computed(
    () => !this.isLoading() && this.error() === null && this.posts().length === 0,
  );

  loadFeed(): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.feedApiService
      .getFeed()
      .pipe(
        catchError((error: unknown) => {
          this.errorState.set(extractHttpErrorMessage(error, 'Impossibile caricare il feed.'));
          return EMPTY;
        }),
        finalize(() => {
          this.loadingState.set(false);
        }),
      )
      .subscribe((posts) => {
        this.postsState.set(posts);
      });
  }

  applyLikeChange(postId: string, liked: boolean): void {
    this.postsState.update((posts) =>
      posts.map((post) =>
        post.id === postId
          ? { ...post, isLiked: liked, likesCount: post.likesCount + (liked ? 1 : -1) }
          : post,
      ),
    );
  }
}
