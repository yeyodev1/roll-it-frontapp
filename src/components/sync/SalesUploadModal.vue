<script setup lang="ts">
import BaseModal from '@/components/ui/BaseModal.vue'
import SalesReportUpload from './SalesReportUpload.vue'
import { dashboardCopy } from '@/config/dashboardCopy'
import { useSalesUploadModal } from '@/composables/useSalesUploadModal'

// Modal con el uploader del reporte de SmartMenu. Se monta una sola vez en la barra de filtros.
const copy = dashboardCopy.salesUpload
const { open, key, hide } = useSalesUploadModal()
</script>

<template>
  <BaseModal
    :open="open"
    :title="copy.title"
    :message="copy.subtitle"
    icon="fa-solid fa-file-arrow-up"
    panel
    @cancel="hide"
  >
    <SalesReportUpload :key="key" @close="hide" />
  </BaseModal>
</template>
