<script setup>
import { ref, reactive, computed } from 'vue'
import { csvDataAccessor, gameStatDataFromContestantStatData } from '@/util'
import { tocPeriodConfigurationData } from '@/configuration'
import * as d3 from 'd3'
import Header from './components/Header.vue'
import TocPeriodListing from './components/index/TocPeriodListing.vue'

let urlParams = new URLSearchParams(window.location.search);
const tocPlayPeriodId = urlParams.get('toc_period_id')
const gameId = +urlParams.get('game_id')

const tocPeriodConfigurations = ref(tocPeriodConfigurationData)

const allContestantStatData = reactive({})

async function fetchData(tocPeriodId) {
  const res = await d3.csv(
    'https://j-ometry.com/csvs/' + tocPeriodId + '_full.csv',
    csvDataAccessor
  )
  var resResult = await res
  allContestantStatData.value = resResult
}
fetchData(tocPlayPeriodId)

const allGameStatData = computed(() => {
    if (allContestantStatData.value) {
      var data = gameStatDataFromContestantStatData(allContestantStatData.value)
      data.sort(d => d[0]);
      data.reverse();
      return data;
    } else return allContestantStatData.value
})

const gameStatData = computed(() => {
  if (allGameStatData.value) return d3.filter(allGameStatData.value, d => d['gameId'] === gameId)[0]
  else return undefined
})

const gameContestantStatData = computed(() => {
  if (allContestantStatData.value) return d3.filter(allContestantStatData.value, d => d['Jometry Game Id'] === gameId)[0]
  else return undefined
})
</script>

<template>
  <Header />
  {{ gameId }}<br/>
  {{ allGameStatData }}<br/>
  {{ gameStatData }}<br/>
  {{ gameContestantStatData }}
</template>

<style scoped>

</style>
