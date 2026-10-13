import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { site } from '@/config/site'

// meta.adminOnly: solo el dueño. El personal de sucursal entra a inventario y facturas.
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    redirect: () => {
      const userStore = useUserStore()
      return userStore.isAdmin ? { name: 'Dashboard' } : { name: 'Inventory' }
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'Ingresar', guestOnly: true, bare: true },
  },
  {
    path: '/panel',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: { title: 'Panel CEO', requiresAuth: true, adminOnly: true },
  },
  {
    path: '/finanzas',
    name: 'Finance',
    component: () => import('@/views/dashboard/FinanceView.vue'),
    meta: { title: 'Finanzas', requiresAuth: true, adminOnly: true },
  },
  {
    path: '/operaciones',
    name: 'Operations',
    component: () => import('@/views/dashboard/OperationsView.vue'),
    meta: { title: 'Operaciones', requiresAuth: true, adminOnly: true },
  },
  {
    path: '/meseros',
    name: 'Waiters',
    component: () => import('@/views/dashboard/WaitersView.vue'),
    meta: { title: 'Meseros', requiresAuth: true, adminOnly: true },
  },
  {
    path: '/inventario',
    name: 'Inventory',
    component: () => import('@/views/inventory/InventoryView.vue'),
    meta: { title: 'Inventario', requiresAuth: true },
  },
  {
    path: '/inventario/inicial',
    name: 'InitialInventory',
    component: () => import('@/views/inventory/InitialInventoryView.vue'),
    meta: { title: 'Inventario inicial', requiresAuth: true },
  },
  {
    path: '/inventario/movimientos',
    name: 'Movements',
    component: () => import('@/views/inventory/MovementsView.vue'),
    meta: { title: 'Movimientos', requiresAuth: true },
  },
  {
    path: '/facturas',
    name: 'Invoices',
    component: () => import('@/views/invoices/InvoicesView.vue'),
    meta: { title: 'Facturas', requiresAuth: true },
  },
  {
    path: '/facturas/:id',
    name: 'InvoiceDetail',
    component: () => import('@/views/invoices/InvoiceDetailView.vue'),
    meta: { title: 'Revisar factura', requiresAuth: true },
  },
  {
    path: '/recetas',
    name: 'Recipes',
    component: () => import('@/views/settings/RecipesView.vue'),
    meta: { title: 'Recetas', requiresAuth: true, adminOnly: true },
  },
  {
    path: '/ajustes',
    name: 'Settings',
    component: () => import('@/views/settings/SettingsView.vue'),
    meta: { title: 'Ajustes', requiresAuth: true, adminOnly: true },
  },
  {
    path: '/cuenta',
    name: 'Account',
    component: () => import('@/views/AccountView.vue'),
    meta: { title: 'Mi cuenta', requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Página no encontrada' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { left: 0, top: 0 }
  },
})

router.beforeEach(async (to) => {
  const userStore = useUserStore()

  // Todo el panel es privado: la sesión se verifica una vez por carga.
  await userStore.restore()

  if (to.name === 'Home' && !userStore.isAuthenticated) {
    return { name: 'Login', replace: true }
  }

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    return { name: 'Login', query: { next: to.fullPath }, replace: true }
  }

  if (to.meta.adminOnly && !userStore.isAdmin) {
    return { name: 'Inventory', replace: true }
  }

  if (to.meta.guestOnly && userStore.isAuthenticated) {
    return { path: '/', replace: true }
  }
})

router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  document.title = title && title !== site.name ? `${title} — ${site.name}` : site.name
})

export default router
