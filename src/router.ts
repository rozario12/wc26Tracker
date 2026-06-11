import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'schedule',
    component: () => import('@/views/Schedule.vue'),
    meta: { title: 'Schedule' },
  },
  {
    path: '/standings',
    name: 'standings',
    component: () => import('@/views/Standings.vue'),
    meta: { title: 'Standings' },
  },
  {
    path: '/bracket',
    name: 'bracket',
    component: () => import('@/views/Bracket.vue'),
    meta: { title: 'Bracket' },
  },
  {
    path: '/favourites',
    name: 'favourites',
    component: () => import('@/views/Favourites.vue'),
    meta: { title: 'Favourites' },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})
