import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Post } from '../../core/api/models/post.types';
import { FeedService } from './feed.service';

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 'p1',
    author: { id: 'u1', firstName: 'Mario', lastName: 'Rossi', avatarUrl: null },
    text: 'ciao',
    imageUrl: null,
    createdAt: '2025-05-04T10:30:00Z',
    likesCount: 5,
    isLiked: false,
    ...overrides,
  };
}

describe('FeedService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('prependPost adds the new post on top', () => {
    const service = TestBed.inject(FeedService);

    service.prependPost(makePost({ id: 'p1' }));
    service.prependPost(makePost({ id: 'p2' }));

    expect(service.posts().map((p) => p.id)).toEqual(['p2', 'p1']);
  });

  it('applyLikeChange toggles isLiked and adjusts the count', () => {
    const service = TestBed.inject(FeedService);
    service.prependPost(makePost({ id: 'p1', likesCount: 5, isLiked: false }));

    service.applyLikeChange('p1', true);
    expect(service.posts()[0]).toMatchObject({ isLiked: true, likesCount: 6 });

    service.applyLikeChange('p1', false);
    expect(service.posts()[0]).toMatchObject({ isLiked: false, likesCount: 5 });
  });

  it('applyLikeChange leaves other posts untouched', () => {
    const service = TestBed.inject(FeedService);
    service.prependPost(makePost({ id: 'p1', likesCount: 5 }));
    service.prependPost(makePost({ id: 'p2', likesCount: 9 }));

    service.applyLikeChange('p1', true);

    expect(service.posts().find((p) => p.id === 'p2')).toMatchObject({ likesCount: 9, isLiked: false });
  });
});
