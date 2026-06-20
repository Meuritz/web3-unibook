import { Component, inject, signal } from '@angular/core';
import {
  FormField,
  FormRoot,
  email as emailRule,
  form,
  minLength,
  required,
} from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';

import { RegisterRequest } from '../../core/api/models/auth.types';
import { AuthService } from '../../core/auth/auth.service';
import { extractHttpErrorMessage } from '../../core/http/extract-http-error-message';

@Component({
  selector: 'app-register',
  imports: [FormField, FormRoot, RouterLink],
  templateUrl: './register.html',
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly model = signal<RegisterRequest>({
    firstName: '',
    lastName: '',
    birthDate: '',
    email: '',
    password: '',
  });

  protected readonly form = form(
    this.model,
    (registration) => {
      required(registration.firstName, { message: 'Inserisci il nome.' });
      required(registration.lastName, { message: 'Inserisci il cognome.' });
      required(registration.birthDate, { message: 'Inserisci la data di nascita.' });
      required(registration.email, { message: "Inserisci l'email." });
      emailRule(registration.email, { message: 'Inserisci un indirizzo email valido.' });
      required(registration.password, { message: 'Inserisci la password.' });
      minLength(registration.password, 8, {
        message: 'La password deve contenere almeno 8 caratteri.',
      });
    },
    {
      submission: {
        action: async () => {
          try {
            await this.authService.register(this.model());
            await this.router.navigateByUrl('/home');
            return;
          } catch (error: unknown) {
            return {
              kind: 'serverError',
              message: extractHttpErrorMessage(
                error,
                'Registrazione non riuscita. Controlla i dati inseriti.',
              ),
            };
          }
        },
        onInvalid: (field) => {
          field().errorSummary()[0]?.fieldTree().focusBoundControl();
        },
      },
    },
  );
}
