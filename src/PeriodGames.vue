<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { movingAverageOfLast, dateFormat, transformValues, threeColorSet } from '@/util'
import { playClassificationName } from '@/configuration'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as data from '@/data'
import * as gsAttributes from '@/gameStatAttributes'
import * as gcsAttributes from '@/gameContestantStatAttributes'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'
import SortableTable from './components/util/SortableTable.vue'
import { formatDate } from 'plotly.js-dist'

let urlParams = new URLSearchParams(window.location.search);

data.loadContestantData()
data.loadGameData()
data.loadGameStatData()
data.loadGameContestantStatData()
data.loadGameRoundContestantStatData()

const seasonSearchParameters = ref(urlParams.get('season') ? urlParams.get('season').split(',') : [])
const tocPeriodSearchParameters = ref(urlParams.get('toc_period') ? urlParams.get('toc_period').split(',') : [])
const playClassificationSearchParameters = ref(urlParams.get('play_classification') ? urlParams.get('play_classification').split(',') : [])

const winThresholdString = ref(urlParams.get('win_threshold'))
const winLimitString = ref(urlParams.get('win_limit'))
const graphDisplayLimitString = ref(urlParams.get('graph_display_limit'))
const displayContestantIdParameters = ref(urlParams.get('contestants') ? urlParams.get('contestants').split(',') : [])

const displayRounds = ref(2)

const queryString = computed(() => {
  var queryStr = ''
  if (seasonSearchParameters.value.length > 0) {
    queryStr += '&season=' + seasonSearchParameters.value.join(',')
  }
  if (tocPeriodSearchParameters.value.length > 0) {
    queryStr += '&toc_period=' + tocPeriodSearchParameters.value.join(',')
  }
  if (playClassificationSearchParameters.value.length > 0) {
    queryStr += '&play_classification=' + playClassificationSearchParameters.value.join(',')
  }
  if (winThresholdString.value !== null) {
    queryStr += '&win_threshold=' + winThresholdString.value
  }
  if (winLimitString.value !== null) {
    queryStr += '&win_limit=' + winLimitString.value
  }
  if (graphDisplayLimitString.value !== null) {
    queryStr += '&graph_display_limit=' + graphDisplayLimitString.value
  }
  if (displayContestantIdParameters.value.length > 0) {
    queryStr += '&contestants=' + displayContestantIdParameters.value.join(',')
  }
  if (queryStr === '') return queryStr
  return '?' + queryStr.substring(1)
})

onMounted(() => {
  window.history.replaceState(null, null, queryString.value );
})

watch(() => queryString, (newValue, oldValue) => {
  window.history.replaceState(null, null, queryString.value );
}, { deep: true })

const gameFilter = computed(() => {
  const satisfiesSeason = seasonSearchParameters.value.length === 0 ? 
    d => true :
    d => seasonSearchParameters.value.includes(d.season_id)
  const satisfiesTocPeriod = tocPeriodSearchParameters.value.length === 0 ? 
    d => true :
    d => tocPeriodSearchParameters.value.includes(d.toc_period)
  const satisfiesPlayClassification = playClassificationSearchParameters.value.length === 0 ? 
    d => true :
    d => playClassificationSearchParameters.value.includes(d.play_classification)
  return d => satisfiesSeason(d) && satisfiesTocPeriod(d) && satisfiesPlayClassification(d)
})
const gameData = data.computedIfRefHasValue(data.gameData, gData => gData.filter(gameFilter.value))
const gameDataById = data.computedIfRefHasValue(gameData, gData => d3.index(gData, g => g.game_id))
const gameIds = data.computedIfRefHasValue(gameData, gData => gData.map(g => g.game_id))
const contestantDataById = data.contestantDataById
const contestantIds = data.computedIfRefHasValue(gameData, gData => [...new Set(gData.flatMap(g => [g.podium_1_contestant_id, g.podium_2_contestant_id, g.podium_3_contestant_id]))])
const gameStatData = data.computedIfRefHasValues([data.gameStatData, gameIds], (gsData, gIds) => gsData.filter(gs => gIds.includes(gs.game_id)))
const gameStatDataById = data.computedIfRefHasValue(gameStatData, gsData => d3.index(gsData, gs => gs.game_id))
const gameContestantStatData = data.computedIfRefHasValues([data.gameContestantStatData, gameIds], (gcsData, gIds) => gcsData.filter(gs => gIds.includes(gs.game_id)))
const gameContestantStatDataByGameId = data.computedIfRefHasValue(gameContestantStatData, gcsData => d3.group(gcsData, gcs => gcs.game_id))
const gameContestantStatDataByContestantId = data.computedIfRefHasValue(gameContestantStatData, gcsData => d3.group(gcsData, gcs => gcs.contestant_id))
const gameContestantStatDataByGameIdAndContestantId = data.computedIfRefHasValue(gameContestantStatData, gcsData => d3.index(gcsData, gcs => gcs.game_id, gcs => gcs.contestant_id))
const gameRoundContestantStatDataByRoundIdContestantId = data.computedIfRefHasValues(
    [data.gameRoundContestantStatData, gameIds],
    (gcsData, gIds) => d3.group(gcsData.filter(gr => gIds.includes(gr.game_id)), r => r.round_of_game, r => r.contestant_id))

const contestantWins = data.computedIfRefHasValue(gameData, gData => d3.rollup(gData, v => v.length, g => g.winning_contestant_id))
const contestantWinnings = data.computedIfRefHasValues([gameData, gameContestantStatDataByGameIdAndContestantId], (gData, gcsData) => {
  const aggregateWinnings = function(games) {
    return games.map(g => gcsData.get(g.game_id).get(g.winning_contestant_id).score).reduce((a, b) => a + b, 0)
  }
  return d3.rollup(gData, aggregateWinnings, g => g.winning_contestant_id)
})
const contestantTotalScores = data.computedIfRefHasValue(gameContestantStatData, gcsData => {
  return d3.rollup(gcsData, v => v.map(gcs => gcs.score).reduce((a, b) => a + b, 0), g => g.contestant_id)
})
const contestantSort = data.computedIfRefHasValues(
  [contestantWins, contestantWinnings, contestantTotalScores],
  (wins, winnings, totalScores) => (
    (a, b) =>
      d3.descending(_.defaultTo(wins.get(a), 0), _.defaultTo(wins.get(b), 0)) ||
      d3.descending(_.defaultTo(winnings.get(a), 0), _.defaultTo(winnings.get(b), 0)) ||
      d3.descending(_.defaultTo(totalScores.get(a), 0), _.defaultTo(totalScores.get(b), 0))))
const displayContestantIds = data.computedIfRefHasValues(
  [displayContestantIdParameters, contestantIds, contestantSort, contestantWins],
  (dcIdParameters, cids, cSort, wins) => {
    if (dcIdParameters.length > 0) {
      return dcIdParameters.map(v => +v)
    }
    cids.sort(cSort)
    if (cids.length <= 10) {
      return cids
    }
    var winThreshold = winThresholdString.value ? +winThresholdString.value : Math.max(Math.min((wins.get(cids[9]) ? wins.get(cids[9]) : 0), 4), cids.length > 21 ? 1 + (wins.get(cids[20]) ? wins.get(cids[20]) : 0) : 0)
    //Okay fine, if anyone ever wins 10001 games this will be a bug,
    //but truthy values are weird when winLimit=0 is a primary case
    var winLimit = winLimitString.value ? +winLimitString.value : 10000
    return cids.filter(i => {
      var cwin = wins.get(i)
      if (cwin === undefined) cwin = 0
      return cwin >= winThreshold && cwin <= winLimit
    })
  })
const displayContestantGameContestantStatData = data.computedIfRefHasValues(
  [displayContestantIds, gameContestantStatData],
  (dCids, gcsData) => gcsData.filter(gcs => dCids.includes(gcs.contestant_id))
)
const winnerContestantGameContestantStatData = data.computedIfRefHasValues(
  [gameDataById, gameContestantStatData],
  (gData, gcsData) => gcsData.filter(gcs => gData.get(gcs.game_id).winning_contestant_id === gcs.contestant_id)
)
const graphDisplayLimit = ref(graphDisplayLimitString.value ? +graphDisplayLimitString.value : undefined)




//Tables
const tableSpec = data.computedIfRefHasValues(
  [gameData, contestantDataById],
  (gData, cData) => {
    const columns = [
      {
        label: 'Game/Date'
      },
      {
        label: 'Podium 1'
      },
      {
        label: 'Podium 2'
      },
      {
        label: 'Podium 3'
      },
      {
        label: 'Play Class'
      }
    ]

    const rows = gData.map(g => {
      var row = [
        {
          value: '<a href="/game.html?game_id=' + g.game_id + '">' + g.season_id + '-' + g.game_in_season + '</a> ' + dateFormat(g.airdate),
          sortValue: g.airdate
        },
        {
          value: cData.get(g.podium_1_contestant_id).name,
          sortValue: cData.get(g.podium_1_contestant_id).name
        },
        {
          value: cData.get(g.podium_2_contestant_id).name,
          sortValue: cData.get(g.podium_2_contestant_id).name
        },
        {
          value: cData.get(g.podium_3_contestant_id).name,
          sortValue: cData.get(g.podium_3_contestant_id).name
        },
        {
          value: playClassificationName(g.play_classification, g.season_id),
          sortValue:  playClassificationName(g.play_classification, g.season_id)
        }
      ]
      return row
    })

    return {
      columns: columns,
      rows: rows,
      footerRows: [],
      initialSortColumnIndex: 0,
      initialSortDescending: true
    }
  })


</script>

<template>
  <Header />
  <div class="component-body">
    <SortableTable v-if="tableSpec" v-bind="tableSpec" />
  </div>
  <Footer />
</template>

<style scoped>



</style>
