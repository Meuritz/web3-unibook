import { computed, inject, Injectable, signal } from '@angular/core';
import { EMPTY } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';

import { MediaApiService } from '../../core/api/media-api.service';
import { Post } from '../../core/api/models/post.types';
import { UsersApiService } from '../../core/api/users-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { extractHttpErrorMessage } from '../../core/http/extract-http-error-message';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly usersApiService = inject(UsersApiService);
  private readonly mediaApiService = inject(MediaApiService);
  private readonly authService = inject(AuthService);
  private readonly postsState = signal<Post[]>([]);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly avatarUpdatingState = signal(false);
  private readonly avatarErrorState = signal<string | null>(null);
  private readonly bioUpdatingState = signal(false);
  private readonly bioErrorState = signal<string | null>(null);

  readonly posts = this.postsState.asReadonly();
  readonly isLoading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly isAvatarUpdating = this.avatarUpdatingState.asReadonly();
  readonly avatarError = this.avatarErrorState.asReadonly();
  readonly isBioUpdating = this.bioUpdatingState.asReadonly();
  readonly bioError = this.bioErrorState.asReadonly();
  readonly isEmpty = computed(
    () => !this.isLoading() && this.error() === null && this.posts().length === 0,
  );

  // Profile picture edit
  updateAvatar(file: File): void {
    this.avatarUpdatingState.set(true);
    this.avatarErrorState.set(null);

    this.mediaApiService
      .uploadAvatar(file)
      .pipe(
        switchMap(({ url }) => this.usersApiService.updateMe({ avatarUrl: url })),
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
  // Profile bio edit
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

  loadPosts(userId: string): void {
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
}
