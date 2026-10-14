<script setup lang="ts">
import ChartCard from '@/components/ui/ChartCard.vue'
import { site } from '@/config/site'
import { dashboardCopy } from '@/config/dashboardCopy'

// Resumen de inventario para el CEO: cuántos insumos están agotados o por acabarse.
const props = defineProps<{ out: number; low: number }>()
const copy = dashboardCopy.ceo
const ok = () => props.out + props.low === 0
</script>

<template>
  <ChartCard :title="copy.alerts" :help="site.help.inventoryAlerts" class="alerts">
    <template #action>
      <RouterLink to="/inventario" class="alerts__cta">
        {{ copy.alertsCta }} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
      </RouterLink>
    </template>

    <div v-if="!ok()" class="alerts__tiles">
      <RouterLink to="/inventario" class="alerts__tile alerts__tile--out">
        <span class="alerts__icon"
          ><i class="fa-solid fa-circle-xmark" aria-hidden="true"></i
        ></span>
        <strong class="alerts__num">{{ out }}</strong>
        <span class="alerts__label">{{ copy.alertsOut }}</span>
      </RouterLink>
      <RouterLink to="/inventario" class="alerts__tile alerts__tile--low">
        <span class="alerts__icon"
          ><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i
        ></span>
        <strong class="alerts__num">{{ low }}</strong>
        <span class="alerts__label">{{ copy.alertsLow }}</span>
      </RouterLink>
    </div>

    <p v-else class="alerts__ok">
      <span class="alerts__icon"><i class="fa-solid fa-circle-check" aria-hidden="true"></i></span>
      <span>
        <strong>{{ copy.alertsOk }}</strong>
        <small>{{ copy.alertsOkText }}</small>
      </span>
    </p>
  </ChartCard>
</template>

<style scoped lang="scss">
.alerts {
  &__cta {
    @include flex(row, center, flex-start, 0.35rem);
    font-size: 0.78rem;
    font-weight: 600;
    color: $accent-deep;

    i {
      font-size: 0.7rem;
      @include transition(transform);
    }

    &:hover i {
      transform: translateX(3px);
    }
  }

  &__tiles {
    @include flex(row, stretch, flex-start, $sp-3);
  }

  &__tile {
    @include flex(column, flex-start, flex-start, 0.2rem);
    flex: 1 1 0;
    min-width: 0;
    padding: $sp-4;
    border-radius: $radius-md;
    @include transition(transform);

    &:hover {
      transform: translateY(-2px);
    }

    &--out {
      background: $danger-bg;
      color: darken($danger, 8%);
    }

    &--low {
      background: $warning-bg;
      color: darken($warning, 22%);
    }
  }

  &__icon {
    @include flex(row, center, center);
    width: 2rem;
    height: 2rem;
    margin-bottom: 0.35rem;
    border-radius: 50%;
    background: $surface;
    font-size: 0.85rem;
  }

  &__num {
    @include figure(1.9rem);
    color: inherit;
  }

  &__label {
    font-size: 0.78rem;
    font-weight: 600;
  }

  &__ok {
    @include flex(row, center, flex-start, $sp-3);
    padding: $sp-4;
    border-radius: $radius-md;
    background: $success-bg;
    color: darken($success, 16%);

    .alerts__icon {
      margin: 0;
    }

    span:last-child {
      @include flex(column, flex-start, flex-start);
    }

    small {
      font-size: 0.75rem;
      color: $ink-soft;
    }
  }
}
</style>
