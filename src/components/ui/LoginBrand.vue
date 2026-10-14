<script setup lang="ts">
import BrandMark from '@/components/ui/BrandMark.vue'
import { site } from '@/config/site'
import { dashboardCopy } from '@/config/dashboardCopy'

// Panel oscuro del ingreso: la marca, la línea del local y lo que hace el panel.
const copy = dashboardCopy.login
</script>

<template>
  <div class="lbrand">
    <BrandMark inverse :size="44" :with-name="false" class="lbrand__mark" />
    <p class="lbrand__name">{{ site.name }}</p>
    <p class="lbrand__tagline">{{ site.tagline }}</p>
    <p class="lbrand__line">{{ copy.brandLine }}</p>
    <ul class="lbrand__features">
      <li v-for="f in copy.features" :key="f.label">
        <i :class="f.icon" aria-hidden="true"></i>{{ f.label }}
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.lbrand {
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

  &__features {
    position: relative;
    list-style: none;
    @include flex(row, center, flex-start, 0.5rem);
    flex-wrap: wrap;
    margin-top: 1.25rem;

    li {
      @include flex(row, center, flex-start, 0.45rem);
      padding: 0.45rem 0.85rem;
      border: 1px solid rgba($paper, 0.12);
      border-radius: $radius-pill;
      background: rgba($paper, 0.06);
      backdrop-filter: blur(6px);
      font-size: 0.76rem;
      color: rgba($paper, 0.85);

      i {
        color: $accent;
        font-size: 0.75rem;
      }
    }
  }
}
</style>
