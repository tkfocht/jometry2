<script setup>
import * as data from '@/data'
import { playClassificationName, playClassificationNameByTocPeriod } from '@/configuration'
import { dateFormat } from '@/util'

import * as d3 from 'd3'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'

data.loadContestantData()
data.loadGameData()
data.loadGameStatData()

const scc2025Cids = [7976, 8040, 8049, 8073, 8079, 8085, 8088, 8091, 8094, 8138, 8159, 8190, 8207, 8210, 8222, 8235, 8250, 8289]
const cwc2025Cids = [8144, 7956, 8163, 8175, 8187, 8195, 8243, 8306, 8312, 8318, 8328, 8334, 8355]
const toc2025Cids = [8042, 8117, 8087, 8286, 7941, 8229, 7968, 8217, 8013, 8265, 8028, 5342, 8201, 8004, 8154, 8249, 7995, 7982, 8336]

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
    <div class="alert alert-primary" role="alert">
      As of the game on December 6, 2024, the site has rolled over to treat the 2026 TOC as the current qualification period.
      The game on December 5 is currently being treated as part of the 2025 period so that Stevie Ruiz's statistics
      are fully within that period while the 2025 postseason completes, but will be placed in the 2026
      period later to put all of Dave Bond's victories within one qualification period.
    </div>
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
        <div class="toc-period-header bg-primary text-white">2024-25 Second Chance Competition Contestants
        </div>
        <div class="competition-summary-links"><a :href="'/period.html?toc_period=2025&play_classification=regular&contestants=' + scc2025Cids.join(',')">Competitor Statistical Summary</a></div>
        <div class="competition-contestant-links">
          <div class="competition-contestant-link" v-for="contestant_id in scc2025Cids">
            <a :href="'/contestant.html?contestant_id=' + contestant_id">{{ contestantData.get(contestant_id).name }}</a>
          </div>
        </div>
      </div>
      <div class="toc-period section">
        <div class="toc-period-header bg-primary text-white">2025 Champions Wildcard Contestants
        </div>
        <div class="competition-summary-links"><a :href="'/period.html?toc_period=2025&play_classification=regular&contestants=' + cwc2025Cids.join(',')">Competitor Statistical Summary</a></div>
        <div class="competition-contestant-links">
          <div class="competition-contestant-link" v-for="contestant_id in cwc2025Cids">
            <a :href="'/contestant.html?contestant_id=' + contestant_id">{{ contestantData.get(contestant_id).name }}</a>
          </div>
        </div>
        <div class="competition-contestant-links">
          Plus two SCC winners
        </div>
      </div>
      <div class="toc-period section">
        <div class="toc-period-header bg-primary text-white">2025 Tournament of Champions Contestants
        </div>
        <div class="competition-summary-links"><a :href="'/period.html?toc_period=2025&play_classification=regular&contestants=' + toc2025Cids.join(',')">Competitor Statistical Summary</a></div>
        <div class="competition-contestant-links">
          <div class="competition-contestant-link" v-for="contestant_id in toc2025Cids">
            <a :href="'/contestant.html?contestant_id=' + contestant_id">{{ contestantData.get(contestant_id).name }}</a>
          </div>
        </div>
        <div class="competition-contestant-links">
          Plus one additional champion and one CWC winner
        </div>
      </div>
      <div class="toc-period section">
        <div class="toc-period-header bg-primary text-white">Current Qualification Period and Season
        </div>
        <div v-for="tocPeriod in ['2026']" class="toc-period-play-class"
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
        <div v-for="season_id_set in [['41']]" class="toc-period-play-class"
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

.competition-summary-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  gap: 0.25em 1em;
  margin-bottom: 1em;
}

.competition-contestant-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  gap: 0.25em 1em;
  margin-bottom: 1em;
}

</style>
