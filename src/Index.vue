<script setup>
import { ref, reactive } from 'vue'
import { csvDataAccessor } from '@/util'
import { tocPeriodConfigurationData } from '@/configuration'
import * as d3 from 'd3'
import Header from './components/Header.vue'
import TocPeriodListing from './components/index/TocPeriodListing.vue'

const tocPeriodConfigurations = ref(tocPeriodConfigurationData)

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
