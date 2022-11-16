<script setup>
import { ref, reactive, computed } from 'vue'
import { csvDataAccessor, formatNumber, gameStatDataFromContestantStatData, dateFormat } from '@/util'
import { playClassificationConfigurationData } from '@/configuration'
import * as d3 from 'd3'
import Header from './components/Header.vue'
import CarouselTable from './components/util/CarouselTable.vue'
import HighlightHistogram from './components/util/HighlightHistogram.vue'
import ScatterHistogram from './components/util/ScatterHistogram.vue'

let urlParams = new URLSearchParams(window.location.search);
const playClassificationId = urlParams.get('toc_period_id')
const gameId = +urlParams.get('game_id')
const playClassificationConfiguration = playClassificationConfigurationData[playClassificationId]

const allContestantStatData = ref([])

async function fetchData(playClassification) {
  const res = await d3.csv(
    'https://j-ometry.com/csvs/' + playClassification + '_full.csv',
    csvDataAccessor
  )
  var resResult = await res
  allContestantStatData.value = resResult
}
fetchData(playClassificationId)

const allGameStatData = computed(() => {
    if (allContestantStatData.value) {
      var data = gameStatDataFromContestantStatData(allContestantStatData.value)
      data.sort(d => d[0]);
      data.reverse();
      return data;
    } else return allContestantStatData.value
})

const gameStatData = computed(() => {
  if (allGameStatData.value) return d3.filter(allGameStatData.value, d => d['gameId'] === gameId)[0]
  else return {}
})

const gameRounds = computed(() => {
  if (gameStatData.value) return gameStatData.value['rounds']
  return 2
})

const gameContestantStatData = computed(() => {
  if (allContestantStatData.value) return d3.filter(allContestantStatData.value, d => d['Jometry Game Id'] === gameId)
  else return allContestantStatData.value
})

const gameContestantIds = computed(() => {
  if (gameContestantStatData.value) return d3.map(gameContestantStatData.value, d => d['Jometry Contestant Id'])
  return []
})

const threeColorSet = ['#0072B2','#E69F00','#009E73']
const color = ref(d3.scaleOrdinal().domain(gameContestantIds.value).range(threeColorSet))

function contestantLink (contestantStatData) {
  return '<span style="color: ' + 
    color.value(contestantStatData['Jometry Contestant Id']) + 
    '">&#9632;</span>&nbsp;<a href="/contestant.html?contestant_id=' + 
    contestantStatData['Jometry Contestant Id'] + 
    '">' + contestantStatData['Contestant'] + '</a>'
}

const scoringTablePanels = computed(() => {
  var columns = [
        { label: 'Contestant', sortValueFunction: d => -d['Podium'], attributeFunction: contestantLink},
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
  if (gameRounds.value >= 3) {
    columns = columns.concat([
        { label: 'TJDDF', attributeFunction: d => d['TJDDF']},
        { label: 'TJDD+', sortValueFunction: d => d['TJDD+'], attributeFunction: d => formatNumber(d['TJDD+'], 2, false, true)},
        { label: 'TJDD$', attributeFunction: d => d['TJDD$']},
        { label: 'TJBuz$', attributeFunction: d => d['TJBuz$']},
        { label: 'TJFinal$', attributeFunction: d => d['TJFinal$']}
      ])
  } 
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
        { label: 'Contestant', sortValueFunction: d => -d['Podium'], attributeFunction: contestantLink},
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
        { label: 'SoloV', attributeFunction: d => formatNumber(d['SoloValue'], 0, false, false)}
      ]
    },
    {
      label: 'Jeopardy Round',
      columns: [
        { label: 'Contestant', sortValueFunction: d => -d['Podium'], attributeFunction: contestantLink},
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
        { label: 'SoloV', attributeFunction: d => formatNumber(d['JSoloValue'], 0, false, false)}
      ]
    },
    {
      label: 'Double Jeopardy Round',
      columns: [
        { label: 'Contestant', sortValueFunction: d => -d['Podium'], attributeFunction: contestantLink},
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
        { label: 'SoloV', attributeFunction: d => formatNumber(d['DJSoloValue'], 0, false, false)}
      ]
    }
  ]
  if (gameRounds.value >= 3) {
    panels.push({
      label: 'Triple Jeopardy Round',
      columns: [
        { label: 'Contestant', sortValueFunction: d => -d['Podium'], attributeFunction: contestantLink},
        { label: 'Att', attributeFunction: d => d['TJAtt']},
        { label: 'Buz', attributeFunction: d => d['TJBuz']},
        { label: '%', attributeFunction: d => formatNumber(d['TJBuz%'], 1, false, false)},
        { label: 'BuzC', attributeFunction: d => d['TJBuzC']},
        { label: '%', attributeFunction: d => formatNumber(100.0 * d['TJBuzC'] / d['TJBuz'], 1, false, false)},
        { label: 'Time', sortValueFunction: d => d['TJTiming'], attributeFunction: d => formatNumber(d['TJTiming'], 1, false, true)},
        { label: 'Solo', attributeFunction: d => formatNumber(d['TJSolo'], 1, false, false)},
        { label: 'AttV', attributeFunction: d => formatNumber(d['TJAttValue'], 0, false, false)},
        { label: 'BuzV', attributeFunction: d => d['TJBuzValue']},
        { label: '%', attributeFunction: d => formatNumber(100.0 * d['TJBuzValue'] / d['TJAttValue'], 1, false, false)},
        { label: 'Buz$', attributeFunction: d => d['TJBuz$']},
        { label: '%', attributeFunction: d => formatNumber(100.0 * d['TJBuz$'] / d['TJBuzValue'], 1, false, false)},
        { label: 'TimeV', sortValueFunction: d => d['TJTimingValue'], attributeFunction: d => formatNumber(d['TJTimingValue'], 0, false, true)},
        { label: 'SoloV', attributeFunction: d => formatNumber(d['TJSoloValue'], 0, false, false)}
      ]
    })
  }
  return panels
})

const allContestantStatDataWithBox = computed(() => {
  if (allContestantStatData.value) {
    return d3.filter(allContestantStatData.value, d => d['Att'] !== undefined)
  } else {
    return []
  }
})

const gameContestantStatDataWithBox = computed(() => {
  if (gameContestantStatData.value) {
    return d3.filter(gameContestantStatData.value, d => d['Att'] !== undefined)
  } else {
    return []
  }
})

//Charts
const attGraphAttribute = computed(() => ({
  label: 'Att',
  requiresBox: true,
  generatingFunctions: [d => d['Att'], d => d['JAtt'], d => d['DJAtt']].concat(gameRounds.value >= 3 ? [d => d['TJAtt']] : []),
  bins: { size: 1 }
}))

const buzGraphAttribute = computed(() => ({
  label: 'Buz',
  requiresBox: false,
  generatingFunctions: [d => d['Buz'], d => d['JBuz'], d => d['DJBuz']].concat(gameRounds.value >= 3 ? [d => d['TJBuz']] : []),
  bins: { size: 1 }
}))

const attValueGraphAttribute = computed(() => ({
  label: 'AttValue',
  requiresBox: true,
  generatingFunctions: [d => d['AttValue'], d => d['JAttValue'], d => d['DJAttValue']].concat(gameRounds.value >= 3 ? [d => d['TJAttValue']] : []),
  bins: { size: 1000 }
}))

const buzValueGraphAttribute = computed(() => ({
  label: 'BuzValue',
  requiresBox: false,
  generatingFunctions: [d => d['BuzValue'], d => d['JBuzValue'], d => d['DJBuzValue']].concat(gameRounds.value >= 3 ? [d => d['TJBuzValue']] : []),
  bins: { size: 1000 }
}))

const buzScoreGraphAttribute = computed(() => ({
  label: 'Buz$',
  requiresBox: false,
  generatingFunctions: [d => d['Buz$'], d => d['JBuz$'], d => d['DJBuz$']].concat(gameRounds.value >= 3 ? [d => d['TJBuz$']] : []),
  bins: { size: 1000 }
}))

const buzValueScoreConversionGraphAttribute = computed(() => ({
  label: 'Buz$%',
  requiresBox: false,
  generatingFunctions: [d => 100.0 * d['Buz$'] / d['BuzValue'], 
    d => 100.0 * d['JBuz$'] / d['JBuzValue'], 
    d => 100.0 * d['DJBuz$'] / d['DJBuzValue']].concat(gameRounds.value >= 3 ? [d => 100.0 * d['TJBuz$'] / d['TJBuzValue']] : []),
  bins: { size: 5 }
}))

const timingGraphAttribute = computed(() => ({
  label: 'Timing',
  requiresBox: true,
  generatingFunctions: [d => d['Timing'], d => d['JTiming'], d => d['DJTiming']].concat(gameRounds.value >= 3 ? [d => d['TJTiming']] : []),
  bins: { size: 0.5 }
}))

const soloGraphAttribute = computed(() => ({
  label: 'Solo',
  requiresBox: true,
  generatingFunctions: [d => d['Solo'], d => d['JSolo'], d => d['DJSolo']].concat(gameRounds.value >= 3 ? [d => d['TJSolo']] : []),
  bins: { start:0, size: 0.5 }
}))

function specifyScatterHistogram(xAttr, yAttr) {
  return {
    histogramData: xAttr['requiresBox'] || yAttr['requiresBox'] ? allContestantStatDataWithBox.value : allContestantStatData.value,
    scatterData: xAttr['requiresBox'] || yAttr['requiresBox'] ? gameContestantStatDataWithBox.value : gameContestantStatData.value,
    scatterLabelFunction: d => d['Contestant'],
    scatterColorFunction: d => color.value(d['Jometry Contestant Id']),
    title: xAttr['label'] + ' vs ' + yAttr['label'],
    xLabel: xAttr['label'],
    xFunction: xAttr['generatingFunctions'][0],
    xBins: xAttr['bins'],
    yLabel: yAttr['label'],
    yFunction: yAttr['generatingFunctions'][0],
    yBins: yAttr['bins'],
  }
}

function specifyHighlightHistogram(xAttr) {
  return {
    histogramData: xAttr['requiresBox'] ? allContestantStatDataWithBox.value : allContestantStatData.value,
    scatterData: xAttr['requiresBox'] ? gameContestantStatDataWithBox.value : gameContestantStatData.value,
    scatterLabelFunction: d => d['Contestant'],
    scatterColorFunction: d => color.value(d['Jometry Contestant Id']),
    title: xAttr['label'],
    xLabel: xAttr['label'],
    xFunction: xAttr['generatingFunctions'][0],
    xBins: xAttr['bins']
  }
}

</script>

<template>
  <Header />
  <div v-if="gameStatData" class="section">
    <h1><span id="toc-period-id">{{ playClassificationConfiguration.label }}</span> Season <span id="season">{{ gameStatData.season }}</span> Game <span id="game-number">{{ gameStatData.gameInSeason }}</span> <span id="game-date">{{ dateFormat(gameStatData.date) }}</span></h1>
    <h2>Scoring and Daily Doubles</h2>
    <CarouselTable 
      :panels="scoringTablePanels"
      :rowData="gameContestantStatData"
      />
    <h2>Buzzing and Conversion Metrics</h2>
    <CarouselTable 
      :panels="conversionMetricTablePanels"
      :rowData="gameContestantStatData"
      />
  </div>
  <ScatterHistogram
    v-bind="specifyScatterHistogram(attGraphAttribute, buzGraphAttribute)" />
  <ScatterHistogram
    v-bind="specifyScatterHistogram(attValueGraphAttribute, buzValueGraphAttribute)" />
  <ScatterHistogram
    v-bind="specifyScatterHistogram(buzValueGraphAttribute, buzScoreGraphAttribute)" />
  <ScatterHistogram
    v-bind="specifyScatterHistogram(buzValueGraphAttribute, buzValueScoreConversionGraphAttribute)" />
  <ScatterHistogram
    v-bind="specifyScatterHistogram(timingGraphAttribute, soloGraphAttribute)" />
  <HighlightHistogram
    v-bind="specifyHighlightHistogram(attGraphAttribute)" />
  {{ gameStatData }}
  {{ gameContestantStatData ? gameContestantStatData[0] : '' }}
</template>

<style scoped>

</style>
