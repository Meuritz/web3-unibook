import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Post } from '../../core/api/models/post.types';

@Component({
  selector: 'app-post-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card border">
      <div class="card-body">
        <div class="d-flex flex-wrap justify-content-between align-items-start gap-2">
          <div>
            <h3 class="h6 mb-1">{{ authorName() }}</h3>
            <p class="text-secondary small mb-0">{{ post().createdAt }}</p>
          </div>

          <div class="text-md-end small fw-semibold">
            <span class="d-block">{{ post().likesCount }} like</span>
            @if (post().isLiked) {
              <span class="text-primary">Ti piace</span>
            }
          </div>
        </div>

        <p class="mt-3 mb-0" style="white-space: pre-wrap;">{{ post().text }}</p>

        @if (post().imageUrl) {
          <img
            class="img-fluid rounded object-fit-cover w-100 mt-3"
            style="max-height: 24rem;"
            [src]="post().imageUrl"
            [alt]="'Immagine del post di ' + authorName()"
          />
        }
      </div>
    </article>
  `,
})
export class PostCard {
  readonly post = input.required<Post>();

  protected readonly authorName = computed(() => {
    const author = this.post().author;
    return `${author.firstName} ${author.lastName}`;
  });
}
