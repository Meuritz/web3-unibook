import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

import { Post } from '../../core/api/models/post.types';
import { UserAvatar } from '../user-avatar/user-avatar';

@Component({
  selector: 'app-post-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UserAvatar],
  template: `
    <article class="d-flex gap-3">
      <app-user-avatar
        class="flex-shrink-0"
        [name]="authorName()"
        [avatarUrl]="post().author.avatarUrl"
        [size]="40"
      />

      <div class="post-bubble flex-grow-1 border rounded position-relative">
        <header
          class="d-flex flex-wrap align-items-center gap-1 bg-body-tertiary border-bottom rounded-top px-3 py-2"
        >
          <span class="fw-semibold">{{ authorName() }}</span>
          <span class="text-secondary small">
            ha pubblicato
            <time [attr.datetime]="post().createdAt" [attr.title]="absoluteDate()">
              {{ relativeDate() }}
            </time>
          </span>
        </header>

        <div class="px-3 py-3">
          <p class="mb-0" style="white-space: pre-wrap;">{{ post().text }}</p>

          @if (post().imageUrl) {
            <img
              class="img-fluid rounded border object-fit-cover w-100 mt-3"
              style="max-height: 24rem;"
              [src]="post().imageUrl"
              [alt]="'Immagine del post di ' + authorName()"
            />
          }
        </div>

        <footer class="border-top px-3 py-2">
          <button
            type="button"
            class="btn btn-sm rounded-pill border d-inline-flex align-items-center gap-1"
            [class.btn-primary]="post().isLiked"
            [class.btn-outline-secondary]="!post().isLiked"
            [disabled]="likePending()"
            [attr.aria-pressed]="post().isLiked"
            (click)="toggleLike.emit(post())"
          >
            @if (likePending()) {
              <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
            } @else {
              <span aria-hidden="true">👍</span>
            }
            <span>{{ post().likesCount }}</span>
            <span class="visually-hidden">
              like - {{ post().isLiked ? 'rimuovi il tuo like' : 'metti like' }}
            </span>
          </button>
        </footer>
      </div>
    </article>
  `,
  styles: `
    /* Freccia stile GitHub che punta verso l'avatar */
    .post-bubble::before,
    .post-bubble::after {
      content: '';
      position: absolute;
      top: 12px;
      right: 100%;
      width: 0;
      height: 0;
      border-style: solid;
    }

    .post-bubble::before {
      border-width: 9px 9px 9px 0;
      border-color: transparent var(--bs-border-color) transparent transparent;
    }

    .post-bubble::after {
      margin-right: -1px;
      border-width: 8px 8px 8px 0;
      border-color: transparent var(--bs-tertiary-bg) transparent transparent;
    }
  `,
})
export class PostCard {
  readonly post = input.required<Post>();
  readonly likePending = input(false);
  readonly toggleLike = output<Post>();

  protected readonly authorName = computed(() => {
    const author = this.post().author;
    return `${author.firstName} ${author.lastName}`;
  });

  protected readonly absoluteDate = computed(() =>
    this.formatAbsolute(this.post().createdAt),
  );

  protected readonly relativeDate = computed(() =>
    this.formatRelative(this.post().createdAt),
  );

  private formatAbsolute(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return new Intl.DateTimeFormat('it-IT', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(date);
  }

  private formatRelative(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    const diffMs = date.getTime() - Date.now();
    const rtf = new Intl.RelativeTimeFormat('it-IT', { numeric: 'auto' });
    const divisions: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
      { amount: 60, unit: 'second' },
      { amount: 60, unit: 'minute' },
      { amount: 24, unit: 'hour' },
      { amount: 7, unit: 'day' },
      { amount: 4.34524, unit: 'week' },
      { amount: 12, unit: 'month' },
      { amount: Number.POSITIVE_INFINITY, unit: 'year' },
    ];

    let duration = diffMs / 1000;
    for (const division of divisions) {
      if (Math.abs(duration) < division.amount) {
        return rtf.format(Math.round(duration), division.unit);
      }
      duration /= division.amount;
    }
    return this.formatAbsolute(value);
  }
}
