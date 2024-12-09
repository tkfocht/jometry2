<script setup>
import * as d3 from 'd3'
import * as _ from 'lodash'
import { ref, computed } from 'vue'
import { formatNumber, dateFormat, roundName, jschemaCsvDataAccessor, roundAbbreviation, subdomainIdentifier, isSyndicated, isPopCulture } from '@/util'
import { playClassificationName, seasonDisplayId } from '@/configuration'
import * as data from '@/data'
import * as gameUtil from '@/gameUtil'
import * as gcsAttributes from '@/gameContestantStatAttributes'

import CumulativeChartSection from '@/components/game/CumulativeChartSection.vue'

import Footer from './components/Footer.vue'
import Header from './components/Header.vue'
import HighlightHistogram from './components/util/HighlightHistogram.vue'
import OptionDropdown from './components/util/OptionDropdown.vue'
import OptionGroup from './components/util/OptionGroup.vue'
import ScatterHistogram from './components/util/ScatterHistogram.vue'
import SortableTable from './components/util/SortableTable.vue'
import StackValueBarChart from './components/util/StackValueBarChart.vue'

let urlParams = new URLSearchParams(window.location.search);

const gameId = +urlParams.get('game_id')

data.loadContestantData()
data.loadGameData()
data.loadGameStatData()
data.loadGameContestantStatData()
data.loadGameRoundContestantStatData()
if (isPopCulture()) {
  data.loadTeamData()
  data.loadGameTeamStatData()
  data.loadGameRoundTeamStatData()
  data.loadJschemaClueTeamStatData(gameId)
}
data.loadJschemaClueContestantStatData(gameId)
data.loadJschemaClueData(gameId)
data.loadJschemaResponseData(gameId)

const contestantDataById = data.contestantDataById
const teamDataById = data.teamDataById
const gameData = data.computedIfRefHasValue(data.gameDataById, gData => gData.get(gameId))
const gameStatData = data.computedIfRefHasValue(data.gameStatDataById, gsData => gsData.get(gameId))
const gamePlayClassification = data.computedIfRefHasValue(gameData, gData => gData.play_classification)
const gameTocPeriod = data.computedIfRefHasValue(gameData, gData => gData.toc_period)
const gameRounds = data.computedIfRefHasValue(gameData, gData => gData.play_classification == 'celebrity' ? 3 : 2)
const gameContestantIds = isPopCulture() ?
  data.computedIfRefHasValue(gameData, gData => [
    gData.podium_1_1_contestant_id, gData.podium_1_2_contestant_id, gData.podium_1_3_contestant_id,
    gData.podium_2_1_contestant_id, gData.podium_2_2_contestant_id, gData.podium_2_3_contestant_id,
    gData.podium_3_1_contestant_id, gData.podium_3_2_contestant_id, gData.podium_3_3_contestant_id
  ]) :
  data.computedIfRefHasValue(gameData, gData => [gData.podium_1_contestant_id, gData.podium_2_contestant_id, gData.podium_3_contestant_id])
const gameTeamIds = data.computedIfRefHasValue(gameData, gData => [gData.podium_1_team_id, gData.podium_2_team_id, gData.podium_3_team_id])

const gameHasAttemptData = data.computedIfRefHasValue(gameStatData, gsData => isSyndicated() && gsData.att_total > 0)

const allGameStatData = data.computedIfRefHasValues(
  [data.gameStatData, gamePlayClassification, gameTocPeriod, data.gameDataById],
  (gsData, playClass, tocPeriod, gData) => gsData.filter(gs => gData.get(gs.game_id).play_classification === playClass && gData.get(gs.game_id).toc_period === tocPeriod))
const allGameContestantStatData = data.computedIfRefHasValues(
  [data.gameContestantStatData, gamePlayClassification, gameTocPeriod, data.gameDataById],
  (gcsData, playClass, tocPeriod, gData) => gcsData.filter(gcs => gData.get(gcs.game_id).play_classification === playClass && gData.get(gcs.game_id).toc_period === tocPeriod))
const gameContestantStatDataByContestantId = data.computedIfRefHasValue(data.gameContestantStatDataByGameIdContestantId, gcsData => gcsData.get(gameId))
const gameContestantStatData = computed(() => {
  if (data.gameContestantStatDataByGameIdContestantId.value && gameContestantIds.value) {
    return d3.map(gameContestantIds.value, cid => data.gameContestantStatDataByGameIdContestantId.value.get(gameId).get(cid))
  } else {
    return null
  }
})

const allGameTeamStatData = data.computedIfRefHasValues(
  [data.gameTeamStatData, gamePlayClassification, gameTocPeriod, data.gameDataById],
  (gcsData, playClass, tocPeriod, gData) => gcsData.filter(gcs => gData.get(gcs.game_id).play_classification === playClass && gData.get(gcs.game_id).toc_period === tocPeriod))
const gameTeamStatDataByTeamId = data.computedIfRefHasValue(data.gameTeamStatDataByGameIdTeamId, gcsData => gcsData.get(gameId))
const gameTeamStatData = computed(() => {
  if (data.gameTeamStatDataByGameIdTeamId.value && gameTeamIds.value) {
    return d3.map(gameTeamIds.value, cid => data.gameTeamStatDataByGameIdTeamId.value.get(gameId).get(cid))
  } else {
    return null
  }
})

const jschemaAllGameRoundContestantStatDataFlat = data.computedIfRefHasValues(
  [data.gameRoundContestantStatData, gamePlayClassification, gameTocPeriod, data.gameDataById],
  (grcsData, playClass, tocPeriod, gData) => grcsData.filter(grcs => gData.get(grcs.game_id).play_classification === playClass && gData.get(grcs.game_id).toc_period === tocPeriod))
const jschemaAllGameRoundContestantStatData = computed(() => {
  if (jschemaAllGameRoundContestantStatDataFlat.value) return d3.index(jschemaAllGameRoundContestantStatDataFlat.value, r => r.game_id, r => r.round_of_game, r => r.contestant_id)
  else return null
})
const jschemaAllGameRoundContestantStatByRound = computed(() => {
  if (jschemaAllGameRoundContestantStatDataFlat.value) return d3.group(jschemaAllGameRoundContestantStatDataFlat.value, r => r.round_of_game)
  else return null
})
const jschemaGameRoundContestantStatData = computed(() => {
  if (jschemaAllGameRoundContestantStatData.value) return jschemaAllGameRoundContestantStatData.value.get(gameId)
  else return null
})
const jschemaGameRoundContestantStatDataByRound = computed(() => {
  if (!jschemaGameRoundContestantStatData.value || !gameContestantIds.value || !gameRounds.value) return null
  const data = []
  for (const rid of d3.range(1, gameRounds.value+1)) {
    data[rid] = d3.map(gameContestantIds.value, cid => jschemaGameRoundContestantStatData.value.get(rid).get(cid))
  }
  return data
})
const gameRoundContestantStatDataByRoundIdContestantId = data.computedIfRefHasValues(
    [data.gameRoundContestantStatData],
    (gcsData) => d3.index(gcsData.filter(gr => gameId === gr.game_id), r => r.round_of_game, r => r.contestant_id))


const gameRoundTeamStatDataByRoundIdTeamId = data.computedIfRefHasValues(
    [data.gameRoundTeamStatData],
    (gcsData) => d3.index(gcsData.filter(gr => gameId === gr.game_id), r => r.round_of_game, r => r.team_id))
const jschemaAllGameRoundTeamStatDataFlat = data.computedIfRefHasValues(
  [data.gameRoundTeamStatData, gamePlayClassification, gameTocPeriod, data.gameDataById],
  (grcsData, playClass, tocPeriod, gData) => grcsData.filter(grcs => gData.get(grcs.game_id).play_classification === playClass && gData.get(grcs.game_id).toc_period === tocPeriod))
const jschemaAllGameRoundTeamStatData = computed(() => {
  if (jschemaAllGameRoundTeamStatDataFlat.value) return d3.index(jschemaAllGameRoundTeamStatDataFlat.value, r => r.game_id, r => r.round_of_game, r => r.team_id)
  else return null
})
const jschemaGameRoundTeamStatData = computed(() => {
  if (jschemaAllGameRoundTeamStatData.value) return jschemaAllGameRoundTeamStatData.value.get(gameId)
  else return null
})



const jschemaClueData = data.jschemaClueData
const jschemaClueContestantStatData = data.jschemaClueContestantStatData
const jschemaClueTeamStatData = data.jschemaClueTeamStatData
const jschemaClueByRoundRowColumn = data.jschemaClueByRoundRowColumn
const jschemaClueContestantStatDataByRoundClueAndContestantId = data.jschemaClueContestantStatDataByRoundClueAndContestantId
const jschemaResponseByRoundClue = data.jschemaResponseByRoundClue
const jschemaTeamResponseByRoundClue = data.jschemaTeamResponseByRoundClue


const threeColorSet = ['#0072B2','#E69F00','#009E73']
const color = computed(() => {
  if (gameContestantIds.value) return d3.scaleOrdinal().domain(gameContestantIds.value).range(threeColorSet)
  else return null
})
const teamColor = computed(() => {
  if (gameTeamIds.value) {
    return d3.scaleOrdinal().domain(gameTeamIds.value).range(threeColorSet)
  }
  else return null
})
const teamContestantColor = computed(() => {
  if (gameContestantIds.value) return d3.scaleOrdinal().domain(gameContestantIds.value).range(
    [
      d3.color(threeColorSet[0]).darker(0.7), d3.color(threeColorSet[0]).brighter(0.5), d3.color(threeColorSet[0]).brighter(1.0),
      d3.color(threeColorSet[1]).darker(0.7), d3.color(threeColorSet[1]).brighter(0.5), d3.color(threeColorSet[1]).brighter(1.0),
      d3.color(threeColorSet[2]).darker(0.7), d3.color(threeColorSet[2]).brighter(0.5), d3.color(threeColorSet[2]).brighter(1.0),
    ]
  )
  else return null
})

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
    '">' + contestant_name + '</a>'
}

function contestantLegend (contestant_id, contestant_name) {
  return '<span style="color: ' + 
    color.value(contestant_id) + 
    '">&#9632;</span>&nbsp;' + contestant_name
}

//Tables
const roundOptionLabels = computed(() => 
  ['Full Game', 'J Round', 'DJ Round'].concat(gameRounds.value && gameRounds.value > 2 ? ['TJ Round'] : []))
const selectedRoundIndex = ref(0)

const standardBaseScoringTableData = data.computedIfRefHasValues(
  [selectedRoundIndex, gameContestantStatDataByContestantId, gameRoundContestantStatDataByRoundIdContestantId],
  (rIdx, gcsDataByCId, gcrsData) => {
    if (rIdx === 0) {
      return gcsDataByCId
    }
    return gcrsData.get(rIdx)
  }
)
const standardBaseScoringTableRows = data.computedIfRefHasValues([gameContestantIds], (cIds) => {
  return cIds.map((cid, idx) => {
    return {
      contestant_id: cid,
      podium: cIds.length - (idx + 1)
    }
  })
})

const popCultureBaseScoringTableData = data.computedIfRefHasValues(
  [selectedRoundIndex, gameTeamStatDataByTeamId, gameRoundTeamStatDataByRoundIdTeamId],
  (rIdx, gcsDataByCId, gcrsData) => {
    if (rIdx === 0) {
      return gcsDataByCId
    }
    return gcrsData.get(rIdx)
  }
)
const popCultureBaseScoringTableRows = data.computedIfRefHasValues([gameTeamIds], (cIds) => {
  return cIds.map((cid, idx) => {
    return {
      team_id: cid,
      podium: cIds.length - (idx + 1)
    }
  })
})

const standardConstructSpecificationConstructor = gameUtil.constructSpecificationConstructor(
  standardBaseScoringTableRows,
  contestantDataById,
  standardBaseScoringTableData,
  isPopCulture() ? teamContestantLink : contestantLink,
  r => r.contestant_id,
  'Contestant'
)
const teamConstructSpecificationConstructor = gameUtil.constructSpecificationConstructor(
  popCultureBaseScoringTableRows,
  teamDataById,
  popCultureBaseScoringTableData,
  teamLink,
  r => r.team_id,
  'Team'
)

const standardScoringAttributes = [gcsAttributes.buz, gcsAttributes.buzc, gcsAttributes.buz_score, gcsAttributes.coryat_score,
  gcsAttributes.dd_found, gcsAttributes.dd_plus_buzc, gcsAttributes.dd_plus_selection, gcsAttributes.dd_score,
  gcsAttributes.fj_start_score, gcsAttributes.fj_score, gcsAttributes.fj_final_score]
const standardScoringTableSpec = standardConstructSpecificationConstructor.constructScoringTableSpecification(standardScoringAttributes)

const conversionScoringAttributes = [gcsAttributes.att, gcsAttributes.att_clue, gcsAttributes.buz,
    gcsAttributes.buz_percent, gcsAttributes.buzc, gcsAttributes.acc_percent, gcsAttributes.conversion_percent,
    gcsAttributes.time, gcsAttributes.timing_rating, gcsAttributes.solo]
const conversionScoringTableSpec = standardConstructSpecificationConstructor.constructScoringTableSpecification(conversionScoringAttributes)

const conversionValueScoringAttributes = [gcsAttributes.att_value, gcsAttributes.buz_value, gcsAttributes.buz_value_percent,
    gcsAttributes.buz_score, gcsAttributes.acc_value_percent, gcsAttributes.conversion_value_percent,
    gcsAttributes.time_value, gcsAttributes.time_score,
    gcsAttributes.solo_value, gcsAttributes.solo_score]
const conversionValueScoringTableSpec = standardConstructSpecificationConstructor.constructScoringTableSpecification(conversionValueScoringAttributes)

const slimConversionValueScoringAttributes = [gcsAttributes.buz, gcsAttributes.buzc,
    gcsAttributes.acc_percent, gcsAttributes.buz_value, gcsAttributes.buz_score, gcsAttributes.acc_value_percent]
const slimConversionValueScoringTableSpec = standardConstructSpecificationConstructor.constructScoringTableSpecification(slimConversionValueScoringAttributes)

const teamStandardScoringAttributes = [gcsAttributes.buz, gcsAttributes.buzc, gcsAttributes.buz_score, gcsAttributes.coryat_score,
  gcsAttributes.dd_found, gcsAttributes.dd_plus_buzc, gcsAttributes.dd_plus_selection, gcsAttributes.dd_score,
  gcsAttributes.fj_start_score, gcsAttributes.fj_score, gcsAttributes.fj_final_score]
const teamStandardScoringTableSpec = teamConstructSpecificationConstructor.constructScoringTableSpecification(standardScoringAttributes)

const teamConversionScoringAttributes = [gcsAttributes.att, gcsAttributes.att_clue, gcsAttributes.buz,
    gcsAttributes.buz_percent, gcsAttributes.buzc, gcsAttributes.acc_percent, gcsAttributes.conversion_percent,
    gcsAttributes.time, gcsAttributes.timing_rating, gcsAttributes.solo]
const teamConversionScoringTableSpec = teamConstructSpecificationConstructor.constructScoringTableSpecification(conversionScoringAttributes)

const teamConversionValueScoringAttributes = [gcsAttributes.att_value, gcsAttributes.buz_value, gcsAttributes.buz_value_percent,
    gcsAttributes.buz_score, gcsAttributes.acc_value_percent, gcsAttributes.conversion_value_percent,
    gcsAttributes.time_value, gcsAttributes.time_score,
    gcsAttributes.solo_value, gcsAttributes.solo_score]
const teamConversionValueScoringTableSpec = teamConstructSpecificationConstructor.constructScoringTableSpecification(conversionValueScoringAttributes)

const teamSlimConversionValueScoringAttributes = [gcsAttributes.buz, gcsAttributes.buzc,
    gcsAttributes.acc_percent, gcsAttributes.buz_value, gcsAttributes.buz_score, gcsAttributes.acc_value_percent]
const teamSlimConversionValueScoringTableSpec = teamConstructSpecificationConstructor.constructScoringTableSpecification(slimConversionValueScoringAttributes)

const standardFinalJeopardyMatrixCells = computed(() => {
  if (!jschemaClueContestantStatData.value || !gameRounds.value || !gameContestantIds.value) return [[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1]]
  const fjRecords = jschemaClueContestantStatData.value.filter(r => r.round_of_game == gameRounds.value + 1 && r.clue_of_round == 1)
  const fjRecordsByContestant = d3.index(fjRecords, r => r.contestant_id)
  var combinations = [[true, true, true],
                        [true, true, false],
                        [true, false, true],
                        [true, false, false],
                        [false, true, true],
                        [false, true, false],
                        [false, false, true],
                        [false, false, false]]
  const fjInitialScores = d3.map(gameContestantIds.value, cid => fjRecordsByContestant.get(cid).prescore);  
  const fjWagers = d3.map(gameContestantIds.value, cid => Math.abs(fjRecordsByContestant.get(cid).postscore - fjRecordsByContestant.get(cid).prescore));
  const mapped = d3.map(combinations, combo => {
    var fjFinalScores = d3.map([0,1,2], p => fjInitialScores[p] + (fjWagers[p] * (combo[p] ? 1 : -1)));
    var winningScore = d3.max(fjFinalScores);
    var winners = d3.filter([0,1,2], idx => fjFinalScores[idx] === winningScore);
    winners = d3.map(winners, w => w+1);
    if (winningScore <= 0) {
      return [-1]
    } else {
      return winners
    }
  })
  return mapped
})

const popCultureFinalJeopardyMatrixCells = computed(() => {
  if (!jschemaClueTeamStatData.value || !gameRounds.value || !gameTeamIds.value) return [[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1]]
  const fjRecords = jschemaClueTeamStatData.value.filter(r => r.round_of_game == gameRounds.value + 1 && r.clue_of_round == 1)
  const fjRecordsByTeam = d3.index(fjRecords, r => r.team_id)
  var combinations = [[true, true, true],
                        [true, true, false],
                        [true, false, true],
                        [true, false, false],
                        [false, true, true],
                        [false, true, false],
                        [false, false, true],
                        [false, false, false]]
  const fjInitialScores = d3.map(gameTeamIds.value, cid => fjRecordsByTeam.get(cid).prescore);
  const fjWagers = d3.map(gameTeamIds.value, cid => Math.abs(fjRecordsByTeam.get(cid).postscore - fjRecordsByTeam.get(cid).prescore));
  const mapped = d3.map(combinations, combo => {
    var fjFinalScores = d3.map([0,1,2], p => fjInitialScores[p] + (fjWagers[p] * (combo[p] ? 1 : -1)));
    var winningScore = d3.max(fjFinalScores);
    var winners = d3.filter([0,1,2], idx => fjFinalScores[idx] === winningScore);
    winners = d3.map(winners, w => w+1);
    if (winningScore <= 0) {
      return [-1]
    } else {
      return winners
    }
  })
  return mapped
})

const finalJeopardyMatrixCells = isPopCulture() ? popCultureFinalJeopardyMatrixCells : standardFinalJeopardyMatrixCells


//Charts
const graphAttributesList = data.computedIfRefHasValue(gameHasAttemptData, hasAttempt => hasAttempt ? gcsAttributes.all_attributes : gcsAttributes.attributes_without_att)

const histogramGraphAttributeSelectedIdx = ref(-1)
const histogramGraphAttributeIdx = computed(() => histogramGraphAttributeSelectedIdx.value >= 0 ? histogramGraphAttributeSelectedIdx.value : 0)
const histogramGraphAttribute = data.computedIfRefHasValues([graphAttributesList, histogramGraphAttributeIdx], (attrList, idx) => attrList[idx])
const histogramGraphRoundIdx = ref(0)

const xScatterGraphAttributeSelectedIdx = ref(-1)
const xScatterGraphAttributeDefaultIdx = data.computedIfRefHasValues(
  [graphAttributesList, gameHasAttemptData],
  (attrList, hasAttempt) => hasAttempt ? attrList.indexOf(gcsAttributes.att_value) : attrList.indexOf(gcsAttributes.buz_value))
const xScatterGraphAttributeIdx = data.computedIfRefHasValues(
  [xScatterGraphAttributeSelectedIdx, xScatterGraphAttributeDefaultIdx],
  (selectedIdx, defaultIdx) => selectedIdx >= 0 ? selectedIdx : defaultIdx)
const xScatterGraphAttribute = data.computedIfRefHasValues([graphAttributesList, xScatterGraphAttributeIdx], (attrList, idx) => attrList[idx])
const yScatterGraphAttributeSelectedIdx = ref(-1)
const yScatterGraphAttributeDefaultIdx = data.computedIfRefHasValues(
  [graphAttributesList, gameHasAttemptData],
  (attrList, hasAttempt) => hasAttempt ? attrList.indexOf(gcsAttributes.conversion_value_percent) : attrList.indexOf(gcsAttributes.acc_value_percent))
const yScatterGraphAttributeIdx = data.computedIfRefHasValues(
  [yScatterGraphAttributeSelectedIdx, yScatterGraphAttributeDefaultIdx],
  (selectedIdx, defaultIdx) => selectedIdx >= 0 ? selectedIdx : defaultIdx)
const yScatterGraphAttribute = data.computedIfRefHasValues([graphAttributesList, yScatterGraphAttributeIdx], (attrList, idx) => attrList[idx])
const scatterGraphRoundIdx = ref(0)

const scatterSpecification = computed(() => {
  if (!contestantDataById.value || !jschemaAllGameRoundContestantStatDataFlat.value || !allGameContestantStatData.value) return null
  const xAttr = xScatterGraphAttribute.value
  const yAttr = yScatterGraphAttribute.value
  var histogramData = allGameContestantStatData.value
  var scatterData = gameContestantStatData.value
  if (scatterGraphRoundIdx.value > 0) {
    histogramData = jschemaAllGameRoundContestantStatByRound.value.get(scatterGraphRoundIdx.value)
    scatterData = jschemaGameRoundContestantStatDataByRound.value[scatterGraphRoundIdx.value]
  }
  histogramData = d3.filter(histogramData, r => xAttr.generatingFunction(r) !== undefined && yAttr.generatingFunction(r) !== undefined)
  scatterData = d3.filter(scatterData, r => xAttr.generatingFunction(r) !== undefined && yAttr.generatingFunction(r) !== undefined)
  return {
    histogramData: histogramData,
    scatterData: scatterData,
    scatterLabelFunction: d => contestantDataById.value.get(d.contestant_id).name,
    scatterColorFunction: d => isPopCulture() ? teamContestantColor.value(d.contestant_id) : color.value(d.contestant_id),
    title: xAttr['label'] + ' vs ' + yAttr['label'],
    xLabel: xAttr['label'],
    xFunction: xAttr.generatingFunction,
    xBins: xAttr['bins'],
    yLabel: yAttr['label'],
    yFunction: yAttr.generatingFunction,
    yBins: yAttr['bins'],
  }
})

const teamScatterSpecification = computed(() => {
  if (!teamDataById.value || !jschemaAllGameRoundTeamStatDataFlat.value || !allGameTeamStatData.value) return null
  const xAttr = xScatterGraphAttribute.value
  const yAttr = yScatterGraphAttribute.value
  var histogramData = allGameTeamStatData.value
  var scatterData = gameTeamStatData.value
  if (scatterGraphRoundIdx.value > 0) {
    histogramData = jschemaAllGameRoundTeamStatByRound.value.get(scatterGraphRoundIdx.value)
    scatterData = jschemaGameRoundTeamStatDataByRound.value[scatterGraphRoundIdx.value]
  }
  histogramData = d3.filter(histogramData, r => xAttr.generatingFunction(r) !== undefined && yAttr.generatingFunction(r) !== undefined)
  scatterData = d3.filter(scatterData, r => xAttr.generatingFunction(r) !== undefined && yAttr.generatingFunction(r) !== undefined)
  return {
    histogramData: histogramData,
    scatterData: scatterData,
    scatterLabelFunction: d => teamDataById.value.get(d.team_id).name,
    scatterColorFunction: d => isPopCulture() ? teamColor.value(d.team_id) : color.value(d.contestant_id),
    title: xAttr['label'] + ' vs ' + yAttr['label'],
    xLabel: xAttr['label'],
    xFunction: xAttr.generatingFunction,
    xBins: xAttr['bins'],
    yLabel: yAttr['label'],
    yFunction: yAttr.generatingFunction,
    yBins: yAttr['bins'],
  }
})

const histogramSpecification = computed(() => {
  if (!contestantDataById.value || !jschemaAllGameRoundContestantStatDataFlat.value || !allGameContestantStatData.value) return null
  const xAttr = histogramGraphAttribute.value
  var histogramData = allGameContestantStatData.value
  var scatterData = gameContestantStatData.value
  if (histogramGraphRoundIdx.value > 0) {
    histogramData = jschemaAllGameRoundContestantStatByRound.value.get(histogramGraphRoundIdx.value)
    scatterData = jschemaGameRoundContestantStatDataByRound.value[histogramGraphRoundIdx.value]
  }
  histogramData = d3.filter(histogramData, r => xAttr.generatingFunction(r) !== undefined)
  scatterData = d3.filter(scatterData, r => xAttr.generatingFunction(r) !== undefined)
  return {
    histogramData: histogramData,
    lineData: scatterData,
    lineLabelFunction: d => contestantDataById.value.get(d.contestant_id).name,
    lineColorFunction: isPopCulture() ? (d => teamContestantColor.value(d.contestant_id)) : (d => color.value(d.contestant_id)),
    title: xAttr['label'],
    xLabel: xAttr['label'],
    xFunction: xAttr.generatingFunction,
    xBins: xAttr['bins']
  }
})
const teamHistogramSpecification = computed(() => {
  if (!teamDataById.value || !jschemaAllGameRoundTeamStatDataFlat.value || !allGameTeamStatData.value) return null
  const xAttr = histogramGraphAttribute.value
  var histogramData = allGameTeamStatData.value
  var scatterData = gameTeamStatData.value
  if (histogramGraphRoundIdx.value > 0) {
    histogramData = jschemaAllGameRoundTeamStatByRound.value.get(histogramGraphRoundIdx.value)
    scatterData = jschemaGameRoundTeamStatDataByRound.value[histogramGraphRoundIdx.value]
  }
  histogramData = d3.filter(histogramData, r => xAttr.generatingFunction(r) !== undefined)
  scatterData = d3.filter(scatterData, r => xAttr.generatingFunction(r) !== undefined)
  return {
    histogramData: histogramData,
    lineData: scatterData,
    lineLabelFunction: d => teamDataById.value.get(d.team_id).name,
    lineColorFunction: isPopCulture() ? (d => teamColor.value(d.team_id)) : (d => color.value(d.contestant_id)),
    title: xAttr['label'],
    xLabel: xAttr['label'],
    xFunction: xAttr.generatingFunction,
    xBins: xAttr['bins']
  }
})
</script>

<template>
  <Header />
  <div class="component-body" :data-bs-theme="subdomainIdentifier()">
    <div v-if="gameData && gameStatData" class="section">
      <div class="overview">
        <div class="overview-row">
          <div class="caption-stack">
            <div class="caption">Date</div>
            <div class="value">{{ dateFormat(gameData.airdate) }}</div>
          </div>
          <div class="caption-stack">
            <div class="caption">Season</div>
            <div class="value">{{ seasonDisplayId(gameData.season_id) }}</div>
          </div>
          <div class="caption-stack">
            <div class="caption">Game</div>
            <div class="value">{{ gameData.game_in_season }}</div>
          </div>
          <div class="caption-stack">
            <div class="caption">Type</div>
            <div class="value">{{ playClassificationName(gameData?.play_classification, gameData?.season_id) }}</div>
          </div>
          <div class="caption-stack">
            <div class="caption">TOC Period</div>
            <div class="value">{{ gameData?.toc_period }}</div>
          </div>
        </div>
        <div class="overview-row">
          <div class="overview-window">
            <table id="game-result-overview">
              <thead>
                <tr>
                  <th></th>
                  <th>Buz$</th>
                  <th>DD$</th>
                  <th>FJ$</th>
                  <th>Total$</th>
                </tr>
              </thead>
              <tbody v-if="isSyndicated()">
                <tr v-for="gcs in gameContestantStatData" :class="gcs.contestant_id === gameData.winning_contestant_id ? 'winner' : ''">
                  <td v-html="contestantLink(gcs.contestant_id, contestantDataById.get(gcs.contestant_id).name)"></td>
                  <td>{{ gcsAttributes.buz_score.generatingFunction(gcs) }}</td>
                  <td>{{ gcsAttributes.dd_score.generatingFunction(gcs) }}</td>
                  <td>{{ gcsAttributes.fj_score.generatingFunction(gcs) }}</td>
                  <td>{{ gcsAttributes.fj_final_score.generatingFunction(gcs) }}</td>
                </tr>
              </tbody>
              <tbody v-if="isPopCulture()">
                <tr v-for="gcs in gameTeamStatData" :class="gcs.team_id === gameData.winning_team_id ? 'winner' : ''">
                  <td v-html="teamLink(gcs.team_id, teamDataById.get(gcs.team_id).name)"></td>
                  <td>{{ gcsAttributes.buz_score.generatingFunction(gcs) }}</td>
                  <td>{{ gcsAttributes.dd_score.generatingFunction(gcs) }}</td>
                  <td>{{ gcsAttributes.fj_score.generatingFunction(gcs) }}</td>
                  <td>{{ gcsAttributes.fj_final_score.generatingFunction(gcs) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="overview-window">
            <div class="overview-row">
              <div class="caption-stack" v-if="gameHasAttemptData">
                <div class="caption">Total Attempt Value</div>
                <div class="value" v-if="gameStatData.att_value_total > 0">${{ formatNumber(gameStatData.att_value_total, 0, true) }}</div>
                <div class="value" v-else></div>
              </div>
              <div class="caption-stack">
                <div class="caption">Combined Positive Coryat</div>
                <div class="value">${{ formatNumber(gameStatData.coryat_score_positive_total, 0, true) }}</div>
              </div>
              <div class="caption-stack" v-if="gameHasAttemptData">
                <div class="caption">Contention</div>
                <div class="value" v-if="gameStatData.contention > 0">{{ formatNumber(gameStatData.contention * 100, 0, true) }}%</div>
                <div class="value" v-else></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="gameData" class="section player-statistics">
      <div class="section-header"><span v-if="isPopCulture()">Team</span><span v-else>Player</span> Statistics</div>
      <div class="option-groups">
        <OptionGroup :optionLabels="roundOptionLabels" :selectionIndex="selectedRoundIndex"
          @newSelectionIndex="(idx) => selectedRoundIndex = idx" />
      </div>
      <div class="subsection" v-if="teamStandardScoringTableSpec">
        <div class="subsection-header">Standard Metrics</div>
        <SortableTable v-bind="teamStandardScoringTableSpec" />
      </div>
      <div class="subsection" v-if="teamConversionScoringTableSpec && gameHasAttemptData">
        <div class="subsection-header">Conversion Metrics</div>
        <SortableTable v-bind="teamConversionScoringTableSpec" />
      </div>
      <div class="subsection" v-if="teamConversionValueScoringTableSpec && gameHasAttemptData">
        <div class="subsection-header">Conversion Value Metrics</div>
        <SortableTable v-bind="teamConversionValueScoringTableSpec" />
      </div>
      <div class="subsection" v-if="teamSlimConversionValueScoringTableSpec && !gameHasAttemptData">
        <div class="subsection-header">Conversion Metrics</div>
        <SortableTable v-bind="teamSlimConversionValueScoringTableSpec" />
      </div>
      <div class="subsection">
        <div class="subsection-header">Standard Metrics</div>
        <SortableTable v-if="standardScoringTableSpec" v-bind="standardScoringTableSpec" />
      </div>
      <div class="subsection" v-if="gameHasAttemptData">
        <div class="subsection-header">Conversion Metrics</div>
        <SortableTable v-if="conversionScoringTableSpec" v-bind="conversionScoringTableSpec" />
      </div>
      <div class="subsection" v-if="gameHasAttemptData">
        <div class="subsection-header">Conversion Value Metrics</div>
        <SortableTable v-if="conversionValueScoringTableSpec" v-bind="conversionValueScoringTableSpec" />
      </div>
      <div class="subsection" v-if="!gameHasAttemptData">
        <div class="subsection-header">Conversion Metrics</div>
        <SortableTable v-if="slimConversionValueScoringTableSpec" v-bind="slimConversionValueScoringTableSpec" />
      </div>
    </div>
    <div class="section response-boards-section" v-if="isSyndicated()">
      <div class="section-header">Correct Responses</div>
      <div id="view-boards">
        <div v-for="round in d3.range(1, gameRounds + 1)">
          <div class="subsection-header">{{ roundName(round) }} Round</div>
          <table class="view-board" v-if="jschemaClueByRoundRowColumn && jschemaClueByRoundRowColumn.get(round) && jschemaResponseByRoundClue && jschemaResponseByRoundClue.get(round)" >
            <tr v-for="row in d3.range(1,6)">
              <td v-for="column in d3.range(1,7)">
                <div v-if="jschemaClueByRoundRowColumn.get(round).get(row).get(column)"
                    :class="(jschemaClueByRoundRowColumn.get(round).get(row).get(column)['is_daily_double'] === 1 ? 'daily-double' : '') +
                            (jschemaClueByRoundRowColumn.get(round).get(row).get(column)['is_triple_play'] === 1 ? 'triple-play' : '')">
                  <template v-if="jschemaResponseByRoundClue.get(round).get(jschemaClueByRoundRowColumn.get(round).get(row).get(column).clue_of_round) && 
                        jschemaResponseByRoundClue.get(round).get(jschemaClueByRoundRowColumn.get(round).get(row).get(column).clue_of_round).filter(r => r.is_correct).length > 0">
                    <div v-for="correctResponseItem in jschemaResponseByRoundClue.get(round).get(jschemaClueByRoundRowColumn.get(round).get(row).get(column).clue_of_round).filter(r => r.is_correct)"
                      :style="'background-color: ' + color(correctResponseItem.contestant_id)"
                      >
                    </div>                  
                  </template>
                  <template v-else>
                    <div style="background-color: gray">
                    </div>
                  </template>
                </div>
                <div v-else>
                  <div style="background-color: black">
                  </div>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
    <div class="section response-boards-section" v-if="isPopCulture()">
      <div class="section-header">Correct Responses</div>
      <div id="view-boards">
        <div v-for="round in d3.range(1, gameRounds + 1)">
          <div class="subsection-header">{{ roundName(round) }} Round</div>
          <table class="view-board" v-if="jschemaClueByRoundRowColumn && jschemaClueByRoundRowColumn.get(round) && jschemaResponseByRoundClue && jschemaTeamResponseByRoundClue && jschemaResponseByRoundClue.get(round)" >
            <tr v-for="row in d3.range(1,6)">
              <td v-for="column in d3.range(1,7)">
                <div v-if="jschemaClueByRoundRowColumn.get(round).get(row).get(column)"
                    :class="(jschemaClueByRoundRowColumn.get(round).get(row).get(column)['is_daily_double'] === 1 ? 'daily-double' : '') +
                            (jschemaClueByRoundRowColumn.get(round).get(row).get(column)['is_triple_play'] === 1 ? 'triple-play' : '')">
                  <template v-if="jschemaClueByRoundRowColumn.get(round).get(row).get(column)['is_triple_play'] === 1 &&
                        jschemaResponseByRoundClue.get(round).get(jschemaClueByRoundRowColumn.get(round).get(row).get(column).clue_of_round) && 
                        jschemaResponseByRoundClue.get(round).get(jschemaClueByRoundRowColumn.get(round).get(row).get(column).clue_of_round).filter(r => r.is_correct).length >= 3">
                    <div v-for="correctResponseItem in jschemaResponseByRoundClue.get(round).get(jschemaClueByRoundRowColumn.get(round).get(row).get(column).clue_of_round).filter(r => r.is_correct)"
                      :style="'background-color: ' + teamContestantColor(correctResponseItem.contestant_id)"
                      >
                    </div>                  
                  </template>
                  <template v-else-if="jschemaClueByRoundRowColumn.get(round).get(row).get(column)['is_triple_play'] === 1 &&
                        jschemaResponseByRoundClue.get(round).get(jschemaClueByRoundRowColumn.get(round).get(row).get(column).clue_of_round) && 
                        jschemaResponseByRoundClue.get(round).get(jschemaClueByRoundRowColumn.get(round).get(row).get(column).clue_of_round).filter(r => r.is_correct).length < 3">
                    <div v-for="correctResponseItem in jschemaResponseByRoundClue.get(round).get(jschemaClueByRoundRowColumn.get(round).get(row).get(column).clue_of_round).filter(r => r.is_correct)"
                      :style="'background-color: ' + teamContestantColor(correctResponseItem.contestant_id)"
                      >
                    </div>                  
                    <div v-for="i in _.range(3 - jschemaResponseByRoundClue.get(round).get(jschemaClueByRoundRowColumn.get(round).get(row).get(column).clue_of_round).filter(r => r.is_correct).length)"
                      style="background-color: gray"
                      >
                    </div>                  
                  </template>
                  <template v-else-if="jschemaClueByRoundRowColumn.get(round).get(row).get(column)['is_daily_double'] === 1 &&
                        jschemaTeamResponseByRoundClue.get(round).get(jschemaClueByRoundRowColumn.get(round).get(row).get(column).clue_of_round) && 
                        jschemaTeamResponseByRoundClue.get(round).get(jschemaClueByRoundRowColumn.get(round).get(row).get(column).clue_of_round).filter(r => r.is_correct).length > 0">
                    <div v-for="correctResponseItem in jschemaTeamResponseByRoundClue.get(round).get(jschemaClueByRoundRowColumn.get(round).get(row).get(column).clue_of_round).filter(r => r.is_correct)"
                      :style="'background-color: ' + teamColor(correctResponseItem.team_id)"
                      >
                    </div>                  
                  </template>
                  <template v-else-if="jschemaResponseByRoundClue.get(round).get(jschemaClueByRoundRowColumn.get(round).get(row).get(column).clue_of_round) && 
                        jschemaResponseByRoundClue.get(round).get(jschemaClueByRoundRowColumn.get(round).get(row).get(column).clue_of_round).filter(r => r.is_correct).length > 0">
                    <div v-for="correctResponseItem in jschemaResponseByRoundClue.get(round).get(jschemaClueByRoundRowColumn.get(round).get(row).get(column).clue_of_round).filter(r => r.is_correct)"
                      :style="'background-color: ' + teamContestantColor(correctResponseItem.contestant_id)"
                      >
                    </div>                  
                  </template>
                  <template v-else>
                    <div style="background-color: gray">
                    </div>
                  </template>
                </div>
                <div v-else>
                  <div style="background-color: black">
                  </div>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </div>
      <div class="legend" v-if="gameContestantIds && contestantDataById && gameTeamIds && teamDataById">
        <div>
          <span v-for="team_id in gameTeamIds">
            <span :style="'color: ' + teamColor(team_id)">&#9632;</span>{{ teamDataById.get(team_id).name }}
          </span>
        </div>
        <div>
          <span v-for="contestant_id in gameContestantIds">
            <span :style="'color: ' + teamContestantColor(contestant_id)">&#9632;</span>{{ contestantDataById.get(contestant_id).name }}
          </span>
        </div>
      </div>
    </div>
    <div class="section" v-if="isSyndicated() && jschemaClueData && contestantDataById && jschemaClueContestantStatDataByRoundClueAndContestantId && gameContestantIds">
      <div class="section-header">Daily Doubles</div>
      <div class="game-stat-listing">
        <table>
          <thead>
            <tr class="bg-secondary">
              <th>Round</th>
              <th>Clue</th>
              <th>Value</th>
              <th><span :style="'color: ' + color(gameContestantIds[0])">&#9632;</span>&nbsp;{{ contestantDataById.get(gameContestantIds[0]).name }}</th>
              <th><span :style="'color: ' + color(gameContestantIds[1])">&#9632;</span>&nbsp;{{ contestantDataById.get(gameContestantIds[1]).name }}</th>
              <th><span :style="'color: ' + color(gameContestantIds[2])">&#9632;</span>&nbsp;{{ contestantDataById.get(gameContestantIds[2]).name }}</th>
              <th>Selector</th>
              <th>DD$</th>
              <th>New Score</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="clueData in jschemaClueData.filter(c => c.is_daily_double)">
              <td>{{ clueData.round_of_game }}</td>
              <td>{{ clueData.clue_of_round }}</td>
              <td>{{ clueData.value }}</td>
              <td>{{ jschemaClueContestantStatDataByRoundClueAndContestantId.get(clueData.round_of_game).get(clueData.clue_of_round).get(gameContestantIds[0]).prescore }}</td>
              <td>{{ jschemaClueContestantStatDataByRoundClueAndContestantId.get(clueData.round_of_game).get(clueData.clue_of_round).get(gameContestantIds[1]).prescore }}</td>
              <td>{{ jschemaClueContestantStatDataByRoundClueAndContestantId.get(clueData.round_of_game).get(clueData.clue_of_round).get(gameContestantIds[2]).prescore }}</td>
              <td><span :style="'color: ' + color(clueData.selecting_contestant_id)">&#9632;</span>&nbsp;{{ contestantDataById.get(clueData.selecting_contestant_id).name }}</td>
              <td>{{ jschemaClueContestantStatDataByRoundClueAndContestantId.get(clueData.round_of_game).get(clueData.clue_of_round).get(clueData.selecting_contestant_id).dd_score }}</td>
              <td>{{ jschemaClueContestantStatDataByRoundClueAndContestantId.get(clueData.round_of_game).get(clueData.clue_of_round).get(clueData.selecting_contestant_id).postscore }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="section">
      <div class="section-header">Final Jeopardy! Win Matrix</div>
      <div id="fj-matrix-container">
        <div class="game-stat-listing" v-if="isPopCulture()">
          <table>
            <thead>
              <tr class="bg-secondary">
                <th>Team</th>
                <th>If Incorrect</th>
                <th>If Correct</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="gcsData in gameTeamStatData">
                <td>
                  <span :style="'color: ' + teamColor(gcsData.team_id)">&#9632;</span>&nbsp;{{ teamDataById.get(gcsData.team_id).name }}
                </td>
                <td>{{ gcsAttributes.fj_start_score.generatingFunction(gcsData) - Math.abs(gcsAttributes.fj_score.generatingFunction(gcsData)) }}</td>
                <td>{{ gcsAttributes.fj_start_score.generatingFunction(gcsData) + Math.abs(gcsAttributes.fj_score.generatingFunction(gcsData)) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="game-stat-listing" v-else>
          <table>
            <thead>
              <tr class="bg-secondary">
                <th>Contestant</th>
                <th>If Incorrect</th>
                <th>If Correct</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="gcsData in gameContestantStatData">
                <td>
                  <span :style="'color: ' + color(gcsData.contestant_id)">&#9632;</span>&nbsp;{{ contestantDataById.get(gcsData.contestant_id).name }}
                </td>
                <td>{{ gcsAttributes.fj_start_score.generatingFunction(gcsData) - Math.abs(gcsAttributes.fj_score.generatingFunction(gcsData)) }}</td>
                <td>{{ gcsAttributes.fj_start_score.generatingFunction(gcsData) + Math.abs(gcsAttributes.fj_score.generatingFunction(gcsData)) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <table id="fj-matrix">
          <tr>
            <td class="empty"></td>
            <th colspan="2" :style="'background-color: ' + threeColorSet[1]">Correct</th>
            <th colspan="2" :style="'background-color: ' + threeColorSet[1]">Incorrect</th>
          </tr>
          <tr>
            <td class="empty"></td>
            <th :style="'background-color: ' + threeColorSet[2]">Correct</th>
            <th :style="'background-color: ' + threeColorSet[2]">Incorrect</th>
            <th :style="'background-color: ' + threeColorSet[2]">Correct</th>
            <th :style="'background-color: ' + threeColorSet[2]">Incorrect</th>
          </tr>
          <tr>
            <th :style="'background-color: ' + threeColorSet[0]">Correct</th>
            <td v-for="idx in [0,1,2,3]">
              <div>
                <div v-for="winnerItem in finalJeopardyMatrixCells[idx]"
                    :style="'background-color: ' + (winnerItem === -1 ? 'black' : (winnerItem === 0 ? 'gray' : threeColorSet[winnerItem-1]))"
                    >
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <th :style="'background-color: ' + threeColorSet[0]">Incorrect</th>
            <td v-for="idx in [4,5,6,7]">
              <div>
                <div v-for="winnerItem in finalJeopardyMatrixCells[idx]"
                    :style="'background-color: ' + (winnerItem === -1 ? 'black' : (winnerItem === 0 ? 'gray' : threeColorSet[winnerItem-1]))"
                    >
                </div>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <CumulativeChartSection
      :jschemaClueTeamStatData="jschemaClueTeamStatData"
      :jschemaClueContestantStatData="jschemaClueContestantStatData"
      :jschemaClueData="jschemaClueData"
      :gameHasAttemptData="gameHasAttemptData"
      :gameTeamIds="gameTeamIds"
      :gameContestantIds="gameContestantIds"
      :teamDataById="teamDataById"
      :contestantDataById="contestantDataById"
      :teamColorFn="teamColor"
      :contestantColorFn="isPopCulture() ? teamContestantColor : color"
    />

    <div class="section">
      <div class="section-header"><span v-if="gameHasAttemptData">Attempts</span><span v-else>Buzzes</span></div>
      <StackValueBarChart
        v-if="isSyndicated() && gameContestantIds && jschemaGameRoundContestantStatData && contestantDataById" 
        :data="gameContestantIds"
        :xCoreLabelFunction="cid => contestantDataById.get(cid).name"
        :xGroupLabels="[roundAbbreviation(1),roundAbbreviation(2)].concat(gameRounds >= 3 ? [roundAbbreviation(3)] : [])"
        :yFunctionGroups="d3.range(1, gameRounds+1).map(rid => 
          [
            cid => jschemaGameRoundContestantStatData.get(rid).get(cid).buzc,
            cid => jschemaGameRoundContestantStatData.get(rid).get(cid).buz,
            cid => formatNumber(jschemaGameRoundContestantStatData.get(rid).get(cid).att, 0)
          ])"
        :colorFunction="cid => color(cid)"
        :yLabel="gameHasAttemptData ? 'BuzC -> Buz -> Att' : 'BuzC -> Buz'"
        :title="gameHasAttemptData ? 'Attempts' : 'Buzzes'"/>
      <StackValueBarChart 
        v-if="isPopCulture() && gameTeamIds && jschemaGameRoundTeamStatData && teamDataById"
        :data="gameTeamIds"
        :xCoreLabelFunction="cid => teamDataById.get(cid).name"
        :xGroupLabels="[roundAbbreviation(1),roundAbbreviation(2)].concat(gameRounds >= 3 ? [roundAbbreviation(3)] : [])"
        :yFunctionGroups="d3.range(1, gameRounds+1).map(rid => 
          [
            cid => jschemaGameRoundTeamStatData.get(rid).get(cid).buzc,
            cid => jschemaGameRoundTeamStatData.get(rid).get(cid).buz,
            cid => formatNumber(jschemaGameRoundTeamStatData.get(rid).get(cid).att, 0)
          ])"
        :colorFunction="cid => teamColor(cid)"
        :yLabel="gameHasAttemptData ? 'BuzC -> Buz -> Att' : 'BuzC -> Buz'"
        :title="gameHasAttemptData ? 'Attempts' : 'Buzzes'"/>
      <StackValueBarChart 
        v-if="isPopCulture() && gameContestantIds && jschemaGameRoundContestantStatData && contestantDataById"
        :data="gameContestantIds"
        :xCoreLabelFunction="cid => contestantDataById.get(cid).name"
        :xGroupLabels="[roundAbbreviation(1),roundAbbreviation(2)].concat(gameRounds >= 3 ? [roundAbbreviation(3)] : [])"
        :yFunctionGroups="d3.range(1, gameRounds+1).map(rid => 
          [
            cid => jschemaGameRoundContestantStatData.get(rid).get(cid).buzc,
            cid => jschemaGameRoundContestantStatData.get(rid).get(cid).buz,
            cid => formatNumber(jschemaGameRoundContestantStatData.get(rid).get(cid).att, 0)
          ])"
        :colorFunction="cid => teamContestantColor(cid)"
        :yLabel="gameHasAttemptData ? 'BuzC -> Buz -> Att' : 'BuzC -> Buz'"
        :title="gameHasAttemptData ? 'Attempts' : 'Buzzes'"/>
    </div>

    <div class="section">
      <div class="section-header"><span v-if="gameHasAttemptData">Attempt Values</span><span v-else>Buzz Values</span></div>
      <StackValueBarChart 
        v-if="isSyndicated() && gameContestantIds && jschemaGameRoundContestantStatData && contestantDataById"
        :data="gameContestantIds"
        :xCoreLabelFunction="cid => contestantDataById.get(cid).name"
        :xGroupLabels="[roundAbbreviation(1),roundAbbreviation(2)].concat(gameRounds >= 3 ? [roundAbbreviation(3)] : [])"
        :yFunctionGroups="d3.range(1, gameRounds+1).map(rid => 
          [
            cid => jschemaGameRoundContestantStatData.get(rid).get(cid).buz_score,
            cid => jschemaGameRoundContestantStatData.get(rid).get(cid).buz_value,
            cid => formatNumber(jschemaGameRoundContestantStatData.get(rid).get(cid).att_value, 0)
          ])"
        :colorFunction="cid => color(cid)"
        :yLabel="gameHasAttemptData ? 'Buz$ -> BuzValue -> AttValue' : 'Buz$ -> BuzValue'"
        :title="gameHasAttemptData ? 'Attempt Values' : 'Buzz Values'"/>
      <StackValueBarChart 
        v-if="isPopCulture() && gameTeamIds && jschemaGameRoundTeamStatData && teamDataById"
        :data="gameTeamIds"
        :xCoreLabelFunction="cid => teamDataById.get(cid).name"
        :xGroupLabels="[roundAbbreviation(1),roundAbbreviation(2)].concat(gameRounds >= 3 ? [roundAbbreviation(3)] : [])"
        :yFunctionGroups="d3.range(1, gameRounds+1).map(rid => 
          [
            cid => jschemaGameRoundTeamStatData.get(rid).get(cid).buz_score,
            cid => jschemaGameRoundTeamStatData.get(rid).get(cid).buz_value,
            cid => formatNumber(jschemaGameRoundTeamStatData.get(rid).get(cid).att_value, 0)
          ])"
        :colorFunction="cid => teamColor(cid)"
        :yLabel="gameHasAttemptData ? 'Buz$ -> BuzValue -> AttValue' : 'Buz$ -> BuzValue'"
        :title="gameHasAttemptData ? 'Attempt Values' : 'Buzz Values'"/>
      <StackValueBarChart 
        v-if="isPopCulture() && gameContestantIds && jschemaGameRoundContestantStatData && contestantDataById"
        :data="gameContestantIds"
        :xCoreLabelFunction="cid => contestantDataById.get(cid).name"
        :xGroupLabels="[roundAbbreviation(1),roundAbbreviation(2)].concat(gameRounds >= 3 ? [roundAbbreviation(3)] : [])"
        :yFunctionGroups="d3.range(1, gameRounds+1).map(rid => 
          [
            cid => jschemaGameRoundContestantStatData.get(rid).get(cid).buz_score,
            cid => jschemaGameRoundContestantStatData.get(rid).get(cid).buz_value,
            cid => formatNumber(jschemaGameRoundContestantStatData.get(rid).get(cid).att_value, 0)
          ])"
        :colorFunction="cid => teamContestantColor(cid)"
        :yLabel="gameHasAttemptData ? 'Buz$ -> BuzValue -> AttValue' : 'Buz$ -> BuzValue'"
        :title="gameHasAttemptData ? 'Attempt Values' : 'Buzz Values'"/>
    </div>

    <div class="section" v-if="graphAttributesList">
      <div class="section-header">Selectable Histograms</div>
      <div class="option-groups">
        <OptionDropdown
          :optionLabels="graphAttributesList.map(attr => attr.label)"
          :selectionIndex="histogramGraphAttributeIdx"
          @newSelectionIndex="(idx) => histogramGraphAttributeSelectedIdx = idx"
        />
        <OptionDropdown
          :optionLabels="['Full Game', 'J! Round', 'DJ! Round'].concat(gameRounds >= 3 ? ['TJ! Round'] : [])"
          :selectionIndex="histogramGraphRoundIdx"
          @newSelectionIndex="(idx) => histogramGraphRoundIdx = idx"
        />
      </div>
      <HighlightHistogram v-bind="teamHistogramSpecification" v-if="isPopCulture() && teamHistogramSpecification"/>
      <HighlightHistogram v-bind="histogramSpecification" v-if="histogramSpecification" />
    </div>


    <div class="section" v-if="graphAttributesList">
      <div class="section-header">Selectable Scatter Plots</div>
      <div class="option-groups">
        <OptionDropdown
          :optionLabels="graphAttributesList.map(attr => attr.label)"
          :selectionIndex="xScatterGraphAttributeIdx"
          @newSelectionIndex="(idx) => xScatterGraphAttributeSelectedIdx = idx"
        />
        <OptionDropdown
          :optionLabels="graphAttributesList.map(attr => attr.label)"
          :selectionIndex="yScatterGraphAttributeIdx"
          @newSelectionIndex="(idx) => yScatterGraphAttributeSelectedIdx = idx"
        />
        <OptionDropdown
          :optionLabels="['Full Game', 'J! Round', 'DJ! Round'].concat(gameRounds >= 3 ? ['TJ! Round'] : [])"
          :selectionIndex="scatterGraphRoundIdx"
          @newSelectionIndex="(idx) => scatterGraphRoundIdx = idx"
        />
      </div>
      <ScatterHistogram v-bind="teamScatterSpecification" v-if="isPopCulture() && teamScatterSpecification"/>
      <ScatterHistogram v-bind="scatterSpecification" v-if="scatterSpecification"/>
    </div>
  </div>
  <Footer/>
</template>

<style lang="scss" scoped>
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins';

.section.player-statistics :deep(table) {
  width: 100%;
}

table.view-board td {
    width: 40px;
    height: 30px;
    border: 1px solid black;
    min-width: 40px;
}

table.view-board div {
    height: 100%;
    max-width: 100%;
    display: flex;
    flex-flow: row nowrap;
}

table.view-board div.daily-double {
    padding: 5px 5px;
    background-color: yellow;
}

table.view-board div.triple-play {
    padding: 5px 5px;
    background-color: var(--bs-primary);
}

table.view-board div div {
    height: 100%;
    width: auto;
    flex-grow: 1;
}

table#fj-matrix {
  border-collapse: separate;
}

table#fj-matrix td, table#fj-matrix th {
    width: 70px;
    height: 40px;
    border: 1px solid black;
    font-size: 13px;
}

table#fj-matrix td.empty {
  border: 0px solid white;
}

table#fj-matrix div {
    height: 100%;
    max-width: 100%;
    display: flex;
    flex-flow: row nowrap;
}

table#fj-matrix div div {
    height: 100%;
    width: auto;
    flex-grow: 1;
}

div#view-boards, div#fj-matrix-container {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-around;
}

div#view-boards > div {
    margin-left: 10px;
    margin-right: 20px;
}

.game-stat-listing {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  overflow-x: auto;
}

.game-stat-listing table {
  border-collapse: collapse;
  font-size: 0.6rem;
  align-self: left;
  width: 100%;
  @include media-breakpoint-up(sm) {
    font-size: 0.8rem;
  }
}

.game-stat-listing table th, .game-stat-listing table td {
    padding: 2px 5px;
    border-top: 1px solid #999999;
    border-bottom: 1px solid #999999;
}

.game-stat-listing table thead tr th {
  background: var(--color-jometry-secondary)
}

.game-stat-listing table tbody tr:nth-child(even) td {
    background: #EEEEEE;
}

.game-stat-listing table tbody tr:nth-child(odd) td {
    background: #FFFFFF;
}

.game-stat-listing table tr:hover td {
    background-color: #CCCCCC;
}

.game-stat-listing table td {
    text-align: center;
}

.overview table {
  margin: 0 auto;
}


.overview table td, .overview table th {
  padding: 0.1rem 0.5rem;
  font-size: 0.6rem;
  @include media-breakpoint-up(sm) {
    font-size: 0.8rem;
  }
}

.overview table tr.winner td {
  font-weight: bold;
}

.overview table td:first-child {
  text-align: left;
}

.response-boards-section .legend {
  font-size: 0.8rem;
  margin-top: 0.5em;

  > div > span {
    margin-left: 0.5em;
    margin-right: 0.5em;
  }
}

</style>
