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
        <div class="toc-period-header bg-primary text-white">{{ tocPeriod }} Tournament of Champions Period
          <span><a :href="'/period.html?toc_period=' + tocPeriod">Summary</a></span>
          <span><a :href="'/period.html?toc_period=' + tocPeriod + '&play_classification=regular'">Regular Play Summary</a></span>
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
      <div v-for="tocPeriod in ['2022', '2021', '2019']" class="toc-period">
        <div class="toc-period-header bg-primary text-white">{{ tocPeriod }} Tournament of Champions Period
          <a :href="'/period.html?toc_period=' + tocPeriod">Summary</a>
          <a :href="'/period.html?toc_period=' + tocPeriod + '&play_classification=regular'">Regular Play Summary</a>
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
