<script setup>
import * as data from '@/data'
import { playClassificationName } from '@/configuration'

import * as d3 from 'd3'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'
import ToggleableGameListing from './components/index/ToggleableGameListing.vue'

data.loadContestantData()
data.loadGameData()

const gameDataRaw = data.gameData
const gameData = data.computedIfRefHasValue(gameDataRaw, gData => {
  gData.sort((a,b) => d3.descending(a['airdate'], b['airdate']) || d3.descending(a['game_in_season'], b['game_in_season']))
  return d3.group(gData, d => d['toc_period'], d => d['season_id'], d => d['play_classification'])
})
const contestantData = data.contestantDataById

</script>

<template>
  <Header />
  <div v-if="gameData && contestantData">
    <div v-for="tocPeriod in ['2023', '2022', '2021', '2019']" class="toc-period">
      <div class="toc-period-header">{{ tocPeriod }} Tournament of Champions Period
        <a :href="'/period.html?data_source=standard&toc_period=' + tocPeriod">Summary</a>
        <a :href="'/period.html?data_source=standard&toc_period=' + tocPeriod + '&play_classification=regular'">Regular Play Summary</a>
        <a :href="'/period.html?data_source=standard&toc_period=2021,2022&play_classification=regular&contestants=267,164,542,492,318,186,458,348,437,144,473,371,290,638,284,621,588,306,570,461,374,359,330,212,602,632,650'">SCC Players Summary</a>
      </div>
      <div v-for="season in gameData.get(tocPeriod).keys()">
        <div v-for="playClassification in gameData.get(tocPeriod).get(season).keys()" class="toc-period-play-class">
          <div class="toc-period-play-class-header">Season {{ season }}, {{ playClassificationName(playClassification, season) }}
            <a :href="'/period.html?toc_period=' + tocPeriod + '&season=' + season + '&play_classification=' + playClassification">Summary</a></div>
          <ToggleableGameListing :contestantData="contestantData" :gameData="gameData.get(tocPeriod).get(season).get(playClassification)"/>
        </div>
      </div>
    </div>
    <div v-for="tocPeriod in ['M2023']" class="toc-period">
      <div class="toc-period-header">{{ tocPeriod.substring(1) }} Masters
      </div>
      <div v-for="season in gameData.get(tocPeriod).keys()">
        <div v-for="playClassification in gameData.get(tocPeriod).get(season).keys()" class="toc-period-play-class">
          <div class="toc-period-play-class-header">Season {{ season }}, {{ playClassificationName(playClassification, season) }}
            <a :href="'/period.html?toc_period=' + tocPeriod + '&season=' + season + '&play_classification=' + playClassification">Summary</a></div>
          <ToggleableGameListing :contestantData="contestantData" :gameData="gameData.get(tocPeriod).get(season).get(playClassification)"/>
        </div>
      </div>
    </div>
    <div v-for="tocPeriod in ['2022', '2021', '2019']" class="toc-period">
      <div class="toc-period-header">{{ tocPeriod }} Tournament of Champions Period
        <a :href="'/period.html?data_source=standard&toc_period=' + tocPeriod">Summary</a>
        <a :href="'/period.html?data_source=standard&toc_period=' + tocPeriod + '&play_classification=regular'">Regular Play Summary</a>
      </div>
      <div v-for="season in gameData.get(tocPeriod).keys()">
        <div v-for="playClassification in gameData.get(tocPeriod).get(season).keys()" class="toc-period-play-class">
          <div class="toc-period-play-class-header">Season {{ season }}, {{ playClassificationName(playClassification, season) }}
            <a :href="'/period.html?toc_period=' + tocPeriod + '&season=' + season + '&play_classification=' + playClassification">Summary</a></div>
          <ToggleableGameListing :contestantData="contestantData" :gameData="gameData.get(tocPeriod).get(season).get(playClassification)"/>
        </div>
      </div>
    </div>
    <div v-for="tocPeriod in ['T2019','T2018']" class="toc-period">
      <div class="toc-period-header">{{ tocPeriod.substring(1) }} Teen Tournament
        <a :href="'/period.html?toc_period=' + tocPeriod">Summary</a>
      </div>
      <div v-for="season in gameData.get(tocPeriod).keys()">
        <div v-for="playClassification in gameData.get(tocPeriod).get(season).keys()" class="toc-period-play-class">
          <div class="toc-period-play-class-header">Season {{ season }}, {{ playClassificationName(playClassification, season) }}
            <a :href="'/period.html?toc_period=' + tocPeriod + '&season=' + season + '&play_classification=' + playClassification">Summary</a></div>
          <ToggleableGameListing :contestantData="contestantData" :gameData="gameData.get(tocPeriod).get(season).get(playClassification)"/>
        </div>
      </div>
    </div>
    <div v-for="tocPeriod in ['C2023']" class="toc-period">
      <div class="toc-period-header">{{ tocPeriod.substring(1) }} Primetime Celebrity Tournament
        <a :href="'/period.html?data_source=celebrity&toc_period=' + tocPeriod">Summary</a>
      </div>
      <div v-for="season in gameData.get(tocPeriod).keys()">
        <div v-for="playClassification in gameData.get(tocPeriod).get(season).keys()" class="toc-period-play-class">
          <div class="toc-period-play-class-header">Season {{ season }}, {{ playClassificationName(playClassification, season) }}
            <a :href="'/period.html?data_source=celebrity&toc_period=' + tocPeriod + '&season=' + season + '&play_classification=' + playClassification">Summary</a></div>
          <ToggleableGameListing :contestantData="contestantData" :gameData="gameData.get(tocPeriod).get(season).get(playClassification)"/>
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
    font-size: 24px;
}

.toc-period-play-class {
    margin: 1em 1em;
}

.toc-period-play-class .toc-period-play-class-header {
    font-size: 24px;
}

.toc-period-play-class .toc-period-play-class-header a {
    font-size: 13px;
}
.toc-period .toc-period-header a {
    font-size: 13px;
    margin-left: 1em;
}

</style>
