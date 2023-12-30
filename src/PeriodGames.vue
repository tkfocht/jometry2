<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { movingAverageOfLast, dateFormat, transformValues, threeColorSet } from '@/util'
import { playClassificationName } from '@/configuration'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as data from '@/data'
import * as gsAttributes from '@/gameStatAttributes'
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
const gameStatData = data.computedIfRefHasValues([data.gameStatData, gameIds], (gsData, gIds) => gsData.filter(gs => gIds.includes(gs.game_id)))
const gameStatDataById = data.computedIfRefHasValue(gameStatData, gsData => d3.index(gsData, gs => gs.game_id))


//Tables
const tableSpec = data.computedIfRefHasValues(
  [gameData, contestantDataById, gameStatDataById],
  (gData, cData, gsDataById) => {
    const statAttrs = [
      gsAttributes.att_value_total,
      gsAttributes.coryat_score_total,
      gsAttributes.coryat_positive_score_total,
      gsAttributes.contention
    ]

    var columns = [
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
    columns = columns.concat(statAttrs.map(attr => ({
      label: attr.short_label,
      description: attr.description
    })))

    const rows = gData.map(g => {
      const gsData = gsDataById.get(g.game_id)

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

      row = row.concat(statAttrs.map(attr => ({
        value: attr.valueDisplayFormat(attr.generatingFunction(gsData)),
        sortValue: attr.generatingFunction(gsData)
      })))

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