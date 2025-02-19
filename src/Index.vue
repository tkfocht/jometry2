<script setup>
import * as data from '@/data'
import * as _ from 'lodash'
import { playClassificationName, playClassificationNameByTocPeriod, seasonDisplayId } from '@/configuration'
import { dateFormat, subdomainIdentifier, isSyndicated, isPopCulture } from '@/util'

import * as d3 from 'd3'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'

const subdomain = subdomainIdentifier()

data.loadContestantData()
data.loadGameData()
if (subdomain == 'popculture') {
  data.loadTeamData()
}

const toc2025Cids = [8042, 8117, 8087, 8286, 7941, 8229, 7968, 8217, 8013, 8265, 8028, 5342, 8201, 8004, 8154, 8249, 7995, 7982, 8336, 8328, 8207]
const jit2025Cids = [639, "Robin Carroll", 5052, "Roger Craig", 4542, 753, 287, 4070, 2653,
  8536, 2650, 4043, 4782, 4374, 4859, 8535, 462, 
  1788, 834, "Rachael Schwartz", 1055, 4066, "Shane Whitlock", 5097, 3451, 1782, 5106]

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
const teamData = data.teamDataById

</script>

<template>
  <Header />
  <div class="component-body" :data-bs-theme="subdomain">
    <div v-if="isSyndicated() && gameData && contestantData">
      <div class="toc-period section">
        <div class="toc-period-header bg-primary text-white">Recent Games
        </div>
        <div>
          <div class="container game-listing">
            <div v-for="game in gameDataSorted.slice(0, 10)" class="row">
              <div class="col-5">
                <div class="row">
                  <div class="col-md-7">
                    <a :href="'game.html?game_id=' + game.game_id">Season {{ seasonDisplayId(game.season_id) }} Game {{ game.game_in_season }}</a>
                  </div>
                  <div class="col-md-5">
                    {{ dateFormat(game.airdate) }}
                  </div>
                </div>
              </div>
              <div class="col-7">
                <div class="row">
                  <div class="col-md" v-for="contestant_id in [game.podium_1_contestant_id, game.podium_2_contestant_id, game.podium_3_contestant_id]">
                    <a :href="'/contestant.html?contestant_id=' + contestant_id">{{ contestantData.get(contestant_id).name }}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="toc-period section">
        <div class="toc-period-header bg-primary text-white">2025 Invitational Tournament Contestants
        </div>
        <div class="competition-summary-links">
          <a :href="'/period.html?play_classification=regular&contestants=639,5052,4542,753,287,4043,4782,4374,4859,462,834,1055,5097,3451,5106'">Competitor Regular Play Summary</a>
          <a :href="'/period.html?play_classificationteen,hsreunion,college&contestants=2653,2650,1788,1782,4070,4066'">Competitor Teen/HSR/College Summary</a>
          <a :href="'/period.html?play_classification=champions&contestants=639,5052,4542,753,287,4043,4782,4374,4859,462,834,1055,5097,3451,5106,4066'">Competitor TOC Summary</a>
        </div>
        <div class="competition-contestant-links">
          <div class="competition-contestant-link" v-for="contestant_id in jit2025Cids">
            <a v-if="_.isInteger(contestant_id)" :href="'/contestant.html?contestant_id=' + contestant_id">{{ contestantData.get(contestant_id).name }}</a>
            <span v-else>{{ contestant_id }}</span>
          </div>
        </div>
      </div>
      <div class="toc-period section">
        <div class="toc-period-header bg-primary text-white">Current Qualification Periods and Season
        </div>
        <div v-for="tocPeriod in ['M2025','2026']" class="toc-period-play-class"
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
        <div v-for="season_id_set in [['PCJ3']]" class="toc-period-play-class"
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

    <div v-if="isPopCulture() && gameData && teamData">
      <div class="toc-period section">
        <div class="toc-period-header bg-primary text-white">Recent Games
        </div>
        <div>
          <div class="container game-listing">
            <div v-for="game in gameDataSorted.slice(0, 10)" class="row">
              <div class="col-5">
                <div class="row">
                  <div class="col-md-7">
                    <a :href="'game.html?game_id=' + game.game_id">Season {{ seasonDisplayId(game.season_id) }} Game {{ game.game_in_season }}</a>
                  </div>
                  <div class="col-md-5">
                    {{ dateFormat(game.airdate) }}
                  </div>
                </div>
              </div>
              <div class="col-7">
                <div class="row">
                  <div class="col-md" v-for="team_id in [game.podium_1_team_id, game.podium_2_team_id, game.podium_3_team_id]">
                    <a :href="'/team.html?team_id=' + team_id">{{ teamData.get(team_id).name }}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
  <Footer />
</template>

<style lang="scss" scoped>
@import "../node_modules/bootstrap/scss/functions";
@import "../node_modules/bootstrap/scss/variables";
@import "../node_modules/bootstrap/scss/mixins";

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

.game-listing {
  text-align: center;

  > .row {
    margin-bottom: 0.5em;
  }

  @include media-breakpoint-down(lg) {
    font-size: 12px;
  }
}

.competition-contestant-links {
  @include media-breakpoint-down(lg) {
    font-size: 12px;
  }
}

</style>
