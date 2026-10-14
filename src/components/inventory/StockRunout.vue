<script setup lang="ts">
import { computed } from 'vue'
import ChartCard from '@/components/ui/ChartCard.vue'
import { site } from '@/config/site'
import { inventoryCopy } from '@/config/inventoryCopy'
import { formatQty } from '@/utils/format'
import type { StockRow } from '@/types'

/** Los insumos que se acaban primero al ritmo de consumo: la lista de compras de mañana. */
const props = withDefaults(
  defineProps<{ rows: StockRow[]; showBranch: boolean; limit?: number }>(),
  {
    limit: 5,
  },
)
const emit = defineEmits<{ adjust: [row: StockRow] }>()

const copy = inventoryCopy.stock

const list = computed(() =>
  props.rows
    .filter((r) => r.status !== 'out' && r.daysLeft !== null)
    .sort((a, b) => a.daysLeft! - b.daysLeft!)
    .slice(0, props.limit)
    .map((r) => {
      const d = Math.floor(r.daysLeft!)
      return {
        key: `${r.branch._id}-${r.ingredient._id}`,
        row: r,
        name: r.ingredient.name,
        sub: props.showBranch
          ? `${r.branch.name} · ${formatQty(r.quantity, r.ingredient.unit)}`
          : formatQty(r.quantity, r.ingredient.unit),
        days: copy.daysShort(d),
        tone: d < 3 ? 'danger' : d < 7 ? 'warning' : 'neutral',
      }
    }),
)
</script>

<template>
  <ChartCard :title="copy.runout" :help="site.help.daysLeft">
    <p v-if="!list.length" class="run__empty">{{ copy.runoutEmpty }}</p>
    <ol v-else class="run">
      <li v-for="(item, i) in list" :key="item.key">
        <button type="button" class="run__item" @click="emit('adjust', item.row)">
          <span class="run__pos num">{{ i + 1 }}</span>
          <span class="run__text">
            <strong>{{ item.name }}</strong>
            <small class="num">{{ item.sub }}</small>
          </span>
          <span class="run__days num" :class="`run__days--${item.tone}`">{{ item.days }}</span>
        </button>
      </li>
    </ol>
  </ChartCard>
</template>

<style scoped lang="scss">
.run {
  list-style: none;
  @include flex(column, stretch, flex-start, 0.15rem);
  margin-inline: -$sp-2;

  &__item {
    @include flex(row, center, flex-start, 0.7rem);
    width: 100%;
    padding: 0.55rem $sp-2;
    border-radius: $radius-ctl;
    text-align: left;
    @include transition(background-color);

    &:hover {
      background: $canvas;
    }
  }

  &__pos {
    @include flex(row, center, center);
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    background: $canvas;
    font-size: 0.7rem;
    font-weight: 700;
    color: $ink-soft;
  }

  &__text {
    @include flex(column, flex-start, center);
    flex: 1;
    min-width: 0;
    line-height: 1.25;

    strong {
      font-size: 0.86rem;
      font-weight: 600;
      color: $ink;
    }

    small {
      font-size: 0.7rem;
      color: $ink-muted;
    }
  }

  &__days {
    flex-shrink: 0;
    padding: 0.2rem 0.55rem;
    border-radius: $radius-pill;
    font-size: 0.74rem;
    font-weight: 700;

    &--danger {
      color: darken($danger, 6%);
      background: $danger-bg;
    }

    &--warning {
      color: darken($warning, 20%);
      background: $warning-bg;
    }

    &--neutral {
      color: $ink-soft;
      background: $canvas;
    }
  }

  &__empty {
    font-size: 0.82rem;
    color: $ink-muted;
  }
}
</style>
