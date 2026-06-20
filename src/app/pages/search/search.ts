import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { UserAvatar } from '../../shared/user-avatar/user-avatar';
import { SearchService } from './search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.html',
  imports: [RouterLink, UserAvatar],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Search {
  private readonly searchService = inject(SearchService);

  protected readonly query = signal('');
  protected readonly results = this.searchService.results;
  protected readonly isLoading = this.searchService.isLoading;
  protected readonly error = this.searchService.error;
  protected readonly isEmpty = this.searchService.isEmpty;
  protected readonly hasSearched = this.searchService.hasSearched;

  protected onQueryInput(value: string): void {
    this.query.set(value);
    this.searchService.setQuery(value);
  }
}
