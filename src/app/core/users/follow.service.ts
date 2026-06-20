import { inject, Injectable, signal } from '@angular/core';
import { EMPTY } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { UsersApiService } from '../api/users-api.service';
import { extractHttpErrorMessage } from '../http/extract-http-error-message';

@Injectable({ providedIn: 'root' })
export class FollowService {
  private readonly usersApiService = inject(UsersApiService);
  private readonly pendingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly isPending = this.pendingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  setFollowing(userId: string, follow: boolean, onSuccess: () => void): void {
    if (this.pendingState()) {
      return;
    }

    this.pendingState.set(true);
    this.errorState.set(null);

    const request$ = follow
      ? this.usersApiService.follow(userId)
      : this.usersApiService.unfollow(userId);

    request$
      .pipe(
        catchError((error: unknown) => {
          this.errorState.set(
            extractHttpErrorMessage(error, 'Impossibile aggiornare lo stato di follow.'),
          );
          return EMPTY;
        }),
        finalize(() => {
          this.pendingState.set(false);
        }),
      )
      .subscribe(() => {
        onSuccess();
      });
  }
}
