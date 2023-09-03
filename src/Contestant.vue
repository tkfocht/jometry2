<script setup>
import { ref, computed } from 'vue'
import * as d3 from 'd3'
import * as data from '@/data'
import { playClassificationNameByTocPeriod } from '@/configuration'
import { threeColorSet } from '@/util'
import * as gcsAttributes from '@/gameContestantStatAttributes'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'
import CarouselTable from './components/util/CarouselTable.vue'
import HighlightHistogram from './components/util/HighlightHistogram.vue'
import ScatterHistogram from './components/util/ScatterHistogram.vue'
import StackValueBarChart from './components/util/StackValueBarChart.vue'
import { dateFormat } from './util'

let urlParams = new URLSearchParams(window.location.search);
const contestantId = +urlParams.get('contestant_id')

data.loadContestantData()
data.loadGameData()
data.loadGameContestantStatData()

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

const singleContestantData = data.computedIfRefHasValue(data.contestantDataById, cData => cData.get(contestantId))

const gameIds = data.computedIfRefHasValues([allGameData, playClassificationPeriod],
  (gData, pcp) => gData.filter(g => g.toc_period === pcp[0] && g.play_classification === pcp[1]).map(g => g.game_id))
const gameContestantStatData = data.computedIfRefHasValues(
  [gameIds, data.gameContestantStatData],
  (gids, gcsData) => gcsData.filter(gcs => gids.includes(gcs.game_id)))
const gameContestantStatDataByContestantId = data.computedIfRefHasValue(gameContestantStatData, gcsData => d3.group(gcsData, gcs => gcs.contestant_id))
const singleContestantGameContestantStatData = data.computedIfRefHasValue(gameContestantStatDataByContestantId, gcsData => gcsData.get(contestantId))
const singleContestantGameContestantStatDataByGameId = data.computedIfRefHasValue(singleContestantGameContestantStatData, gcsData => d3.index(gcsData, gcs => gcs.game_id))

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

const scoringTablePanels = data.computedIfRefHasValues([singleContestantGameContestantStatDataByGameId], (gcsData) => {
  var leadColumns = [{label: 'Game', sortValueFunction: d => d.airdate, attributeFunction: d => gameLink(d.game_id, d.season_id, d.game_in_season) + ' ' + dateFormat(d.airdate)}]
  var attrColumnDefs = [
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
  ]
  var attrColumns = attrColumnDefs.map(attrDef => ({
    label: attrDef.short_label,
    sortValueFunction: r => attrDef.generatingFunction(gcsData.get(r.game_id)),
    attributeFunction: r => attrDef.valueDisplayFormat(attrDef.generatingFunction(gcsData.get(r.game_id))),
    description: attrDef.description
  }))

  var panels = [
    {
      label: 'Full Game',
      columns: leadColumns.concat(attrColumns)
    }
  ]

  return panels
})

const conversionScoringTablePanels = data.computedIfRefHasValues([singleContestantGameContestantStatDataByGameId], (gcsData) => {
  var leadColumns = [{label: 'Game', sortValueFunction: d => d.airdate, attributeFunction: d => gameLink(d.game_id, d.season_id, d.game_in_season) + ' ' + dateFormat(d.airdate)}]
  var attrColumnDefs = [
    gcsAttributes.att,
    gcsAttributes.att_clue,
    gcsAttributes.buz,
    gcsAttributes.buz_percent,
    gcsAttributes.buzc,
    gcsAttributes.acc_percent,
    gcsAttributes.conversion_percent,
    gcsAttributes.time,
    gcsAttributes.solo
  ]
  var attrColumns = attrColumnDefs.map(attrDef => ({
    label: attrDef.short_label,
    sortValueFunction: r => attrDef.generatingFunction(gcsData.get(r.game_id)),
    attributeFunction: r => attrDef.valueDisplayFormat(attrDef.generatingFunction(gcsData.get(r.game_id))),
    description: attrDef.description
  }))

  var panels = [
    {
      label: 'Full Game',
      columns: leadColumns.concat(attrColumns)
    }
  ]

  return panels
})

const conversionValueScoringTablePanels = data.computedIfRefHasValues([singleContestantGameContestantStatDataByGameId], (gcsData) => {
  var leadColumns = [{label: 'Game', sortValueFunction: d => d.airdate, attributeFunction: d => gameLink(d.game_id, d.season_id, d.game_in_season) + ' ' + dateFormat(d.airdate)}]
  var attrColumnDefs = [
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
  ]
  var attrColumns = attrColumnDefs.map(attrDef => ({
    label: attrDef.short_label,
    sortValueFunction: r => attrDef.generatingFunction(gcsData.get(r.game_id)),
    attributeFunction: r => attrDef.valueDisplayFormat(attrDef.generatingFunction(gcsData.get(r.game_id))),
    description: attrDef.description
  }))

  var panels = [
    {
      label: 'Full Game',
      columns: leadColumns.concat(attrColumns)
    }
  ]

  return panels
})


//Stacked bars
const buildStackedBarSpecificationLambda = function(yAttrs, title) {
  return (gcsData, gData) => {
    const dataSet = gcsData.map(gcs => ({
      game_id: gcs.game_id,
      airdate: gData.get(gcs.game_id).airdate,
      values: yAttrs.map(attr => attr.generatingFunction(gcs)),
      displayValues: yAttrs.map(attr => attr.valueDisplayFormat(attr.generatingFunction(gcs))),
    }))
    return {
      data: dataSet,
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

const attemptBarChartSpecification = data.computedIfRefHasValues(
  [singleContestantGameContestantStatData, data.gameDataById],
  buildStackedBarSpecificationLambda([gcsAttributes.buzc, gcsAttributes.buz, gcsAttributes.att], 'Attempts'))

const attemptValueBarChartSpecification = data.computedIfRefHasValues(
  [singleContestantGameContestantStatData, data.gameDataById],
  buildStackedBarSpecificationLambda([gcsAttributes.buz_score, gcsAttributes.buz_value, gcsAttributes.att_value], 'Attempt Values'))


const histogramGraphRoundIdx = ref(0)
const histogramGraphAttributes = gcsAttributes.all_attributes
const histogramGraphAttributeIdx = ref(0)
const histogramGraphAttribute = computed(() => histogramGraphAttributes[histogramGraphAttributeIdx.value])
const histogramSpecification = data.computedIfRefHasValues(
  [singleContestantGameContestantStatData, gameContestantStatData, data.gameDataById, histogramGraphAttribute],
  (singleGCSData, gcsData, gData, attr) => {
    singleGCSData = singleGCSData.filter(gcs => attr.generatingFunction(gcs) !== undefined)
    gcsData = gcsData.filter(gcs => attr.generatingFunction(gcs) !== undefined)
    return {
      histogramData: gcsData,
      scatterData: singleGCSData,
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
  [singleContestantGameContestantStatData, gameContestantStatData, data.gameDataById, xScatterGraphAttribute, yScatterGraphAttribute],
  (singleGCSData, gcsData, gData, xAttr, yAttr) => {
    singleGCSData = singleGCSData.filter(gcs => xAttr.generatingFunction(gcs) !== undefined)
    singleGCSData = singleGCSData.filter(gcs => yAttr.generatingFunction(gcs) !== undefined)
    gcsData = gcsData.filter(gcs => xAttr.generatingFunction(gcs) !== undefined)
    gcsData = gcsData.filter(gcs => yAttr.generatingFunction(gcs) !== undefined)
    return {
      histogramData: gcsData,
      scatterData: singleGCSData,
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
      <h1>{{ playClassificationNameByTocPeriod(playClassificationPeriod[1], playClassificationPeriod[0]) }} ({{ playClassificationPeriod[0] }} TOC period)</h1>
      <select v-model="playClassificationPeriodIdx">
        <option v-for="(pcp, idx) in playClassificationPeriods" :value="idx">
          {{ playClassificationNameByTocPeriod(pcp[1], pcp[0]) }} ({{ pcp[0] }} TOC period)
        </option>
      </select>
      <h2>Statistics</h2>
      <h4>Standard</h4>
      <CarouselTable 
        :panels="scoringTablePanels"
        :rowData="scoringTableRows"
        :defaultSortFunction="d => d.airdate"
        />
      <h4>Conversion</h4>
      <CarouselTable 
        :panels="conversionScoringTablePanels"
        :rowData="scoringTableRows"
        :defaultSortFunction="d => d.airdate"
        />
      <h4>Conversion Value</h4>
      <CarouselTable 
        :panels="conversionValueScoringTablePanels"
        :rowData="scoringTableRows"
        :defaultSortFunction="d => d.airdate"
        />
    </div>
    <div v-if="singleContestantGameContestantStatData" class="section">
      <h2>Attempts</h2>
      <StackValueBarChart v-if="attemptBarChartSpecification" v-bind="attemptBarChartSpecification" />
    </div>
    <div v-if="singleContestantGameContestantStatData" class="section">
      <h2>Attempt Value</h2>
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
        <!--<option :value="1">J! Round</option>
        <option :value="2">DJ! Round</option>
        <option v-if="displayRounds >= 3" :value="3">TJ! Round</option>-->
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
          {{ graphAttribute.label }}
        </option>
      </select>
      <select v-model="scatterGraphRoundIdx">
        <option :value="0">Full Game</option>
        <!--<option :value="1">J! Round</option>
        <option :value="2">DJ! Round</option>
        <option v-if="displayRounds >= 3" :value="3">TJ! Round</option>-->
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
  width: 960px;
}



</style>
