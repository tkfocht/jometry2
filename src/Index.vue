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
          <span><a :href="'/period.html?data_source=standard&toc_period=' + tocPeriod">Summary</a></span>
          <span><a :href="'/period.html?data_source=standard&toc_period=' + tocPeriod + '&play_classification=regular'">Regular Play Summary</a></span>
          <span><a :href="'/period.html?data_source=standard&toc_period=2021,2022&play_classification=regular&contestants=267,164,542,492,318,186,458,348,437,144,473,371,290,638,284,621,588,306,570,461,374,359,330,212,602,632,650'">S37 SCC Players Summary</a></span>
          <span><a :href="'/period.html?data_source=standard&toc_period=2021,2022&play_classification=regular&contestants=117,398,812,1007,4539,126,4271,189,134,365,488,4463,4368,4014,474,303,4278,231,368,11,24,314,4493,4523,4497,197,630'">S37/38 CWC Spade Players Summary</a></span>
          <span><a :href="'/period.html?data_source=standard&toc_period=2021,2022&play_classification=regular&contestants=357,4511,72,416,285,273,374,183,80,462,42,219,36,803,426,1,89,170,564,990,320,458,4022,18,785,1020'">S37/38 CWC Diamond Players Summary</a></span>
          <span><a :href="'/period.html?data_source=standard&toc_period=2021,2022&play_classification=regular&contestants=149,612,1031,311,420,132,4502,281,177,375,407,566,459,555,1038,4017,618,996,4359,9,987,543,528,144,1017,576'">S37/38 CWC Club Players Summary</a></span>
          <span><a :href="'/period.html?data_source=standard&toc_period=2021,2022&play_classification=regular&contestants=984,4275,153,623,4040,47,393,4536,537,4025,185,344,119,4514,4526,195,429,402,4481,530,102,333,381,242,999'">S37/38 CWC Heart Players Summary</a></span>
          <span><a :href="'/period.html?data_source=standard&toc_period=2024&play_classification=regular&contestants=4932,5069,4617,5001,5022,5006,5211,4794,5106,4743,4796,5058,4763,4758,4922,4811,5114,4565,5351,4848,4812,4838,4746,4749,4562,4841,4985,4817,4884,4547,4988,5226,5231,4586'">S39 SCC Players Regular Play Summary</a></span>
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
    font-size: 1.5rem;
    padding: 0 1rem;
    margin-bottom: 1rem;
    border-radius: 15px;
}

.toc-period-play-class {
    margin: 0 1rem 1rem 1rem;
}

.toc-period-play-class .toc-period-play-class-header {
    font-size: 1.25rem;
    border-radius: 15px;
}

.toc-period-play-class  :deep(div) {
    padding: 0 1rem;
}

.toc-period-play-class .toc-period-play-class-header a {
    font-size: 1rem;
}

.toc-period .toc-period-header a {
    font-size: 1rem;
    margin-left: 1rem;
}

.toc-period .toc-period-header a {
    font-size: 1rem;
    margin-left: 1rem;
    display: inline-block;
}

</style>
