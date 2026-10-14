<script setup lang="ts">
import { computed, ref } from 'vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import InfoTip from '@/components/ui/InfoTip.vue'
import SalesReportSummary from './SalesReportSummary.vue'
import { site } from '@/config/site'
import { dashboardCopy } from '@/config/dashboardCopy'
import { useFiltersStore } from '@/stores/filters'
import { useSalesReportUpload } from '@/composables/useSalesReportUpload'
import type { SalesReportResult } from '@/types'

/**
 * Subir el reporte de ventas detallado de SmartMenu: zona para arrastrar o
 * elegir el archivo, barra de progreso y resumen de lo cargado.
 */
const emit = defineEmits<{ done: [result: SalesReportResult]; close: [] }>()

const copy = dashboardCopy.salesUpload
const filters = useFiltersStore()
const up = useSalesReportUpload((r) => emit('done', r))
const { phase, progress, round, error, file, branch, result, busy } = up

const input = ref<HTMLInputElement | null>(null)
const dragging = ref(false)
let depth = 0

const branchOptions = computed(() => [
  { value: 'auto', label: copy.branchAuto },
  ...filters.branches.map((b) => ({ value: b.slug, label: b.name })),
])

const pct = computed(() => Math.round(progress.value * 100))
const status = computed(() => (phase.value === 'processing' ? copy.processing : copy.uploading))
const showDrop = computed(
  () => phase.value === 'idle' || (phase.value === 'error' && !result.value),
)

function pick() {
  input.value?.click()
}

function onPicked(event: Event) {
  const f = (event.target as HTMLInputElement).files?.[0]
  if (f) up.start(f)
  // Se limpia para poder elegir el mismo archivo otra vez.
  ;(event.target as HTMLInputElement).value = ''
}

function onDrop(event: DragEvent) {
  dragging.value = false
  depth = 0
  const f = event.dataTransfer?.files?.[0]
  if (f && !busy.value) up.start(f)
}

function onEnter() {
  depth++
  dragging.value = true
}

function onLeave() {
  depth = Math.max(depth - 1, 0)
  if (!depth) dragging.value = false
}
</script>

<template>
  <div class="srup">
    <input
      ref="input"
      type="file"
      class="visually-hidden"
      accept=".xls,.xlsx,.csv"
      tabindex="-1"
      aria-hidden="true"
      @change="onPicked"
    />

    <template v-if="showDrop">
      <div
        class="srup__drop"
        :class="{ 'srup__drop--over': dragging }"
        role="button"
        tabindex="0"
        :aria-label="copy.pick"
        @click="pick"
        @keydown.enter.prevent="pick"
        @keydown.space.prevent="pick"
        @dragenter.prevent="onEnter"
        @dragover.prevent
        @dragleave.prevent="onLeave"
        @drop.prevent="onDrop"
      >
        <span class="srup__icon" aria-hidden="true">
          <i class="fa-solid fa-file-excel"></i>
        </span>
        <p class="srup__title">{{ dragging ? copy.dropActive : copy.drop }}</p>
        <p class="srup__formats">{{ copy.formats }}</p>
        <span class="btn btn--dark btn--sm srup__pick">
          <i class="fa-solid fa-arrow-up-from-bracket" aria-hidden="true"></i>
          {{ copy.pick }}
        </span>
      </div>

      <div class="srup__opts">
        <span class="srup__how">
          <InfoTip :text="site.help.salesUpload" />
          <span>{{ copy.where }}</span>
        </span>
        <AppSelect
          v-if="filters.branches.length > 1"
          v-model="branch"
          class="srup__branch"
          :options="branchOptions"
          :label="copy.branch"
          icon="fa-solid fa-store"
        />
      </div>
    </template>

    <div v-if="busy && !result" class="srup__busy" aria-live="polite">
      <span class="srup__file">
        <i class="fa-solid fa-file-excel" aria-hidden="true"></i>
        <span>{{ file?.name }}</span>
      </span>
      <div
        class="srup__track"
        role="progressbar"
        :aria-valuenow="pct"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-label="status"
      >
        <span
          class="srup__bar"
          :class="{ 'srup__bar--wait': phase === 'processing' }"
          :style="{ transform: `scaleX(${phase === 'processing' ? 1 : progress})` }"
        ></span>
      </div>
      <p class="srup__status">
        <span>{{ status }}</span>
        <span v-if="phase === 'uploading'" class="num">{{ pct }}%</span>
        <span v-else class="muted">{{ copy.processingHint }}</span>
      </p>
    </div>

    <p v-if="phase === 'error'" class="srup__error" role="alert">
      <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
      <span>{{ error }}</span>
      <button v-if="file && result" type="button" class="srup__retry" @click="up.retry">
        {{ copy.retry }}
      </button>
    </p>

    <SalesReportSummary
      v-if="result && phase !== 'idle'"
      :result="result"
      :busy="busy"
      :round="round"
      @resume="up.resume"
      @another="up.reset"
      @close="emit('close')"
    />
  </div>
</template>

<style scoped lang="scss">
.srup {
  @include flex(column, stretch, flex-start, $sp-4);
  min-width: 0;

  &__drop {
    @include flex(column, center, center, 0.35rem);
    padding: $sp-8 $sp-4;
    border: 1.5px dashed rgba($accent, 0.45);
    border-radius: $radius-card;
    background: linear-gradient(180deg, rgba($accent-soft, 0.55), rgba($accent-soft, 0.2));
    text-align: center;
    cursor: pointer;
    @include transition;
    @include focus-ring;

    &:hover,
    &--over {
      border-color: $accent;
      background: $accent-soft;
    }

    &--over .srup__icon {
      transform: translateY(-3px) scale(1.06);
    }
  }

  &__icon {
    @include flex(row, center, center);
    width: 3.25rem;
    height: 3.25rem;
    margin-bottom: 0.35rem;
    border-radius: 16px;
    background: $surface;
    color: $accent;
    font-size: 1.35rem;
    box-shadow: $shadow-sm;
    @include transition(transform);
  }

  &__title {
    font-weight: 700;
    color: $ink;
  }

  &__formats {
    font-size: 0.75rem;
    color: $ink-muted;
  }

  &__pick {
    margin-top: $sp-3;
    pointer-events: none;
  }

  &__opts {
    @include flex(row, center, space-between, $sp-3);
    flex-wrap: wrap;
  }

  &__how {
    @include flex(row, center, flex-start, 0.4rem);
    font-size: 0.78rem;
    color: $ink-soft;
    min-width: 0;
  }

  &__branch {
    flex: 1 1 12rem;
    max-width: 16rem;
  }

  &__busy {
    @include flex(column, stretch, flex-start, $sp-2);
    padding: $sp-5 $sp-4;
    border-radius: $radius-card;
    background: $canvas;
  }

  &__file {
    @include flex(row, center, flex-start, 0.5rem);
    font-size: 0.86rem;
    font-weight: 600;
    min-width: 0;

    i {
      color: $success;
    }

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__track {
    height: 0.5rem;
    border-radius: $radius-pill;
    background: $sand;
    overflow: hidden;
  }

  &__bar {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: $accent;
    transform-origin: left;
    transition: transform 0.25s ease;

    &--wait {
      background: linear-gradient(90deg, rgba($accent, 0.55), $accent, rgba($accent, 0.55));
      background-size: 200% 100%;
      animation: srup-wait 1.4s linear infinite;
    }
  }

  &__status {
    @include flex(row, center, space-between, $sp-2);
    font-size: 0.78rem;
    color: $ink-soft;
  }

  &__error {
    @include flex(row, center, flex-start, 0.5rem);
    flex-wrap: wrap;
    padding: 0.65rem $sp-4;
    border-radius: $radius-ctl;
    background: $danger-bg;
    font-size: 0.82rem;
    color: darken($danger, 8%);
  }

  &__retry {
    margin-left: auto;
    font-weight: 700;
    text-decoration: underline;
  }
}

@keyframes srup-wait {
  to {
    background-position: -200% 0;
  }
}
</style>
