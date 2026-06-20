import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-user-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (avatarUrl()) {
      <img
        class="rounded-circle border object-fit-cover"
        [width]="size()"
        [height]="size()"
        [style.width.px]="size()"
        [style.height.px]="size()"
        [src]="avatarUrl()"
        [alt]="'Foto profilo di ' + name()"
      />
    } @else {
      <span
        class="rounded-circle border bg-body-tertiary d-inline-flex align-items-center justify-content-center fw-semibold text-secondary"
        [style.width.px]="size()"
        [style.height.px]="size()"
        [style.font-size.px]="size() * 0.4"
        aria-hidden="true"
      >
        {{ initials() }}
      </span>
    }
  `,
})
export class UserAvatar {
  readonly name = input.required<string>();
  readonly avatarUrl = input<string | null>(null);
  readonly size = input(48);

  protected readonly initials = computed(() => {
    const parts = this.name().trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.charAt(0) ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (first + last).toUpperCase();
  });
}
