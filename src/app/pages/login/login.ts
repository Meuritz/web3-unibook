import { Component, inject, signal } from '@angular/core';
import { FormField, FormRoot, email as emailRule, form, required } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { LoginRequest } from '../../core/api/models/auth.types';
import { AuthService } from '../../core/auth/auth.service';
import { extractHttpErrorMessage } from '../../core/http/extract-http-error-message';

@Component({
  selector: 'app-login',
  imports: [FormField, FormRoot, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly model = signal<LoginRequest>({
    email: '',
    password: '',
  });

  protected readonly form = form(
    this.model,
    (login) => {
      required(login.email, { message: "Inserisci l'email." });
      emailRule(login.email, { message: 'Inserisci un indirizzo email valido.' });
      required(login.password, { message: 'Inserisci la password.' });
    },
    {
      submission: {
        action: async () => {
          try {
            await this.authService.login(this.model());
            const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo') ?? '/home';
            await this.router.navigateByUrl(redirectTo);
            return;
          } catch (error: unknown) {
            return {
              kind: 'serverError',
              message: extractHttpErrorMessage(
                error,
                'Accesso non riuscito. Verifica le credenziali.',
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
