<script setup>
import { ref, reactive } from 'vue'
import { csvDataAccessor } from '@/util'
import * as d3 from 'd3'
import Header from './components/Header.vue'
import TocPeriodListing from './components/index/TocPeriodListing.vue'

const tocPeriodConfigurations = ref({
  'TOC2023': {
    id: 'TOC2023',
    label: 'TOC 2023 (S40)',
    playClassifications: {
      'TOC2023R': {
        id: 'TOC2023R',
        label: '2023 TOC Regular Play (S39)'
      }
    }
  },
  'TOC2022': {
    id: 'TOC2022',
    label: 'TOC 2022 (S39)',
    playClassifications: {
      'TOC2022H': {
        id: 'TOC2022H',
        label: '2022 Tournament of Champions (S39)',
        quicklinks: [
          {
            label: 'Tournament',
            link: '/toc_period.html?toc_period=TOC2022H&contestants=all'
          }
        ]
      },
      'TOC2022R': {
        id: 'TOC2022R',
        label: '2022 TOC Regular Play (S37-S38)',
        quicklinks: [
          {
            label: 'Qualifiers',
            link: '/toc_period.html?toc_period=TOC2022R&contestants=834,639,4281,4374,753,245,587,4421,266,4440,819,788,4043,287,1055,1044,1067,752,690'
          },
          {
            label: 'SC Qualifiers',
            link: '/toc_period.html?toc_period=TOC2022R&contestants=354,4448,4404,827,4488,903,4416,708,585,4340,860,810,4356,752,690,4512,255,806'
          }
        ]
      },
      'TOC2022SC': {
        id: 'TOC2022SC',
        label: '2022 Second Chance (S39)',
        quicklinks: [
          {
            label: 'Semifinalists',
            link: '/toc_period.html?toc_period=TOC2022SC'
          }
        ]
      },
      'NCC2022': {
        id: 'NCC2022',
        label: '2022 National College Championship',
        quicklinks: [
          {
            label: 'Semifinalists',
            link: '/toc_period.html?toc_period=NCC2022&contestants=4066,4070,4064,4045,4059,4076,4050,4060,4074,4052,4056,4080'
          }
        ]
      },
      'TOC2022P': {
        id: 'TOC2022P',
        label: '2022 Professors Tournament (S38)',
        quicklinks: [
          {
            label: 'Semifinalists',
            link: 'toc_period.html?toc_period=TOC2022P&contestants=all'
          }
        ]
      }
    }
  },
  'TOC2021': {
    id: 'TOC2021',
    label: 'TOC 2021 (S37)',
    playClassifications: {
      'TOC2021H': {
        id: 'TOC2021H',
        label: '2021 Tournament of Champions (S37)',
        quicklinks: [
          {
            label: 'Tournament',
            link: '/toc_period.html?toc_period=TOC2021H&contestants=all'
          }
        ]
      },
      'TOC2021R': {
        id: 'TOC2021R',
        label: '2021 TOC Regular Play (S35-S37)'
      }
    }
  }
})

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

for (var tocPeriodId in tocPeriodConfigurations.value) {
  for (var tocPlayPeriodClassification in tocPeriodConfigurations.value[tocPeriodId].playClassifications) {
    fetchData(tocPlayPeriodClassification)
  }
}
</script>

<template>
  <Header />
  <div v-for="tocPeriod in tocPeriodConfigurations">
    <TocPeriodListing :tocPeriodConfiguration="tocPeriod" :contestantStatData="contestantStatData" />
  </div>
</template>

<style scoped>

</style>
