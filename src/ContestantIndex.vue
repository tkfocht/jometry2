<script setup>
import { ref, computed } from 'vue'
import { rollupData, csvDataAccessor, formatNumber } from '@/util'
  import { playClassificationName } from '@/configuration'
import { graphAttributes } from '@/graphAttributes'
import * as d3 from 'd3'
import Header from './components/Header.vue'
import BoxWhiskerChart from './components/util/BoxWhiskerChart.vue'
import CarouselTable from './components/util/CarouselTable.vue'
import ScatterHistogram from './components/util/ScatterHistogram.vue'
import StackValueBarChart from './components/util/StackValueBarChart.vue'

let urlParams = new URLSearchParams(window.location.search);

const allContestantStatData = ref(null)

async function fetchContestantStatData() {
  const res = await d3.csv(
    'https://j-ometry.com/csvs/all_standard.csv',
    csvDataAccessor
  )
  var resResult = await res
  allContestantStatData.value = resResult
}
fetchContestantStatData()

const contestantStatDataByContestant = computed(() => {
  if (!allContestantStatData.value) return undefined
  return d3.group(allContestantStatData.value, d => d['Jometry Contestant Id'])
})

const contestantSummariesByContestant = computed(() => {
  if (!contestantStatDataByContestant.value) return undefined
  return new d3.InternMap(d3.map(contestantStatDataByContestant.value,
    ([k, rs]) => [k, {
      'Jometry Contestant Id': k,
      'Contestant': rs[0]['Contestant'],
      'Games': rs.length
    }]))
})

const contestantSummariesSorted = computed(() => {
  if (!contestantSummariesByContestant.value) return undefined
  var summaries = Array.from(contestantSummariesByContestant.value.values())
  summaries.sort((a,b) => d3.ascending(a['Contestant'], b['Contestant']))
  return summaries
})
</script>

<template>
  <Header />
  <div class="component-body">
    <div class="section">
      <h1>Contestant Index</h1>
      <div v-for="summary in contestantSummariesSorted">
        <a :href="'/contestant.html?contestant_id=' + summary['Jometry Contestant Id']">{{ summary['Contestant'] }}</a>
        {{ summary['Games'] }} game{{ summary['Games'] === 1 ? '' : 's' }}
      </div>
    </div>
  </div>

</template>

<style scoped>

.component-body {
  margin: 0 2em;
}

.section {
  padding: 0.5em 0 2em 0;
  border-bottom: 1px solid black;
  width: 960px;
}



</style>
