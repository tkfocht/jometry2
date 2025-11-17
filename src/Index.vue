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

var scc2026CidsWeek1 = [8613, 8625, 8639, 8648, 8897, 8903, 8975, 9003, 9014]
var scc2026CidsWeek2 = [8385, 8616, 8636, 8669, 8672, 8708, 8891, 9072, 9077]
var scc2026CidsWeek3 = [8400, 8582, 8609, 8660, 8678, 8706, 8876, 8882, 8952]

var cwc2026Cids = [8366, 8790, 8583, 8928, 8360, 8868, 9024, 8799, 8976, 8604, 8579, 8940]

var toc2026Cids = [8874, 8391, 8942, 8646, 8670, 8607, 8690, 8991, 8591, 9075, 8963, 8624, 8375, 8814, 9030, 8747, 8637, 9053]

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
      <div class="alert alert-primary" role="alert" v-if="isSyndicated()">
        Games from November 11 to November 14, 2025, have been placed into the qualification
        periods for both the 2026 and 2027 Tournaments of Champions.
      </div>

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
        <div class="toc-period-header bg-primary text-white">2025-26 Second Chance Competition Contestants</div>
        <div class="competition-summary-links"><a :href="'/period.html?toc_period=2026&play_classification=regular&contestants=' + scc2026CidsWeek1.join(',')">Week 1 Competitor Statistical Summary</a></div>
        <div class="competition-contestant-links">
          <div class="competition-contestant-link" v-for="contestant_id in scc2026CidsWeek1">
            <a :href="'/contestant.html?contestant_id=' + contestant_id">{{ contestantData.get(contestant_id).name }}</a>
          </div>
        </div>
        <div class="competition-summary-links"><a :href="'/period.html?toc_period=2026&play_classification=regular&contestants=' + scc2026CidsWeek2.join(',')">Week 2 Competitor Statistical Summary</a></div>
        <div class="competition-contestant-links">
          <div class="competition-contestant-link" v-for="contestant_id in scc2026CidsWeek2">
            <a :href="'/contestant.html?contestant_id=' + contestant_id">{{ contestantData.get(contestant_id).name }}</a>
          </div>
        </div>
        <div class="competition-summary-links"><a :href="'/period.html?toc_period=2026&play_classification=regular&contestants=' + scc2026CidsWeek3.join(',')">Week 3 Competitor Statistical Summary</a></div>
        <div class="competition-contestant-links">
          <div class="competition-contestant-link" v-for="contestant_id in scc2026CidsWeek3">
            <a :href="'/contestant.html?contestant_id=' + contestant_id">{{ contestantData.get(contestant_id).name }}</a>
          </div>
        </div>
      </div>
      <div class="toc-period section">
        <div class="toc-period-header bg-primary text-white">2026 Champions Wildcard Contestants</div>
        <div class="competition-summary-links"><a :href="'/period.html?toc_period=2026&play_classification=regular&contestants=' + cwc2026Cids.join(',')">Competitor Statistical Summary</a></div>
        <div class="competition-contestant-links">
          <div class="competition-contestant-link" v-for="contestant_id in cwc2026Cids">
            <a :href="'/contestant.html?contestant_id=' + contestant_id">{{ contestantData.get(contestant_id).name }}</a>
          </div>
          <div class="competition-contestant-link">
            +3 SCC champions
          </div>
        </div>
      </div>
      <div class="toc-period section">
        <div class="toc-period-header bg-primary text-white">2026 Tournament of Champions Contestants</div>
        <div class="competition-summary-links"><a :href="'/period.html?toc_period=2026&play_classification=regular&contestants=' + toc2026Cids.join(',')">Regular Play Competitor Statistical Summary</a></div>
        <div class="competition-contestant-links">
          <div class="competition-contestant-link" v-for="contestant_id in toc2026Cids">
            <a :href="'/contestant.html?contestant_id=' + contestant_id">{{ contestantData.get(contestant_id).name }}</a>
          </div>
          <div class="competition-contestant-link" v-for="contestant_id in [5417, 8442]">
            <a :href="'/contestant.html?contestant_id=' + contestant_id">{{ contestantData.get(contestant_id).name }}</a>
          </div>
          <div class="competition-contestant-link">
            +1 CWC champion
          </div>
        </div>
      </div>
      <div class="toc-period section">
        <div class="toc-period-header bg-primary text-white">Current Qualification Periods and Season
        </div>
        <div v-for="tocPeriod in ['2026', '2027']" class="toc-period-play-class"
            :set1="tocPeriodGames = gameDataSorted.filter(g => g.toc_period === tocPeriod || g.toc_period_2 === tocPeriod)"
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
        <div v-for="season_id_set in [['42']]" class="toc-period-play-class"
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
