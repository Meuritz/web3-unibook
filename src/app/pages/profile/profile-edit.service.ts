import { inject, Injectable, signal } from '@angular/core';
import { EMPTY } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { UsersApiService } from '../../core/api/users-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { extractHttpErrorMessage } from '../../core/http/extract-http-error-message';

/** Mutates the current user's own profile (avatar, bio) and syncs the session. */
@Injectable({ providedIn: 'root' })
export class ProfileEditService {
  private readonly usersApiService = inject(UsersApiService);
  private readonly authService = inject(AuthService);

  private readonly avatarUpdatingState = signal(false);
  private readonly avatarErrorState = signal<string | null>(null);
  private readonly bioUpdatingState = signal(false);
  private readonly bioErrorState = signal<string | null>(null);

  readonly isAvatarUpdating = this.avatarUpdatingState.asReadonly();
  readonly avatarError = this.avatarErrorState.asReadonly();
  readonly isBioUpdating = this.bioUpdatingState.asReadonly();
  readonly bioError = this.bioErrorState.asReadonly();

  updateAvatar(url: string): void {
    this.avatarUpdatingState.set(true);
    this.avatarErrorState.set(null);

    const trimmed = url.trim();

    this.usersApiService
      .updateMe({ avatarUrl: trimmed ? trimmed : null })
      .pipe(
        catchError((error: unknown) => {
          this.avatarErrorState.set(
            extractHttpErrorMessage(error, "Impossibile aggiornare l'immagine del profilo."),
          );
          return EMPTY;
        }),
        finalize(() => {
          this.avatarUpdatingState.set(false);
        }),
      )
      .subscribe((user) => {
        this.authService.updateCurrentUser(user);
      });
  }

  updateBio(bio: string, onSuccess?: () => void): void {
    this.bioUpdatingState.set(true);
    this.bioErrorState.set(null);

    const trimmed = bio.trim();

    this.usersApiService
      .updateMe({ bio: trimmed.length ? trimmed : null })
      .pipe(
        catchError((error: unknown) => {
          this.bioErrorState.set(extractHttpErrorMessage(error, 'Impossibile aggiornare la bio.'));
          return EMPTY;
        }),
        finalize(() => {
          this.bioUpdatingState.set(false);
        }),
      )
      .subscribe((user) => {
        this.authService.updateCurrentUser(user);
        onSuccess?.();
      });
  }
}
