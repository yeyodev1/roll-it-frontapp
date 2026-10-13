<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/ui/PageHeader.vue'
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
  <div class="page account">
    <PageHeader :title="user?.name || user?.email || copy.title" :subtitle="copy.title" />

    <dl class="card account__data">
      <div>
        <dt>{{ copy.email }}</dt>
        <dd>{{ user?.email }}</dd>
      </div>
      <div>
        <dt>{{ copy.role }}</dt>
        <dd>{{ role }}</dd>
      </div>
      <div>
        <dt>{{ copy.branch }}</dt>
        <dd>{{ branch }}</dd>
      </div>
    </dl>

    <form class="card account__form" @submit.prevent="changePassword">
      <h2 class="card__title">{{ copy.passwordTitle }}</h2>
      <label class="field">
        <span>{{ copy.current }}</span>
        <input v-model="current" type="password" autocomplete="current-password" required />
      </label>
      <label class="field">
        <span>{{ copy.next }}</span>
        <input v-model="next" type="password" autocomplete="new-password" minlength="8" required />
      </label>
      <label class="field">
        <span>{{ copy.confirm }}</span>
        <input v-model="confirm" type="password" autocomplete="new-password" required />
      </label>
      <p v-if="error" class="field__error" role="alert">{{ error }}</p>
      <button type="submit" class="btn btn--dark" :disabled="saving">
        <i v-if="saving" class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
        {{ copy.save }}
      </button>
    </form>

    <button type="button" class="btn btn--ghost account__logout" @click="logout">
      <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i> {{ copy.logout }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.account {
  max-width: 720px;

  &__data {
    @include flex-cards(180px, 1rem);

    dt {
      font-size: 0.72rem;
      font-weight: 600;
      color: $ink-muted;
    }

    dd {
      margin-top: 0.15rem;
      font-weight: 500;
      overflow-wrap: anywhere;
    }
  }

  &__form {
    @include flex(column, stretch, flex-start, 0.9rem);

    .card__title {
      margin-bottom: 0.2rem;
    }

    .field span {
      font-size: 0.82rem;
      font-weight: 500;
      color: $ink-soft;
    }

    .btn {
      align-self: flex-start;
    }
  }

  &__logout {
    align-self: flex-start;
    color: $danger;
  }
}
</style>
