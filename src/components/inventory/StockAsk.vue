<script setup lang="ts">
import InfoTip from '@/components/ui/InfoTip.vue'
import { useInventoryAsk } from '@/composables/useInventoryAsk'
import { inventoryCopy } from '@/config/inventoryCopy'

const props = defineProps<{ branch: string }>()

const copy = inventoryCopy.ask
const { question, answer, asking, ask, clear } = useInventoryAsk()
</script>

<template>
  <section class="ask">
    <form class="ask__form" @submit.prevent="ask(props.branch)">
      <i class="fa-solid fa-magnifying-glass-chart ask__icon" aria-hidden="true"></i>
      <input
        v-model="question"
        type="search"
        enterkeyhint="search"
        :placeholder="copy.placeholder"
        :aria-label="copy.placeholder"
      />
      <button class="btn btn--dark btn--sm" type="submit" :disabled="asking || !question.trim()">
        <i v-if="asking" class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
        <span v-else>{{ copy.button }}</span>
      </button>
      <InfoTip :text="copy.help" />
    </form>
    <Transition name="rise">
      <div v-if="answer" class="ask__answer" aria-live="polite">
        <p>{{ answer }}</p>
        <button class="ask__clear" type="button" aria-label="Cerrar respuesta" @click="clear">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </Transition>
  </section>
</template>

<style scoped lang="scss">
.ask {
  @include flex(column, stretch, flex-start, 0.6rem);

  &__form {
    @include flex(row, center, flex-start, 0.5rem);
    position: relative;
    background: $surface;
    border: 1px solid $line;
    border-radius: $radius-pill;
    padding: 0.3rem 0.4rem 0.3rem 1rem;

    &:focus-within {
      border-color: $accent;
      box-shadow: 0 0 0 3px rgba($accent, 0.15);
    }

    input {
      flex: 1;
      min-width: 0;
      border: none;
      padding: 0.55rem 0.2rem;
      background: transparent;
      box-shadow: none;
      font-size: 1rem;
    }
  }

  &__icon {
    color: $accent;
  }

  &__answer {
    @include flex(row, flex-start, space-between, 1rem);
    padding: 1.1rem 1.2rem;
    border-radius: $radius-md;
    background: $ink;
    color: $surface;

    p {
      @include display($text-xl, 400);
      line-height: 1.3;
    }
  }

  &__clear {
    color: rgba($surface, 0.6);
    padding: 0.2rem;

    &:hover {
      color: $surface;
    }
  }
}
</style>
