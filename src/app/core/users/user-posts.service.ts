import { computed, inject, Injectable, signal } from '@angular/core';
import { EMPTY } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { Post } from '../api/models/post.types';
import { UsersApiService } from '../api/users-api.service';
import { extractHttpErrorMessage } from '../http/extract-http-error-message';

@Injectable({ providedIn: 'root' })
export class UserPostsService {
  private readonly usersApiService = inject(UsersApiService);
  private readonly postsState = signal<Post[]>([]);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly posts = this.postsState.asReadonly();
  readonly isLoading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly isEmpty = computed(
    () => !this.isLoading() && this.error() === null && this.posts().length === 0,
  );

  load(userId: string): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.usersApiService
      .getPosts(userId)
      .pipe(
        catchError((error: unknown) => {
          this.errorState.set(extractHttpErrorMessage(error, 'Impossibile caricare i post.'));
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
