<script setup>
import { ref } from 'vue'
import { dataSourceAddress, playClassificationName } from '@/configuration'
import { csvDataAccessor, gameStatDataFromContestantStatData } from '@/util'

import * as d3 from 'd3'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'
import ToggleableGameListing from './components/index/ToggleableGameListing.vue'

const gameStatData = ref(null)
const celebrityGameStatData = ref(null)

async function fetchData(dataSourceId) {
  const res = await d3.csv(
    dataSourceAddress(dataSourceId),
    csvDataAccessor
  )
  var resResult = await res
  resResult = gameStatDataFromContestantStatData(resResult)
  resResult.sort((a,b) => d3.descending(a['date'], b['date'] || d3.descending(a['gameInSeason'], b['gameInSeason'])))
  if (dataSourceId === 'standard') {
    gameStatData.value = d3.group(resResult, d => d['tocPeriod'], d => d['season'], d => d['playClassification'])
  }
  if (dataSourceId === 'celebrity') {
    celebrityGameStatData.value = d3.group(resResult, d => d['tocPeriod'], d => d['season'], d => d['playClassification'])
  }
}
fetchData('standard')
fetchData('celebrity')

</script>

<template>
  <Header />
  <div v-if="gameStatData">
    <div v-for="tocPeriod in ['2023', '2022', '2021', '2019']" class="toc-period">
      <div class="toc-period-header">{{ tocPeriod }} Tournament of Champions Period
        <a :href="'/period.html?data_source=standard&toc_period=' + tocPeriod">Summary</a>
        <a :href="'/period.html?data_source=standard&toc_period=' + tocPeriod + '&play_classification=regular'">Regular Play Summary</a>
        <a v-if="tocPeriod === '2023'" :href="'/period.html?data_source=standard&toc_period=' + tocPeriod + '&season=39&play_classification=regular&win_threshold=0&win_limit=0&graph_display_limit=30'">SC-Eligible Players</a>
      </div>
      <div v-for="season in gameStatData.get(tocPeriod).keys()">
        <div v-for="playClassification in gameStatData.get(tocPeriod).get(season).keys()" class="toc-period-play-class">
          <div class="toc-period-play-class-header">Season {{ season }}, {{ playClassificationName(playClassification, season) }}
            <a :href="'/period.html?toc_period=' + tocPeriod + '&season=' + season + '&play_classification=' + playClassification">Summary</a></div>
          <ToggleableGameListing :dataSourceId="'standard'" :gameStatData="gameStatData.get(tocPeriod).get(season).get(playClassification)"/>
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
          <ToggleableGameListing :dataSourceId="'standard'" :gameStatData="gameStatData.get(tocPeriod).get(season).get(playClassification)"/>
        </div>
      </div>
    </div>
  </div>
  <div v-if="celebrityGameStatData">
    <div v-for="tocPeriod in ['C2023']" class="toc-period">
      <div class="toc-period-header">{{ tocPeriod.substring(1) }} Primetime Celebrity Tournament
        <a :href="'/period.html?data_source=celebrity&toc_period=' + tocPeriod">Summary</a>
      </div>
      <div v-for="season in celebrityGameStatData.get(tocPeriod).keys()">
        <div v-for="playClassification in celebrityGameStatData.get(tocPeriod).get(season).keys()" class="toc-period-play-class">
          <div class="toc-period-play-class-header">Season {{ season }}, {{ playClassificationName(playClassification, season) }}
            <a :href="'/period.html?data_source=celebrity&toc_period=' + tocPeriod + '&season=' + season + '&play_classification=' + playClassification">Summary</a></div>
          <ToggleableGameListing :dataSourceId="'celebrity'" :gameStatData="celebrityGameStatData.get(tocPeriod).get(season).get(playClassification)"/>
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
