import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import {
  FormField,
  FormRoot,
  form,
  maxLength,
  pattern,
  required,
} from '@angular/forms/signals';

import { Post } from '../../../core/api/models/post.types';
import { extractHttpErrorMessage } from '../../../core/http/extract-http-error-message';
import { PostComposeService } from '../../../core/posts/post-compose.service';

@Component({
  selector: 'app-post-composer',
  imports: [FormField, FormRoot],
  templateUrl: './post-composer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .composer:focus-within {
      border-color: var(--bs-primary) !important;
      box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.25);
    }

    .composer textarea:focus,
    .composer input:focus {
      box-shadow: none;
    }
  `,
})
export class PostComposer {
  private readonly postComposeService = inject(PostComposeService);

  readonly created = output<Post>();

  protected readonly maxTextLength = 500;

  protected readonly model = signal({ text: '', imageUrl: '' });

  protected readonly remaining = computed(
    () => this.maxTextLength - this.model().text.length,
  );

  protected readonly previewUrl = computed(() => {
    const url = this.model().imageUrl.trim();
    return url.length && this.form.imageUrl().valid() ? url : null;
  });

  protected readonly form = form(
    this.model,
    (post) => {
      required(post.text, { message: 'Scrivi qualcosa prima di pubblicare.' });
      maxLength(post.text, this.maxTextLength, {
        message: `Il testo non puo superare ${this.maxTextLength} caratteri.`,
      });
      pattern(post.imageUrl, /^https?:\/\/.+/i, {
        message: "Inserisci un URL valido (deve iniziare con http:// o https://).",
      });
    },
    {
      submission: {
        action: async () => {
          try {
            const post = await this.postComposeService.create(
              this.model().text,
              this.model().imageUrl,
            );
            this.created.emit(post);
            this.resetForm();
            return;
          } catch (error: unknown) {
            return {
              kind: 'serverError',
              message: extractHttpErrorMessage(error, 'Pubblicazione non riuscita.'),
            };
          }
        },
        onInvalid: (field) => {
          field().errorSummary()[0]?.fieldTree().focusBoundControl();
        },
      },
    },
  );

  private resetForm(): void {
    this.form().reset({ text: '', imageUrl: '' });
  }
}
