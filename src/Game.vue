<script setup>
import { ref, reactive, computed } from 'vue'
import { csvDataAccessor, formatNumber, gameStatDataFromContestantStatData, dateFormat } from '@/util'
import { playClassificationConfigurationData } from '@/configuration'
import * as d3 from 'd3'
import Header from './components/Header.vue'
import CarouselTable from './components/util/CarouselTable.vue'
import ReactiveChart from './components/util/ReactiveChart.vue'

let urlParams = new URLSearchParams(window.location.search);
const playClassificationId = urlParams.get('toc_period_id')
const gameId = +urlParams.get('game_id')
const playClassificationConfiguration = playClassificationConfigurationData[playClassificationId]

const allContestantStatData = reactive({})

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

const scoringTablePanels = reactive([
  {
    label: 'Game',
    columns: [
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
      { label: 'DJFinal$', attributeFunction: d => d['DJFinal$']},
      { label: 'FJ$', attributeFunction: d => d['FJ$']},
      { label: 'FJFinal$', attributeFunction: d => d['FJFinal$']},
    ]
  }
])

const conversionMetricTablePanels = reactive([
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
])

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
const attBuzData = computed(() => {
  if (allContestantStatDataWithBox.value) {
    return [
      {
        x: d3.map(allContestantStatDataWithBox.value, d => d['Att']),
        y: d3.map(allContestantStatDataWithBox.value, d => d['Buz']),
        autobinx: false,
        xbins: { start: -0.5, end: 57.5, size: 1 },
        ybins: { start: 0, end: 50, size: 1 },
        type: 'histogram2d',
        colorscale : [['0' , 'white'],['1', '#999999']]
      },
      {
        x: d3.map(gameContestantStatDataWithBox.value, d => d['Att']),
        y: d3.map(gameContestantStatDataWithBox.value, d => d['Buz']),
        mode: 'markers+text',
        marker: {
            symbol: 'circle',
            size: 6,
            opacity: 1,
            line: {
                color: 'black',
                width: 0.5
            },
            color: d3.map(gameContestantStatDataWithBox.value, d => color.value(d['Jometry Contestant Id'])),
        },
        type: 'scatter',
        textcolor: d3.map(gameContestantStatDataWithBox.value, d => color.value(d['Jometry Contestant Id'])),
        textfont: {
            family: 'Roboto'
        },
        textposition: 'center right',
        text: d3.map(gameContestantStatDataWithBox.value, d => d['Contestant'])
      }
    ]
  } else {
    return []
  }
})
const attBuzLayout = reactive({
  title: 'Att vs Buz', xaxis: { title: 'Att' }, yaxis: { title: 'Buz' } })

const attValueBuzValueData = computed(() => {
  if (allContestantStatDataWithBox.value) {
    return [
      {
        x: d3.map(allContestantStatDataWithBox.value, d => d['AttValue']),
        y: d3.map(allContestantStatDataWithBox.value, d => d['Buz$']),
        autobinx: false,
        xbins: { start: 0, end: 50000, size: 1000 },
        ybins: { start: -10000, end: 50000, size: 2000 },
        type: 'histogram2d',
        colorscale : [['0' , 'white'],['1', '#999999']]
      },
      {
        x: d3.map(gameContestantStatDataWithBox.value, d => d['AttValue']),
        y: d3.map(gameContestantStatDataWithBox.value, d => d['Buz$']),
        mode: 'markers+text',
        marker: {
            symbol: 'circle',
            size: 6,
            opacity: 1,
            line: {
                color: 'black',
                width: 0.5
            },
            color: d3.map(gameContestantStatDataWithBox.value, d => color.value(d['Jometry Contestant Id'])),
        },
        type: 'scatter',
        textcolor: d3.map(gameContestantStatDataWithBox.value, d => color.value(d['Jometry Contestant Id'])),
        textfont: {
            family: 'Roboto'
        },
        textposition: 'center right',
        text: d3.map(gameContestantStatDataWithBox.value, d => d['Contestant'])
      }
    ]
  } else {
    return []
  }
})
const attBuzValueLayout = reactive({
  title: 'AttValue vs BuzValue', xaxis: { title: 'AttValue' }, yaxis: { title: 'BuzValue' } })

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
  <ReactiveChart :chart="{ traces: attBuzData, layout: attBuzLayout }"/>
  <ReactiveChart :chart="{ traces: attValueBuzValueData, layout: attBuzValueLayout }"/>
  {{ gameContestantStatData ? gameContestantStatData[0] : '' }}
</template>

<style scoped>

</style>
