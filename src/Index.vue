<script setup>
import { ref } from 'vue'
import { playClassificationName } from '@/configuration'
import { csvDataAccessor, gameStatDataFromContestantStatData } from '@/util'

import * as d3 from 'd3'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'
import ToggleableGameListing from './components/index/ToggleableGameListing.vue'

const gameStatData = ref(null)

async function fetchData() {
  const res = await d3.csv(
    'https://j-ometry.com/csvs/all_standard.csv',
    csvDataAccessor
  )
  var resResult = await res
  resResult = gameStatDataFromContestantStatData(resResult)
  resResult.sort((a,b) => d3.descending(a['date'], b['date'] || d3.descending(a['gameInSeason'], b['gameInSeason'])))
  gameStatData.value = d3.group(resResult, d => d['tocPeriod'], d => d['season'], d => d['playClassification'])
}
fetchData()

</script>

<template>
  <Header />
  <div v-if="gameStatData">
    <div v-for="tocPeriod in ['2023', '2022', '2021', '2019']" class="toc-period">
      <div class="toc-period-header">{{ tocPeriod }} Tournament of Champions Period
        <a :href="'/period.html?toc_period=' + tocPeriod">Summary</a>
        <a :href="'/period.html?toc_period=' + tocPeriod + '&play_classification=regular'">Regular Play Summary</a>
        </div>
      <div v-for="season in gameStatData.get(tocPeriod).keys()">
        <div v-for="playClassification in gameStatData.get(tocPeriod).get(season).keys()" class="toc-period-play-class">
          <div class="toc-period-play-class-header">Season {{ season }}, {{ playClassificationName(playClassification, season) }}
            <a :href="'/period.html?toc_period=' + tocPeriod + '&season=' + season + '&play_classification=' + playClassification">Summary</a></div>
          <ToggleableGameListing :gameStatData="gameStatData.get(tocPeriod).get(season).get(playClassification)"/>
        </div>
      </div>
    </div>
    <div v-for="tocPeriod in ['T2019','T2018']" class="toc-period">
      <div class="toc-period-header">{{ tocPeriod.substring(1) }} Teen Tournament
        <a :href="'/period.html?toc_period=' + tocPeriod">Summary</a>
        </div>
      <div v-for="season in gameStatData.get(tocPeriod).keys()">
        <div v-for="playClassification in gameStatData.get(tocPeriod).get(season).keys()" class="toc-period-play-class">
          <div class="toc-period-play-class-header">Season {{ season }}, {{ playClassificationName(playClassification, season) }}
            <a :href="'/period.html?toc_period=' + tocPeriod + '&season=' + season + '&play_classification=' + playClassification">Summary</a></div>
          <ToggleableGameListing :gameStatData="gameStatData.get(tocPeriod).get(season).get(playClassification)"/>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<style scoped>

.toc-period {
    margin: 2em 1em;
}

.toc-period .toc-period-header {
    font-size: 36px;
}

.toc-period-play-class {
    margin: 1em 1em;
}

.toc-period-play-class .toc-period-play-class-header {
    font-size: 24px;
}

.toc-period-play-class .toc-period-play-class-header a {
    font-size: 16px;
}
.toc-period .toc-period-header a {
    font-size: 16px;
    margin-left: 1em;
}

</style>
