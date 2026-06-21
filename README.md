# UniBook Client

Social network universitario costruito con Angular 21 (standalone components, signals, `@angular/forms/signals`) e Bootstrap 5 lato frontend. Il client si collega al backend deployato su Supabase Functions e copre autenticazione, profili, ricerca utenti, follow, post con immagini, like e feed personale.

## Avvio

```bash
npm install # installa le dipendenze necessarie
npm start   # build ed esecuzione del progetto in locale 
```

Altri comandi:

```bash
npm run build   # build di produzione
npm run watch   # build in watch (development)
npm test        # test unitari (fatti con vitest)
npm run lint    # per formattare il codice (eslint)
```

## Funzionalità

Autenticazione e sessione:

- Registrazione e login collegati al backend.
- `token` e `refreshToken` persistiti in `localStorage`.
- Interceptor HTTP che aggiunge sempre `apikey` e, quando serve, `Authorization: Bearer <token>`.
- Refresh automatico della sessione dopo un `401` sulle richieste protette.
- Guard di navigazione per route pubbliche (`publicOnlyChildGuard`) e protette (`authChildGuard`).
- Logout con revoca del refresh token e pulizia della sessione locale.

Feature applicative:

- Profilo personale e modifica profilo (bio e avatar).
- Profilo pubblico di altri utenti con follower, seguiti e post pubblicati.
- Ricerca utenti per nome o cognome.
- Follow e unfollow.
- Creazione di post con testo e immagine opzionale.
- Like e unlike, con conteggio e stato del like corrente.
- Feed personale con i post degli utenti seguiti e i propri.
- Post in ordine cronologico inverso nei profili.
- Upload immagini per avatar e post.

Il dettaglio dei requisiti funzionali è in [requisiti.md](requisiti.md).

> Nota: la cancellazione dei propri post è esposta dall'API (`PostsApiService.remove`) ma non ancora collegata alla UI.

## Configurazione

Endpoint e chiave anon sono in [src/environments/environment.ts](src/environments/environment.ts):

- `api.functionsBaseUrl`: base URL delle Supabase Functions.
- `api.apikey`: chiave `anon` inviata su ogni richiesta dall'interceptor.

## Struttura

- `src/app/` — bootstrap (`app.ts`, `app.config.ts`), routing (`app.routes.ts`) e shell dell'app.
- `src/app/core/` — infrastruttura trasversale: autenticazione e sessione (`auth/`), configurazione API (`config/`), interceptor HTTP (`http/`), service di stato per follow, post e like.
- `src/app/core/api/` — service tipizzati verso il backend (`users`, `posts`, `feed`, `media`) e modelli in `models/`.
- `src/app/pages/` — schermate agganciate alle route: `login`, `register`, `home` (feed + composer), `profile`, `user-profile` (`users/:id`), `search`.
- `src/app/shared/` — componenti riusati: `post-card`, `user-avatar`.
- `src/app/layouts/` — `auth-layout` per le pagine pubbliche, `protected-layout` per quelle autenticate.

### Route

| Path | Componente | Accesso |
| --- | --- | --- |
| `/login`, `/register` | `Login`, `Register` | solo non autenticati |
| `/home` | `Home` | autenticato |
| `/profile` | `Profile` | autenticato |
| `/search` | `Search` | autenticato |
| `/users/:id` | `UserProfile` | autenticato |

### Service API

- `UsersApiService` — `/users-me`, `/users-search`, `/users-by-id/:id`, `/users-posts/:id`, `/users-follow/:id`.
- `PostsApiService` — `/posts`, `/posts/:id`, `/posts-like/:id`.
- `FeedApiService` — `/feed`.
- `MediaApiService` — `/media-upload` (multipart con `kind` `avatar`|`post`).

## Pattern per service di stato

Quando una schermata carica dati dal backend si usa un service di stato dedicato alla UI della feature: incapsula la chiamata API, conserva lo stato con i signals e lascia al template il solo compito di leggere lo stato corrente.

Gli stati da gestire:

- `data`: richiesta riuscita con dati da mostrare.
- `empty`: richiesta riuscita ma senza dati (derivato con `computed()`, non salvato come signal separato).
- `loading`: richiesta in corso.
- `error`: richiesta fallita, con messaggio utile ed eventuale retry.

Esempio concreto nel feed della home:

- [src/app/pages/home/feed.service.ts](src/app/pages/home/feed.service.ts) — stato UI + chiamata al backend in un service stateful.
- [src/app/pages/home/home.ts](src/app/pages/home/home.ts) — orchestrazione minima della pagina.
- [src/app/pages/home/home.html](src/app/pages/home/home.html) — mapping esplicito dei 4 stati nel template.

## Upload immagini (avatar e post)

Un `input type="file"` non si gestisce con `[formField]` come i campi testuali: il file non passa da un normale `value` ma da `input.files`, e nel dominio il dato finale non è il `File` ma l'URL (`avatarUrl` / `imageUrl`).

Pattern:

1. i campi testuali restano nel `model` del form con `[formField]`;
2. il file selezionato vive in un `signal<File | null>` separato, valorizzato con `(change)`;
3. nel submit si fa prima l'upload con `MediaApiService` (`uploadAvatar` / `uploadPostImage`);
4. il backend risponde con una `url`;
5. quella `url` valorizza `avatarUrl` / `imageUrl` nel payload finale (`UpdateProfileRequest` / `CreatePostRequest`).

Lo strato multipart è incapsulato in [src/app/core/api/media-api.service.ts](src/app/core/api/media-api.service.ts): costruisce la `FormData`, aggiunge `kind` e `file` e invia a `/media-upload`.

Per concatenare upload e creazione del post si possono usare `firstValueFrom()` con async/await (stile di `login`/`register`) oppure `switchMap` per restare in RxJS puro.
