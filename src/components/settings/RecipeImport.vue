<script setup lang="ts">
import { ref } from 'vue'
import InfoTip from '@/components/ui/InfoTip.vue'
import { useRecipesImport } from '@/composables/useRecipesImport'
import { inventoryCopy } from '@/config/inventoryCopy'
import { site } from '@/config/site'

const emit = defineEmits<{ done: [] }>()

const copy = inventoryCopy.recipes
const input = ref<HTMLInputElement | null>(null)
const { importing, result, run } = useRecipesImport(() => emit('done'))

function onChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) run(file)
  target.value = ''
}
</script>

<template>
  <div class="import">
    <div class="import__row">
      <button class="btn btn--dark" :disabled="importing" @click="input?.click()">
        <i
          :class="importing ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-file-excel'"
          aria-hidden="true"
        ></i>
        {{ importing ? copy.importing : copy.import }}
      </button>
      <InfoTip :text="site.help.recipesImport" />
      <input
        ref="input"
        class="visually-hidden"
        type="file"
        accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
        tabindex="-1"
        @change="onChange"
      />
    </div>
    <div v-if="result" class="import__result card">
      <p class="import__ok">
        <i class="fa-solid fa-circle-check" aria-hidden="true"></i> {{ copy.result(result) }}
      </p>
      <details v-if="result.warnings.length" class="import__warnings">
        <summary>{{ copy.warnings }} ({{ result.warnings.length }})</summary>
        <ul>
          <li v-for="(w, i) in result.warnings" :key="i">{{ w }}</li>
        </ul>
      </details>
    </div>
  </div>
</template>

<style scoped lang="scss">
.import {
  @include flex(column, stretch, flex-start, 0.6rem);

  &__row {
    @include flex(row, center, flex-start, 0.4rem);
  }

  &__result {
    @include flex(column, stretch, flex-start, 0.5rem);
  }

  &__ok {
    font-weight: 600;
    color: darken($success, 14%);
  }

  &__warnings {
    font-size: $text-sm;

    summary {
      cursor: pointer;
      font-weight: 600;
      color: darken($warning, 18%);
    }

    ul {
      margin-top: 0.4rem;
      padding-left: 1.1rem;
      color: $ink-soft;
      max-height: 12rem;
      overflow-y: auto;
    }
  }
}
</style>
