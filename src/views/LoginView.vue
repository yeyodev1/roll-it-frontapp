<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoginBrand from '@/components/ui/LoginBrand.vue'
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
const show = ref(false)

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
    <LoginBrand />

    <div class="login__side">
      <form class="login__form" @submit.prevent="submit">
        <p class="login__eyebrow">{{ copy.eyebrow }}</p>
        <h1 class="login__title">{{ copy.title }}</h1>

        <p class="login__lead">{{ copy.lead }}</p>

        <div class="field">
          <label for="login-email">{{ copy.email }}</label>
          <span class="login__input">
            <i class="fa-solid fa-envelope" aria-hidden="true"></i>
            <input
              id="login-email"
              v-model="email"
              type="email"
              autocomplete="email"
              inputmode="email"
              required
            />
          </span>
        </div>

        <div class="field">
          <label for="login-pass">{{ copy.password }}</label>
          <span class="login__input">
            <i class="fa-solid fa-lock" aria-hidden="true"></i>
            <input
              id="login-pass"
              v-model="password"
              :type="show ? 'text' : 'password'"
              autocomplete="current-password"
              required
            />
            <button
              type="button"
              class="login__eye"
              :aria-label="show ? copy.hide : copy.show"
              :aria-pressed="show"
              @click="show = !show"
            >
              <i :class="show ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" aria-hidden="true"></i>
            </button>
          </span>
        </div>

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

  &__side {
    flex: 1;
    @include flex(column, stretch, center);
    padding: 2rem 1.25rem 3rem;
    background: $canvas;

    @include from('lg') {
      flex: 1 1 50%;
      align-items: center;
      padding: 4rem;
    }
  }

  &__form {
    @include card;
    @include flex(column, stretch, flex-start, 1rem);
    width: 100%;
    max-width: 420px;
    margin-inline: auto;
    padding: $sp-6 $sp-5;

    @include from('md') {
      padding: $sp-8;
    }
  }

  &__lead {
    margin-top: -0.6rem;
    font-size: 0.84rem;
    color: $ink-muted;
  }

  &__input {
    position: relative;
    display: block;

    > i {
      position: absolute;
      left: 0.95rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.82rem;
      color: $ink-muted;
      pointer-events: none;
    }

    input {
      min-height: 3rem;
      padding-left: 2.6rem;
      padding-right: 2.8rem;
      border-radius: $radius-ctl;
      background: $canvas;
      border-color: transparent;

      &:focus {
        background: $surface;
      }
    }
  }

  &__eye {
    position: absolute;
    right: 0.35rem;
    top: 50%;
    transform: translateY(-50%);
    @include flex(row, center, center);
    width: 2.3rem;
    height: 2.3rem;
    border-radius: $radius-ctl;
    color: $ink-muted;

    &:hover {
      color: $ink;
    }
  }

  &__eyebrow {
    @include eyebrow;
  }

  &__title {
    @include display($display-sm, 500);
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
