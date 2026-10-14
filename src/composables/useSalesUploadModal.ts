import { ref } from 'vue'

// Estado de módulo: el botón vive dentro del aviso "Datos hasta…", que desaparece
// apenas las ventas quedan al día. El modal no puede depender de él.
const open = ref(false)
// Cambia en cada apertura: el uploader se monta de nuevo y arranca limpio.
const key = ref(0)

/** Abre y cierra el modal de "Actualizar ventas" desde cualquier parte del layout. */
export function useSalesUploadModal() {
  function show() {
    key.value++
    open.value = true
  }

  function hide() {
    open.value = false
  }

  return { open, key, show, hide }
}
