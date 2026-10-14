<script setup lang="ts">
import InfoTip from './InfoTip.vue'
import DeltaBadge from './DeltaBadge.vue'
import Sparkline from '@/components/charts/Sparkline.vue'

export type KpiTone = 'accent' | 'blue' | 'amber' | 'violet' | 'ink'

/**
 * Métrica protagonista: etiqueta con (i), ícono en la esquina, cifra grande y
 * variación con flecha. Opcional: `spark` (tendencia mínima), `sub` (línea
 * secundaria) y un slot para algo propio debajo (barra de progreso, etc.).
 */
withDefaults(
  defineProps<{
    label: string
    value: string
    delta?: number | null
    /** Contra qué se compara ("vs anterior"). */
    deltaLabel?: string
    help?: string
    icon?: string
    tone?: KpiTone
    spark?: number[]
    sub?: string
  }>(),
  { tone: 'accent', delta: null },
)

const SPARK: Record<KpiTone, string> = {
  accent: 'var(--chart-1)',
  blue: 'var(--chart-2)',
  amber: 'var(--chart-3)',
  violet: 'var(--chart-4)',
  ink: 'var(--text)',
}
</script>

<template>
  <article class="kpi">
    <header class="kpi__head">
      <span class="kpi__label">
        {{ label }}
        <InfoTip v-if="help" :text="help" />
      </span>
      <span v-if="icon" class="kpi__icon" :class="`kpi__icon--${tone}`" aria-hidden="true">
        <i :class="icon"></i>
      </span>
    </header>

    <p class="kpi__value" :style="{ '--chars': Math.max(value.length, 8) }">{{ value }}</p>

    <p v-if="delta !== null || sub" class="kpi__meta">
      <DeltaBadge :value="delta" />
      <span v-if="deltaLabel && delta !== null" class="kpi__vs">{{ deltaLabel }}</span>
      <span v-if="sub" class="kpi__sub">{{ sub }}</span>
    </p>

    <div v-if="$slots.default" class="kpi__extra"><slot /></div>
    <Sparkline
      v-if="spark && spark.length > 1"
      class="kpi__spark"
      :values="spark"
      :color="SPARK[tone]"
    />
  </article>
</template>

<style scoped lang="scss">
.kpi {
  @include card;
  @include flex(column, stretch, flex-start, 0.4rem);
  position: relative;
  container-type: inline-size;
  padding: $sp-4;
  min-width: 0;
  @include transition(box-shadow);

  @include from('md') {
    padding: $sp-5 $sp-5 $sp-4;
  }

  &:hover {
    box-shadow: $shadow-hover;
  }

  &__head {
    @include flex(row, flex-start, space-between, 0.5rem);
    min-height: 2.25rem;
  }

  &__label {
    @include card-label;
    @include flex(row, center, flex-start, 0.35rem);
    padding-top: 0.2rem;
    min-width: 0;
  }

  &__icon {
    @include flex(row, center, center);
    flex: 0 0 auto;
    width: 2rem;
    height: 2rem;
    border-radius: $radius-ctl;
    font-size: 0.82rem;

    @include from('md') {
      width: 2.25rem;
      height: 2.25rem;
      font-size: 0.9rem;
    }

    &--accent {
      color: $accent-deep;
      background: $accent-soft;
    }

    &--blue {
      color: $chart-2;
      background: rgba($chart-2, 0.1);
    }

    &--amber {
      color: darken($chart-3, 4%);
      background: rgba($chart-3, 0.13);
    }

    &--violet {
      color: $chart-4;
      background: rgba($chart-4, 0.11);
    }

    &--ink {
      color: $ink;
      background: $sand;
    }
  }

  &__value {
    @include figure;
    // La cifra nunca se parte: se achica según el ancho de la tarjeta y sus caracteres.
    font-size: clamp(1.3rem, calc(100cqi / (var(--chars) * 0.62)), 2rem);
    white-space: nowrap;
  }

  &__meta {
    @include flex(row, center, flex-start, 0.4rem);
    flex-wrap: wrap;
    min-height: 1.4rem;
    font-size: 0.75rem;
  }

  &__vs,
  &__sub {
    color: $ink-muted;
  }

  // En el celular basta la flecha: contra qué se compara lo dice el (i).
  &__vs {
    @include until('sm') {
      display: none;
    }
  }

  &__spark {
    margin-top: auto;
    padding-top: 0.35rem;
  }

  &__extra {
    margin-top: auto;
    padding-top: 0.35rem;

    &:empty {
      display: none;
    }
  }
}
</style>
