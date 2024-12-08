<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { dateFormat, subdomainIdentifier, isSyndicated, isPopCulture } from '@/util'
import * as configuration from '@/configuration'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as data from '@/data'
import * as gsAttributes from '@/gameStatAttributes'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'
import SearchFilterDropdown from './components/util/SearchFilterDropdown.vue'
import SortableTable from './components/util/SortableTable.vue'
import { formatDate } from 'plotly.js-dist'

let urlParams = new URLSearchParams(window.location.search);

data.loadContestantData()
if (isPopCulture()) {
  data.loadTeamData()
}
data.loadGameData()
data.loadGameStatData()

const searchSeasonIds = isPopCulture() ? configuration.popCultureSeasonIds : configuration.seasonIds
const searchTocPeriodIds = isPopCulture() ? configuration.popCultureTocPeriodIds : configuration.tocPeriodIds
const searchPlayClassifications = isPopCulture() ? configuration.popCulturePlayClassifications : configuration.playClassifications

const seasonSearchSelectedIndices = ref(
  urlParams.get('season') ?
  urlParams.get('season').split(',')
    .map(sid => searchSeasonIds.indexOf(sid))
    .filter(s_idx => s_idx >= 0)
    .sort(d3.ascending) :
  []
)
const seasonSearchParameters = data.computedIfRefHasValue(
  seasonSearchSelectedIndices,
  idxs => idxs.map(idx => searchSeasonIds[idx])
)
const tocPeriodSelectedIndices = ref(
  urlParams.get('toc_period') ?
  urlParams.get('toc_period').split(',')
    .map(tid => searchTocPeriodIds.indexOf(tid))
    .filter(t_idx => t_idx >= 0)
    .sort(d3.ascending) :
  []
)
const tocPeriodSearchParameters = data.computedIfRefHasValue(
  tocPeriodSelectedIndices,
  idxs => idxs.map(idx => searchTocPeriodIds[idx])
)
const playClassificationSelectedIndices = ref(
  urlParams.get('play_classification') ?
  urlParams.get('play_classification').split(',')
    .map(tid => searchPlayClassifications.indexOf(tid))
    .filter(t_idx => t_idx >= 0)
    .sort(d3.ascending) :
  []
)
const playClassificationSearchParameters = data.computedIfRefHasValue(
  playClassificationSelectedIndices,
  idxs => idxs.map(idx => searchPlayClassifications[idx])
)

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
const teamDataById = data.teamDataById
const gameStatData = data.computedIfRefHasValues([data.gameStatData, gameIds], (gsData, gIds) => gsData.filter(gs => gIds.includes(gs.game_id)))
const gameStatDataById = data.computedIfRefHasValue(gameStatData, gsData => d3.index(gsData, gs => gs.game_id))
const anyGameHasAttemptData = data.computedIfRefHasValue(gameStatData, gsData => {
  return gsData.some(gs => gs.att_total > 0)
})


//Tables
const tableSpec = data.computedIfRefHasValues(
  [gameData, isPopCulture() ? teamDataById : contestantDataById, gameStatDataById, anyGameHasAttemptData],
  (gData, cData, gsDataById, hasAttempt) => {
    const allStatAttrs = [
      gsAttributes.att_value_total,
      gsAttributes.coryat_score_total,
      gsAttributes.coryat_positive_score_total,
      gsAttributes.contention
    ]

    const statAttrs = hasAttempt ?
      allStatAttrs :
      allStatAttrs.filter(attr => !attr.requiresAttemptData)

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
        label: 'ToC Period'
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

      var row = isSyndicated() ? [
        {
          value: '<a href="/game.html?game_id=' + g.game_id + '">' + configuration.seasonDisplayId(g.season_id) + '-' + g.game_in_season + '</a> <span class="date" style="white-space: nowrap">' + dateFormat(g.airdate) + '</span>',
          sortValue: g.airdate
        },
        {
          value: '<a href="/contestant.html?contestant_id=' + g.podium_1_contestant_id + '">' + cData.get(g.podium_1_contestant_id).name + '</a>',
          sortValue: cData.get(g.podium_1_contestant_id).name
        },
        {
          value: '<a href="/contestant.html?contestant_id=' + g.podium_2_contestant_id + '">' + cData.get(g.podium_2_contestant_id).name + '</a>',
          sortValue: cData.get(g.podium_2_contestant_id).name
        },
        {
          value: '<a href="/contestant.html?contestant_id=' + g.podium_3_contestant_id + '">' + cData.get(g.podium_3_contestant_id).name + '</a>',
          sortValue: cData.get(g.podium_3_contestant_id).name
        },
        {
          value: g.toc_period,
          sortValue: g.toc_period
        },
        {
          value: configuration.playClassificationName(g.play_classification, g.season_id),
          sortValue: configuration.playClassificationName(g.play_classification, g.season_id)
        }
      ] : [
        {
          value: '<a href="/game.html?game_id=' + g.game_id + '">' + configuration.seasonDisplayId(g.season_id) + '-' + g.game_in_season + '</a> <span class="date" style="white-space: nowrap">' + dateFormat(g.airdate) + '</span>',
          sortValue: g.airdate
        },
        {
          value: '<a href="/team.html?team_id=' + g.podium_1_team_id + '">' + cData.get(g.podium_1_team_id).name + '</a>',
          sortValue: cData.get(g.podium_1_team_id).name
        },
        {
          value: '<a href="/team.html?team_id=' + g.podium_2_team_id + '">' + cData.get(g.podium_2_team_id).name + '</a>',
          sortValue: cData.get(g.podium_2_team_id).name
        },
        {
          value: '<a href="/team.html?team_id=' + g.podium_3_team_id + '">' + cData.get(g.podium_3_team_id).name + '</a>',
          sortValue: cData.get(g.podium_3_team_id).name
        },
        {
          value: g.toc_period,
          sortValue: g.toc_period
        },
        {
          value: configuration.playClassificationName(g.play_classification, g.season_id),
          sortValue: configuration.playClassificationName(g.play_classification, g.season_id)
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
  <div class="component-body" :data-bs-theme="subdomainIdentifier()">
    <h1>
      <span v-if="tocPeriodSearchParameters && tocPeriodSearchParameters.length > 0">{{ tocPeriodSearchParameters.join(', ') }} TOC Period<span v-if="tocPeriodSearchParameters.length > 1">s</span>&nbsp;</span>
      <span v-if="seasonSearchParameters && seasonSearchParameters.length > 0">Season<span v-if="seasonSearchParameters.length > 1">s</span> {{ seasonSearchParameters.map(configuration.seasonDisplayId).join(', ') }}&nbsp;</span>
      <span v-if="playClassificationSearchParameters && playClassificationSearchParameters.length > 0">{{ d3.map(playClassificationSearchParameters, p => configuration.playClassificationGenericName(p)).join(", ") }}&nbsp;</span>Games
    </h1>
    <div id="search-filters">
      <SearchFilterDropdown
        :optionLabels="searchSeasonIds.map(configuration.seasonDisplayId)"
        :selectedIndices="seasonSearchSelectedIndices"
        :label="'Seasons'"
        @updateSelectionIndices="(idxs) => seasonSearchSelectedIndices = idxs"
      />
      <SearchFilterDropdown
        :optionLabels="searchTocPeriodIds"
        :selectedIndices="tocPeriodSelectedIndices"
        :label="'TOC Periods'"
        @updateSelectionIndices="(idxs) => tocPeriodSelectedIndices = idxs"
      />
      <SearchFilterDropdown
        :optionLabels="searchPlayClassifications.map(configuration.playClassificationGenericName)"
        :selectedIndices="playClassificationSelectedIndices"
        :label="'Play Classifications'"
        @updateSelectionIndices="(idxs) => playClassificationSelectedIndices = idxs"
      />
    </div>
    <div>
      <a :href="'/period.html' + queryString">Statistical Summary</a>
    </div>
    <div class="section">
      <SortableTable v-if="tableSpec" v-bind="tableSpec" />
    </div>
  </div>
  <Footer />
</template>

<style lang="scss" scoped>

.section :deep(table) {
  width: 100%;
}

.component-body {
  margin-bottom: 1em;
}

#search-filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  margin-bottom: 0.5em;
}

</style>
