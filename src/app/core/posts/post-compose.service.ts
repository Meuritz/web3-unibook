import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Post } from '../api/models/post.types';
import { PostsApiService } from '../api/posts-api.service';

@Injectable({ providedIn: 'root' })
export class PostComposeService {
  private readonly postsApiService = inject(PostsApiService);

  async create(text: string, imageUrl: string | null): Promise<Post> {
    const trimmedUrl = imageUrl?.trim();
    return firstValueFrom(
      this.postsApiService.create({
        text: text.trim(),
        imageUrl: trimmedUrl ? trimmedUrl : null,
      }),
    );
  }
}
