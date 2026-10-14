<script setup lang="ts" generic="Row extends Record<string, unknown>">
export interface TableColumn {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
  /** Se oculta en el celular para que la tabla quepa sin scroll. */
  hideOnMobile?: boolean
  /** Se oculta hasta pantallas anchas (≥1280px): para tablas que comparten fila con otra tarjeta. */
  hideOnNarrow?: boolean
}

/**
 * Tabla simple dentro de una tarjeta. Cada celda se puede personalizar con el
 * slot `cell-<key>` (recibe `row` y `value`), p. ej. para un DeltaBadge o AppBadge.
 * Si aun así no cabe, se desliza de lado dentro de su caja, nunca la página.
 */
withDefaults(
  defineProps<{
    columns: TableColumn[]
    rows: Row[]
    rowKey?: string
    /** Resalta una fila (el mes en curso, la sucursal elegida). */
    highlightKey?: unknown
    caption?: string
  }>(),
  { rowKey: 'id', highlightKey: undefined, caption: '' },
)
</script>

<template>
  <div class="dtable">
    <table>
      <caption v-if="caption" class="visually-hidden">
        {{
          caption
        }}
      </caption>
      <thead>
        <tr>
          <th
            v-for="c in columns"
            :key="c.key"
            scope="col"
            :class="[
              `is-${c.align ?? 'left'}`,
              { 'is-wide-only': c.hideOnMobile, 'is-xl-only': c.hideOnNarrow },
            ]"
          >
            {{ c.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, i) in rows"
          :key="String(row[rowKey] ?? i)"
          :class="{ 'is-on': highlightKey !== undefined && row[rowKey] === highlightKey }"
        >
          <td
            v-for="c in columns"
            :key="c.key"
            :class="[
              `is-${c.align ?? 'left'}`,
              { 'is-wide-only': c.hideOnMobile, 'is-xl-only': c.hideOnNarrow },
            ]"
          >
            <slot :name="`cell-${c.key}`" :row="row" :value="row[c.key]">{{ row[c.key] }}</slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.dtable {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8rem;

    @include from('md') {
      font-size: 0.84rem;
    }

    @include tabular;
  }

  // Bordes con el aire de la tarjeta; entre columnas, menos.
  th,
  td {
    &:first-child {
      padding-left: $sp-4;

      @include from('md') {
        padding-left: $sp-6;
      }
    }

    &:last-child {
      padding-right: $sp-4;

      @include from('md') {
        padding-right: $sp-6;
      }
    }
  }

  th {
    padding: 0.6rem 0.6rem;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: $ink-muted;
    background: rgba($canvas, 0.7);
    white-space: nowrap;

    @include from('md') {
      padding-inline: $sp-4;
    }
  }

  td {
    padding: 0.75rem 0.6rem;
    border-top: 1px solid $line-soft;
    color: $ink;
    white-space: nowrap;

    @include from('md') {
      padding-inline: $sp-4;
    }
  }

  tbody tr {
    @include transition(background-color);

    &:hover {
      background: rgba($canvas, 0.6);
    }

    &.is-on {
      background: rgba($accent-soft, 0.55);
    }
  }

  .is-left {
    text-align: left;
  }

  .is-right {
    text-align: right;
  }

  .is-center {
    text-align: center;
  }

  .is-xl-only {
    @include until('xl') {
      display: none;
    }
  }

  .is-wide-only {
    @include until('md') {
      display: none;
    }
  }
}
</style>
