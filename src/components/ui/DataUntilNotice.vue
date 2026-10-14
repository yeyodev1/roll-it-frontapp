<script setup lang="ts">
import { computed } from 'vue'
import InfoTip from './InfoTip.vue'
import { site } from '@/config/site'
import { dashboardCopy } from '@/config/dashboardCopy'
import { useFiltersStore } from '@/stores/filters'
import { dayLabel } from '@/utils/chartFormat'

/**
 * "Datos hasta el 30 sep · SmartMenu aún no está conectado en vivo".
 * Solo aparece cuando la última venta es de antes de hoy; `banner` es la
 * versión con caja para el cuerpo de una vista, sin él va en línea.
 */
defineProps<{ banner?: boolean }>()

const filters = useFiltersStore()
const copy = dashboardCopy.dataUntil
const day = computed(() => (filters.dataUntil ? dayLabel(filters.dataUntil) : ''))
</script>

<template>
  <p v-if="filters.isBehind" class="until" :class="{ 'until--banner': banner }" role="note">
    <i class="fa-solid fa-calendar-day until__icon" aria-hidden="true"></i>
    <span class="until__text">
      <strong>{{ copy.label(day) }}</strong>
      <span class="until__more">
        <span class="until__sep" aria-hidden="true">·</span>
        <span>{{ copy.notLive }}</span>
      </span>
    </span>
    <InfoTip :text="site.help.sync" />
  </p>
</template>

<style scoped lang="scss">
.until {
  @include flex(row, center, flex-start, 0.45rem);
  font-size: 0.75rem;
  color: darken($warning, 22%);
  min-width: 0;

  &__icon {
    flex: 0 0 auto;
    color: darken($warning, 8%);
  }

  &__text {
    min-width: 0;

    strong {
      font-weight: 600;
    }
  }

  // En la barra de filtros del celular basta la fecha: el (i) explica el resto.
  &:not(&--banner) &__more {
    @include until('md') {
      display: none;
    }
  }

  &__sep {
    margin-inline: 0.3rem;
  }

  &--banner {
    padding: 0.65rem 0.85rem;
    border-radius: $radius-sm;
    border: 1px solid rgba($warning, 0.35);
    background: $warning-bg;
    font-size: $text-sm;
  }
}
</style>
