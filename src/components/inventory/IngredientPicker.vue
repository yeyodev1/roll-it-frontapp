<script setup lang="ts">
import { computed } from 'vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import { useInventoryIngredients } from '@/composables/useInventoryIngredients'
import { inventoryCopy } from '@/config/inventoryCopy'

// Selector con buscador: con 80 insumos hay que poder escribir. Encuentra también por alias
// ("SALMON FRESCO NORUEGO" → Salmón), que es como vienen en las facturas.
const model = defineModel<string | null>({ required: true })
defineProps<{ disabled?: boolean; invalid?: boolean }>()

const copy = inventoryCopy.ingredientPicker
const { active } = useInventoryIngredients()

const options = computed(() => [
  // "Sin insumo" solo tiene sentido si ya hay uno elegido: es la forma de soltarlo.
  ...(model.value ? [{ value: '', label: copy.none, icon: 'fa-solid fa-link-slash' }] : []),
  ...active.value.map((i) => ({
    value: i._id,
    label: i.name,
    hint: i.unit,
    keywords: i.aliases.join(' '),
  })),
])

const value = computed({
  get: () => model.value ?? '',
  set: (id: string | undefined) => (model.value = id || null),
})
</script>

<template>
  <AppSelect
    v-model="value"
    :options="options"
    :placeholder="inventoryCopy.invoice.pickIngredient"
    :label="inventoryCopy.invoice.ingredient"
    :disabled="disabled"
    :invalid="invalid"
    searchable
  />
</template>
