import { createRouter, createWebHistory } from 'vue-router'
import Index from '../views/Index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: Index
    },
    {
      path: '/about',
      name: 'About',
      component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
    },
    {
      path: '/contestant',
      name: 'Contestant',
      component: () => import(/* webpackChunkName: "contestant" */ '../views/Contestant.vue')
    },
    {
      path: '/contestant_index',
      name: 'ContestantIndex',
      component: () => import(/* webpackChunkName: "contestant_index" */ '../views/ContestantIndex.vue')
    },
    {
      path: '/game',
      name: 'Game',
      component: () => import(/* webpackChunkName: "game" */ '../views/Game.vue')
    },
    {
      path: '/glossary',
      name: 'Glossary',
      component: () => import(/* webpackChunkName: "glossary" */ '../views/Glossary.vue')
    },
    {
      path: '/period',
      name: 'Period',
      component: () => import(/* webpackChunkName: "period" */ '../views/Period.vue')
    }
  ]
})

export default router
