import { inject, Injectable, signal } from '@angular/core';
import { EMPTY } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { UserPublic } from '../../core/api/models/user.types';
import { UsersApiService } from '../../core/api/users-api.service';
import { extractHttpErrorMessage } from '../../core/http/extract-http-error-message';

/** Owns the public profile (UserPublic) being viewed. */
@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private readonly usersApiService = inject(UsersApiService);
  private readonly userState = signal<UserPublic | null>(null);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly user = this.userState.asReadonly();
  readonly isLoading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  load(userId: string): void {
    this.loadingState.set(true);
    this.errorState.set(null);
    this.userState.set(null);

    this.usersApiService
      .getById(userId)
      .pipe(
        catchError((error: unknown) => {
          this.errorState.set(extractHttpErrorMessage(error, 'Impossibile caricare il profilo.'));
          return EMPTY;
        }),
        finalize(() => {
          this.loadingState.set(false);
        }),
      )
      .subscribe((user) => {
        this.userState.set(user);
      });
  }

  applyFollowChange(following: boolean): void {
    this.userState.update((current) =>
      current
        ? {
            ...current,
            isFollowing: following,
            followersCount: current.followersCount + (following ? 1 : -1),
          }
        : current,
    );
  }
}
