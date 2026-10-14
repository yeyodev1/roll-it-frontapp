<script setup lang="ts">
import { computed } from 'vue'
import { dashboardCopy } from '@/config/dashboardCopy'
import { ecuadorDay } from '@/stores/filters'
import { dayLabel } from '@/utils/chartFormat'
import { formatQty } from '@/utils/format'
import type { SalesReportResult } from '@/types'

/**
 * Resultado de subir el reporte: sucursal y fechas, cifras de lo cargado y,
 * si quedaron platos sin receta, la lista en un desplegable.
 */
const props = defineProps<{ result: SalesReportResult; busy?: boolean; round?: number }>()
const emit = defineEmits<{ resume: []; another: []; close: [] }>()

const copy = dashboardCopy.salesUpload
const day = (iso: string | null) => (iso ? dayLabel(ecuadorDay(iso)) : '—')
const partial = computed(() => props.result.pending > 0)

const stats = computed(() => [
  { key: 'created', label: copy.created, value: props.result.created, tone: 'accent' },
  { key: 'updated', label: copy.updated, value: props.result.updated, tone: 'blue' },
  { key: 'unchanged', label: copy.unchanged, value: props.result.unchanged, tone: 'ink' },
  { key: 'tickets', label: copy.tickets, value: props.result.tickets, tone: 'ink' },
])
</script>

<template>
  <div class="rsum">
    <header class="rsum__head" :class="{ 'rsum__head--partial': partial }">
      <span class="rsum__badge" aria-hidden="true">
        <i :class="partial ? 'fa-solid fa-hourglass-half' : 'fa-solid fa-check'"></i>
      </span>
      <div class="rsum__titles">
        <p class="rsum__title">{{ partial ? copy.partial : copy.done }}</p>
        <p class="rsum__sub">
          {{
            partial
              ? copy.partialText(result.pending)
              : copy.doneText(result.branch.name, day(result.to))
          }}
        </p>
      </div>
    </header>

    <dl class="rsum__meta">
      <div>
        <dt>{{ copy.branch }}</dt>
        <dd><i class="fa-solid fa-store" aria-hidden="true"></i>{{ result.branch.name }}</dd>
      </div>
      <div>
        <dt>{{ copy.range }}</dt>
        <dd class="num">
          <i class="fa-solid fa-calendar-day" aria-hidden="true"></i>{{ day(result.from) }} –
          {{ day(result.to) }}
        </dd>
      </div>
    </dl>

    <ul class="rsum__stats">
      <li v-for="s in stats" :key="s.key" class="rsum__stat" :class="`rsum__stat--${s.tone}`">
        <span class="rsum__stat-label">{{ s.label }}</span>
        <strong class="rsum__stat-value">{{ formatQty(s.value) }}</strong>
      </li>
    </ul>

    <details v-if="result.unmappedProducts.length" class="rsum__unmapped">
      <summary>
        <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
        <span>{{ copy.unmapped(result.unmappedProducts.length) }}</span>
        <i class="fa-solid fa-chevron-down rsum__chev" aria-hidden="true"></i>
      </summary>
      <p class="rsum__hint">{{ copy.unmappedHint }}</p>
      <ul class="rsum__chips">
        <li v-for="name in result.unmappedProducts" :key="name">{{ name }}</li>
      </ul>
      <RouterLink to="/recetas" class="rsum__link" @click="emit('close')">
        {{ copy.toRecipes }} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
      </RouterLink>
    </details>

    <div class="rsum__actions">
      <template v-if="partial">
        <button type="button" class="btn btn--primary" :disabled="busy" @click="emit('resume')">
          <i
            :class="busy ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-forward'"
            aria-hidden="true"
          ></i>
          {{ busy ? copy.continuing(round ?? 1) : copy.continue }}
        </button>
      </template>
      <template v-else>
        <button type="button" class="btn btn--ghost btn--sm" @click="emit('another')">
          <i class="fa-solid fa-arrow-up-from-bracket" aria-hidden="true"></i>
          {{ copy.another }}
        </button>
        <button type="button" class="btn btn--dark btn--sm" @click="emit('close')">
          {{ copy.close }}
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.rsum {
  @include flex(column, stretch, flex-start, $sp-4);

  &__head {
    @include flex(row, center, flex-start, $sp-3);
    padding: $sp-3 $sp-4;
    border-radius: $radius-ctl;
    background: $success-bg;

    &--partial {
      background: $warning-bg;

      .rsum__badge {
        background: $warning;
      }
    }
  }

  &__badge {
    @include flex(row, center, center);
    flex: 0 0 auto;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    background: $success;
    color: $surface;
    font-size: 0.9rem;
  }

  &__titles {
    min-width: 0;
  }

  &__title {
    font-weight: 700;
    color: $ink;
    line-height: 1.3;
  }

  &__sub {
    font-size: 0.8rem;
    color: $ink-soft;
  }

  &__meta {
    @include flex(row, flex-start, flex-start, $sp-3 $sp-6);
    flex-wrap: wrap;

    dt {
      @include card-label;
      font-size: 0.72rem;
    }

    dd {
      @include flex(row, center, flex-start, 0.4rem);
      font-size: 0.88rem;
      font-weight: 600;
      color: $ink;

      i {
        color: $ink-muted;
        font-size: 0.75rem;
      }
    }
  }

  &__stats {
    list-style: none;
    @include flex-cards(100px, $sp-2);
  }

  &__stat {
    @include flex(column, flex-start, flex-start, 0.15rem);
    padding: $sp-3;
    border-radius: $radius-ctl;
    background: $canvas;

    &--accent .rsum__stat-value {
      color: $accent-deep;
    }

    &--blue .rsum__stat-value {
      color: $chart-2;
    }
  }

  &__stat-label {
    @include card-label;
    font-size: 0.72rem;
  }

  &__stat-value {
    @include figure(1.35rem);
  }

  &__unmapped {
    border: 1px solid rgba($warning, 0.35);
    border-radius: $radius-ctl;
    background: rgba($warning, 0.06);

    summary {
      @include flex(row, center, flex-start, 0.5rem);
      padding: 0.7rem $sp-4;
      font-size: 0.84rem;
      font-weight: 600;
      color: darken($warning, 24%);
      cursor: pointer;
      list-style: none;

      &::-webkit-details-marker {
        display: none;
      }
    }

    &[open] .rsum__chev {
      transform: rotate(180deg);
    }
  }

  &__chev {
    margin-left: auto;
    font-size: 0.7rem;
    @include transition(transform);
  }

  &__hint {
    padding: 0 $sp-4;
    font-size: 0.78rem;
    color: $ink-soft;
  }

  &__chips {
    list-style: none;
    @include flex(row, center, flex-start, 0.35rem);
    flex-wrap: wrap;
    max-height: 9rem;
    overflow-y: auto;
    padding: $sp-3 $sp-4;

    li {
      padding: 0.2rem 0.6rem;
      border-radius: $radius-pill;
      background: $surface;
      border: 1px solid $line-soft;
      font-size: 0.74rem;
      color: $ink;
    }
  }

  &__link {
    @include flex(row, center, flex-start, 0.4rem);
    padding: 0 $sp-4 $sp-3;
    font-size: 0.8rem;
    font-weight: 600;
    color: $accent-deep;
  }

  &__actions {
    @include flex(row, center, flex-end, $sp-2);
    flex-wrap: wrap;
  }
}
</style>
