<script setup>
import * as data from '@/data'
import { playClassificationName, playClassificationNameByTocPeriod } from '@/configuration'
import { dateFormat } from '@/util'

import * as d3 from 'd3'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'
import ToggleableGameListing from './components/index/ToggleableGameListing.vue'

data.loadContestantData()
data.loadGameData()
data.loadGameStatData()

const gameDataRaw = data.gameData
const gameDataSorted = data.computedIfRefHasValue(gameDataRaw, gData => {
  gData.sort((a,b) => d3.descending(a['airdate'], b['airdate']) || d3.descending(a['game_in_season'], b['game_in_season']))
  return gData
})
const gameData = data.computedIfRefHasValue(gameDataRaw, gData => {
  gData.sort((a,b) => d3.descending(a['airdate'], b['airdate']) || d3.descending(a['game_in_season'], b['game_in_season']))
  return d3.group(gData, d => d['toc_period'], d => d['season_id'], d => d['play_classification'])
})
const contestantData = data.contestantDataById
const gameStatData = data.gameStatData
const gameStatDataById = data.computedIfRefHasValue(gameStatData, gsData => d3.index(gsData, gs => gs.game_id))

</script>

<template>
  <Header />
  <div class="component-body">
    <div v-if="gameData && contestantData">
      <div class="toc-period section">
        <div class="toc-period-header bg-primary text-white">Recent Games
        </div>
        <div>
          <table class="game-list">
            <tbody>
              <tr v-for="game in gameDataSorted.slice(0, 10)">
                <td><a :href="'game.html?game_id=' + game.game_id">Season {{ game.season_id }} Game {{ game.game_in_season }}</a></td>
                <td>{{ dateFormat(game.airdate) }}</td>
                <td v-for="contestant_id in [game.podium_1_contestant_id, game.podium_2_contestant_id, game.podium_3_contestant_id]">
                  <a :href="'/contestant.html?contestant_id=' + contestant_id">{{ contestantData.get(contestant_id).name }}</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="toc-period section">
        <div class="toc-period-header bg-primary text-white">Current Qualification Period and Season
        </div>
        <div v-for="tocPeriod in ['2025']" class="toc-period-play-class"
            :set1="tocPeriodGames = gameDataSorted.filter(g => g.toc_period === tocPeriod)"
            :set2="tocPeriodGamesByPlayClassification = d3.group(tocPeriodGames, g => g.play_classification)">
          <div class="toc-period-play-class-header bg-secondary">
            {{ tocPeriod }} Period&nbsp;
            <a :href="'/period_games.html?toc_period=' + tocPeriod">{{ tocPeriodGames.length }} game{{ tocPeriodGames.length === 1 ? '' : 's' }}</a>&nbsp;
            <a :href="'/period.html?toc_period=' + tocPeriod">Statistical Summary</a>
          </div>
          <div class="play-classification-list">
            <div v-for="playClassification in tocPeriodGamesByPlayClassification.keys()">
                <div>{{ playClassificationNameByTocPeriod(playClassification, tocPeriod) }}</div>
                <div><a :href="'/period_games.html?toc_period=' + tocPeriod + '&play_classification=' + playClassification">{{ tocPeriodGamesByPlayClassification.get(playClassification).length }} game{{ tocPeriodGamesByPlayClassification.get(playClassification).length === 1 ? '' : 's' }}</a></div>
                <div><a :href="'/period.html?toc_period=' + tocPeriod + '&play_classification=' + playClassification">Statistical Summary</a></div>
            </div>
          </div>
        </div>
        <div v-for="season_id_set in [['40']]" class="toc-period-play-class"
            :set1="seasonGames = gameDataSorted.filter(g => season_id_set.includes(g.season_id))"
            :set2="seasonGamesByPlayClassification = d3.group(seasonGames, g => g.play_classification)">
          <div class="toc-period-play-class-header bg-secondary">
            Season {{ season_id_set[0] }}&nbsp;
            <a :href="'/period_games.html?season=' + season_id_set.join(',')">{{ seasonGames.length }} game{{ seasonGames.length === 1 ? '' : 's' }}</a>&nbsp;
            <a :href="'/period.html?season=' + season_id_set.join(',')">Statistical Summary</a>
          </div>
          <div class="play-classification-list">
            <div v-for="playClassification in seasonGamesByPlayClassification.keys()">
              <div>{{ playClassificationName(playClassification, season_id_set[0]) }}</div>
              <div><a :href="'/period_games.html?season=' + season_id_set.join(',') + '&play_classification=' + playClassification">{{ seasonGamesByPlayClassification.get(playClassification).length }} game{{ seasonGamesByPlayClassification.get(playClassification).length === 1 ? '' : 's' }}</a></div>
              <div><a :href="'/period.html?season=' + season_id_set.join(',') + '&play_classification=' + playClassification">Statistical Summary</a></div>
            </div>
          </div>
        </div>
      </div>
      <div class="toc-period section">
        <div class="toc-period-header bg-primary text-white">2024 Masters Contestants
        </div>
        <div class="contestant-listing">
          <div v-for="contestant_id in [834, 2487, 639, 4281, 7912, 4842]" class="contestant-listing-item">
            <a :href="'/contestant.html?contestant_id=' + contestant_id">{{ contestantData.get(contestant_id).name }}</a>
          </div>
        </div>
      </div>
      <div class="toc-period section">
        <div class="toc-period-header bg-primary text-white">Tournament of Champions Qualification Periods
        </div>
        <div v-for="tocPeriod in ['2025','2024','2022','2021','2019','2017']" class="toc-period-play-class"
            :set1="tocPeriodGames = gameDataSorted.filter(g => g.toc_period === tocPeriod)"
            :set2="tocPeriodGamesByPlayClassification = d3.group(tocPeriodGames, g => g.play_classification)">
          <div class="toc-period-play-class-header bg-secondary">
            {{ tocPeriod }} Period&nbsp;
            <a :href="'/period_games.html?toc_period=' + tocPeriod">{{ tocPeriodGames.length }} game{{ tocPeriodGames.length === 1 ? '' : 's' }}</a>&nbsp;
            <a :href="'/period.html?toc_period=' + tocPeriod">Statistical Summary</a>
          </div>
          <div class="play-classification-list">
            <div v-for="playClassification in tocPeriodGamesByPlayClassification.keys()">
                <div>{{ playClassificationNameByTocPeriod(playClassification, tocPeriod) }}</div>
                <div><a :href="'/period_games.html?toc_period=' + tocPeriod + '&play_classification=' + playClassification">{{ tocPeriodGamesByPlayClassification.get(playClassification).length }} game{{ tocPeriodGamesByPlayClassification.get(playClassification).length === 1 ? '' : 's' }}</a></div>
                <div><a :href="'/period.html?toc_period=' + tocPeriod + '&play_classification=' + playClassification">Statistical Summary</a></div>
            </div>
          </div>
        </div>
      </div>
      <div class="toc-period section">
        <div class="toc-period-header bg-primary text-white">Masters Qualification Periods
        </div>
        <div v-for="tocPeriod in ['M2024','M2023']" class="toc-period-play-class"
            :set1="tocPeriodGames = gameDataSorted.filter(g => g.toc_period === tocPeriod)"
            :set2="tocPeriodGamesByPlayClassification = d3.group(tocPeriodGames, g => g.play_classification)">
          <div class="toc-period-play-class-header bg-secondary">
            {{ tocPeriod }} Period&nbsp;
            <a :href="'/period_games.html?toc_period=' + tocPeriod">{{ tocPeriodGames.length }} game{{ tocPeriodGames.length === 1 ? '' : 's' }}</a>&nbsp;
            <a :href="'/period.html?toc_period=' + tocPeriod">Statistical Summary</a>
          </div>
          <div class="play-classification-list">
            <div v-for="playClassification in tocPeriodGamesByPlayClassification.keys()">
              <div>{{ playClassificationNameByTocPeriod(playClassification, tocPeriod) }}</div>
              <div><a :href="'/period_games.html?toc_period=' + tocPeriod + '&play_classification=' + playClassification">{{ tocPeriodGamesByPlayClassification.get(playClassification).length }} game{{ tocPeriodGamesByPlayClassification.get(playClassification).length === 1 ? '' : 's' }}</a></div>
              <div><a :href="'/period.html?toc_period=' + tocPeriod + '&play_classification=' + playClassification">Statistical Summary</a></div>
            </div>
          </div>
        </div>
      </div>
      <div class="toc-period section">
        <div class="toc-period-header bg-primary text-white">Syndicated Seasons
        </div>
        <div v-for="season_id_set in [['40','40A'],['39'],['38'],['37'],['36'],['35'],['34'],['33'],['32']]" class="toc-period-play-class"
            :set1="seasonGames = gameDataSorted.filter(g => season_id_set.includes(g.season_id))"
            :set2="seasonGamesByPlayClassification = d3.group(seasonGames, g => g.play_classification)">
          <div class="toc-period-play-class-header bg-secondary">
            Season {{ season_id_set[0] }}&nbsp;
            <a :href="'/period_games.html?season=' + season_id_set.join(',')">{{ seasonGames.length }} game{{ seasonGames.length === 1 ? '' : 's' }}</a>&nbsp;
            <a :href="'/period.html?season=' + season_id_set.join(',')">Statistical Summary</a>
          </div>
          <div class="play-classification-list">
            <div v-for="playClassification in seasonGamesByPlayClassification.keys()">
              <div>{{ playClassificationName(playClassification, season_id_set[0]) }}</div>
              <div><a :href="'/period_games.html?season=' + season_id_set.join(',') + '&play_classification=' + playClassification">{{ seasonGamesByPlayClassification.get(playClassification).length }} game{{ seasonGamesByPlayClassification.get(playClassification).length === 1 ? '' : 's' }}</a></div>
              <div><a :href="'/period.html?season=' + season_id_set.join(',') + '&play_classification=' + playClassification">Statistical Summary</a></div>
            </div>
          </div>
        </div>
      </div>
      <div class="toc-period section">
        <div class="toc-period-header bg-primary text-white">Primetime Seasons
        </div>
        <div v-for="season_id_set in [['PCJ2'],['M2023'],['PCJ1'],['NCC2022']]" class="toc-period-play-class"
            :set1="seasonGames = gameDataSorted.filter(g => season_id_set.includes(g.season_id))"
            :set2="seasonGamesByPlayClassification = d3.group(seasonGames, g => g.play_classification)">
          <div class="toc-period-play-class-header bg-secondary">
            Season {{ season_id_set[0] }}&nbsp;
            <a :href="'/period_games.html?season=' + season_id_set.join(',')">{{ seasonGames.length }} game{{ seasonGames.length === 1 ? '' : 's' }}</a>&nbsp;
            <a :href="'/period.html?season=' + season_id_set.join(',')">Statistical Summary</a>
          </div>
          <div class="play-classification-list">
            <div v-for="playClassification in seasonGamesByPlayClassification.keys()">
              <div>{{ playClassificationName(playClassification, season_id_set[0]) }}</div>
              <div><a :href="'/period_games.html?season=' + season_id_set.join(',') + '&play_classification=' + playClassification">{{ seasonGamesByPlayClassification.get(playClassification).length }} game{{ seasonGamesByPlayClassification.get(playClassification).length === 1 ? '' : 's' }}</a></div>
              <div><a :href="'/period.html?season=' + season_id_set.join(',') + '&play_classification=' + playClassification">Statistical Summary</a></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<style lang="scss" scoped>

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

.play-classification-list {
  width: 100%;

  > div {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;

    > div:first-child {
      flex-grow: 1;
    }

    > div {
      flex-grow: 0;
    }
  }
}

table.game-list, table.play-classification-list {
  width: 100%;

  td {
    padding: 2px 5px;
    text-align: center;

    &:first-child {
      text-align: left;
    }
  }
}

.contestant-listing {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  gap: 0.25em 1em;
  margin-bottom: 1em;
}

</style>
