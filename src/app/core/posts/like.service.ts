import { inject, Injectable, signal } from '@angular/core';
import { EMPTY } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { PostsApiService } from '../api/posts-api.service';
import { extractHttpErrorMessage } from '../http/extract-http-error-message';

@Injectable({ providedIn: 'root' })
export class LikeService {
  private readonly postsApiService = inject(PostsApiService);
  private readonly pendingIdState = signal<string | null>(null);
  private readonly errorState = signal<string | null>(null);

  readonly pendingId = this.pendingIdState.asReadonly();
  readonly error = this.errorState.asReadonly();

  setLiked(postId: string, like: boolean, onSuccess: () => void): void {
    if (this.pendingIdState() !== null) {
      return;
    }

    this.pendingIdState.set(postId);
    this.errorState.set(null);

    const request$ = like
      ? this.postsApiService.like(postId)
      : this.postsApiService.unlike(postId);

    request$
      .pipe(
        catchError((error: unknown) => {
          this.errorState.set(
            extractHttpErrorMessage(error, 'Impossibile aggiornare il like.'),
          );
          return EMPTY;
        }),
        finalize(() => {
          this.pendingIdState.set(null);
        }),
      )
      .subscribe(() => {
        onSuccess();
      });
  }
}
