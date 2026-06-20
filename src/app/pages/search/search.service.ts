import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';

import { UserSearchResult } from '../../core/api/models/user.types';
import { UsersApiService } from '../../core/api/users-api.service';
import { extractHttpErrorMessage } from '../../core/http/extract-http-error-message';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly usersApiService = inject(UsersApiService);
  private readonly queryState = signal('');
  private readonly resultsState = signal<UserSearchResult[]>([]);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly searchedState = signal(false);

  readonly results = this.resultsState.asReadonly();
  readonly isLoading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly hasSearched = this.searchedState.asReadonly();
  readonly isEmpty = computed(
    () =>
      this.hasSearched() &&
      !this.isLoading() &&
      this.error() === null &&
      this.results().length === 0,
  );

  constructor() {
    toObservable(this.queryState)
      .pipe(
        map((query) => query.trim()),
        debounceTime(250),
        distinctUntilChanged(),
        tap((query) => {
          this.errorState.set(null);
          if (!query) {
            this.resultsState.set([]);
            this.searchedState.set(false);
            this.loadingState.set(false);
          } else {
            this.loadingState.set(true);
            this.searchedState.set(true);
          }
        }),
        switchMap((query) => {
          if (!query) {
            return of<UserSearchResult[]>([]);
          }
          return this.usersApiService.search(query).pipe(
            catchError((error: unknown) => {
              this.errorState.set(
                extractHttpErrorMessage(error, 'Ricerca non riuscita.'),
              );
              return of<UserSearchResult[]>([]);
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((results) => {
        this.resultsState.set(results);
        this.loadingState.set(false);
      });
  }

  setQuery(query: string): void {
    this.queryState.set(query);
  }
}
