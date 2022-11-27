<script setup>
import { ref, computed } from 'vue'
import { csvDataAccessor, formatNumber, gameStatDataFromContestantStatData,
  dateFormat, roundName } from '@/util'
import { graphAttributes } from '@/graphAttributes'
import * as d3 from 'd3'
import Header from './components/Header.vue'
import CarouselTable from './components/util/CarouselTable.vue'
import ReactiveChart from './components/util/ReactiveChart.vue'
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

function gameLink (contestantGameStatData) {
  console.log(contestantGameStatData)
  return '<a href="/game.html?game_id=' + 
    contestantGameStatData['Jometry Game Id'] + 
    '">' + contestantGameStatData['Season'] + '-' + contestantGameStatData['Game In Season'] + '</a>&nbsp;' + dateFormat(contestantGameStatData['Date'])
}


const scoringTablePanels = computed(() => {
  var columns = [
        { label: 'Game', sortValueFunction: d => -d['Date'], attributeFunction: gameLink},
        { label: 'JDDF', attributeFunction: d => d['JDDF']},
        { label: 'JDD+', sortValueFunction: d => d['JDD+'], attributeFunction: d => formatNumber(d['JDD+'], 2, false, true)},
        { label: 'JDD$', attributeFunction: d => d['JDD$']},
        { label: 'JBuz$', attributeFunction: d => d['JBuz$']},
        { label: 'JFinal$', attributeFunction: d => d['JFinal$']},
        { label: 'DJDDF', attributeFunction: d => d['DJDDF']},
        { label: 'DJDD+', sortValueFunction: d => d['DJDD+'], attributeFunction: d => formatNumber(d['DJDD+'], 2, false, true)},
        { label: 'DJDD$', attributeFunction: d => d['DJDD$']},
        { label: 'DJBuz$', attributeFunction: d => d['DJBuz$']},
        { label: 'DJFinal$', attributeFunction: d => d['DJFinal$']}
      ]
  columns = columns.concat([
        { label: 'FJ$', attributeFunction: d => d['FJ$']},
        { label: 'FJFinal$', attributeFunction: d => d['FJFinal$']},
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
        { label: 'Att', attributeFunction: d => d['Att']},
        { label: 'Buz', attributeFunction: d => d['Buz']},
        { label: '%', attributeFunction: d => formatNumber(d['Buz%'], 1, false, false)},
        { label: 'BuzC', attributeFunction: d => d['BuzC']},
        { label: '%', attributeFunction: d => formatNumber(100.0 * d['BuzC'] / d['Buz'], 1, false, false)},
        { label: 'Time', sortValueFunction: d => d['Timing'], attributeFunction: d => formatNumber(d['Timing'], 1, false, true)},
        { label: 'Solo', attributeFunction: d => formatNumber(d['Solo'], 1, false, false)},
        { label: 'AttV', attributeFunction: d => formatNumber(d['AttValue'], 0, false, false)},
        { label: 'BuzV', attributeFunction: d => d['BuzValue']},
        { label: '%', attributeFunction: d => formatNumber(100.0 * d['BuzValue'] / d['AttValue'], 1, false, false)},
        { label: 'Buz$', attributeFunction: d => d['Buz$']},
        { label: '%', attributeFunction: d => formatNumber(100.0 * d['Buz$'] / d['BuzValue'], 1, false, false)},
        { label: 'TimeV', sortValueFunction: d => d['TimingValue'], attributeFunction: d => formatNumber(d['TimingValue'], 0, false, true)},
        { label: 'SoloV', sortValueFunction: d => d['SoloValue'], attributeFunction: d => formatNumber(d['SoloValue'], 0, false, false)}
      ]
    },
    {
      label: 'Jeopardy Round',
      columns: [
        { label: 'Game', sortValueFunction: d => -d['Date'], attributeFunction: gameLink},
        { label: 'Att', attributeFunction: d => d['JAtt']},
        { label: 'Buz', attributeFunction: d => d['JBuz']},
        { label: '%', attributeFunction: d => formatNumber(d['JBuz%'], 1, false, false)},
        { label: 'BuzC', attributeFunction: d => d['JBuzC']},
        { label: '%', attributeFunction: d => formatNumber(100.0 * d['JBuzC'] / d['JBuz'], 1, false, false)},
        { label: 'Time', sortValueFunction: d => d['JTiming'], attributeFunction: d => formatNumber(d['JTiming'], 1, false, true)},
        { label: 'Solo', attributeFunction: d => formatNumber(d['JSolo'], 1, false, false)},
        { label: 'AttV', attributeFunction: d => formatNumber(d['JAttValue'], 0, false, false)},
        { label: 'BuzV', attributeFunction: d => d['JBuzValue']},
        { label: '%', attributeFunction: d => formatNumber(100.0 * d['JBuzValue'] / d['JAttValue'], 1, false, false)},
        { label: 'Buz$', attributeFunction: d => d['JBuz$']},
        { label: '%', attributeFunction: d => formatNumber(100.0 * d['JBuz$'] / d['JBuzValue'], 1, false, false)},
        { label: 'TimeV', sortValueFunction: d => d['JTimingValue'], attributeFunction: d => formatNumber(d['JTimingValue'], 0, false, true)},
        { label: 'SoloV', sortValueFunction: d => d['JSoloValue'], attributeFunction: d => formatNumber(d['JSoloValue'], 0, false, false)}
      ]
    },
    {
      label: 'Double Jeopardy Round',
      columns: [
        { label: 'Game', sortValueFunction: d => -d['Date'], attributeFunction: gameLink},
        { label: 'Att', attributeFunction: d => d['DJAtt']},
        { label: 'Buz', attributeFunction: d => d['DJBuz']},
        { label: '%', attributeFunction: d => formatNumber(d['DJBuz%'], 1, false, false)},
        { label: 'BuzC', attributeFunction: d => d['DJBuzC']},
        { label: '%', attributeFunction: d => formatNumber(100.0 * d['DJBuzC'] / d['DJBuz'], 1, false, false)},
        { label: 'Time', sortValueFunction: d => d['DJTiming'], attributeFunction: d => formatNumber(d['DJTiming'], 1, false, true)},
        { label: 'Solo', attributeFunction: d => formatNumber(d['DJSolo'], 1, false, false)},
        { label: 'AttV', attributeFunction: d => formatNumber(d['DJAttValue'], 0, false, false)},
        { label: 'BuzV', attributeFunction: d => d['DJBuzValue']},
        { label: '%', attributeFunction: d => formatNumber(100.0 * d['DJBuzValue'] / d['DJAttValue'], 1, false, false)},
        { label: 'Buz$', attributeFunction: d => d['DJBuz$']},
        { label: '%', attributeFunction: d => formatNumber(100.0 * d['DJBuz$'] / d['DJBuzValue'], 1, false, false)},
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
const xGraphAttributeIdx = ref(0)
const xGraphAttribute = computed(() => graphAttributesList.value[xGraphAttributeIdx.value])
const yGraphAttributeIdx = ref(null)
const yGraphAttribute = computed(() => graphAttributesList.value[yGraphAttributeIdx.value])
const graphRoundIdx = ref(0)

function specifyScatterHistogram(xAttr, yAttr) {
  return {
    histogramData: xAttr['requiresBox'] || yAttr['requiresBox'] ? allContestantStatDataWithBox.value : allContestantStatData.value,
    scatterData: xAttr['requiresBox'] || yAttr['requiresBox'] ? contestantStatDataWithBox.value : contestantStatData.value,
    scatterLabelFunction: d => d['Season'] + '-' + d['Game In Season'],
    scatterColorFunction: d => threeColorSet[0],
    title: xAttr['label'] + ' vs ' + yAttr['label'],
    xLabel: xAttr['label'],
    xFunction: xAttr['generatingFunctions'][graphRoundIdx.value],
    xBins: xAttr['bins'],
    yLabel: yAttr['label'],
    yFunction: yAttr['generatingFunctions'][graphRoundIdx.value],
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
    xFunction: xAttr['generatingFunctions'][graphRoundIdx.value],
    xBins: xAttr['bins']
  }
}

</script>

<template>
  <Header />
  <div class="body-section">
    <div v-if="contestantStatData" class="section">
      <h1>{{ contestantData['contestantName'] }}</h1>
      <h2>Scoring and Daily Doubles</h2>
      <CarouselTable 
        :panels="scoringTablePanels"
        :rowData="contestantStatData"
        :defaultSortFunction="d => d['Date']"
        />
      <h2>Buzzing and Conversion Metrics</h2>
      <CarouselTable 
        :panels="conversionMetricTablePanels"
        :rowData="contestantStatData"
        :defaultSortFunction="d => d['Date']"
        />
    </div>
    <div>
      <h2>Attempts</h2>
      <StackValueBarChart
        :data="contestantStatData"
        :xCoreLabelFunction="d => d['Season'] + '-' + d['Game In Season']"
        :xGroupLabels="['Game']"
        :yFunctionGroups="[[d => d['BuzC'], d => d['Buz'], d => d['Att']]]"
        :colorFunction="d => threeColorSet[0]"
        :yLabel="'BuzC -> Buz -> Att'"
        :title="'Attempts'"/>
    </div>
    <div>
      <h2>Attempt Value</h2>
      <StackValueBarChart
        :data="contestantStatData"
        :xCoreLabelFunction="d => d['Season'] + '-' + d['Game In Season']"
        :xGroupLabels="['Game']"
        :yFunctionGroups="[[d => d['Buz$'], d => d['BuzValue'], d => formatNumber(d['AttValue'],0)]]"
        :colorFunction="d => threeColorSet[0]"
        :yLabel="'Buz$ -> BuzValue -> AttValue'"
        :title="'Attempt Values'"/>
    </div>
    <select v-model="xGraphAttributeIdx">
      <option v-for="(graphAttribute, idx) in graphAttributesList" :value="idx">
        {{ graphAttribute.label }}
      </option>
    </select>
    <select v-model="yGraphAttributeIdx">
      <option :value="null">None</option>
      <option v-for="(graphAttribute, idx) in graphAttributesList" :value="idx">
        {{ graphAttribute.label }}
      </option>
    </select>
    <select v-model="graphRoundIdx">
      <option :value="0">Full Game</option>
      <option :value="1">J! Round</option>
      <option :value="2">DJ! Round</option>
      <option v-if="displayRounds >= 3" :value="3">TJ! Round</option>
    </select><br/>
    <ScatterHistogram v-if="yGraphAttribute" v-bind="specifyScatterHistogram(xGraphAttribute, yGraphAttribute)" />
    <HighlightHistogram v-else v-bind="specifyHighlightHistogram(xGraphAttribute)" />
  </div>

</template>

<style scoped>

.body-section {
  margin: 2em 1em;
}



</style>
