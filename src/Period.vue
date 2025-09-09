<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { movingAverageOfLast, dateFormat, transformValues, urlDateParse,
  roundAbbreviation, subdomainIdentifier, isPopCulture, isSyndicated, initializeString,
  teamIdToContestantIdMapFromGameData, contestantIdToTeamIdMapFromGameData } from '@/util'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as configuration from '@/configuration'
import * as data from '@/data'
import * as gsAttributes from '@/gameStatAttributes'
import * as gcsAttributes from '@/gameContestantStatAttributes'
import * as periodUtil from '@/periodUtil'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'
import BoxWhiskerChart from './components/util/BoxWhiskerChart.vue'
import LineChart from './components/util/LineChart.vue'
import OptionDropdown from './components/util/OptionDropdown.vue'
import ReactiveChart from './components/util/ReactiveChart.vue'
import ScatterHistogram from './components/util/ScatterHistogram.vue'
import SearchFilterDropdown from './components/util/SearchFilterDropdown.vue'
import SortableTable from './components/util/SortableTable.vue'
import StackValueBarChart from './components/util/StackValueBarChart.vue'

let urlParams = new URLSearchParams(window.location.search);

data.loadContestantData()
if (isPopCulture()) {
  data.loadTeamData()
  data.loadGameTeamStatData()
  data.loadGameRoundTeamStatData()
  data.loadGameTriplePlayData()
}
data.loadGameData()
data.loadGameStatData()
data.loadGameContestantStatData()
data.loadGameRoundContestantStatData()
data.loadGameDailyDoubleData()

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

const minDateString = ref(urlParams.get('min_date'))
const maxDateString = ref(urlParams.get('max_date'))

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
  if (minDateString.value !== null) {
    queryStr += '&min_date=' + minDateString.value
  }
  if (maxDateString.value !== null) {
    queryStr += '&max_date=' + maxDateString.value
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
    d => tocPeriodSearchParameters.value.includes(d.toc_period) ||  tocPeriodSearchParameters.value.includes(d.toc_period_2 ? d.toc_period_2.toString() : undefined)
  const satisfiesPlayClassification = playClassificationSearchParameters.value.length === 0 ? 
    d => true :
    d => playClassificationSearchParameters.value.includes(d.play_classification)
  const satisfiesMinDate = minDateString.value === null ?
    d => true :
    d => d.airdate >= urlDateParse(minDateString.value)
  const satisfiesMaxDate = maxDateString.value === null ?
    d => true :
    d => d.airdate <= urlDateParse(maxDateString.value)
  return d => satisfiesSeason(d) && satisfiesTocPeriod(d) && satisfiesPlayClassification(d) && satisfiesMinDate(d) && satisfiesMaxDate(d)
})
const gameData = data.computedIfRefHasValue(data.gameData, gData => gData.filter(gameFilter.value))

const displayRounds = data.computedIfRefHasValue(gameData,
  gData => gData.every(g => g.play_classification === 'celebrity') ? 3 : 2)


const gameDataById = data.computedIfRefHasValue(gameData, gData => d3.index(gData, g => g.game_id))
const gameIds = data.computedIfRefHasValue(gameData, gData => gData.map(g => g.game_id))
const contestantDataById = data.contestantDataById
const teamDataById = data.teamDataById
const contestantIds = data.computedIfRefHasValue(
  gameData,
  gData => [...new Set(gData.flatMap(g => [
    g.podium_1_contestant_id, g.podium_2_contestant_id, g.podium_3_contestant_id,
    g.podium_1_1_contestant_id, g.podium_1_2_contestant_id, g.podium_1_3_contestant_id,
    g.podium_2_1_contestant_id, g.podium_2_2_contestant_id, g.podium_2_3_contestant_id,
    g.podium_3_1_contestant_id, g.podium_3_2_contestant_id, g.podium_3_3_contestant_id,
  ]))].filter(cid => !_.isNil(cid)))
const gameStatData = data.computedIfRefHasValues([data.gameStatData, gameIds], (gsData, gIds) => gsData.filter(gs => gIds.includes(gs.game_id)))
const gameStatDataById = data.computedIfRefHasValue(gameStatData, gsData => d3.index(gsData, gs => gs.game_id))
const gameContestantStatData = data.computedIfRefHasValues([data.gameContestantStatData, gameIds], (gcsData, gIds) => gcsData.filter(gs => gIds.includes(gs.game_id)))
const gameContestantStatDataByGameId = data.computedIfRefHasValue(gameContestantStatData, gcsData => d3.group(gcsData, gcs => gcs.game_id))
const gameContestantStatDataByContestantId = data.computedIfRefHasValue(gameContestantStatData, gcsData => d3.group(gcsData, gcs => gcs.contestant_id))
const gameContestantStatDataByGameIdAndContestantId = data.computedIfRefHasValue(gameContestantStatData, gcsData => d3.index(gcsData, gcs => gcs.game_id, gcs => gcs.contestant_id))
const gameRoundContestantStatDataByRoundIdContestantId = data.computedIfRefHasValues(
    [data.gameRoundContestantStatData, gameIds],
    (gcsData, gIds) => d3.group(gcsData.filter(gr => gIds.includes(gr.game_id)), r => r.round_of_game, r => r.contestant_id))
const gameDailyDoubleData = data.computedIfRefHasValues(
    [data.gameDailyDoubleData, gameIds],
    (gddData, gIds) => {
      return gddData.filter(gdd => gIds.includes(gdd.game_id))
    }
)
const gameTriplePlayData = data.computedIfRefHasValues(
    [data.gameTriplePlayData, gameIds],
    (gddData, gIds) => {
      return gddData.filter(gdd => gIds.includes(gdd.game_id))
    }
)

const teamIds = data.computedIfRefHasValue(gameData, gData => [...new Set(gData.flatMap(g => [g.podium_1_team_id, g.podium_2_team_id, g.podium_3_team_id]))])
const gameTeamStatData = data.computedIfRefHasValues([data.gameTeamStatData, gameIds], (gcsData, gIds) => gcsData.filter(gs => gIds.includes(gs.game_id)))
const gameTeamStatDataByTeamId = data.computedIfRefHasValue(gameTeamStatData, gcsData => d3.group(gcsData, gcs => gcs.team_id))
const gameTeamStatDataByGameIdAndTeamId = data.computedIfRefHasValue(gameTeamStatData, gcsData => d3.group(gcsData, gcs => gcs.game_id, gcs => gcs.team_id))
const gameRoundTeamStatDataByRoundIdTeamId = data.computedIfRefHasValues(
    [data.gameRoundTeamStatData, gameIds],
    (gcsData, gIds) => d3.group(gcsData.filter(gr => gIds.includes(gr.game_id)), r => r.round_of_game, r => r.team_id))

const teamIdToContestantIdMap = teamIdToContestantIdMapFromGameData(gameData)
const contestantIdToTeamIdMap = contestantIdToTeamIdMapFromGameData(gameData)

const summaryDataConstructed = periodUtil.summaryDataConstructor(
  gameData,
  isPopCulture() ?
    g => {
      if (g.winning_team_id === g.podium_1_team_id) {
        return [g.podium_1_1_contestant_id, g.podium_1_2_contestant_id, g.podium_1_3_contestant_id]
      }
      if (g.winning_team_id === g.podium_2_team_id) {
        return [g.podium_2_1_contestant_id, g.podium_2_2_contestant_id, g.podium_2_3_contestant_id]
      }
      if (g.winning_team_id === g.podium_3_team_id) {
        return [g.podium_3_1_contestant_id, g.podium_3_2_contestant_id, g.podium_3_3_contestant_id]
      }
    } :
    g => [g.winning_contestant_id],
  gameContestantStatDataByGameIdAndContestantId,
  gameContestantStatData,
  gcs => gcs.contestant_id,
  displayContestantIdParameters,
  contestantIds,
  gameDataById,
  graphDisplayLimitString,
  winThresholdString,
  winLimitString
);
const teamSummaryDataConstructed = periodUtil.summaryDataConstructor(
  gameData,
  g => [g.winning_team_id],
  gameTeamStatDataByGameIdAndTeamId,
  gameTeamStatData,
  gcs => gcs.team_id,
  displayContestantIdParameters,
  teamIds,
  gameDataById,
  graphDisplayLimitString,
  winThresholdString,
  winLimitString
);

const displayContestantGameContestantStatData = summaryDataConstructed.displayCompetitorGameCompetitorStatData
const displayContestantIds = summaryDataConstructed.displayCompetitorIds
const contestantSort = summaryDataConstructed.competitorSort
const contestantWins = summaryDataConstructed.competitorWins
const winnerContestantGameContestantStatData = summaryDataConstructed.winnerCompetitorGameCompetitorStatData
const graphDisplayLimit = summaryDataConstructed.graphDisplayLimit

const displayTeamGameTeamStatData = teamSummaryDataConstructed.displayCompetitorGameCompetitorStatData
const displayTeamIds = teamSummaryDataConstructed.displayCompetitorIds
const teamSort = teamSummaryDataConstructed.competitorSort
const teamWins = teamSummaryDataConstructed.competitorWins
const winnerTeamGameTeamStatData = teamSummaryDataConstructed.winnerCompetitorGameCompetitorStatData
const teamGraphDisplayLimit = teamSummaryDataConstructed.graphDisplayLimit


const anyGameHasAttemptData = data.computedIfRefHasValue(
  displayContestantGameContestantStatData,
  (dcgcsData) => {
    return dcgcsData.some(gcsData => !_.isNil(gcsData.att))
  }
)
const everyGameHasAttemptData = data.computedIfRefHasValue(
  displayContestantGameContestantStatData,
  (dcgcsData) => {
    return dcgcsData.every(gcsData => !_.isNil(gcsData.att))
  }
)

const colorSet = computed(() => {
  if (!displayContestantIds.value) return undefined
  return d3.scaleOrdinal()
    .domain(displayContestantIds.value)
    .range(d3.schemeCategory10.concat(d3.schemeDark2).concat(d3.schemeAccent))
})

const teamColorSet = computed(() => {
  if (!displayTeamIds.value) return undefined
  return d3.scaleOrdinal()
    .domain(displayTeamIds.value)
    .range(d3.schemeCategory10.concat(d3.schemeDark2).concat(d3.schemeAccent))
})

const color = computed(() => {
  return cid => {
    if (displayContestantIds.value && displayContestantIds.value.includes(cid)) {
      return colorSet.value(cid);
    } else {
      return "black";
    }
  }
})

const teamColor = computed(() => {
  return cid => {
    if (displayTeamIds.value && displayTeamIds.value.includes(cid)) {
      return teamColorSet.value(cid);
    } else {
      return "black";
    }
  }
})

const teamContestantColor = data.computedIfRefHasValues(
  [contestantIdToTeamIdMap, teamIdToContestantIdMap, teamColor],
  (cToT, tToC, tColor) => (cid => {
    const teamId = cToT.get(cid)[0]
    const contestant_idx = tToC.get(teamId).indexOf(cid)
    const teamColorValue = tColor(teamId)
    var contestantColorValue = teamColorValue
    if (contestant_idx == 0) contestantColorValue = d3.color(contestantColorValue).darker(0.7)
    if (contestant_idx == 1) contestantColorValue = d3.color(contestantColorValue).brighter(0.5)
    if (contestant_idx == 2) contestantColorValue = d3.color(contestantColorValue).brighter(1.0)
    return contestantColorValue
  })
)

function contestantLink (contestant_id, contestant_name) {
  return '<span style="color: ' + 
    color.value(contestant_id) + 
    '">&#9632;</span>&nbsp;<a href="/contestant.html?contestant_id=' + 
    contestant_id + 
    '">' + contestant_name + '</a>'
}

function teamLink (contestant_id, contestant_name) {
  return '<span style="color: ' + 
    teamColor.value(contestant_id) + 
    '">&#9632;</span>&nbsp;<a href="/team.html?team_id=' + 
    contestant_id + 
    '">' + contestant_name + '</a>'
}

function teamContestantLink (contestant_id, contestant_name) {
  return '<span style="color: ' + 
    teamContestantColor.value(contestant_id) + 
    '">&#9632;</span>&nbsp;<a href="/contestant.html?contestant_id=' + 
    contestant_id + 
    '">' + contestant_name + '</a> (' + teamDataById.value.get(contestantIdToTeamIdMap.value.get(contestant_id)[0]).name + ')'
}

const contestantGraphLabel = data.computedIfRefHasValue(contestantDataById, cData => (
  cid => cData.get(cid).name
))

const teamGraphLabel = data.computedIfRefHasValue(teamDataById, cData => (
  cid => cData.get(cid).name
))

const teamContestantGraphLabel = data.computedIfRefHasValues(
  [contestantDataById, teamDataById, contestantIdToTeamIdMap],
  (cData, tData, cToTMap) => (
    cid => {
      return cData.get(cid).name + ' (' + cToTMap.get(cid).map(tid => initializeString(tData.get(tid).name)).join('/') + ')'
    }
  ))

//Tables
const roundOptionLabels = data.computedIfRefHasValue(displayRounds, dr => ['Full Game', 'J! Round', 'DJ! Round'].concat(dr >= 3 ? ['TJ! Round'] : []))
const selectedRoundIndex = ref(0)
const aggregationOptionLabels = ref(['Game Average', 'Total', 'Game Max', 'Game Median', 'Game Min'])
const selectedAggregationIndex = ref(0)

const buildBaseScoringTableData = function(rIdx, gcsDataByCId, grcsDataByRIdCId) {
  if (rIdx === 0) {
    return gcsDataByCId
  }
  return grcsDataByRIdCId.get(rIdx)
}

const standardBaseScoringTableData = data.computedIfRefHasValues(
  [selectedRoundIndex, gameContestantStatDataByContestantId, gameRoundContestantStatDataByRoundIdContestantId],
  (rIdx, gcsDataByCId, grcsDataByRIdCId) => buildBaseScoringTableData(rIdx, gcsDataByCId, grcsDataByRIdCId))
const teamBaseScoringTableData = data.computedIfRefHasValues(
  [selectedRoundIndex, gameTeamStatDataByTeamId, gameRoundTeamStatDataByRoundIdTeamId],
  (rIdx, gcsDataByCId, grcsDataByRIdCId) => buildBaseScoringTableData(rIdx, gcsDataByCId, grcsDataByRIdCId))

const baseScoringTableAggregation = data.computedIfRefHasValue(
  selectedAggregationIndex, idx => [d3.mean, d3.sum, d3.max, d3.median, d3.min][idx])
const baseScoringTableDisplayFunction = data.computedIfRefHasValue(
  selectedAggregationIndex, idx => [
    attrSpec => attrSpec.averageDisplayFormat,
    attrSpec => attrSpec.valueDisplayFormat,
    attrSpec => attrSpec.valueDisplayFormat,
    attrSpec => attrSpec.valueDisplayFormat,
    attrSpec => attrSpec.valueDisplayFormat][idx])

const buildBaseScoringTableRow = function(displayCompetitorIds, competitorSort, competitorWins, competitorLabel) {
  displayCompetitorIds.sort(competitorSort)
  return displayCompetitorIds.map((competitor_id, idx) => {
    const foundWins = competitorWins.get(competitor_id)
    const obj = {
      'wins': _.isNil(foundWins) ? 0 : foundWins,
      'ranking': displayCompetitorIds.length - idx - 1
    }
    obj[competitorLabel] = competitor_id
    return obj
  })
}
const standardBaseScoringTableRows = data.computedIfRefHasValues(
  [displayContestantIds, contestantSort, contestantWins],
  (cIds, cSort, cWins) => buildBaseScoringTableRow(cIds, cSort, cWins, 'contestant_id'))
const teamBaseScoringTableRows = data.computedIfRefHasValues(
  [displayTeamIds, teamSort, teamWins],
  (cIds, cSort, cWins) => buildBaseScoringTableRow(cIds, cSort, cWins, 'team_id'))

const teamSpecificationConstructor = periodUtil.constructSpecificationConstuctors(
  teamBaseScoringTableRows,
  gameDataById,
  teamDataById,
  teamBaseScoringTableData,
  baseScoringTableAggregation,
  baseScoringTableDisplayFunction,
  teamLink,
  row => row.team_id,
  g => g.winning_team_id,
  'Team'
)
const contestantSpecificationConstructor = periodUtil.constructSpecificationConstuctors(
  standardBaseScoringTableRows,
  gameDataById,
  contestantDataById,
  standardBaseScoringTableData,
  baseScoringTableAggregation,
  baseScoringTableDisplayFunction,
  isPopCulture() ? teamContestantLink : contestantLink,
  row => row.contestant_id,
  g => g.winning_contestant_id,
  'Contestant',
  !isPopCulture()
)


const standardScoringAttributes = [gcsAttributes.buz, gcsAttributes.buzc, gcsAttributes.buz_score, gcsAttributes.coryat_score,
  gcsAttributes.dd_found, gcsAttributes.dd_plus_buzc, gcsAttributes.dd_plus_selection, gcsAttributes.dd_score,
  gcsAttributes.fj_start_score, gcsAttributes.fj_score, gcsAttributes.fj_final_score]

const conversionScoringAttributes = [gcsAttributes.att, gcsAttributes.att_clue, gcsAttributes.buz,
    gcsAttributes.buz_percent, gcsAttributes.buzc, gcsAttributes.acc_percent, gcsAttributes.conversion_percent,
    gcsAttributes.time, gcsAttributes.timing_rating, gcsAttributes.solo]
    
const conversionValueScoringAttributes = [gcsAttributes.att_value, gcsAttributes.buz_value, gcsAttributes.buz_value_percent,
    gcsAttributes.buz_score, gcsAttributes.acc_value_percent, gcsAttributes.conversion_value_percent,
    gcsAttributes.time_value, gcsAttributes.time_score,
    gcsAttributes.solo_value, gcsAttributes.solo_score]

const slimConversionScoringAttributes = [gcsAttributes.buz, gcsAttributes.buzc,
    gcsAttributes.acc_percent, gcsAttributes.buz_value, gcsAttributes.buz_score, gcsAttributes.acc_value_percent]

const standardScoringTableSpec = contestantSpecificationConstructor.constructScoringTableSpecification(standardScoringAttributes)
const conversionScoringTableSpec = contestantSpecificationConstructor.constructScoringTableSpecification(conversionScoringAttributes)
const conversionValueScoringTableSpec = contestantSpecificationConstructor.constructScoringTableSpecification(conversionValueScoringAttributes)
const slimConversionScoringTableSpec = contestantSpecificationConstructor.constructScoringTableSpecification(slimConversionScoringAttributes)

const teamStandardScoringTableSpec = teamSpecificationConstructor.constructScoringTableSpecification(standardScoringAttributes)
const teamConversionScoringTableSpec = teamSpecificationConstructor.constructScoringTableSpecification(conversionScoringAttributes)
const teamConversionValueScoringTableSpec = teamSpecificationConstructor.constructScoringTableSpecification(conversionValueScoringAttributes)
const teamSlimConversionScoringTableSpec = teamSpecificationConstructor.constructScoringTableSpecification(slimConversionScoringAttributes)


//Stacked bars
const buildStackedBarSpecificationLambda = function(yAttrsInput, colorFn, tOrCLabel) {
  return (cids, cData, gcsData, displayGcsData, allGcsData, winGcsData, hasAttempt, nameLabelFn) => {
    const yAttrs = hasAttempt ? yAttrsInput.slice(0,3) : yAttrsInput.slice(0,2)
    const dataSet = cids.map(cid => ({
      contestant_id: cid,
      values: yAttrs.map(attr => d3.mean(gcsData.get(cid).map(attr.generatingFunction))),
      displayValues: yAttrs.map(attr => attr.averageDisplayFormat(d3.mean(gcsData.get(cid).map(attr.generatingFunction)))),
    }))
    const aggregateDataSet = [
      {
        label: 'Selected ' + tOrCLabel + ' avg',
        values: yAttrs.map(attr => d3.mean(displayGcsData.map(attr.generatingFunction))),
        displayValues: yAttrs.map(attr => attr.averageDisplayFormat(d3.mean(displayGcsData.map(attr.generatingFunction)))),
        color: 'black'
      },
      {
        label: 'Winner avg',
        values: yAttrs.map(attr => d3.mean(winGcsData.map(attr.generatingFunction))),
        displayValues: yAttrs.map(attr => attr.averageDisplayFormat(d3.mean(winGcsData.map(attr.generatingFunction)))),
        color: 'black'
      },
      {
        label: 'All ' + tOrCLabel + ' avg',
        values: yAttrs.map(attr => d3.mean(allGcsData.map(attr.generatingFunction))),
        displayValues: yAttrs.map(attr => attr.averageDisplayFormat(d3.mean(allGcsData.map(attr.generatingFunction)))),
        color: 'black'
      }
    ]
    return {
      data: dataSet,
      aggregateData: aggregateDataSet,
      xCoreLabelFunction: d => nameLabelFn(d.contestant_id),
      xGroupLabels: [],
      yFunctionGroups: [d3.range(0, yAttrs.length).map(i => (d => d.displayValues[i]))],
      colorFunction: d => colorFn.value(d.contestant_id),
      sortFunction: (a, b) => d3.descending(a.values[0], b.values[0]),
      displayLimit: graphDisplayLimit.value,
      yLabel: yAttrs.map(attr => attr.short_label).join(' -> '),
      title: null
    }
  }
}

const attemptBarChartSpecification = data.computedIfRefHasValues(
  [displayContestantIds, contestantDataById, gameContestantStatDataByContestantId,
    displayContestantGameContestantStatData, gameContestantStatData, winnerContestantGameContestantStatData, anyGameHasAttemptData,
    isPopCulture() ? teamContestantGraphLabel : contestantGraphLabel],
  buildStackedBarSpecificationLambda(
    [gcsAttributes.buzc, gcsAttributes.buz, gcsAttributes.att],
    isPopCulture() ? teamContestantColor : color,
    'contestant'
  ))

const teamAttemptBarChartSpecification = data.computedIfRefHasValues(
  [displayTeamIds, teamDataById, gameTeamStatDataByTeamId,
    displayTeamGameTeamStatData, gameTeamStatData, winnerTeamGameTeamStatData, anyGameHasAttemptData,
    teamGraphLabel],
  buildStackedBarSpecificationLambda(
    [gcsAttributes.buzc, gcsAttributes.buz, gcsAttributes.att],
    teamColor,
    'team'
  ))

const attemptValueBarChartSpecification = data.computedIfRefHasValues(
  [displayContestantIds, contestantDataById, gameContestantStatDataByContestantId,
    displayContestantGameContestantStatData, gameContestantStatData, winnerContestantGameContestantStatData, anyGameHasAttemptData,
    isPopCulture() ? teamContestantGraphLabel : contestantGraphLabel],
  buildStackedBarSpecificationLambda(
    [gcsAttributes.buz_score, gcsAttributes.buz_value, gcsAttributes.att_value],
    isPopCulture() ? teamContestantColor : color,
    'contestant'
  ))

const teamAttemptValueBarChartSpecification = data.computedIfRefHasValues(
  [displayTeamIds, teamDataById, gameTeamStatDataByTeamId,
    displayTeamGameTeamStatData, gameTeamStatData, winnerTeamGameTeamStatData, anyGameHasAttemptData,
    teamGraphLabel],
  buildStackedBarSpecificationLambda(
    [gcsAttributes.buz_score, gcsAttributes.buz_value, gcsAttributes.att_value],
    teamColor,
    'team'
  ))

//Charts
const totalAttemptsChartSpecification = data.computedIfRefHasValues(
  [gameIds, gameDataById, gameStatDataById, gameContestantStatDataByGameId],
  (gIds, gData, gsData, gcsData) => {
    const values = d3.zip(
      movingAverageOfLast(5, gIds.map(gid => gsAttributes.att_total.generatingFunction(gsData.get(gid), gcsData.get(gid)))),
      movingAverageOfLast(5, gIds.map(gid => gsAttributes.att_max.generatingFunction(gsData.get(gid), gcsData.get(gid)))),
      movingAverageOfLast(5, gIds.map(gid => gsAttributes.att_med.generatingFunction(gsData.get(gid), gcsData.get(gid)))),
      movingAverageOfLast(5, gIds.map(gid => gsAttributes.att_min.generatingFunction(gsData.get(gid), gcsData.get(gid))))
    )
    return {
      data: d3.zip(gIds, values),
      xFunction: d => dateFormat(gData.get(d[0]).airdate),
      yFunctions: [d => d[1][0], d => d[1][1], d => d[1][2], d => d[1][3]],
      colors: d3.schemeCategory10,
      labels: [gsAttributes.att_total.label, gsAttributes.att_max.label, gsAttributes.att_med.label, gsAttributes.att_min.label],
      xLabel: 'Airdate',
      yLabel: 'Attempts',
      title: 'Attempts 5 Game Rolling Average'
    }
  })

const rollingAverageGraphAttributeSelectedIdx = ref(0)
const rollingAverageGraphAttributeIdx = data.computedIfRefHasValue(rollingAverageGraphAttributeSelectedIdx, idx => idx)
const rollingAverageRollCountOptions = [5, 10, 20]
const rollingAverageRollCountLabels = rollingAverageRollCountOptions.map(c => c + ' games')
const rollingAverageRollCountIdx = ref(0)
const rollingAverageRollCount = computed(() => rollingAverageRollCountOptions[rollingAverageRollCountIdx.value])
const rollingGameStatAttributes = data.computedIfRefHasValue(anyGameHasAttemptData, hasAttempt => hasAttempt ? gsAttributes.all_attributes : gsAttributes.attributes_without_att)
const rollingAverageGraphAttribute = data.computedIfRefHasValues(
  [rollingGameStatAttributes, rollingAverageGraphAttributeIdx],
  (attrList, idx) => attrList[idx]
)
const rollingChartSpecification = data.computedIfRefHasValues(
  [gameIds, gameDataById, gameStatDataById, gameContestantStatDataByGameId, rollingAverageGraphAttribute, rollingAverageRollCount],
  (gIds, gData, gsData, gcsData, attr, rollCount) => {
    const numerators = movingAverageOfLast(rollCount, gIds.map(gid => attr.generatingFunction(gsData.get(gid), gcsData.get(gid))))
    const denominators = attr.denominatorGeneratingFunction ?
      movingAverageOfLast(rollCount, gIds.map(gid => attr.denominatorGeneratingFunction(gsData.get(gid), gcsData.get(gid)))) :
      new Array(numerators.length).fill(1.0)
    const values = d3.zip(numerators, denominators).map(a => (1.0 * a[0] / a[1]))
    return {
      data: d3.zip(gIds, values),
      xFunction: d => dateFormat(gData.get(d[0]).airdate),
      yFunctions: [d => d[1]],
      colors: d3.schemeCategory10,
      labels: [attr.label],
      xLabel: 'Airdate',
      yLabel: attr.short_label,
      title: attr.label + ' ' + rollCount + ' Game Rolling Average'
    }
  })

const boxWhiskerGraphAttributeSelectedIdx = ref(-1)
const boxWhiskerGraphAttributes = data.computedIfRefHasValue(anyGameHasAttemptData, hasAttempt => hasAttempt ? gcsAttributes.all_attributes : gcsAttributes.attributes_without_att)
const boxWhiskerGraphAttributeDefaultIdx = data.computedIfRefHasValues(
  [boxWhiskerGraphAttributes, everyGameHasAttemptData],
  (attrList, allHaveAttempt) => allHaveAttempt ? attrList.indexOf(gcsAttributes.att_value) : attrList.indexOf(gcsAttributes.buz_value))
const boxWhiskerGraphAttributeIdx = data.computedIfRefHasValues(
  [boxWhiskerGraphAttributeSelectedIdx, boxWhiskerGraphAttributeDefaultIdx],
  (selectedIdx, defaultIdx) => selectedIdx >= 0 ? selectedIdx : defaultIdx)
const boxWhiskerGraphAttribute = data.computedIfRefHasValues([boxWhiskerGraphAttributes, boxWhiskerGraphAttributeIdx], (attrList, idx) => attrList[idx])
const boxWhiskerGraphRoundIdx = ref(0)
const boxWhiskerGraphSpecification = data.computedIfRefHasValues(
  [displayContestantIds, contestantDataById, gameDataById, gameContestantStatDataByContestantId, boxWhiskerGraphAttribute,
    isPopCulture() ? teamContestantGraphLabel : contestantGraphLabel
  ],
  (cids, cData, gData, gcsData, attr, nameFn) => {
    cids = cids.filter(cid => {
      return gcsData.get(cid).some(gcs => !_.isNil(attr.generatingFunction(gcs)))
    })
    cids.sort((a,b) => d3.descending(
      d3.mean(gcsData.get(a).map(attr.generatingFunction)),
      d3.mean(gcsData.get(b).map(attr.generatingFunction))
    ))
    if (graphDisplayLimit.value) {
      cids = cids.slice(0, graphDisplayLimit.value)
    }
    return {
      dataByKey: gcsData,
      orderedKeys: cids,
      xLabel: k => nameFn(k),
      yFunction: attr.generatingFunction,
      yLabel: d => gData.get(d.game_id).season_id + '-' + gData.get(d.game_id).game_in_season,
      idColorFunction: isPopCulture() ? teamContestantColor.value : color.value,
      title: attr.label,
      additionalBoxes: [
        {
          label: 'All Others',
          color: 'black',
          yLabel: d => nameFn(d.contestant_id) + ' ' + gData.get(d.game_id).season_id + '-' + gData.get(d.game_id).game_in_season,
          filter: d => !cids.includes(d.contestant_id)
        }
      ]
    }
  }
)

const teamBoxWhiskerGraphSpecification = data.computedIfRefHasValues(
  [displayTeamIds, teamDataById, gameDataById, gameTeamStatDataByTeamId, boxWhiskerGraphAttribute, teamGraphLabel],
  (cids, cData, gData, gcsData, attr, nameFn) => {
    cids = cids.filter(cid => {
      return gcsData.get(cid).some(gcs => !_.isNil(attr.generatingFunction(gcs)))
    })
    cids.sort((a,b) => d3.descending(
      d3.mean(gcsData.get(a).map(attr.generatingFunction)),
      d3.mean(gcsData.get(b).map(attr.generatingFunction))
    ))
    if (teamGraphDisplayLimit.value) {
      cids = cids.slice(0, teamGraphDisplayLimit.value)
    }
    return {
      dataByKey: gcsData,
      orderedKeys: cids,
      xLabel: k => nameFn(k),
      yFunction: attr.generatingFunction,
      yLabel: d => gData.get(d.game_id).season_id + '-' + gData.get(d.game_id).game_in_season,
      idColorFunction: teamColor.value,
      title: attr.label,
      additionalBoxes: [
        {
          label: 'All Others',
          color: 'black',
          yLabel: d => cData.get(d.team_id).name + ' ' + gData.get(d.game_id).season_id + '-' + gData.get(d.game_id).game_in_season,
          filter: d => !cids.includes(d.team_id)
        }
      ]
    }
  }
)

const scatterGraphRoundIdx = ref(0)
const scatterGraphAttributes = data.computedIfRefHasValue(anyGameHasAttemptData, hasAttempt => hasAttempt ? gcsAttributes.all_attributes : gcsAttributes.attributes_without_att)
const xScatterGraphAttributeSelectedIdx = ref(-1)
const xScatterGraphAttributeDefaultIdx = data.computedIfRefHasValues(
  [scatterGraphAttributes, everyGameHasAttemptData],
  (attrList, allHaveAttempt) => allHaveAttempt ? attrList.indexOf(gcsAttributes.att_value) : attrList.indexOf(gcsAttributes.buz_value))
const xScatterGraphAttributeIdx = data.computedIfRefHasValues(
  [xScatterGraphAttributeSelectedIdx, xScatterGraphAttributeDefaultIdx],
  (selectedIdx, defaultIdx) => selectedIdx >= 0 ? selectedIdx : defaultIdx)
const yScatterGraphAttributeSelectedIdx = ref(-1)
const yScatterGraphAttributeDefaultIdx = data.computedIfRefHasValues(
  [scatterGraphAttributes, everyGameHasAttemptData],
  (attrList, allHaveAttempt) => allHaveAttempt ? attrList.indexOf(gcsAttributes.conversion_value_percent) : attrList.indexOf(gcsAttributes.acc_value_percent))
const yScatterGraphAttributeIdx = data.computedIfRefHasValues(
  [yScatterGraphAttributeSelectedIdx, yScatterGraphAttributeDefaultIdx],
  (selectedIdx, defaultIdx) => selectedIdx >= 0 ? selectedIdx : defaultIdx)
const xScatterGraphAttribute = data.computedIfRefHasValues([scatterGraphAttributes, xScatterGraphAttributeIdx], (attrList, idx) => attrList[idx])
const yScatterGraphAttribute = data.computedIfRefHasValues([scatterGraphAttributes, yScatterGraphAttributeIdx], (attrList, idx) => attrList[idx])
const scatterGraphSpecification = data.computedIfRefHasValues(
  [displayContestantIds, contestantDataById, gameDataById, gameContestantStatData,
    xScatterGraphAttribute, yScatterGraphAttribute,
    isPopCulture() ? teamContestantColor : color,
    isPopCulture() ? teamContestantGraphLabel : contestantGraphLabel],
  (cids, cData, gData, gcsData, xAttr, yAttr, colorFunction, nameFn) => {
    return {
      histogramData: gcsData,
      scatterData: gcsData.filter(gcs => cids.includes(gcs.contestant_id)),
      scatterLabelFunction: d => nameFn(d.contestant_id) + ' ' + gData.get(d.game_id).season_id + '-' + gData.get(d.game_id).game_in_season,
      scatterColorFunction: d => colorFunction(d.contestant_id),
      title: xAttr.label + ' vs ' + yAttr.label,
      xLabel: xAttr.label,
      xFunction: xAttr.generatingFunction,
      xBins: xAttr.bins ? xAttr.bins : {},
      yLabel: yAttr.label,
      yFunction: yAttr.generatingFunction,
      yBins: yAttr.bins ? yAttr.bins : {},
      scatterMode: 'markers'
    }
  }
)


const averageScatterGraphSpecification = data.computedIfRefHasValues(
  [displayContestantIds, contestantDataById, gameContestantStatDataByContestantId,
    xScatterGraphAttribute, yScatterGraphAttribute,
    isPopCulture() ? teamContestantColor : color,
    isPopCulture() ? teamContestantGraphLabel : contestantGraphLabel],
  (cids, cData, gcsData, xAttr, yAttr, colorFunction, nameFn) => {
    const gcsDataTransformed = transformValues(gcsData, gcsArray => [
      d3.mean(gcsArray.map(xAttr.generatingFunction)),
      d3.mean(gcsArray.map(yAttr.generatingFunction))
    ])
    const gcsDataForDisplay = [...gcsDataTransformed].map(([k, vs]) => [k].concat(vs))
    return {
      histogramData: gcsDataForDisplay,
      scatterData: gcsDataForDisplay.filter(gcs => cids.includes(gcs[0])),
      scatterLabelFunction: d => nameFn(d[0]),
      scatterColorFunction: d => colorFunction(d[0]),
      title: 'Average ' + xAttr.label + ' vs ' + yAttr.label,
      xLabel: xAttr.label,
      xFunction: d => d[1],
      xBins: xAttr.bins ? xAttr.bins : {},
      yLabel: yAttr.label,
      yFunction: d => d[2],
      yBins: yAttr.bins ? yAttr.bins : {}
    }
  }
)

const teamScatterGraphSpecification = data.computedIfRefHasValues(
  [displayTeamIds, teamDataById, gameDataById, gameTeamStatData, xScatterGraphAttribute, yScatterGraphAttribute,
    teamColor, teamGraphLabel],
  (cids, cData, gData, gcsData, xAttr, yAttr, colorFunction, nameFn) => {
    return {
      histogramData: gcsData,
      scatterData: gcsData.filter(gcs => cids.includes(gcs.team_id)),
      scatterLabelFunction: d => nameFn(d.team_id) + ' ' + gData.get(d.game_id).season_id + '-' + gData.get(d.game_id).game_in_season,
      scatterColorFunction: d => colorFunction(d.team_id),
      title: xAttr.label + ' vs ' + yAttr.label,
      xLabel: xAttr.label,
      xFunction: xAttr.generatingFunction,
      xBins: xAttr.bins ? xAttr.bins : {},
      yLabel: yAttr.label,
      yFunction: yAttr.generatingFunction,
      yBins: yAttr.bins ? yAttr.bins : {},
      scatterMode: 'markers'
    }
  }
)


const teamAverageScatterGraphSpecification = data.computedIfRefHasValues(
  [displayTeamIds, teamDataById, gameTeamStatDataByTeamId, xScatterGraphAttribute, yScatterGraphAttribute,
    teamColor, teamGraphLabel],
  (cids, cData, gcsData, xAttr, yAttr, colorFunction, nameFn) => {
    const gcsDataTransformed = transformValues(gcsData, gcsArray => [
      d3.mean(gcsArray.map(xAttr.generatingFunction)),
      d3.mean(gcsArray.map(yAttr.generatingFunction))
    ])
    const gcsDataForDisplay = [...gcsDataTransformed].map(([k, vs]) => [k].concat(vs))
    return {
      histogramData: gcsDataForDisplay,
      scatterData: gcsDataForDisplay.filter(gcs => cids.includes(gcs[0])),
      scatterLabelFunction: d => nameFn(d[0]),
      scatterColorFunction: d => colorFunction(d[0]),
      title: 'Average ' + xAttr.label + ' vs ' + yAttr.label,
      xLabel: xAttr.label,
      xFunction: d => d[1],
      xBins: xAttr.bins ? xAttr.bins : {},
      yLabel: yAttr.label,
      yFunction: d => d[2],
      yBins: yAttr.bins ? yAttr.bins : {}
    }
  }
)

const clueHeatMapChartSpecFn = (dr, gddData) => {
    var heatmapTraces = []
    for (var r of d3.range(1, dr + 1, 1)) {
      const xValues = d3.range(1, 7, 1)
      const yValues = d3.range(5, 0, -1)
      const zValues = d3.map(yValues, y => d3.map(xValues, x => {
        return d3.filter(gddData, gdd => gdd.round_of_game === r && gdd.row === y && gdd.column === x).length
      }))
      heatmapTraces.push({
        x: d3.map(xValues, x => 'Column ' + x),
        y: d3.map(yValues, y => 'Row ' + y),
        z: zValues,
        type: 'heatmap',
        round: r
      })
    }
    
    return d3.map(heatmapTraces, t => {
      var annotations = []
      for (var i = 0; i < t.y.length; ++i) {
        for (var j = 0; j < t.x.length; ++j) {
          var v = t.z[i][j]
          var result = {
            xref: 'x1',
            yref: 'y1',
            x: t.x[j],
            y: t.y[i],
            text: v,
            font: {
              family: 'Arial',
              size: 12,
              color: 'rgb(50, 171, 96)'
            },
            showarrow: false,
            font: {
              color: 'white'
            }
          };
          annotations.push(result)
        }
      }
      return {
        traces: [t],
        layout: {
          title: roundAbbreviation(t.round) + ' Round',
          annotations: annotations,
          xaxis: {
            ticks: '',
            side: 'top',
            fixedrange: true
          },
          yaxis: {
            ticks: '',
            fixedrange: true
          }
        }
      }
    })
  }

const dailyDoubleAbsoluteLocationHeatmapChartSpecs = data.computedIfRefHasValues(
  [displayRounds, gameDailyDoubleData], clueHeatMapChartSpecFn)

  const triplePlayAbsoluteLocationHeatmapChartSpecs = data.computedIfRefHasValues(
  [displayRounds, gameTriplePlayData], clueHeatMapChartSpecFn)


const dailyDoubleRelativeLocationHeatmapChartSpecs = data.computedIfRefHasValues(
  [displayRounds, gameDailyDoubleData],
  (dr, gddData) => {
    const gameDailyDoubleRoundGameData = d3.group(gddData, gdd => gdd.round_of_game, gdd => gdd.game_id)
    var heatmapTraces = []
    for (var r of d3.range(1, dr + 1, 1)) {
      const gameDailyDoubleGameData = gameDailyDoubleRoundGameData.get(r)
      var coordinateCounter = {}
      for (const [gameId, dds] of gameDailyDoubleGameData.entries()) {
        if (dds.length < 2) continue
        for (var i = 0; i < dds.length; ++i) {
          for (var j = i + 1; j < dds.length; ++j) {
            const rightwardPair = [dds[j].column - dds[i].column, dds[j].row - dds[i].row]
            const leftwardPair = [dds[i].column - dds[j].column, dds[i].row - dds[j].row]
            if (!_.has(coordinateCounter, rightwardPair[0])) coordinateCounter[rightwardPair[0]] = {}
            if (!_.has(coordinateCounter[rightwardPair[0]], rightwardPair[1])) coordinateCounter[rightwardPair[0]][rightwardPair[1]] = 0
            coordinateCounter[rightwardPair[0]][rightwardPair[1]] += 1
            if (!_.has(coordinateCounter, leftwardPair[0])) coordinateCounter[leftwardPair[0]] = {}
            if (!_.has(coordinateCounter[leftwardPair[0]], leftwardPair[1])) coordinateCounter[leftwardPair[0]][leftwardPair[1]] = 0
            coordinateCounter[leftwardPair[0]][leftwardPair[1]] += 1
          }
        }
      }
      const xValues = d3.range(-5, 6, 1)
      const yValues = d3.range(4, -5, -1)
      const zValues = d3.map(yValues, y => d3.map(xValues, x => {
        if (!_.has(coordinateCounter, x)) return 0
        if (!_.has(coordinateCounter[x], y)) return 0
        return coordinateCounter[x][y]
      }))
      heatmapTraces.push({
        x: d3.map(xValues, x => 'Row ' + x),
        y: d3.map(yValues, y => 'Row ' + y),
        z: zValues,
        type: 'heatmap'
      })
    }
    
    return d3.map(heatmapTraces, t => ({
      traces: [t],
      layout: {
        xaxis: {
          ticks: '',
          side: 'top'
        },
        yaxis: {
          ticks: ''
        },
        showlegend: false
      }
    }))
  }
)



</script>

<template>
  <Header />
  <div class="component-body" :data-bs-theme="subdomainIdentifier()">
    <h1>
      <span v-if="tocPeriodSearchParameters && tocPeriodSearchParameters.length > 0">{{ tocPeriodSearchParameters.join(', ') }} Qual Period<span v-if="tocPeriodSearchParameters.length > 1">s</span>&nbsp;</span>
      <span v-if="seasonSearchParameters && seasonSearchParameters.length > 0">Season<span v-if="seasonSearchParameters.length > 1">s</span> {{ seasonSearchParameters.map(s => configuration.seasonDisplayId(s)).join(', ') }}&nbsp;</span>
      <span v-if="playClassificationSearchParameters && playClassificationSearchParameters.length > 0">{{ d3.map(playClassificationSearchParameters, p => configuration.playClassificationGenericName(p)).join(", ") }}&nbsp;</span>Statistical Summary
    </h1>
    <div id="search-filters">
      <SearchFilterDropdown
        :optionLabels="searchSeasonIds.map(s => configuration.seasonDisplayId(s))"
        :selectedIndices="seasonSearchSelectedIndices"
        :label="'Seasons'"
        @updateSelectionIndices="(idxs) => seasonSearchSelectedIndices = idxs"
      />
      <SearchFilterDropdown
        :optionLabels="searchTocPeriodIds"
        :selectedIndices="tocPeriodSelectedIndices"
        :label="'Qual Periods'"
        @updateSelectionIndices="(idxs) => tocPeriodSelectedIndices = idxs"
      />
      <SearchFilterDropdown
        :optionLabels="searchPlayClassifications.map(configuration.playClassificationGenericName)"
        :selectedIndices="playClassificationSelectedIndices"
        :label="'Play Classifications'"
        @updateSelectionIndices="(idxs) => playClassificationSelectedIndices = idxs"
      />
    </div>
    <div v-if="displayContestantIdParameters.length > 0">
      Displaying specified contestants
    </div>
    <div v-else>
      Display <span v-if="isPopCulture()">teams and </span>contestants between
      <select v-model="winThresholdString">
        <option :value="null">Auto</option>
        <option>0</option>
        <option>1</option>
        <option>2</option>
        <option>3</option>
        <option>4</option>
        <option>5</option>
      </select>
      and 
      <select v-model="winLimitString">
        <option>0</option>
        <option>1</option>
        <option>2</option>
        <option>3</option>
        <option>4</option>
        <option>5</option>
        <option :value="null">No limit</option>
      </select>
      wins
    </div>
    <div>
      <a :href="'/period_games.html' + queryString">Game List</a>
    </div>
    <div class="section">
      <div class="section-header">Statistics Tables</div>
      <div class="option-groups">
        <OptionDropdown :optionLabels="roundOptionLabels" :selectionIndex="selectedRoundIndex"
          @newSelectionIndex="(idx) => selectedRoundIndex = idx" />
        <OptionDropdown :optionLabels="aggregationOptionLabels" :selectionIndex="selectedAggregationIndex"
          @newSelectionIndex="(idx) => selectedAggregationIndex = idx" />
      </div>
      <div class="subsection" v-if="teamStandardScoringTableSpec" >
        <div class="subsection-header">Standard Metrics</div>
        <SortableTable v-bind="teamStandardScoringTableSpec" />
      </div>
      <div class="subsection" v-if="anyGameHasAttemptData && teamConversionScoringTableSpec">
        <div class="subsection-header">Conversion Metrics</div>
        <SortableTable v-bind="teamConversionScoringTableSpec" />
      </div>
      <div class="subsection" v-if="anyGameHasAttemptData && teamConversionValueScoringTableSpec">
        <div class="subsection-header">Conversion Value Metrics</div>
        <SortableTable v-bind="teamConversionValueScoringTableSpec" />
      </div>
      <div class="subsection" v-if="!anyGameHasAttemptData && teamSlimConversionScoringTableSpec">
        <div class="subsection-header">Conversion Metrics</div>
        <SortableTable v-bind="teamSlimConversionScoringTableSpec" />
      </div>
      <div class="subsection" v-if="standardScoringTableSpec">
        <div class="subsection-header">Standard Metrics</div>
        <SortableTable v-bind="standardScoringTableSpec" />
      </div>
      <div class="subsection" v-if="anyGameHasAttemptData && conversionScoringTableSpec">
        <div class="subsection-header">Conversion Metrics</div>
        <SortableTable v-bind="conversionScoringTableSpec" />
      </div>
      <div class="subsection" v-if="anyGameHasAttemptData && conversionValueScoringTableSpec">
        <div class="subsection-header">Conversion Value Metrics</div>
        <SortableTable v-bind="conversionValueScoringTableSpec" />
      </div>
      <div class="subsection" v-if="!anyGameHasAttemptData && slimConversionScoringTableSpec">
        <div class="subsection-header">Conversion Metrics</div>
        <SortableTable v-bind="slimConversionScoringTableSpec" />
      </div>
    </div>
    <div class="section">
      <div class="section-header"><span v-if="anyGameHasAttemptData">Attempts</span><span v-else>Buzzes</span></div>
      <StackValueBarChart v-if="teamAttemptBarChartSpecification" v-bind="teamAttemptBarChartSpecification" />
      <StackValueBarChart v-if="attemptBarChartSpecification" v-bind="attemptBarChartSpecification" />
    </div>
    <div class="section">
      <div class="section-header"><span v-if="anyGameHasAttemptData">Attempt Values</span><span v-else>Buzz Values</span></div>
      <StackValueBarChart v-if="teamAttemptValueBarChartSpecification" v-bind="teamAttemptValueBarChartSpecification" />
      <StackValueBarChart v-if="attemptValueBarChartSpecification" v-bind="attemptValueBarChartSpecification" />
    </div>
    <div class="section" v-if="isSyndicated() && anyGameHasAttemptData">
      <div class="section-header">Total Attempts</div>
      <LineChart v-bind="totalAttemptsChartSpecification" />
    </div>
    <div class="section" v-if="isSyndicated() && rollingAverageGraphAttribute">
      <div class="section-header">Rolling Averages</div>
      <div class="option-groups">
        <OptionDropdown :optionLabels="rollingAverageRollCountLabels" :selectionIndex="rollingAverageRollCountIdx"
          @newSelectionIndex="(idx) => rollingAverageRollCountIdx = idx" />
        <OptionDropdown
          :optionLabels="rollingGameStatAttributes.map(attr => attr.label)"
          :selectionIndex="rollingAverageGraphAttributeIdx"
          @newSelectionIndex="(idx) => rollingAverageGraphAttributeSelectedIdx = idx"
        />
      </div>
      <LineChart v-bind="rollingChartSpecification" />
    </div>
    <div class="section">
      <div class="section-header">Daily Double Heatmaps</div>
      <div v-for="(dailyDoubleAbsoluteLocationHeatmapChartSpec, index) in dailyDoubleAbsoluteLocationHeatmapChartSpecs">
        <ReactiveChart :chart="dailyDoubleAbsoluteLocationHeatmapChartSpec"/>
      </div>
    </div>
    <div class="section" v-if="triplePlayAbsoluteLocationHeatmapChartSpecs">
      <div class="section-header">Triple Play Heatmaps</div>
      <div v-for="(triplePlayAbsoluteLocationHeatmapChartSpec, index) in triplePlayAbsoluteLocationHeatmapChartSpecs">
        <ReactiveChart :chart="triplePlayAbsoluteLocationHeatmapChartSpec"/>
      </div>
    </div>
    <div class="section" v-if="boxWhiskerGraphAttributes">
      <div class="section-header">Selectable Box and Whisker Plots</div>
      <div class="option-groups">
        <OptionDropdown
          :optionLabels="boxWhiskerGraphAttributes.map(attr => attr.label)"
          :selectionIndex="boxWhiskerGraphAttributeIdx"
          @newSelectionIndex="(idx) => boxWhiskerGraphAttributeSelectedIdx = idx"
        />
      </div>
      <BoxWhiskerChart v-if="teamBoxWhiskerGraphSpecification" v-bind="teamBoxWhiskerGraphSpecification" />
      <BoxWhiskerChart v-if="boxWhiskerGraphSpecification" v-bind="boxWhiskerGraphSpecification" />
    </div>
    <div class="section" v-if="scatterGraphAttributes">
      <div class="section-header">Selectable Scatter Plots</div>
      <div class="option-groups">
        <OptionDropdown
          :optionLabels="scatterGraphAttributes.map(attr => attr.label)"
          :selectionIndex="xScatterGraphAttributeIdx"
          @newSelectionIndex="(idx) => xScatterGraphAttributeSelectedIdx = idx"
        />
        <OptionDropdown
          :optionLabels="scatterGraphAttributes.map(attr => attr.label)"
          :selectionIndex="yScatterGraphAttributeIdx"
          @newSelectionIndex="(idx) => yScatterGraphAttributeSelectedIdx = idx"
        />
      </div>
      <div class="subsection" v-if="isSyndicated()">
        <div class="subsection-header">All Games</div>
        <ScatterHistogram v-if="scatterGraphSpecification" v-bind="scatterGraphSpecification"/>
      </div>
      <div class="subsection" v-if="isPopCulture()">
        <div class="subsection-header">Average for Team</div>
        <ScatterHistogram v-if="teamAverageScatterGraphSpecification" v-bind="teamAverageScatterGraphSpecification"/>
      </div>
      <div class="subsection">
        <div class="subsection-header">Average for Contestant</div>
        <ScatterHistogram v-if="averageScatterGraphSpecification" v-bind="averageScatterGraphSpecification"/>
      </div>
    </div>
  </div>
  <Footer />
</template>

<style lang="scss" scoped>


.section :deep(table) {
  width: 100%;
}

#search-filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  margin-bottom: 0.5em;
}

</style>
