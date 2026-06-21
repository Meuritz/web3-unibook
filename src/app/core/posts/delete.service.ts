import { inject, Injectable, signal } from '@angular/core';
import { EMPTY } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { PostsApiService } from '../api/posts-api.service';
import { extractHttpErrorMessage } from '../http/extract-http-error-message';

@Injectable({ providedIn: 'root' })
export class DeleteService {
  private readonly postsApiService = inject(PostsApiService);
  private readonly pendingIdState = signal<string | null>(null);
  private readonly errorState = signal<string | null>(null);

  readonly pendingId = this.pendingIdState.asReadonly();
  readonly error = this.errorState.asReadonly();

  remove(postId: string, onSuccess: () => void): void {
    if (this.pendingIdState() !== null) {
      return;
    }

    this.pendingIdState.set(postId);
    this.errorState.set(null);

    this.postsApiService
      .remove(postId)
      .pipe(
        catchError((error: unknown) => {
          this.errorState.set(
            extractHttpErrorMessage(error, 'Impossibile eliminare il post al momento.'),
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
