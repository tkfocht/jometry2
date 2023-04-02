import { createRouter, createWebHistory } from 'vue-router'
import About from '../views/About.vue'
import Contestant from '../views/Contestant.vue'
import ContestantIndex from '../views/ContestantIndex.vue'
import Game from '../views/Game.vue'
import Glossary from '../views/Glossary.vue'
import Index from '../views/Index.vue'
import Period from '../views/Period.vue'

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
      component: About
    },
    {
      path: '/contestant',
      name: 'Contestant',
      component: Contestant
    },
    {
      path: '/contestant_index',
      name: 'ContestantIndex',
      component: ContestantIndex
    },
    {
      path: '/game',
      name: 'Game',
      component: Game
    },
    {
      path: '/glossary',
      name: 'Glossary',
      component: Glossary
    },
    {
      path: '/period',
      name: 'Period',
      component: Period
    }
  ]
})

export default router
