<script setup>
import { ref, computed } from 'vue'
import * as d3 from 'd3'
import * as data from '@/data'
import { playClassificationNameByTocPeriod } from '@/configuration'
import { threeColorSet, roundAbbreviation } from '@/util'
import * as gcsAttributes from '@/gameContestantStatAttributes'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'
import CarouselTable from './components/util/CarouselTable.vue'
import HighlightHistogram from './components/util/HighlightHistogram.vue'
import ScatterHistogram from './components/util/ScatterHistogram.vue'
import StackValueBarChart from './components/util/StackValueBarChart.vue'
import { dateFormat } from './util'
import { ref2id } from 'plotly.js-dist'

let urlParams = new URLSearchParams(window.location.search);
const contestantId = +urlParams.get('contestant_id')

data.loadContestantData()
data.loadGameData()
data.loadGameContestantStatData()
data.loadGameRoundContestantStatData()

const allGameData = data.gameData
const contestantGames = data.computedIfRefHasValue(
  allGameData,
  gData => gData.filter(g => [g.podium_1_contestant_id, g.podium_2_contestant_id, g.podium_3_contestant_id].includes(contestantId)))
const contestantGamesByStatisticalDatasetKeys = data.computedIfRefHasValue(
  contestantGames,
  cgData => d3.group(cgData, cg => cg.toc_period, cg => cg.play_classification))
const playClassificationPeriods = data.computedIfRefHasValue(
  contestantGamesByStatisticalDatasetKeys,
  cgs => {
    const periodIds = Array.from(cgs.keys())
    return periodIds.flatMap(pid => Array.from(cgs.get(pid).keys()).map(pctype => [pid, pctype]))
  })
const playClassificationPeriodIdx = ref(0)
const playClassificationPeriod = data.computedIfRefHasValue(playClassificationPeriods, pcp => pcp[playClassificationPeriodIdx.value])
const displayRounds = data.computedIfRefHasValue(playClassificationPeriod, pcp => pcp[1] === 'celebrity' ? 3 : 2)

const singleContestantData = data.computedIfRefHasValue(data.contestantDataById, cData => cData.get(contestantId))

const gameIds = data.computedIfRefHasValues([allGameData, playClassificationPeriod],
  (gData, pcp) => gData.filter(g => g.toc_period === pcp[0] && g.play_classification === pcp[1]).map(g => g.game_id))

const gameContestantStatData = data.computedIfRefHasValues(
  [gameIds, data.gameContestantStatData],
  (gids, gcsData) => gcsData.filter(gcs => gids.includes(gcs.game_id)))
const winnerGameContestantStatData = data.computedIfRefHasValues(
  [data.gameDataById, gameContestantStatData],
  (gData, gcsData) => gcsData.filter(gcs => gData.get(gcs.game_id).winning_contestant_id === gcs.contestant_id))
const gameContestantStatDataByContestantId = data.computedIfRefHasValue(gameContestantStatData, gcsData => d3.group(gcsData, gcs => gcs.contestant_id))
const singleContestantGameContestantStatData = data.computedIfRefHasValue(gameContestantStatDataByContestantId, gcsData => gcsData.get(contestantId))
const singleContestantGameContestantStatDataByGameId = data.computedIfRefHasValue(singleContestantGameContestantStatData, gcsData => d3.index(gcsData, gcs => gcs.game_id))

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

function gameLink(game_id, season_id, game_of_season) {
  return '<a href="/game.html?game_id=' + 
    game_id + 
    '">' + season_id + '-' + game_of_season + '</a>'
}

const scoringTableRows = data.computedIfRefHasValues([data.gameDataById, singleContestantGameContestantStatData], (gData, gcsData) => {
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


const generateScoringPanels = function(attrColumnDefs) {
  return data.computedIfRefHasValues(
    [displayRounds,
      singleContestantGameContestantStatDataByGameId, singleContestantRoundContestantStatDataByRoundAndGameId,
      singleContestantGameContestantStatData, singleContestantRoundContestantStatData, gameContestantStatData, roundContestantStatDataByRound,
      winnerGameContestantStatData, winnerRoundContestantStatDataByRound],
    (dRounds, singleGcsDataByGameId, singleRcsDataByRoundAndGameId, singleGcsData, singleRcsDataByRound, allGcsData, allRcsData, winGcsData, winRcsData) => {
      var leadColumns = [{label: 'Game', sortValueFunction: d => d.airdate, attributeFunction: d => gameLink(d.game_id, d.season_id, d.game_in_season) + ' ' + dateFormat(d.airdate)}]
      var attrColumnsForDataset = attrColumnDefs.map(attrDef => (csData => ({
        label: attrDef.short_label,
        sortValueFunction: r => attrDef.generatingFunction(csData.get(r.game_id)),
        attributeFunction: r => attrDef.valueDisplayFormat(attrDef.generatingFunction(csData.get(r.game_id))),
        description: attrDef.description
      })))

      var footerLeadColumns = [
        { attributeFunction: r => r.label }
      ]
      var footerAttrColumns = attrColumnDefs.map(attrDef => ({
        attributeFunction: fr => fr.displayFunction(attrDef)(fr.aggregation(fr.dataToAggregate.map(attrDef.generatingFunction))),
        description: attrDef.description
      }))

      var panels = [
        {
          label: 'Full Game',
          columns: leadColumns.concat(attrColumnsForDataset.map(attrCol => attrCol(singleGcsDataByGameId))),
          footerColumns: footerLeadColumns.concat(footerAttrColumns),
          footerRows: [
            {
              label: 'Contestant avg',
              dataToAggregate: singleGcsData,
              aggregation: d3.mean,
              displayFunction: attrDef => attrDef.averageDisplayFormat
            },
            {
              label: 'All contestants avg',
              dataToAggregate: allGcsData,
              aggregation: d3.mean,
              displayFunction: attrDef => attrDef.averageDisplayFormat
            },
            {
              label: 'Winners avg',
              dataToAggregate: winGcsData,
              aggregation: d3.mean,
              displayFunction: attrDef => attrDef.averageDisplayFormat
            }
          ]
        }
      ]

      for (const i of d3.range(1, dRounds+1)) {
        panels.push({
          label: roundAbbreviation(i) + ' Round ',
          columns: leadColumns.concat(attrColumnsForDataset.map(attrCol => attrCol(singleRcsDataByRoundAndGameId.get(i)))),
          footerColumns: footerLeadColumns.concat(footerAttrColumns),
          footerRows: [
            {
              label: 'Contestant avg',
              dataToAggregate: singleRcsDataByRound.get(i),
              aggregation: d3.mean,
              displayFunction: attrDef => attrDef.averageDisplayFormat
            },
            {
              label: 'All contestants avg',
              dataToAggregate: allRcsData.get(i),
              aggregation: d3.mean,
              displayFunction: attrDef => attrDef.averageDisplayFormat
            },
            {
              label: 'Winners avg',
              dataToAggregate: winRcsData.get(i),
              aggregation: d3.mean,
              displayFunction: attrDef => attrDef.averageDisplayFormat
            }
          ]
        })
      }

      return panels
    })
}

const standardScoringTablePanels = generateScoringPanels(
  [
    gcsAttributes.buz,
    gcsAttributes.buzc,
    gcsAttributes.buz_score,
    gcsAttributes.coryat_score,
    gcsAttributes.dd_found,
    gcsAttributes.dd_plus_buzc,
    gcsAttributes.dd_plus_selection,
    gcsAttributes.dd_score,
    gcsAttributes.fj_start_score,
    gcsAttributes.fj_score,
    gcsAttributes.fj_final_score,
  ])

const standardScoringTableSpecification = data.computedIfRefHasValues(
  [standardScoringTablePanels, scoringTableRows],
  (p, r) => ({
    panels: p,
    rowData: r,
    defaultSortFunction: d => d.airdate
  })
)

const conversionScoringTablePanels = generateScoringPanels(
  [
    gcsAttributes.att,
    gcsAttributes.att_clue,
    gcsAttributes.buz,
    gcsAttributes.buz_percent,
    gcsAttributes.buzc,
    gcsAttributes.acc_percent,
    gcsAttributes.conversion_percent,
    gcsAttributes.time,
    gcsAttributes.solo
  ])

const conversionScoringTableSpecification = data.computedIfRefHasValues(
  [conversionScoringTablePanels, scoringTableRows],
  (p, r) => ({
    panels: p,
    rowData: r,
    defaultSortFunction: d => d.airdate
  })
)

const conversionValueScoringTablePanels = generateScoringPanels(
  [
    gcsAttributes.att_value,
    gcsAttributes.buz_value,
    gcsAttributes.buz_value_percent,
    gcsAttributes.buz_score,
    gcsAttributes.acc_value_percent,
    gcsAttributes.conversion_value_percent,
    gcsAttributes.time_value,
    gcsAttributes.time_score,
    gcsAttributes.solo_value,
    gcsAttributes.solo_score
  ])

const conversionValueScoringTableSpecification = data.computedIfRefHasValues(
  [conversionValueScoringTablePanels, scoringTableRows],
  (p, r) => ({
    panels: p,
    rowData: r,
    defaultSortFunction: d => d.airdate
  })
)


//Stacked bars
const buildStackedBarSpecificationLambda = function(yAttrs, title) {
  return (rIdx, gcsData, gData, winGcsData, allGcsData, rcsData, winRcsData, allRcsData) => {
    var csData = gcsData
    var allCsData = allGcsData
    var winCsData = winGcsData
    if (rIdx > 0) {
      csData = rcsData.get(rIdx)
      allCsData = allRcsData.get(rIdx)
      winCsData = winRcsData.get(rIdx)
    }
    const dataSet = csData.map(cs => ({
      game_id: cs.game_id,
      airdate: gData.get(cs.game_id).airdate,
      values: yAttrs.map(attr => attr.generatingFunction(cs)),
      displayValues: yAttrs.map(attr => attr.valueDisplayFormat(attr.generatingFunction(cs))),
    }))
    const aggregateDataSet = [
      {
        label: 'Contestant avg',
        values: yAttrs.map(attr => d3.mean(csData.map(attr.generatingFunction))),
        displayValues: yAttrs.map(attr => attr.averageDisplayFormat(d3.mean(csData.map(attr.generatingFunction)))),
        color: threeColorSet[2]
      },
      {
        label: 'Winner avg',
        values: yAttrs.map(attr => d3.mean(winCsData.map(attr.generatingFunction))),
        displayValues: yAttrs.map(attr => attr.averageDisplayFormat(d3.mean(winCsData.map(attr.generatingFunction)))),
        color: threeColorSet[1]
      },
      {
        label: 'All contestant avg',
        values: yAttrs.map(attr => d3.mean(allCsData.map(attr.generatingFunction))),
        displayValues: yAttrs.map(attr => attr.averageDisplayFormat(d3.mean(allCsData.map(attr.generatingFunction)))),
        color: 'black'
      }
    ]
    return {
      data: dataSet,
      aggregateData: aggregateDataSet,
      xCoreLabelFunction: d => gData.get(d.game_id).season_id + '-' + gData.get(d.game_id).game_in_season,
      xGroupLabels: ['Game'],
      yFunctionGroups: [d3.range(0, yAttrs.length).map(i => (d => d.displayValues[i]))],
      colorFunction: d => threeColorSet[0],
      sortFunction: (a, b) => d3.ascending(a.airdate, b.airdate),
      yLabel: yAttrs.map(attr => attr.short_label).join(' -> '),
      title: title
    }
  }
}

const attemptBarChartRoundIdx = ref(0)
const attemptBarChartSpecification = data.computedIfRefHasValues(
  [attemptBarChartRoundIdx, singleContestantGameContestantStatData, data.gameDataById, winnerGameContestantStatData, gameContestantStatData,
    singleContestantRoundContestantStatData, winnerRoundContestantStatDataByRound, roundContestantStatDataByRound],
  buildStackedBarSpecificationLambda([gcsAttributes.buzc, gcsAttributes.buz, gcsAttributes.att], 'Attempts'))

const attemptValueBarChartRoundIdx = ref(0)
const attemptValueBarChartSpecification = data.computedIfRefHasValues(
  [attemptValueBarChartRoundIdx, singleContestantGameContestantStatData, data.gameDataById, winnerGameContestantStatData, gameContestantStatData,
    singleContestantRoundContestantStatData, winnerRoundContestantStatDataByRound, roundContestantStatDataByRound],
  buildStackedBarSpecificationLambda([gcsAttributes.buz_score, gcsAttributes.buz_value, gcsAttributes.att_value], 'Attempt Values'))


const histogramGraphRoundIdx = ref(0)
const histogramGraphAttributes = gcsAttributes.all_attributes
const histogramGraphAttributeIdx = ref(0)
const histogramGraphAttribute = computed(() => histogramGraphAttributes[histogramGraphAttributeIdx.value])
const histogramSpecification = data.computedIfRefHasValues(
  [histogramGraphRoundIdx, singleContestantGameContestantStatData, singleContestantRoundContestantStatData, gameContestantStatData, roundContestantStatDataByRound, data.gameDataById, histogramGraphAttribute],
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
      scatterData: singleCSData,
      scatterLabelFunction: d => gData.get(d.game_id).season_id + '-' + gData.get(d.game_id).game_in_season,
      scatterColorFunction: d => threeColorSet[0],
      title: attr.label,
      xLabel: attr.short_label,
      xFunction: attr.generatingFunction,
      xBins: attr.bins
    }
  }
)


const scatterGraphRoundIdx = ref(0)
const scatterGraphAttributes = gcsAttributes.all_attributes
const xScatterGraphAttributeIdx = ref(0)
const yScatterGraphAttributeIdx = ref(2)
const xScatterGraphAttribute = computed(() => scatterGraphAttributes[xScatterGraphAttributeIdx.value])
const yScatterGraphAttribute = computed(() => scatterGraphAttributes[yScatterGraphAttributeIdx.value])
const scatterHistogramSpecification = data.computedIfRefHasValues(
  [scatterGraphRoundIdx, singleContestantGameContestantStatData, singleContestantRoundContestantStatData, gameContestantStatData, roundContestantStatDataByRound, data.gameDataById, xScatterGraphAttribute, yScatterGraphAttribute],
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
      scatterLabelFunction: d => gData.get(d.game_id).season_id + '-' + gData.get(d.game_id).game_in_season,
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
  <div class="component-body">
    <div v-if="singleContestantData" class="section">
      <h1>{{ singleContestantData.name }}</h1>
      <h1 v-if="playClassificationPeriod">{{ playClassificationNameByTocPeriod(playClassificationPeriod[1], playClassificationPeriod[0]) }} ({{ playClassificationPeriod[0] }} TOC period)</h1>
      <select v-model="playClassificationPeriodIdx">
        <option v-for="(pcp, idx) in playClassificationPeriods" :value="idx">
          {{ playClassificationNameByTocPeriod(pcp[1], pcp[0]) }} ({{ pcp[0] }} TOC period)
        </option>
      </select>
      <h2>Statistics</h2>
      <h4>Standard</h4>
      <CarouselTable v-if="standardScoringTableSpecification"
        v-bind="standardScoringTableSpecification"
        />
      <h4>Conversion</h4>
      <CarouselTable v-if="conversionScoringTableSpecification"
        v-bind="conversionScoringTableSpecification"
        />
      <h4>Conversion Value</h4>
      <CarouselTable v-if="conversionValueScoringTableSpecification"
        v-bind="conversionValueScoringTableSpecification"
        />
    </div>
    <div v-if="singleContestantGameContestantStatData" class="section">
      <h2>Attempts</h2>
      <select v-model="attemptBarChartRoundIdx">
        <option :value="0">Full Game</option>
        <option :value="1">{{ roundAbbreviation(1) }} Round</option>
        <option :value="2">{{ roundAbbreviation(2) }} Round</option>
        <option v-if="displayRounds >= 3" :value="3">{{ roundAbbreviation(3) }} Round</option>
      </select><br/>
      <StackValueBarChart v-if="attemptBarChartSpecification" v-bind="attemptBarChartSpecification" />
    </div>
    <div v-if="singleContestantGameContestantStatData" class="section">
      <h2>Attempt Value</h2>
      <select v-model="attemptValueBarChartRoundIdx">
        <option :value="0">Full Game</option>
        <option :value="1">{{ roundAbbreviation(1) }} Round</option>
        <option :value="2">{{ roundAbbreviation(2) }} Round</option>
        <option v-if="displayRounds >= 3" :value="3">{{ roundAbbreviation(3) }} Round</option>
      </select><br/>
      <StackValueBarChart v-if="attemptValueBarChartSpecification" v-bind="attemptValueBarChartSpecification" />
    </div>
    <div class="section">
      <h2>Selectable Histograms</h2>
      <select v-model="histogramGraphAttributeIdx">
        <option v-for="(graphAttribute, idx) in histogramGraphAttributes" :value="idx">
          {{ graphAttribute.short_label }}
        </option>
      </select>
      <select v-model="histogramGraphRoundIdx">
        <option :value="0">Full Game</option>
        <option :value="1">{{ roundAbbreviation(1) }} Round</option>
        <option :value="2">{{ roundAbbreviation(2) }} Round</option>
        <option v-if="displayRounds >= 3" :value="3">{{ roundAbbreviation(3) }} Round</option>
      </select><br/>
      <HighlightHistogram v-bind="histogramSpecification" />
    </div>
    <div class="section">
      <h2>Selectable Scatter Plots</h2>
      <select v-model="xScatterGraphAttributeIdx">
        <option v-for="(graphAttribute, idx) in scatterGraphAttributes" :value="idx">
          {{ graphAttribute.short_label }}
        </option>
      </select>
      <select v-model="yScatterGraphAttributeIdx">
        <option :value="null">None</option>
        <option v-for="(graphAttribute, idx) in scatterGraphAttributes" :value="idx">
          {{ graphAttribute.short_label }}
        </option>
      </select>
      <select v-model="scatterGraphRoundIdx">
        <option :value="0">Full Game</option>
        <option :value="1">{{ roundAbbreviation(1) }} Round</option>
        <option :value="2">{{ roundAbbreviation(2) }} Round</option>
        <option v-if="displayRounds >= 3" :value="3">{{ roundAbbreviation(3) }} Round</option>
      </select><br/>
      <ScatterHistogram v-bind="scatterHistogramSpecification" />
    </div>
  </div>
  <Footer/>
</template>

<style scoped>

.component-body {
  margin: 0 2em;
}

.section {
  padding: 0.5em 0 2em 0;
  border-bottom: 1px solid black;
  max-width: min(95vw, 960px);
}



</style>
