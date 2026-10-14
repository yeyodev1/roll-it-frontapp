<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/ui/PageHeader.vue'
import ChartCard from '@/components/ui/ChartCard.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import { useAccount } from '@/composables/useAccount'
import { dashboardCopy } from '@/config/dashboardCopy'
import { authService } from '@/services/auth.service'
import { useUserStore } from '@/stores/user'
import { useFiltersStore } from '@/stores/filters'
import { useToastStore } from '@/stores/toast'
import type { ApiError } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const filters = useFiltersStore()
const toast = useToastStore()
const copy = dashboardCopy.account

const user = computed(() => userStore.user)
const { initials } = useAccount()
const role = computed(
  () => copy.roles[user.value?.accountType ?? ''] ?? user.value?.accountType ?? '',
)
const branch = computed(() => {
  const id = user.value?.branch
  if (!id) return copy.allBranches
  return filters.branches.find((b) => b._id === id)?.name ?? '—'
})

const current = ref('')
const next = ref('')
const confirm = ref('')
const saving = ref(false)
const error = ref('')

async function changePassword() {
  error.value = ''
  if (next.value.length < 8) return (error.value = copy.tooShort)
  if (next.value !== confirm.value) return (error.value = copy.mismatch)
  saving.value = true
  try {
    await authService.changePassword(current.value, next.value)
    toast.success(copy.saved)
    current.value = next.value = confirm.value = ''
  } catch (e) {
    error.value = (e as ApiError).message
  } finally {
    saving.value = false
  }
}

function logout() {
  userStore.clear()
  filters.setBranches([])
  toast.info(copy.loggedOut)
  router.replace('/login')
}
</script>

<template>
  <div class="page">
    <PageHeader :title="copy.title" />

    <div class="acc">
      <section class="acc__profile">
        <span class="acc__avatar" aria-hidden="true">{{ initials }}</span>
        <h2 class="acc__name">{{ user?.name || user?.email }}</h2>
        <div class="acc__badges">
          <AppBadge tone="accent" icon="fa-solid fa-user-shield">{{ role }}</AppBadge>
          <AppBadge tone="neutral" icon="fa-solid fa-store">{{ branch }}</AppBadge>
        </div>
        <dl class="acc__data">
          <div>
            <dt>{{ copy.email }}</dt>
            <dd>{{ user?.email }}</dd>
          </div>
        </dl>
        <button type="button" class="btn btn--ghost acc__logout" @click="logout">
          <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i> {{ copy.logout }}
        </button>
      </section>

      <ChartCard class="acc__form" :title="copy.passwordTitle" :subtitle="copy.passwordHint">
        <form class="pwd" @submit.prevent="changePassword">
          <div class="field">
            <label for="pwd-current">{{ copy.current }}</label>
            <input
              id="pwd-current"
              v-model="current"
              type="password"
              autocomplete="current-password"
              required
            />
          </div>
          <div class="pwd__row">
            <div class="field">
              <label for="pwd-next">{{ copy.next }}</label>
              <input
                id="pwd-next"
                v-model="next"
                type="password"
                autocomplete="new-password"
                minlength="8"
                required
              />
            </div>
            <div class="field">
              <label for="pwd-confirm">{{ copy.confirm }}</label>
              <input
                id="pwd-confirm"
                v-model="confirm"
                type="password"
                autocomplete="new-password"
                required
              />
            </div>
          </div>
          <p v-if="error" class="pwd__error" role="alert">
            <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i> {{ error }}
          </p>
          <button type="submit" class="btn btn--dark" :disabled="saving">
            <i
              :class="saving ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-lock'"
              aria-hidden="true"
            ></i>
            {{ copy.save }}
          </button>
        </form>
      </ChartCard>
    </div>
  </div>
</template>

<style scoped lang="scss">
.acc {
  @include flex(column, stretch, flex-start, $sp-3);

  @include from('md') {
    gap: $sp-4;
  }

  @include from('lg') {
    flex-direction: row;
    align-items: flex-start;
  }

  &__profile {
    @include card;
    @include flex(column, center, flex-start, $sp-3);
    flex: 1 1 0;
    min-width: 0;
    padding: $sp-8 $sp-4 $sp-6;
    text-align: center;
    background:
      linear-gradient(180deg, rgba($accent-soft, 0.9) 0, rgba($accent-soft, 0) 7.5rem), $surface;
  }

  &__avatar {
    @include flex(row, center, center);
    width: 5rem;
    height: 5rem;
    border-radius: 50%;
    background: $ink;
    color: $surface;
    font-size: 1.5rem;
    font-weight: 700;
    box-shadow:
      0 0 0 5px $surface,
      $shadow-md;
  }

  &__name {
    @include display($text-xl, 500);
  }

  &__badges {
    @include flex(row, center, center, 0.4rem);
    flex-wrap: wrap;
  }

  &__data {
    @include flex(column, stretch, flex-start, 0);
    width: 100%;
    margin-top: $sp-2;
    text-align: left;

    div {
      @include flex(row, center, space-between, $sp-3);
      padding: 0.7rem 0;
      border-top: 1px solid $line-soft;
    }

    dt {
      @include card-label;
    }

    dd {
      font-size: 0.86rem;
      font-weight: 600;
      overflow-wrap: anywhere;
      text-align: right;
    }
  }

  &__logout {
    width: 100%;
    color: $danger;
  }

  &__form {
    flex: 1.6 1 0;
  }
}

.pwd {
  @include flex(column, stretch, flex-start, $sp-4);

  &__row {
    @include flex-cards(200px, $sp-4);
  }

  &__error {
    @include flex(row, center, flex-start, 0.45rem);
    padding: 0.6rem 0.8rem;
    border-radius: $radius-ctl;
    background: $danger-bg;
    color: darken($danger, 8%);
    font-size: 0.82rem;
    font-weight: 600;
  }

  .btn {
    align-self: flex-start;
  }
}
</style>
