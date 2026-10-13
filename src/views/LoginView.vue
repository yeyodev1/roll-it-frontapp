<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BrandMark from '@/components/ui/BrandMark.vue'
import { site } from '@/config/site'
import { dashboardCopy } from '@/config/dashboardCopy'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import type { ApiError } from '@/types'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const toast = useToastStore()
const copy = dashboardCopy.login

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const user = await userStore.login(email.value.trim(), password.value)
    toast.success(copy.hello(user.name || user.email))
    // Solo rutas internas: un "next" con dominio externo se ignora.
    const next =
      typeof route.query.next === 'string' && route.query.next.startsWith('/')
        ? route.query.next
        : '/'
    router.replace(next)
  } catch (e) {
    error.value = (e as ApiError).message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="login">
    <div class="login__brand">
      <BrandMark inverse :size="44" :with-name="false" class="login__mark" />
      <p class="login__name">{{ site.name }}</p>
      <p class="login__tagline">{{ site.tagline }}</p>
      <p class="login__line">{{ copy.brandLine }}</p>
    </div>

    <div class="login__side">
      <form class="login__form" @submit.prevent="submit">
        <p class="login__eyebrow">{{ copy.eyebrow }}</p>
        <h1 class="login__title">{{ copy.title }}</h1>

        <label class="field">
          <span>{{ copy.email }}</span>
          <input v-model="email" type="email" autocomplete="email" inputmode="email" required />
        </label>

        <label class="field">
          <span>{{ copy.password }}</span>
          <input v-model="password" type="password" autocomplete="current-password" required />
        </label>

        <Transition name="rise">
          <p v-if="error" class="login__error" role="alert">
            <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i> {{ error }}
          </p>
        </Transition>

        <button class="btn btn--primary login__submit" type="submit" :disabled="loading">
          <i v-if="loading" class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
          {{ loading ? copy.loading : copy.submit }}
        </button>
      </form>
    </div>
  </section>
</template>

<style scoped lang="scss">
.login {
  flex: 1;
  @include flex(column, stretch, flex-start);
  min-height: 100vh;
  min-height: 100dvh;
  background: $paper;

  @include from('lg') {
    flex-direction: row;
  }

  &__brand {
    position: relative;
    overflow: hidden;
    @include flex(column, flex-start, flex-end, 0.35rem);
    padding: 2.5rem 1.5rem 2rem;
    min-height: 15rem;
    background: $ink;
    color: $paper;

    @include from('lg') {
      flex: 1 1 50%;
      padding: 4rem;
    }

    // Corte de roll gigante que asoma por la esquina: la marca hecha paisaje.
    &::before {
      content: '';
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      width: 26rem;
      height: 26rem;
      right: -9rem;
      top: -10rem;
      border: 3.5rem solid lighten($ink, 8%);
      background:
        radial-gradient(circle at 42% 46%, rgba($accent, 0.85) 0 15%, transparent 15.5%),
        radial-gradient(circle at 60% 60%, rgba($success, 0.6) 0 9%, transparent 9.5%),
        rgba($paper, 0.06);

      @include from('lg') {
        width: 44rem;
        height: 44rem;
        right: -14rem;
        top: -12rem;
        border-width: 5rem;
      }
    }
  }

  &__mark {
    position: relative;
    margin-bottom: 0.5rem;
  }

  &__name {
    position: relative;
    @include display($display-lg, 600);
  }

  &__tagline {
    position: relative;
    font-size: $text-lg;
    color: rgba($paper, 0.8);
  }

  &__line {
    position: relative;
    font-size: $text-xs;
    letter-spacing: 0.08em;
    color: rgba($paper, 0.5);
  }

  &__side {
    flex: 1;
    @include flex(column, stretch, center);
    padding: 2rem 1.25rem 3rem;

    @include from('lg') {
      flex: 1 1 50%;
      align-items: center;
      padding: 4rem;
    }
  }

  &__form {
    @include flex(column, stretch, flex-start, 1rem);
    width: 100%;
    max-width: 380px;
    margin-inline: auto;

    .field span {
      font-size: 0.82rem;
      font-weight: 500;
      color: $ink-soft;
    }

    input {
      min-height: 3rem;
    }
  }

  &__eyebrow {
    @include eyebrow;
  }

  &__title {
    @include display($display-sm, 500);
    margin-bottom: 0.4rem;
  }

  &__error {
    @include flex(row, center, flex-start, 0.5rem);
    font-size: $text-sm;
    color: $danger;
    background: $danger-bg;
    padding: 0.7rem 0.9rem;
    border-radius: $radius-sm;
  }

  &__submit {
    min-height: 3rem;
    margin-top: 0.4rem;
  }
}
</style>
