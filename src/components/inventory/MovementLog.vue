<script setup lang="ts">
import { computed } from 'vue'
import { site } from '@/config/site'
import { inventoryCopy } from '@/config/inventoryCopy'
import { ecuadorDay } from '@/stores/filters'
import { dayLabel } from '@/utils/chartFormat'
import { formatQty } from '@/utils/format'
import type { Movement, MovementType } from '@/types'

/** Historial de movimientos agrupado por día: tipo con ícono, insumo, nota y cantidad con signo. */
const props = defineProps<{ items: Movement[]; showBranch: boolean }>()

const copy = inventoryCopy.movements
const time = new Intl.DateTimeFormat('es-EC', { hour: '2-digit', minute: '2-digit' })

const ICON: Record<MovementType, string> = {
  initial: 'fa-solid fa-clipboard-list',
  purchase: 'fa-solid fa-truck-ramp-box',
  sale: 'fa-solid fa-utensils',
  adjustment: 'fa-solid fa-sliders',
  waste: 'fa-solid fa-trash-can',
}

function signed(m: Movement) {
  const text = formatQty(Math.abs(m.quantity), m.ingredient.unit)
  return m.quantity > 0 ? `+${text}` : m.quantity < 0 ? `−${text}` : text
}

const groups = computed(() => {
  const today = ecuadorDay()
  const map = new Map<string, Movement[]>()
  for (const m of props.items) {
    const day = ecuadorDay(m.date)
    if (!map.has(day)) map.set(day, [])
    map.get(day)!.push(m)
  }
  return [...map.entries()].map(([day, list]) => ({
    day,
    label: day === today ? copy.today : dayLabel(day),
    list,
  }))
})
</script>

<template>
  <div class="mlog">
    <section v-for="g in groups" :key="g.day" class="mlog__group">
      <h3 class="mlog__day">
        <span>{{ g.label }}</span>
        <small class="num">{{ copy.count(g.list.length) }}</small>
      </h3>
      <ul class="mlog__list">
        <li v-for="m in g.list" :key="m._id" class="mlog__row">
          <span class="mlog__icon" :class="`mlog__icon--${m.type}`" aria-hidden="true">
            <i :class="ICON[m.type]"></i>
          </span>
          <span class="mlog__main">
            <strong>{{ m.ingredient.name }}</strong>
            <small>
              <span class="mlog__type" :class="`mlog__type--${m.type}`">{{
                site.movementTypes[m.type]
              }}</span>
              <span class="num">{{ time.format(new Date(m.date)) }}</span>
              <span v-if="showBranch">{{ m.branch.name }}</span>
              <span v-if="m.createdBy">{{ copy.by }} {{ m.createdBy.name }}</span>
            </small>
            <small v-if="m.note" class="mlog__note">{{ m.note }}</small>
          </span>
          <span class="mlog__qty num" :class="m.quantity >= 0 ? 'is-in' : 'is-out'">
            {{ signed(m) }}
          </span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped lang="scss">
.mlog {
  @include flex(column, stretch, flex-start);

  &__day {
    @include flex(row, center, space-between, 0.5rem);
    padding: 0.55rem $sp-4;
    background: rgba($canvas, 0.7);
    border-top: 1px solid $line-soft;
    font-family: $font-principal;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: $ink-soft;

    @include from('md') {
      padding-inline: $sp-6;
    }

    small {
      font-weight: 500;
      letter-spacing: 0;
      text-transform: none;
      color: $ink-muted;
    }
  }

  &__list {
    list-style: none;
  }

  &__row {
    @include flex(row, center, flex-start, 0.8rem);
    padding: 0.75rem $sp-4;
    border-top: 1px solid $line-soft;
    @include transition(background-color);

    @include from('md') {
      padding-inline: $sp-6;
    }

    &:hover {
      background: rgba($canvas, 0.5);
    }
  }

  &__icon {
    @include flex(row, center, center);
    flex: 0 0 auto;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: $radius-ctl;
    font-size: 0.82rem;
    background: $sand;
    color: $ink-soft;

    // En el celular el tipo ya va en color debajo del nombre: el ícono es aire que falta.
    @include until('sm') {
      display: none;
    }

    &--purchase {
      background: $success-bg;
      color: darken($success, 10%);
    }

    &--waste {
      background: $danger-bg;
      color: $danger;
    }

    &--adjustment,
    &--initial {
      background: $info-bg;
      color: darken($info, 8%);
    }

    &--sale {
      background: $accent-soft;
      color: $accent-deep;
    }
  }

  &__main {
    @include flex(column, flex-start, flex-start, 0.1rem);
    flex: 1;
    min-width: 0;
    line-height: 1.3;

    strong {
      font-size: 0.88rem;
      font-weight: 600;
    }

    small {
      @include flex(row, center, flex-start, 0.25rem 0.5rem);
      flex-wrap: wrap;
      font-size: 0.72rem;
      color: $ink-muted;
    }
  }

  &__type {
    font-weight: 700;

    &--purchase {
      color: darken($success, 10%);
    }

    &--waste {
      color: $danger;
    }

    &--adjustment,
    &--initial {
      color: darken($info, 8%);
    }

    &--sale {
      color: $accent-deep;
    }
  }

  &__note {
    font-style: italic;
    color: $ink-soft !important;
  }

  &__qty {
    flex: 0 0 auto;
    font-size: 0.9rem;
    font-weight: 700;
    white-space: nowrap;

    &.is-in {
      color: darken($success, 10%);
    }

    &.is-out {
      color: $danger;
    }
  }
}
</style>
