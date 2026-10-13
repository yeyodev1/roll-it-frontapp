<script setup lang="ts">
import { onMounted } from 'vue'
import InfoTip from '@/components/ui/InfoTip.vue'
import LoadingBlock from '@/components/ui/LoadingBlock.vue'
import { useSettingsSync } from '@/composables/useSettingsSync'
import { inventoryCopy } from '@/config/inventoryCopy'
import { site } from '@/config/site'

const copy = inventoryCopy.settings.sync
const { items, loading, load } = useSettingsSync()

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
    <div class="sync__bar">
      <InfoTip :text="site.help.sync" />
      <button class="btn btn--ghost btn--sm" :disabled="loading" @click="load">
        <i class="fa-solid fa-rotate" :class="{ 'fa-spin': loading }" aria-hidden="true"></i>
        {{ copy.refresh }}
      </button>
    </div>
    <LoadingBlock v-if="loading && !items.length" />
    <ul v-else class="sync__list">
      <li
        v-for="s in items"
        :key="s.branch._id"
        class="card status"
        :class="{ 'status--stale': stale(s.lastSyncAt) }"
      >
        <span class="status__name">
          <span class="status__dot" aria-hidden="true"></span>
          {{ s.branch.name }}
        </span>
        <dl>
          <div>
            <dt>{{ copy.lastSync }}</dt>
            <dd>{{ s.lastSyncAt ? stamp.format(new Date(s.lastSyncAt)) : copy.never }}</dd>
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
  @include flex(column, stretch, flex-start, 0.8rem);

  &__bar {
    @include flex(row, center, space-between, 0.5rem);
  }

  &__list {
    list-style: none;
    @include flex-cards(260px, 0.7rem);
  }
}

.status {
  @include flex(column, stretch, flex-start, 0.7rem);

  &__name {
    @include flex(row, center, flex-start, 0.5rem);
    font-weight: 600;
  }

  &__dot {
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 50%;
    background: $success;
    box-shadow: 0 0 0 4px $success-bg;
  }

  &--stale &__dot {
    background: $warning;
    box-shadow: 0 0 0 4px $warning-bg;
  }

  dl {
    @include flex(row, flex-start, flex-start, 1.5rem);
  }

  dt {
    font-size: $text-xs;
    color: $ink-muted;
  }

  dd {
    @include display($text-lg, 500);
  }
}
</style>
