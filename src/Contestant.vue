<script setup>
import { ref, computed } from 'vue'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as data from '@/data'
import { playClassificationNameByTocPeriod, seasonDisplayId } from '@/configuration'
import { threeColorSet, roundAbbreviation, subdomainIdentifier, isPopCulture,
  contestantIdToTeamIdMapFromGameData, teamIdToContestantIdMapFromGameData } from '@/util'
import * as gcsAttributes from '@/gameContestantStatAttributes'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'
import HighlightHistogramHorizontal from './components/util/HighlightHistogramHorizontal.vue'
import OptionDropdown from './components/util/OptionDropdown.vue'
import OptionGroup from './components/util/OptionGroup.vue'
import ScatterHistogram from './components/util/ScatterHistogram.vue'
import SortableTable from './components/util/SortableTable.vue'
import StackValueBarChart from './components/util/StackValueBarChart.vue'
import { dateFormat } from './util'

let urlParams = new URLSearchParams(window.location.search);
const contestantId = +urlParams.get('contestant_id')

const displayAsTeamListing = window.location.pathname === '/team.html'
const teamId = +urlParams.get('team_id')

data.loadContestantData()
const isPopCultureTeam = isPopCulture() && displayAsTeamListing
if (isPopCulture()) {
  data.loadTeamData()
}
if (isPopCultureTeam) {
  data.loadGameTeamStatData()
  data.loadGameRoundTeamStatData()
}
data.loadGameData()
data.loadGameContestantStatData()
data.loadGameRoundContestantStatData()

const allGameData = data.gameData
const contestantGames = data.computedIfRefHasValue(
  allGameData,
  gData => gData.filter(g => [g.podium_1_contestant_id, g.podium_2_contestant_id, g.podium_3_contestant_id,
    g.podium_1_1_contestant_id, g.podium_1_2_contestant_id, g.podium_1_3_contestant_id,
    g.podium_2_1_contestant_id, g.podium_2_2_contestant_id, g.podium_2_3_contestant_id,
    g.podium_3_1_contestant_id, g.podium_3_2_contestant_id, g.podium_3_3_contestant_id,
  ].includes(contestantId)))
const teamGames = data.computedIfRefHasValue(
  allGameData,
  gData => gData.filter(g => [g.podium_1_team_id, g.podium_2_team_id, g.podium_3_team_id].includes(teamId)))
const contestantGamesByStatisticalDatasetKeys = data.computedIfRefHasValue(
  contestantGames,
  cgData => d3.group(cgData, cg => cg.toc_period, cg => cg.play_classification))
const teamGamesByStatisticalDatasetKeys = data.computedIfRefHasValue(
  teamGames,
  cgData => d3.group(cgData, cg => cg.toc_period, cg => cg.play_classification))
const playClassificationPeriods = data.computedIfRefHasValue(
  isPopCultureTeam ? teamGamesByStatisticalDatasetKeys : contestantGamesByStatisticalDatasetKeys,
  cgs => {
    const periodIds = Array.from(cgs.keys())
    return periodIds.flatMap(pid => Array.from(cgs.get(pid).keys()).map(pctype => [pid, pctype]))
  })
const selectedPlayClassificationPeriodIdx = ref(-1)
const defaultPlayClassificationPeriodIdx = data.computedIfRefHasValue(
  playClassificationPeriods,
  pcps => pcps.findLastIndex(pcp => pcp[1] === 'regular') >= 0 ? pcps.findLastIndex(pcp => pcp[1] === 'regular') : 0
)
const playClassificationPeriodIdx = data.computedIfRefHasValues(
  [selectedPlayClassificationPeriodIdx, defaultPlayClassificationPeriodIdx],
  (selectedIdx, defaultIdx) => selectedIdx >= 0 ? selectedIdx : defaultIdx)
const playClassificationPeriod = data.computedIfRefHasValue(playClassificationPeriods, pcp => pcp[playClassificationPeriodIdx.value])
const displayRounds = data.computedIfRefHasValue(playClassificationPeriod, pcp => pcp[1] === 'celebrity' ? 3 : 2)

const contestantDataById = data.contestantDataById
const teamDataById = data.teamDataById

const singleContestantData = data.computedIfRefHasValue(contestantDataById, cData => cData.get(contestantId))
const singleTeamData = data.computedIfRefHasValue(teamDataById, cData => cData.get(teamId))

const singleCompetitorData = isPopCultureTeam ? singleTeamData : singleContestantData
const contestantIdToTeamIdMap = contestantIdToTeamIdMapFromGameData(contestantGames)
const teamIdToContestantIdMap = teamIdToContestantIdMapFromGameData(teamGames)

const gameIds = data.computedIfRefHasValues([allGameData, playClassificationPeriod],
  (gData, pcp) => gData.filter(g => (g.toc_period === pcp[0] || (g.toc_period_2 ? g.toc_period_2.toString() : undefined) === pcp[0]) && g.play_classification === pcp[1]).map(g => g.game_id))

const gameContestantStatData = data.computedIfRefHasValues(
  [gameIds, data.gameContestantStatData],
  (gids, gcsData) => gcsData.filter(gcs => gids.includes(gcs.game_id)))
const winnerGameContestantStatData = data.computedIfRefHasValues(
  [data.gameDataById, gameContestantStatData],
  (gData, gcsData) => gcsData.filter(gcs => gData.get(gcs.game_id).winning_contestant_id === gcs.contestant_id))
const gameContestantStatDataByContestantId = data.computedIfRefHasValue(gameContestantStatData, gcsData => d3.group(gcsData, gcs => gcs.contestant_id))
const singleContestantGameContestantStatData = data.computedIfRefHasValue(gameContestantStatDataByContestantId, gcsData => gcsData.get(contestantId))
const singleContestantGameContestantStatDataByGameId = data.computedIfRefHasValue(singleContestantGameContestantStatData, gcsData => d3.index(gcsData, gcs => gcs.game_id))

const gameTeamStatData = data.computedIfRefHasValues(
  [gameIds, data.gameTeamStatData],
  (gids, gcsData) => gcsData.filter(gcs => gids.includes(gcs.game_id)))
const winnerGameTeamStatData = data.computedIfRefHasValues(
  [data.gameDataById, gameTeamStatData],
  (gData, gcsData) => gcsData.filter(gcs => gData.get(gcs.game_id).winning_team_id === gcs.team_id))
const gameTeamStatDataByTeamId = data.computedIfRefHasValue(gameTeamStatData, gcsData => d3.group(gcsData, gcs => gcs.team_id))
const singleTeamGameTeamStatData = data.computedIfRefHasValue(gameTeamStatDataByTeamId, gcsData => gcsData.get(teamId))
const singleTeamGameTeamStatDataByGameId = data.computedIfRefHasValue(singleTeamGameTeamStatData, gcsData => d3.index(gcsData, gcs => gcs.game_id))

const roundContestantStatData = data.computedIfRefHasValues(
  [gameIds, data.gameRoundContestantStatData],
  (gids, rcsData) => rcsData.filter(rcs => gids.includes(rcs.game_id)))
const winnerRoundContestantStatDataByRound = data.computedIfRefHasValues(
  [data.gameDataById, roundContestantStatData],
  (gData, rcsData) => d3.group(rcsData.filter(rcs => gData.get(rcs.game_id).winning_contestant_id === rcs.contestant_id), rcs => rcs.round_of_game))
const roundContestantStatDataByRound = data.computedIfRefHasValues(
  [roundContestantStatData],
  (rcsData) => d3.group(rcsData, rcs => rcs.round_of_game))
const roundContestantStatDataByContestantIdAndRound = data.computedIfRefHasValues(
  [roundContestantStatData],
  (rcsData) => d3.group(rcsData, rcs => rcs.contestant_id, rcs => rcs.round_of_game))
const singleContestantRoundContestantStatData = data.computedIfRefHasValue(roundContestantStatDataByContestantIdAndRound, rcs => rcs.get(contestantId))
const singleContestantRoundContestantStatDataByRoundAndGameId = data.computedIfRefHasValues(
  [roundContestantStatData],
  (rcsData) => d3.index(rcsData, rcs => rcs.contestant_id, rcs => rcs.round_of_game, rcs => rcs.game_id).get(contestantId))

const roundTeamStatData = data.computedIfRefHasValues(
  [gameIds, data.gameRoundTeamStatData],
  (gids, rcsData) => rcsData.filter(rcs => gids.includes(rcs.game_id)))
const winnerRoundTeamStatDataByRound = data.computedIfRefHasValues(
  [data.gameDataById, roundTeamStatData],
  (gData, rcsData) => d3.group(rcsData.filter(rcs => gData.get(rcs.game_id).winning_team_id === rcs.team_id), rcs => rcs.round_of_game))
const roundTeamStatDataByRound = data.computedIfRefHasValues(
  [roundTeamStatData],
  (rcsData) => d3.group(rcsData, rcs => rcs.round_of_game))
const roundTeamStatDataByTeamIdAndRound = data.computedIfRefHasValues(
  [roundTeamStatData],
  (rcsData) => d3.group(rcsData, rcs => rcs.team_id, rcs => rcs.round_of_game))
const singleTeamRoundTeamStatData = data.computedIfRefHasValue(roundTeamStatDataByTeamIdAndRound, rcs => rcs.get(teamId))
const singleTeamRoundTeamStatDataByRoundAndGameId = data.computedIfRefHasValues(
  [roundTeamStatData],
  (rcsData) => d3.index(rcsData, rcs => rcs.team_id, rcs => rcs.round_of_game, rcs => rcs.game_id).get(teamId))

const singleCompetitorGameCompetitorStatData = isPopCultureTeam ? singleTeamGameTeamStatData : singleContestantGameContestantStatData
const winnerGameCompetitorStatData = isPopCultureTeam ? winnerGameTeamStatData : winnerGameContestantStatData
const gameCompetitorStatData = isPopCultureTeam ? gameTeamStatData : gameContestantStatData
const singleCompetitorRoundCompetitorStatData = isPopCultureTeam ? singleTeamRoundTeamStatData : singleContestantRoundContestantStatData
const winnerRoundCompetitorStatDataByRound = isPopCultureTeam ? winnerRoundTeamStatDataByRound : winnerRoundContestantStatDataByRound
const roundCompetitorStatDataByRound = isPopCultureTeam ? roundTeamStatDataByRound : roundContestantStatDataByRound
const anyGameHasAttemptData = data.computedIfRefHasValue(singleCompetitorGameCompetitorStatData, gcsData => gcsData.some(gData => !_.isNil(gData.att)))


function gameLink(game_id, season_id, game_of_season) {
  return '<a href="/game.html?game_id=' + 
    game_id + 
    '">' + seasonDisplayId(season_id) + '-' + game_of_season + '</a>'
}

const roundOptionLabels = ref(['Full Game', 'J Round', 'DJ Round'])
const selectedRoundIndex = ref(0)

const baseScoringTableRows = data.computedIfRefHasValues(
  [data.gameDataById, isPopCultureTeam ? singleTeamGameTeamStatData : singleContestantGameContestantStatData],
  (gData, gcsData) => {
    const gIds = gcsData.map(gcs => gcs.game_id)
    return gIds.map((game_id, idx) => {
      return {
        'game_id': game_id,
        'season_id': gData.get(game_id).season_id,
        'game_in_season': gData.get(game_id).game_in_season,
        'airdate': gData.get(game_id).airdate
      }
    })
  })

const baseScoringTableData = data.computedIfRefHasValues(
  [
    isPopCultureTeam ? singleTeamGameTeamStatData : singleContestantGameContestantStatData,
    isPopCultureTeam ? singleTeamRoundTeamStatData : singleContestantRoundContestantStatData
  ],
  (gcsData, gcrsData) => {
    if (selectedRoundIndex.value === 0) {
      return d3.index(gcsData, gcs => gcs.game_id)
    }
    return d3.index(gcrsData.get(selectedRoundIndex.value), gcs => gcs.game_id)
  })

const constructScoringTableSpecification = function(attrSpecs) {
  return data.computedIfRefHasValues(
    [baseScoringTableRows, data.gameDataById, baseScoringTableData],
    (baseRows, gData, gcsData) => {
      var columns = [
        {
          label: 'Game'
        }
      ]
      columns = columns.concat(attrSpecs.map(attr => ({
        label: attr.short_label,
        description: attr.description
      })))

      var rows = baseRows.map(baseRow => {
        const gid = baseRow.game_id
        var row = [
          {
            value: gameLink(gid, gData.get(gid).season_id, gData.get(gid).game_in_season),
            sortValue: baseRow.airdate
          }
        ]
        row = row.concat(attrSpecs.map(attr => ({
          value: attr.valueDisplayFormat(attr.generatingFunction(gcsData.get(gid))),
          sortValue: attr.valueDisplayFormat(attr.generatingFunction(gcsData.get(gid)))
        })))
        return row
      })

      var footerRows = [
        [ { value: 'Average' } ]
      ]

      footerRows[0] = footerRows[0].concat(attrSpecs.map(attr => {
        const gameIds = baseRows.map(baseRow => baseRow.game_id)
        const gcses = gameIds.flatMap(gid => gcsData.get(gid))
        return {
          value: attr.averageDisplayFormat(d3.mean(gcses.map(attr.generatingFunction)))
        }
      }))


      return {
        columns: columns,
        rows: rows,
        footerRows: footerRows,
        initialSortColumnIndex: 0,
        initialSortDescending: false
      }
    }
  )
}

const standardScoringAttributes = [gcsAttributes.buz, gcsAttributes.buzc, gcsAttributes.buz_score, gcsAttributes.coryat_score,
    gcsAttributes.dd_found, gcsAttributes.dd_plus_buzc, gcsAttributes.dd_plus_selection]
  .concat(isPopCulture() && !isPopCultureTeam ? [] : [gcsAttributes.dd_score])
  .concat(isPopCulture() ? [gcsAttributes.tp_score] : [])
  .concat(isPopCulture() && !isPopCultureTeam ? [] : [gcsAttributes.fj_start_score, gcsAttributes.fj_score])
  .concat([gcsAttributes.fj_final_score])
const standardScoringTableSpec = constructScoringTableSpecification(standardScoringAttributes)

const conversionScoringAttributes = [gcsAttributes.att, gcsAttributes.att_clue, gcsAttributes.buz,
    gcsAttributes.buz_percent, gcsAttributes.buzc, gcsAttributes.acc_percent, gcsAttributes.conversion_percent,
    gcsAttributes.time, gcsAttributes.timing_rating, gcsAttributes.solo]
const conversionScoringTableSpec = constructScoringTableSpecification(conversionScoringAttributes)

const conversionValueScoringAttributes = [gcsAttributes.att_value, gcsAttributes.buz_value, gcsAttributes.buz_value_percent,
    gcsAttributes.buz_score, gcsAttributes.acc_value_percent, gcsAttributes.conversion_value_percent,
    gcsAttributes.time_value, gcsAttributes.time_score,
    gcsAttributes.solo_value, gcsAttributes.solo_score]
const conversionValueScoringTableSpec = constructScoringTableSpecification(conversionValueScoringAttributes)

const slimConversionScoringAttributes = [gcsAttributes.buz, gcsAttributes.buzc,
    gcsAttributes.acc_percent, gcsAttributes.buz_value, gcsAttributes.buz_score, gcsAttributes.acc_value_percent]
const slimConversionScoringTableSpec = constructScoringTableSpecification(slimConversionScoringAttributes)

//Stacked bars
const buildStackedBarSpecificationLambda = function(yAttrs, title, slimTitle) {
  return (rIdx, gcsData, gData, winGcsData, allGcsData, rcsData, winRcsData, allRcsData, hasAttempt) => {
    var csData = gcsData
    var allCsData = allGcsData
    var winCsData = winGcsData
    if (rIdx > 0) {
      csData = rcsData.get(rIdx)
      allCsData = allRcsData.get(rIdx)
      winCsData = winRcsData.get(rIdx)
    }
    var yAttrsToUse = yAttrs.slice(0,3)
    var titleToUse = title
    if (!hasAttempt) {
      yAttrsToUse = yAttrs.slice(0,2)
      titleToUse = slimTitle
    }
    const dataSet = csData.map(cs => ({
      game_id: cs.game_id,
      airdate: gData.get(cs.game_id).airdate,
      values: yAttrsToUse.map(attr => attr.generatingFunction(cs)),
      displayValues: yAttrsToUse.map(attr => attr.valueDisplayFormat(attr.generatingFunction(cs))),
    }))
    const aggregateDataSet = [
      {
        label: isPopCultureTeam ? 'Team avg' : 'Contestant avg',
        values: yAttrsToUse.map(attr => d3.mean(csData.map(attr.generatingFunction))),
        displayValues: yAttrsToUse.map(attr => attr.averageDisplayFormat(d3.mean(csData.map(attr.generatingFunction)))),
        color: threeColorSet[2]
      },
      {
        label: 'Winner avg',
        values: yAttrsToUse.map(attr => d3.mean(winCsData.map(attr.generatingFunction))),
        displayValues: yAttrsToUse.map(attr => attr.averageDisplayFormat(d3.mean(winCsData.map(attr.generatingFunction)))),
        color: threeColorSet[1]
      },
      {
        label: isPopCultureTeam ? 'All team avg' : 'All contestant avg',
        values: yAttrsToUse.map(attr => d3.mean(allCsData.map(attr.generatingFunction))),
        displayValues: yAttrsToUse.map(attr => attr.averageDisplayFormat(d3.mean(allCsData.map(attr.generatingFunction)))),
        color: 'black'
      }
    ]
    if (isPopCulture() && !isPopCultureTeam) {
      aggregateDataSet.splice(1, 1)
    }
    return {
      data: dataSet,
      aggregateData: aggregateDataSet,
      xCoreLabelFunction: d => seasonDisplayId(gData.get(d.game_id).season_id) + '-' + gData.get(d.game_id).game_in_season,
      xGroupLabels: ['Game'],
      yFunctionGroups: [d3.range(0, yAttrsToUse.length).map(i => (d => d.displayValues[i]))],
      colorFunction: d => threeColorSet[0],
      sortFunction: (a, b) => d3.ascending(a.airdate, b.airdate),
      yLabel: yAttrsToUse.map(attr => attr.short_label).join(' -> '),
      title: titleToUse
    }
  }
}

const attemptBarChartRoundIdx = ref(0)
const attemptBarChartSpecification = data.computedIfRefHasValues(
  [attemptBarChartRoundIdx, singleCompetitorGameCompetitorStatData, data.gameDataById, winnerGameCompetitorStatData, gameCompetitorStatData,
    singleCompetitorRoundCompetitorStatData, winnerRoundCompetitorStatDataByRound, roundCompetitorStatDataByRound, anyGameHasAttemptData],
  buildStackedBarSpecificationLambda([gcsAttributes.buzc, gcsAttributes.buz, gcsAttributes.att], 'Attempts', 'Buzzes'))

const attemptValueBarChartRoundIdx = ref(0)
const attemptValueBarChartSpecification = data.computedIfRefHasValues(
  [attemptValueBarChartRoundIdx, singleCompetitorGameCompetitorStatData, data.gameDataById, winnerGameCompetitorStatData, gameCompetitorStatData,
    singleCompetitorRoundCompetitorStatData, winnerRoundCompetitorStatDataByRound, roundCompetitorStatDataByRound, anyGameHasAttemptData],
  buildStackedBarSpecificationLambda([gcsAttributes.buz_score, gcsAttributes.buz_value, gcsAttributes.att_value], 'Attempt Values', 'Buzz Values'))


const histogramGraphRoundIdx = ref(0)
const histogramGraphAttributes = data.computedIfRefHasValue(anyGameHasAttemptData,
  hasAttempt => isPopCulture() ? gcsAttributes.attributes_for_pop_culture : (hasAttempt ? gcsAttributes.all_attributes : gcsAttributes.attributes_without_att))
const histogramGraphAttributeSelectedIdx = ref(-1)
const histogramGraphAttributeIdx = computed(() => histogramGraphAttributeSelectedIdx.value >= 0 ? histogramGraphAttributeSelectedIdx.value : 0)
const histogramGraphAttribute = data.computedIfRefHasValues([histogramGraphAttributes, histogramGraphAttributeIdx], (attrList, idx) => attrList[idx])
const histogramSpecification = data.computedIfRefHasValues(
  [histogramGraphRoundIdx, singleCompetitorGameCompetitorStatData, singleCompetitorRoundCompetitorStatData, gameCompetitorStatData, roundCompetitorStatDataByRound, data.gameDataById, histogramGraphAttribute],
  (rIdx, singleGCSData, singleRCSData, gcsData, rcsData, gData, attr) => {
    var singleCSData = singleGCSData
    var csData = gcsData
    if (rIdx > 0) {
      singleCSData = singleRCSData.get(rIdx)
      csData = rcsData.get(rIdx)
    }
    singleCSData = singleCSData.filter(cs => attr.generatingFunction(cs) !== undefined)
    csData = csData.filter(cs => attr.generatingFunction(cs) !== undefined)
    return {
      histogramData: csData,
      trendData: singleCSData,
      trendColor: threeColorSet[0],
      trendHoverTemplate: 'Episode %{text}: %{y}<extra></extra>',
      trendLabelFunction: d => seasonDisplayId(gData.get(d.game_id).season_id) + '-' + gData.get(d.game_id).game_in_season,
      title: attr.label,
      yLabel: attr.short_label,
      yFunction: attr.generatingFunction,
      yBins: attr.bins
    }
  }
)


const scatterGraphRoundIdx = ref(0)
const scatterGraphAttributes = data.computedIfRefHasValue(anyGameHasAttemptData, hasAttempt => hasAttempt ? gcsAttributes.all_attributes : gcsAttributes.attributes_without_att)
const xScatterGraphAttributeSelectedIdx = ref(-1)
const yScatterGraphAttributeSelectedIdx = ref(-1)
const xScatterGraphAttributeDefaultIdx = data.computedIfRefHasValues(
  [scatterGraphAttributes, anyGameHasAttemptData],
  (attrList, hasAttempt) => hasAttempt ? attrList.indexOf(gcsAttributes.att_value) : attrList.indexOf(gcsAttributes.buz_value))
const xScatterGraphAttributeIdx = data.computedIfRefHasValues([xScatterGraphAttributeSelectedIdx, xScatterGraphAttributeDefaultIdx], (idx, defaultIdx) => idx >= 0 ? idx : defaultIdx)
const yScatterGraphAttributeDefaultIdx = data.computedIfRefHasValues(
  [scatterGraphAttributes, anyGameHasAttemptData],
  (attrList, hasAttempt) => hasAttempt ? attrList.indexOf(gcsAttributes.conversion_value_percent) : attrList.indexOf(gcsAttributes.acc_value_percent))
const yScatterGraphAttributeIdx = data.computedIfRefHasValues([yScatterGraphAttributeSelectedIdx, yScatterGraphAttributeDefaultIdx], (idx, defaultIdx) => idx >= 0 ? idx : defaultIdx)
const xScatterGraphAttribute = data.computedIfRefHasValues([scatterGraphAttributes, xScatterGraphAttributeIdx], (attrList, idx) => attrList[idx])
const yScatterGraphAttribute = data.computedIfRefHasValues([scatterGraphAttributes, yScatterGraphAttributeIdx], (attrList, idx) => attrList[idx])
const scatterHistogramSpecification = data.computedIfRefHasValues(
  [scatterGraphRoundIdx, singleCompetitorGameCompetitorStatData, singleCompetitorRoundCompetitorStatData, gameCompetitorStatData, roundCompetitorStatDataByRound, data.gameDataById, xScatterGraphAttribute, yScatterGraphAttribute],
  (rIdx, singleGCSData, singleRCSData, gcsData, rcsData, gData, xAttr, yAttr) => {
    var singleCSData = singleGCSData
    var csData = gcsData
    if (rIdx > 0) {
      singleCSData = singleRCSData.get(rIdx)
      csData = rcsData.get(rIdx)
    }
    singleCSData = singleCSData.filter(cs => xAttr.generatingFunction(cs) !== undefined)
    singleCSData = singleCSData.filter(cs => yAttr.generatingFunction(cs) !== undefined)
    csData = csData.filter(cs => xAttr.generatingFunction(cs) !== undefined)
    csData = csData.filter(cs => yAttr.generatingFunction(cs) !== undefined)
    return {
      histogramData: csData,
      scatterData: singleCSData,
      scatterLabelFunction: d => seasonDisplayId(gData.get(d.game_id).season_id) + '-' + gData.get(d.game_id).game_in_season,
      scatterColorFunction: d => threeColorSet[0],
      title: xAttr.label + ' vs ' + yAttr.label,
      xLabel: xAttr.short_label,
      xFunction: xAttr.generatingFunction,
      xBins: xAttr.bins,
      yLabel: yAttr.short_label,
      yFunction: yAttr.generatingFunction,
      yBins: yAttr.bins
    }
  }
)


</script>

<template>
  <Header />
  <div class="component-body" :data-bs-theme="subdomainIdentifier()">
    <div id="contestant-overview" class="section">
      <div class="subsection" v-if="playClassificationPeriods">
        <div class="option-groups">
          <OptionDropdown
            :optionLabels="playClassificationPeriods.map(pcp => playClassificationNameByTocPeriod(pcp[1], pcp[0]) + ' (' + pcp[[0]] + (pcp[[0]][0] == '2' ? ' TOC' : '') + ')')"
            :selectionIndex="playClassificationPeriodIdx"
            @newSelectionIndex="(idx) => {
              selectedPlayClassificationPeriodIdx = idx
              histogramGraphAttributeSelectedIdx = -1
              xScatterGraphAttributeSelectedIdx = -1
              yScatterGraphAttributeSelectedIdx = -1
            }" />
        </div>  
      </div>
      <div v-if="singleCompetitorData && singleCompetitorGameCompetitorStatData" class="subsection">
        <div class="overview">
          <div class="overview-row">
            <div id="overview-name" class="value" v-if="isPopCulture() && !isPopCultureTeam">
              <div>{{ singleCompetitorData.name }}</div>
              <div>
                <span v-for="(teamId, teamIdIdx) in contestantIdToTeamIdMap.get(singleCompetitorData.contestant_id)">
                  <span v-if="teamIdIdx !== 0">&nbsp;/&nbsp;</span>
                  <a :href="'/team.html?team_id=' + teamId">{{ teamDataById.get(teamId).name }}</a>
                </span>
              </div>
            </div>
            <div id="overview-name" class="value" v-else-if="isPopCulture() && isPopCultureTeam">
              <div>{{ singleCompetitorData.name }}</div>
              <div>
                <span v-for="(contestantId, contestantIdIdx) in teamIdToContestantIdMap.get(singleCompetitorData.team_id)">
                  <span v-if="contestantIdIdx !== 0">&nbsp;/&nbsp;</span>
                  <a :href="'/contestant.html?contestant_id=' + contestantId">{{ contestantDataById.get(contestantId).name }}</a>
                </span>
              </div>
            </div>
            <div id="overview-name" class="value" v-else>{{ singleCompetitorData.name }}</div>
            <div class="overview-window">
              <div class="overview-row">
                <div class="caption-stack">
                  <div class="caption">Games</div>
                  <div class="value">{{ singleCompetitorGameCompetitorStatData.length }}</div>
                </div>
                <div class="caption-stack">
                  <div class="caption">Total Final$</div>
                  <div class="value">${{ d3.sum(singleCompetitorGameCompetitorStatData.map(gcsAttributes.fj_final_score.generatingFunction)) }}</div>
                </div>
              </div>
            </div>
            <div class="overview-window">
              <div class="overview-row">
                <div class="caption-stack" v-if="anyGameHasAttemptData">
                  <div class="caption">Avg Attempt Value</div>
                  <div class="value">${{ gcsAttributes.att_value.averageDisplayFormat(d3.mean(singleCompetitorGameCompetitorStatData.map(gcsAttributes.att_value.generatingFunction))) }}</div>
                </div>
                <div class="caption-stack">
                  <div class="caption">Avg Buzz Value</div>
                  <div class="value">${{ gcsAttributes.buz_value.averageDisplayFormat(d3.mean(singleCompetitorGameCompetitorStatData.map(gcsAttributes.buz_value.generatingFunction))) }}</div>
                </div>
                <div class="caption-stack">
                  <div class="caption">Avg Buzz Score</div>
                  <div class="value">${{ gcsAttributes.buz_score.averageDisplayFormat(d3.mean(singleCompetitorGameCompetitorStatData.map(gcsAttributes.buz_score.generatingFunction))) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="section" v-if="standardScoringTableSpec && conversionScoringTableSpec && conversionValueScoringTableSpec">
      <div class="section-header">Game Statistic Tables</div>
      <div class="option-groups">
        <OptionDropdown :optionLabels="roundOptionLabels" :selectionIndex="selectedRoundIndex"
          @newSelectionIndex="(idx) => selectedRoundIndex = idx" />
      </div>
      <div class="subsection">
        <div class="subsection-header">Standard Metrics</div>
        <SortableTable v-if="standardScoringTableSpec" v-bind="standardScoringTableSpec" />
      </div>
      <div class="subsection" v-if="anyGameHasAttemptData">
        <div class="subsection-header">Conversion Metrics</div>
        <SortableTable v-if="conversionScoringTableSpec" v-bind="conversionScoringTableSpec" />
      </div>
      <div class="subsection" v-if="anyGameHasAttemptData">
        <div class="subsection-header">Conversion Value Metrics</div>
        <SortableTable v-if="conversionValueScoringTableSpec" v-bind="conversionValueScoringTableSpec" />
      </div>
      <div class="subsection" v-if="!anyGameHasAttemptData">
        <div class="subsection-header">Conversion Metrics</div>
        <SortableTable v-if="slimConversionScoringTableSpec" v-bind="slimConversionScoringTableSpec" />
      </div>
    </div>
    <div v-if="singleCompetitorGameCompetitorStatData" class="section">
      <div class="section-header"><span v-if="anyGameHasAttemptData">Attempts</span><span v-else>Buzzes</span></div>
      <div class="option-groups">
        <OptionDropdown
          :optionLabels="['Full Game'].concat(d3.range(1, displayRounds + 1).map(i => roundAbbreviation(i) + ' Round'))"
          :selectionIndex="attemptBarChartRoundIdx"
          @newSelectionIndex="(idx) => attemptBarChartRoundIdx = idx" />
      </div>
      <StackValueBarChart v-if="attemptBarChartSpecification" v-bind="attemptBarChartSpecification" />
    </div>
    <div v-if="singleCompetitorGameCompetitorStatData" class="section">
      <div class="section-header"><span v-if="anyGameHasAttemptData">Attempt Value</span><span v-else>Buzz Value</span></div>
      <div class="option-groups">
        <OptionDropdown
          :optionLabels="['Full Game'].concat(d3.range(1, displayRounds + 1).map(i => roundAbbreviation(i) + ' Round'))"
          :selectionIndex="attemptValueBarChartRoundIdx"
          @newSelectionIndex="(idx) => attemptValueBarChartRoundIdx = idx" />
      </div>
      <StackValueBarChart v-if="attemptValueBarChartSpecification" v-bind="attemptValueBarChartSpecification" />
    </div>
    <div class="section" v-if="histogramGraphAttributes">
      <div class="section-header">Selectable Histograms</div>
      <div class="option-groups">
        <OptionDropdown
          :optionLabels="histogramGraphAttributes.map(attr => attr.label)"
          :selectionIndex="histogramGraphAttributeIdx"
          @newSelectionIndex="(idx) => histogramGraphAttributeSelectedIdx = idx"
        />
        <OptionDropdown
          :optionLabels="['Full Game'].concat(d3.range(1, displayRounds + 1).map(i => roundAbbreviation(i) + ' Round'))"
          :selectionIndex="histogramGraphRoundIdx"
          @newSelectionIndex="(idx) => histogramGraphRoundIdx = idx" />
      </div>
      <HighlightHistogramHorizontal v-bind="histogramSpecification" />
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
        <OptionDropdown
          :optionLabels="['Full Game'].concat(d3.range(1, displayRounds + 1).map(i => roundAbbreviation(i) + ' Round'))"
          :selectionIndex="scatterGraphRoundIdx"
          @newSelectionIndex="(idx) => scatterGraphRoundIdx = idx" />
      </div>
      <ScatterHistogram v-bind="scatterHistogramSpecification" />
    </div>
  </div>
  <Footer/>
</template>

<style scoped>

#contestant-overview.section {
  margin-top: 1em;
}

#overview-name {
  min-width: 40%;
  align-self: center;
}

.section :deep(table) {
  width: 100%;
}

</style>
