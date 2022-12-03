<script setup>
import { ref, computed } from 'vue'
import { averageData, csvDataAccessor, formatNumber, dateFormat } from '@/util'
import { graphAttributes } from '@/graphAttributes'
import * as d3 from 'd3'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'
import CarouselTable from './components/util/CarouselTable.vue'
import HighlightHistogram from './components/util/HighlightHistogram.vue'
import ScatterHistogram from './components/util/ScatterHistogram.vue'
import StackValueBarChart from './components/util/StackValueBarChart.vue'

let urlParams = new URLSearchParams(window.location.search);
const contestantId = +urlParams.get('contestant_id')

const allContestantStatData = ref(null)
const displayRounds = ref(2)

async function fetchContestantStatData() {
  const res = await d3.csv(
    'https://j-ometry.com/csvs/all_standard.csv',
    csvDataAccessor
  )
  var resResult = await res
  allContestantStatData.value = resResult
}
fetchContestantStatData()

const contestantStatData = computed(() => {
  if (allContestantStatData.value) return d3.filter(allContestantStatData.value, d => d['Jometry Contestant Id'] === contestantId)
  else return null
})
const contestantStatDataWithBox = computed(() => {
  if (contestantStatData.value) return d3.filter(contestantStatData.value, d => d['Att'] !== contestantId)
  else return null
})
const contestantAverageStatData = computed(() => {
  if (!contestantStatData.value) return null
  const cAvg = averageData(contestantStatData.value)
  cAvg['Contestant'] = 'Contestant Avg'
  return cAvg
})
const allContestantAverageStatData = computed(() => {
  if (!allContestantStatData.value) return null
  const cAvg = averageData(allContestantStatData.value)
  cAvg['Contestant'] = 'All Avg'
  return cAvg
})
const winningContestantAverageStatData = computed(() => {
  if (!allContestantStatData.value) return null
  const cAvg = averageData(d3.filter(allContestantStatData.value, d => d['Wins'] === 1))
  cAvg['Contestant'] = 'Winners Avg'
  return cAvg
})
const contestantData = computed(() => {
  if (contestantStatData.value) {
    return {
      contestantId: contestantStatData.value[0]['Jometry Contestant Id'],
      contestantName: contestantStatData.value[0]['Contestant']
    }
  }
  return null
})


const threeColorSet = ['#0072B2','#E69F00','#009E73']
const averageAwareColorFunction = function(d) {
  if (d['Contestant'] === 'Contestant Avg') return threeColorSet[2]
  if (d['Contestant'] === 'Winners Avg') return threeColorSet[1]
  if (contestantData.value && d['Contestant'] === contestantData.value['contestantName']) return threeColorSet[0]
  return 'black'
}
const averageAwareGameLabelFunction = function(d) {
  if (d['Contestant'] === 'Contestant Avg' || d['Contestant'] === 'Winners Avg' ||
    d['Contestant'] === 'All Avg') return d['Contestant']
  if (contestantData.value && d['Contestant'] === contestantData.value['contestantName']) return d['Season'] + '-' + d['Game In Season']
  return ''
}

function gameLink (contestantGameStatData) {
  if (contestantGameStatData['Contestant'] === 'Contestant Avg' || 
    contestantGameStatData['Contestant'] === 'Winners Avg' ||
    contestantGameStatData['Contestant'] === 'All Avg') return contestantGameStatData['Contestant']
  return '<a href="/game.html?game_id=' + 
    contestantGameStatData['Jometry Game Id'] + 
    '">' + contestantGameStatData['Season'] + '-' + contestantGameStatData['Game In Season'] + '</a>&nbsp;' + dateFormat(contestantGameStatData['Date'])
}


const scoringTablePanels = computed(() => {
  var columns = [
        { label: 'Game', sortValueFunction: d => -d['Date'], attributeFunction: gameLink},
        { label: 'JDDF', sortValueFunction: d => d['JDDF'], attributeFunction: d => formatNumber(d['JDDF'], 2)},
        { label: 'JDD+', sortValueFunction: d => d['JDD+'], attributeFunction: d => formatNumber(d['JDD+'], 2, false, true)},
        { label: 'JDD$', sortValueFunction: d => d['JDD$'], attributeFunction: d => formatNumber(d['JDD$'], 0)},
        { label: 'JBuz$', sortValueFunction: d => d['JBuz$'], attributeFunction: d => formatNumber(d['JBuz$'], 0)},
        { label: 'JFinal$', sortValueFunction: d => d['JFinal$'], attributeFunction: d => formatNumber(d['JFinal$'], 0)},
        { label: 'DJDDF', sortValueFunction: d => d['DJDDF'], attributeFunction: d => formatNumber(d['DJDDF'], 2)},
        { label: 'DJDD+', sortValueFunction: d => d['DJDD+'], attributeFunction: d => formatNumber(d['DJDD+'], 2, false, true)},
        { label: 'DJDD$', sortValueFunction: d => d['DJDD$'], attributeFunction: d => formatNumber(d['DJDD$'], 0)},
        { label: 'DJBuz$', sortValueFunction: d => d['DJBuz$'], attributeFunction: d => formatNumber(d['DJBuz$'], 0)},
        { label: 'DJFinal$', sortValueFunction: d => d['DJFinal$'], attributeFunction: d => formatNumber(d['DJFinal$'], 0)}
      ]
  columns = columns.concat([
        { label: 'FJ$', sortValueFunction: d => d['FJ$'], attributeFunction: d => formatNumber(d['FJ$'], 0)},
        { label: 'FJFinal$', sortValueFunction: d => d['FJFinal$'], attributeFunction: d => formatNumber(d['FJFinal$'], 0)},
      ])
  return [
    {
      label: 'Game',
      columns: columns
    }
  ]
})

const conversionMetricTablePanels = computed(() => {
  var panels = [
    {
      label: 'Game',
      columns: [
        { label: 'Game', sortValueFunction: d => -d['Date'], attributeFunction: gameLink},
        { label: 'Att', sortValueFunction: d => d['Att'], attributeFunction: d => formatNumber(d['Att'], 1)},
        { label: 'Buz', sortValueFunction: d => d['Buz'], attributeFunction: d => formatNumber(d['Buz'], 1)},
        { label: '%', sortValueFunction: d => d['Buz%'], attributeFunction: d => formatNumber(d['Buz%'], 1, false, false)},
        { label: 'BuzC', sortValueFunction: d => d['BuzC'], attributeFunction: d => formatNumber(d['BuzC'], 1)},
        { label: '%', sortValueFunction: d => d['BuzC'] / d['Buz'], attributeFunction: d => formatNumber(100.0 * d['BuzC'] / d['Buz'], 1, false, false)},
        { label: 'Time', sortValueFunction: d => d['Timing'], attributeFunction: d => formatNumber(d['Timing'], 1, false, true)},
        { label: 'Solo', sortValueFunction: d => d['Solo'], attributeFunction: d => formatNumber(d['Solo'], 1, false, false)},
        { label: 'AttV', sortValueFunction: d => d['AttV'], attributeFunction: d => formatNumber(d['AttValue'], 0, false, false)},
        { label: 'BuzV', sortValueFunction: d => d['BuzValue'], attributeFunction: d => formatNumber(d['BuzValue'], 0)},
        { label: '%', sortValueFunction: d => d['BuzValue'] / d['AttValue'], attributeFunction: d => formatNumber(100.0 * d['BuzValue'] / d['AttValue'], 1, false, false)},
        { label: 'Buz$', sortValueFunction: d => d['Buz$'], attributeFunction: d => formatNumber(d['Buz$'], 0)},
        { label: '%', sortValueFunction: d => d['Buz$'] / d['BuzValue'], attributeFunction: d => formatNumber(100.0 * d['Buz$'] / d['BuzValue'], 1, false, false)},
        { label: 'TimeV', sortValueFunction: d => d['TimingValue'], attributeFunction: d => formatNumber(d['TimingValue'], 0, false, true)},
        { label: 'SoloV', sortValueFunction: d => d['SoloValue'], attributeFunction: d => formatNumber(d['SoloValue'], 0, false, false)}
      ]
    },
    {
      label: 'Jeopardy Round',
      columns: [
        { label: 'Game', sortValueFunction: d => -d['Date'], attributeFunction: gameLink},
        { label: 'Att', sortValueFunction: d => d['JAtt'], attributeFunction: d => formatNumber(d['JAtt'], 1)},
        { label: 'Buz', sortValueFunction: d => d['JBuz'], attributeFunction: d => formatNumber(d['JBuz'], 1)},
        { label: '%', sortValueFunction: d => d['JBuz%'], attributeFunction: d => formatNumber(d['JBuz%'], 1, false, false)},
        { label: 'BuzC', sortValueFunction: d => d['JBuzC'], attributeFunction: d => formatNumber(d['JBuzC'], 1)},
        { label: '%', sortValueFunction: d => d['JBuzC'] / d['JBuz'], attributeFunction: d => formatNumber(100.0 * d['JBuzC'] / d['JBuz'], 1, false, false)},
        { label: 'Time', sortValueFunction: d => d['JTiming'], attributeFunction: d => formatNumber(d['JTiming'], 1, false, true)},
        { label: 'Solo', sortValueFunction: d => d['JSolo'], attributeFunction: d => formatNumber(d['JSolo'], 1, false, false)},
        { label: 'AttV', sortValueFunction: d => d['JAttV'], attributeFunction: d => formatNumber(d['JAttValue'], 0, false, false)},
        { label: 'BuzV', sortValueFunction: d => d['JBuzValue'], attributeFunction: d => formatNumber(d['JBuzValue'], 0)},
        { label: '%', sortValueFunction: d => d['JBuzValue'] / d['JAttValue'], attributeFunction: d => formatNumber(100.0 * d['JBuzValue'] / d['JAttValue'], 1, false, false)},
        { label: 'Buz$', sortValueFunction: d => d['JBuz$'], attributeFunction: d => formatNumber(d['JBuz$'], 0)},
        { label: '%', sortValueFunction: d => d['JBuz$'] / d['JBuzValue'], attributeFunction: d => formatNumber(100.0 * d['JBuz$'] / d['JBuzValue'], 1, false, false)},
        { label: 'TimeV', sortValueFunction: d => d['JTimingValue'], attributeFunction: d => formatNumber(d['JTimingValue'], 0, false, true)},
        { label: 'SoloV', sortValueFunction: d => d['JSoloValue'], attributeFunction: d => formatNumber(d['JSoloValue'], 0, false, false)}
      ]
    },
    {
      label: 'Double Jeopardy Round',
      columns: [
        { label: 'Game', sortValueFunction: d => -d['Date'], attributeFunction: gameLink},
        { label: 'Att', sortValueFunction: d => d['DJAtt'], attributeFunction: d => formatNumber(d['DJAtt'], 1)},
        { label: 'Buz', sortValueFunction: d => d['DJBuz'], attributeFunction: d => formatNumber(d['DJBuz'], 1)},
        { label: '%', sortValueFunction: d => d['DJBuz%'], attributeFunction: d => formatNumber(d['DJBuz%'], 1, false, false)},
        { label: 'BuzC', sortValueFunction: d => d['DJBuzC'], attributeFunction: d => formatNumber(d['DJBuzC'], 1)},
        { label: '%', sortValueFunction: d => d['DJBuzC'] / d['DJBuz'], attributeFunction: d => formatNumber(100.0 * d['DJBuzC'] / d['DJBuz'], 1, false, false)},
        { label: 'Time', sortValueFunction: d => d['DJTiming'], attributeFunction: d => formatNumber(d['DJTiming'], 1, false, true)},
        { label: 'Solo', sortValueFunction: d => d['DJSolo'], attributeFunction: d => formatNumber(d['DJSolo'], 1, false, false)},
        { label: 'AttV', sortValueFunction: d => d['DJAttV'], attributeFunction: d => formatNumber(d['DJAttValue'], 0, false, false)},
        { label: 'BuzV', sortValueFunction: d => d['DJBuzValue'], attributeFunction: d => formatNumber(d['DJBuzValue'], 0)},
        { label: '%', sortValueFunction: d => d['DJBuzValue'] / d['DJAttValue'], attributeFunction: d => formatNumber(100.0 * d['DJBuzValue'] / d['DJAttValue'], 1, false, false)},
        { label: 'Buz$', sortValueFunction: d => d['DJBuz$'], attributeFunction: d => formatNumber(d['DJBuz$'], 0)},
        { label: '%', sortValueFunction: d => d['DJBuz$'] / d['DJBuzValue'], attributeFunction: d => formatNumber(100.0 * d['DJBuz$'] / d['DJBuzValue'], 1, false, false)},
        { label: 'TimeV', sortValueFunction: d => d['DJTimingValue'], attributeFunction: d => formatNumber(d['DJTimingValue'], 0, false, true)},
        { label: 'SoloV', sortValueFunction: d => d['DJSoloValue'], attributeFunction: d => formatNumber(d['DJSoloValue'], 0, false, false)}
      ]
    }
  ]
  return panels
})

const allContestantStatDataWithBox = computed(() => {
  if (allContestantStatData.value) {
    return d3.filter(allContestantStatData.value, d => d['Att'] !== undefined)
  } else {
    return []
  }
})

const graphAttributesList = computed(() => graphAttributes(displayRounds.value))

const histogramGraphAttributeIdx = ref(0)
const histogramGraphAttribute = computed(() => graphAttributesList.value[histogramGraphAttributeIdx.value])
const histogramGraphRoundIdx = ref(0)

const xScatterGraphAttributeIdx = ref(0)
const xScatterGraphAttribute = computed(() => graphAttributesList.value[xScatterGraphAttributeIdx.value])
const yScatterGraphAttributeIdx = ref(1)
const yScatterGraphAttribute = computed(() => graphAttributesList.value[yScatterGraphAttributeIdx.value])
const scatterGraphRoundIdx = ref(0)

function specifyScatterHistogram(xAttr, yAttr) {
  return {
    histogramData: xAttr['requiresBox'] || yAttr['requiresBox'] ? allContestantStatDataWithBox.value : allContestantStatData.value,
    scatterData: xAttr['requiresBox'] || yAttr['requiresBox'] ? contestantStatDataWithBox.value : contestantStatData.value,
    scatterLabelFunction: d => d['Season'] + '-' + d['Game In Season'],
    scatterColorFunction: d => threeColorSet[0],
    title: xAttr['label'] + ' vs ' + yAttr['label'],
    xLabel: xAttr['label'],
    xFunction: xAttr['generatingFunctions'][scatterGraphRoundIdx.value],
    xBins: xAttr['bins'],
    yLabel: yAttr['label'],
    yFunction: yAttr['generatingFunctions'][scatterGraphRoundIdx.value],
    yBins: yAttr['bins'],
  }
}

function specifyHighlightHistogram(xAttr) {
  return {
    histogramData: xAttr['requiresBox'] ? allContestantStatDataWithBox.value : allContestantStatData.value,
    scatterData: xAttr['requiresBox'] ? contestantStatDataWithBox.value : contestantStatData.value,
    scatterLabelFunction: d => d['Season'] + '-' + d['Game In Season'],
    scatterColorFunction: d => threeColorSet[0],
    title: xAttr['label'],
    xLabel: xAttr['label'],
    xFunction: xAttr['generatingFunctions'][histogramGraphRoundIdx.value],
    xBins: xAttr['bins']
  }
}

</script>

<template>
  <Header />
  <div class="component-body">
    <div v-if="contestantStatData" class="section">
      <h1>{{ contestantData['contestantName'] }}</h1>
      <h2>Scoring and Daily Doubles</h2>
      <CarouselTable 
        :panels="scoringTablePanels"
        :rowData="contestantStatData"
        :footerRowData="[contestantAverageStatData].concat(winningContestantAverageStatData).concat(allContestantAverageStatData)"
        :defaultSortFunction="d => d['Date']"
        />
      <h2>Buzzing and Conversion Metrics</h2>
      <CarouselTable 
        :panels="conversionMetricTablePanels"
        :rowData="contestantStatData"
        :footerRowData="[contestantAverageStatData].concat(winningContestantAverageStatData).concat(allContestantAverageStatData)"
        :defaultSortFunction="d => d['Date']"
        />
    </div>
    <div v-if="contestantStatData" class="section">
      <h2>Attempts</h2>
      <StackValueBarChart
        :data="contestantStatData.concat(contestantAverageStatData).concat(winningContestantAverageStatData).concat(allContestantAverageStatData)"
        :xCoreLabelFunction="averageAwareGameLabelFunction"
        :xGroupLabels="['Game']"
        :yFunctionGroups="[[d => formatNumber(d['BuzC'],1), d => formatNumber(d['Buz'],1), d => formatNumber(d['Att'],1)]]"
        :colorFunction="averageAwareColorFunction"
        :yLabel="'BuzC -> Buz -> Att'"
        :title="'Attempts'"/>
    </div>
    <div v-if="contestantStatData" class="section">
      <h2>Attempt Value</h2>
      <StackValueBarChart
        :data="contestantStatData.concat(contestantAverageStatData).concat(winningContestantAverageStatData).concat(allContestantAverageStatData)"
        :xCoreLabelFunction="averageAwareGameLabelFunction"
        :xGroupLabels="['Game']"
        :yFunctionGroups="[[d => formatNumber(d['Buz$'],0), d => formatNumber(d['BuzValue'], 0), d => formatNumber(d['AttValue'],0)]]"
        :colorFunction="averageAwareColorFunction"
        :yLabel="'Buz$ -> BuzValue -> AttValue'"
        :title="'Attempt Values'"/>
    </div>
    <div class="section">
      <h2>Selectable Histograms</h2>
      <select v-model="histogramGraphAttributeIdx">
        <option v-for="(graphAttribute, idx) in graphAttributesList" :value="idx">
          {{ graphAttribute.label }}
        </option>
      </select>
      <select v-model="histogramGraphRoundIdx">
        <option :value="0">Full Game</option>
        <option :value="1">J! Round</option>
        <option :value="2">DJ! Round</option>
        <option v-if="displayRounds >= 3" :value="3">TJ! Round</option>
      </select><br/>
      <HighlightHistogram v-bind="specifyHighlightHistogram(histogramGraphAttribute)" />
    </div>
    <div class="section">
      <h2>Selectable Scatter Plots</h2>
      <select v-model="xScatterGraphAttributeIdx">
        <option v-for="(graphAttribute, idx) in graphAttributesList" :value="idx">
          {{ graphAttribute.label }}
        </option>
      </select>
      <select v-model="yScatterGraphAttributeIdx">
        <option :value="null">None</option>
        <option v-for="(graphAttribute, idx) in graphAttributesList" :value="idx">
          {{ graphAttribute.label }}
        </option>
      </select>
      <select v-model="scatterGraphRoundIdx">
        <option :value="0">Full Game</option>
        <option :value="1">J! Round</option>
        <option :value="2">DJ! Round</option>
        <option v-if="displayRounds >= 3" :value="3">TJ! Round</option>
      </select><br/>
      <ScatterHistogram v-bind="specifyScatterHistogram(xScatterGraphAttribute, yScatterGraphAttribute)" />
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
