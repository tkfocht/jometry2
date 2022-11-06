<script setup>
import { ref, reactive } from 'vue'
import { csvDataAccessor } from '@/util'
import { tocPeriodConfigurationData } from '@/configuration'
import * as d3 from 'd3'
import Header from './components/Header.vue'
import TocPeriodListing from './components/index/TocPeriodListing.vue'

const contestantStatData = reactive({})

async function fetchData(tocPeriodId) {
  const res = await d3.csv(
    'https://j-ometry.com/csvs/' + tocPeriodId + '_full.csv',
    csvDataAccessor
  )
  var resResult = await res
  contestantStatData[tocPeriodId] = resResult
}

for (var tocPeriodId in tocPeriodConfigurationData) {
  for (const playClassificationId of tocPeriodConfigurationData[tocPeriodId].playClassifications) {
    fetchData(playClassificationId)
  }
}
</script>

<template>
  <Header />
  <div v-for="tocPeriod in tocPeriodConfigurationData">
    <TocPeriodListing :tocPeriodConfiguration="tocPeriod" :contestantStatData="contestantStatData" />
  </div>
</template>

<style scoped>

</style>
