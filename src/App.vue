<script setup>
import { ref, reactive } from 'vue'
import { csvDataAccessor } from '@/util'
import * as d3 from 'd3'
import Header from './components/Header.vue'
import TocPeriodListing from './components/index/TocPeriodListing.vue'

const tocPeriodConfigurations = ref([
{
    id: 'TOC2023',
    label: 'TOC 2023 (S40)',
    playClassifications: [
      {
        id: 'TOC2023R',
        label: '2023 TOC Regular Play (S39)'
      }
    ]
  },
  {
    id: 'TOC2022',
    label: 'TOC 2022 (S39)',
    playClassifications: [
      {
        id: 'TOC2022H',
        label: '2022 Tournament of Champions (S39)'
      },
      {
        id: 'TOC2022R',
        label: '2022 TOC Regular Play (S37-S38)'
      }
    ]
  },
  {
    id: 'TOC2021',
    label: 'TOC 2021 (S37)',
    playClassifications: [
      {
        id: 'TOC2021H',
        label: '2021 Tournament of Champions (S37)'
      },
      {
        id: 'TOC2021R',
        label: '2021 TOC Regular Play (S35-S37)'
      }
    ]
  }
])

const playClassificationData = reactive({})
const contestantStatData = reactive({})

async function fetchData(tocPeriodId) {
  const res = await d3.csv(
    'https://j-ometry.com/csvs/' + tocPeriodId + '_full.csv',
    csvDataAccessor
  )
  var resResult = await res
  contestantStatData[tocPeriodId] = resResult
}

fetchData('TOC2023R')
fetchData('TOC2022H')
fetchData('TOC2022R')
fetchData('TOC2021H')
fetchData('TOC2021R')

</script>

<template>
  <Header />
  <div v-for="tocPeriod in tocPeriodConfigurations">
    <TocPeriodListing :tocPeriodConfiguration="tocPeriod" :contestantStatData="contestantStatData" />
  </div>
</template>

<style scoped>

</style>
