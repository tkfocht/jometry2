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
  <div class="component-body">
    <div v-if="gameData && contestantData">
      <div v-for="tocPeriod in ['2024']" class="toc-period section">
        <div class="toc-period-header bg-primary text-white">{{ tocPeriod }} Tournament of Champions Period<br/>
          <a :href="'/period.html?data_source=standard&toc_period=' + tocPeriod">Summary</a>
          <a :href="'/period.html?data_source=standard&toc_period=' + tocPeriod + '&play_classification=regular'">Regular Play Summary</a>
          <a :href="'/period.html?data_source=standard&toc_period=2021,2022&play_classification=regular&contestants=267,164,542,492,318,186,458,348,437,144,473,371,290,638,284,621,588,306,570,461,374,359,330,212,602,632,650'">S37 SCC Players Summary</a>
          <a :href="'/period.html?data_source=standard&toc_period=2021,2022&play_classification=regular&contestants=117,398,812,1007,4539,126,4271,189,134,365,488,4463,4368,4014,474,303,4278,231,368,11,24,314,4493,4523,4497,197,630'">S37/38 CWC Spade Players Summary</a>
        </div>
        <div v-for="season in gameData.get(tocPeriod).keys()">
          <div v-for="playClassification in gameData.get(tocPeriod).get(season).keys()" class="toc-period-play-class">
            <div class="toc-period-play-class-header bg-secondary">Season {{ season }}, {{ playClassificationName(playClassification, season) }}
              <a :href="'/period.html?toc_period=' + tocPeriod + '&season=' + season + '&play_classification=' + playClassification">Summary</a></div>
            <ToggleableGameListing :contestantData="contestantData" :gameData="gameData.get(tocPeriod).get(season).get(playClassification)"/>
          </div>
        </div>
      </div>
      <div v-for="tocPeriod in ['C2023']" class="toc-period">
        <div class="toc-period-header bg-primary text-white">2023-24 Primetime Celebrity Tournament
          <a :href="'/period.html?data_source=celebrity&toc_period=' + tocPeriod">Summary</a>
        </div>
        <div v-for="season in gameData.get(tocPeriod).keys()">
          <div v-for="playClassification in gameData.get(tocPeriod).get(season).keys()" class="toc-period-play-class">
            <div class="toc-period-play-class-header bg-secondary">Season {{ season }}, {{ playClassificationName(playClassification, season) }}
              <a :href="'/period.html?data_source=celebrity&toc_period=' + tocPeriod + '&season=' + season + '&play_classification=' + playClassification">Summary</a></div>
            <ToggleableGameListing :contestantData="contestantData" :gameData="gameData.get(tocPeriod).get(season).get(playClassification)"/>
          </div>
        </div>
      </div>
      <div v-for="tocPeriod in ['M2023']" class="toc-period">
        <div class="toc-period-header bg-primary text-white">{{ tocPeriod.substring(1) }} Masters
        </div>
        <div v-for="season in gameData.get(tocPeriod).keys()">
          <div v-for="playClassification in gameData.get(tocPeriod).get(season).keys()" class="toc-period-play-class">
            <div class="toc-period-play-class-header bg-secondary">Season {{ season }}, {{ playClassificationName(playClassification, season) }}
              <a :href="'/period.html?toc_period=' + tocPeriod + '&season=' + season + '&play_classification=' + playClassification">Summary</a></div>
            <ToggleableGameListing :contestantData="contestantData" :gameData="gameData.get(tocPeriod).get(season).get(playClassification)"/>
          </div>
        </div>
      </div>
      <div v-for="tocPeriod in ['C2022']" class="toc-period">
        <div class="toc-period-header bg-primary text-white">2022-23 Primetime Celebrity Tournament
          <a :href="'/period.html?data_source=celebrity&toc_period=' + tocPeriod">Summary</a>
        </div>
        <div v-for="season in gameData.get(tocPeriod).keys()">
          <div v-for="playClassification in gameData.get(tocPeriod).get(season).keys()" class="toc-period-play-class">
            <div class="toc-period-play-class-header bg-secondary">Season {{ season }}, {{ playClassificationName(playClassification, season) }}
              <a :href="'/period.html?data_source=celebrity&toc_period=' + tocPeriod + '&season=' + season + '&play_classification=' + playClassification">Summary</a></div>
            <ToggleableGameListing :contestantData="contestantData" :gameData="gameData.get(tocPeriod).get(season).get(playClassification)"/>
          </div>
        </div>
      </div>
      <div v-for="tocPeriod in ['2022', '2021', '2019']" class="toc-period">
        <div class="toc-period-header bg-primary text-white">{{ tocPeriod }} Tournament of Champions Period
          <a :href="'/period.html?data_source=standard&toc_period=' + tocPeriod">Summary</a>
          <a :href="'/period.html?data_source=standard&toc_period=' + tocPeriod + '&play_classification=regular'">Regular Play Summary</a>
        </div>
        <div v-for="season in gameData.get(tocPeriod).keys()">
          <div v-for="playClassification in gameData.get(tocPeriod).get(season).keys()" class="toc-period-play-class">
            <div class="toc-period-play-class-header bg-secondary">Season {{ season }}, {{ playClassificationName(playClassification, season) }}
              <a :href="'/period.html?toc_period=' + tocPeriod + '&season=' + season + '&play_classification=' + playClassification">Summary</a></div>
            <ToggleableGameListing :contestantData="contestantData" :gameData="gameData.get(tocPeriod).get(season).get(playClassification)"/>
          </div>
        </div>
      </div>
      <div v-for="tocPeriod in ['T2019','T2018']" class="toc-period">
        <div class="toc-period-header bg-primary text-white">{{ tocPeriod.substring(1) }} Teen Tournament
          <a :href="'/period.html?toc_period=' + tocPeriod">Summary</a>
        </div>
        <div v-for="season in gameData.get(tocPeriod).keys()">
          <div v-for="playClassification in gameData.get(tocPeriod).get(season).keys()" class="toc-period-play-class">
            <div class="toc-period-play-class-header bg-secondary">Season {{ season }}, {{ playClassificationName(playClassification, season) }}
              <a :href="'/period.html?toc_period=' + tocPeriod + '&season=' + season + '&play_classification=' + playClassification">Summary</a></div>
            <ToggleableGameListing :contestantData="contestantData" :gameData="gameData.get(tocPeriod).get(season).get(playClassification)"/>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<style scoped>

.toc-period {
  text-align: left;
}

.toc-period .toc-period-header {
    font-size: 24px;
    padding: 0 1em;
    border-radius: 15px;
}

.toc-period-play-class {
    margin: 2em 2em;
}

.toc-period-play-class .toc-period-play-class-header {
    font-size: 24px;
    padding: 0 1em;
    border-radius: 15px;
}

.toc-period-play-class  :deep(div) {
    padding: 0 1em;
}

.toc-period-play-class .toc-period-play-class-header a {
    font-size: 0.75rem;
}

.toc-period .toc-period-header a {
    font-size: 0.75rem;
    margin-left: 1em;
}

</style>
