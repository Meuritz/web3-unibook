import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { LikeService } from './like.service';

describe('LikeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('posts a like and runs onSuccess', () => {
    const service = TestBed.inject(LikeService);
    const httpMock = TestBed.inject(HttpTestingController);
    const onSuccess = vi.fn();

    service.setLiked('p1', true, onSuccess);

    const req = httpMock.expectOne('/posts-like/p1');
    expect(req.request.method).toBe('POST');
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(onSuccess).toHaveBeenCalledOnce();
    expect(service.pendingId()).toBeNull();
    expect(service.error()).toBeNull();
  });

  it('sends DELETE when unliking', () => {
    const service = TestBed.inject(LikeService);
    const httpMock = TestBed.inject(HttpTestingController);

    service.setLiked('p1', false, vi.fn());

    const req = httpMock.expectOne('/posts-like/p1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('ignores concurrent calls while one is pending', () => {
    const service = TestBed.inject(LikeService);
    const httpMock = TestBed.inject(HttpTestingController);

    service.setLiked('p1', true, vi.fn());
    service.setLiked('p2', true, vi.fn());

    httpMock.expectOne('/posts-like/p1').flush(null, { status: 204, statusText: 'No Content' });
    httpMock.expectNone('/posts-like/p2');
  });

  it('sets an error message and skips onSuccess on failure', () => {
    const service = TestBed.inject(LikeService);
    const httpMock = TestBed.inject(HttpTestingController);
    const onSuccess = vi.fn();

    service.setLiked('p1', true, onSuccess);

    httpMock
      .expectOne('/posts-like/p1')
      .flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(service.error()).toBe('boom');
    expect(service.pendingId()).toBeNull();
  });
});
