<script setup lang="ts">
import { onMounted } from 'vue'
import ChartCard from '@/components/ui/ChartCard.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import LoadError from '@/components/ui/LoadError.vue'
import SkeletonCards from '@/components/ui/skeleton/SkeletonCards.vue'
import SalesReportUpload from '@/components/sync/SalesReportUpload.vue'
import { useSettingsSync } from '@/composables/useSettingsSync'
import { inventoryCopy } from '@/config/inventoryCopy'
import { dashboardCopy } from '@/config/dashboardCopy'
import { site } from '@/config/site'

const copy = inventoryCopy.settings.sync
const upload = dashboardCopy.salesUpload
const { items, loading, error, load } = useSettingsSync()

const stamp = new Intl.DateTimeFormat('es-EC', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

// Más de 2 horas sin datos en horario de servicio suele ser el equipo del local apagado.
function stale(iso: string | null) {
  return !iso || Date.now() - new Date(iso).getTime() > 2 * 60 * 60 * 1000
}

onMounted(load)
</script>

<template>
  <section class="sync">
    <ChartCard :title="upload.title" :subtitle="upload.subtitle" :help="site.help.salesUpload">
      <SalesReportUpload @done="load" />
    </ChartCard>

    <div class="sync__bar">
      <h2 class="sync__title">{{ copy.status }}</h2>
      <button class="btn btn--ghost btn--sm" :disabled="loading" @click="load">
        <i class="fa-solid fa-rotate" :class="{ 'fa-spin': loading }" aria-hidden="true"></i>
        {{ copy.refresh }}
      </button>
    </div>

    <SkeletonCards
      v-if="loading && !items.length"
      :count="3"
      basis="240px"
      :lines="0"
      min-height="7.6rem"
    />
    <LoadError v-else-if="error && !items.length" :message="error" @retry="load" />
    <ul v-else class="sync__list">
      <li v-for="s in items" :key="s.branch._id" class="status">
        <header class="status__head">
          <span class="status__icon" aria-hidden="true"><i class="fa-solid fa-store"></i></span>
          <strong class="status__name">{{ s.branch.name }}</strong>
          <AppBadge :tone="stale(s.lastSyncAt) ? 'warning' : 'success'" dot>
            {{ stale(s.lastSyncAt) ? copy.behind : copy.live }}
          </AppBadge>
        </header>
        <dl class="status__data">
          <div>
            <dt>{{ copy.lastSync }}</dt>
            <dd class="num">
              {{ s.lastSyncAt ? stamp.format(new Date(s.lastSyncAt)) : copy.never }}
            </dd>
          </div>
          <div>
            <dt>{{ copy.today }}</dt>
            <dd class="num">{{ s.salesToday }}</dd>
          </div>
        </dl>
      </li>
    </ul>
  </section>
</template>

<style scoped lang="scss">
.sync {
  @include flex(column, stretch, flex-start, $sp-4);

  &__bar {
    @include flex(row, center, space-between, 0.5rem);
    margin-top: $sp-2;
  }

  &__title {
    font-family: $font-principal;
    font-size: 0.98rem;
    font-weight: 700;
    color: $ink;
  }

  &__list {
    list-style: none;
    @include flex-cards(240px, $sp-3);

    @include from('md') {
      gap: $sp-4;
    }
  }
}

.status {
  @include card;
  @include flex(column, stretch, flex-start, $sp-4);
  padding: $sp-4 $sp-5;

  &__head {
    @include flex(row, center, flex-start, $sp-3);
  }

  &__icon {
    @include flex(row, center, center);
    flex: 0 0 auto;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: $radius-ctl;
    background: $accent-soft;
    color: $accent-deep;
    font-size: 0.85rem;
  }

  &__name {
    flex: 1;
    min-width: 0;
    font-size: 0.92rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__data {
    @include flex(row, flex-start, flex-start, $sp-6);

    dt {
      @include card-label;
      font-size: 0.72rem;
    }

    dd {
      @include figure(1.15rem);
    }
  }
}
</style>
