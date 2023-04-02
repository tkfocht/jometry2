<script setup>
import { ref, computed } from 'vue'
import { csvDataAccessor, gameClueDataAccessor, formatNumber, gameStatDataFromContestantStatData,
  dateFormat, roundName } from '@/util'
import { dataSourceAddress } from '@/configuration'
import { graphAttributes } from '@/graphAttributes'
import * as d3 from 'd3'
import Footer from '../components/Footer.vue'
import Header from '../components/Header.vue'
import CarouselTable from '../components/util/CarouselTable.vue'
import ReactiveChart from '../components/util/ReactiveChart.vue'
import HighlightHistogram from '../components/util/HighlightHistogram.vue'
import ScatterHistogram from '../components/util/ScatterHistogram.vue'
import StackValueBarChart from '../components/util/StackValueBarChart.vue'
import { formatDate } from 'plotly.js-dist'

let urlParams = new URLSearchParams(window.location.search);
const dataSourceString = urlParams.get('data_source')
const dataSourceId = dataSourceString ? dataSourceString : 'standard'

const gameId = +urlParams.get('game_id')

const allContestantStatData = ref(null)
const gameClueData = ref(null)

async function fetchContestantStatData(dataSourceId) {
  const res = await d3.csv(
    dataSourceAddress(dataSourceId),
    csvDataAccessor
  )
  var resResult = await res
  allContestantStatData.value = resResult
}
fetchContestantStatData(dataSourceId)

async function fetchGameClueData(gameId) {
  const res = await d3.csv(
    'https://j-ometry.com/csvs/game_clue/' + gameId + '.csv',
    gameClueDataAccessor
  )
  var resResult = await res
  gameClueData.value = resResult
}
fetchGameClueData(gameId)

const gameClueCorrectResponses = computed(() => {
  if (!gameClueData.value) return null
  var r = d3.rollup(gameClueData.value, v => {
    if (v.length === 0) return { 'dd': 0, 'corrects': [-1] }
    var corrects = d3.filter([1,2,3], idx => { return v[0]['Correct' + idx] === 1; })
    if (corrects.length === 0) corrects = [0]
    return { 'dd': v[0]['DD'], 'corrects': corrects }
  }, d => d['Round of Game'], d => d['Base Value'], d => d['Column'])
  return r
})

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
  else return null
})

const gameRounds = computed(() => {
  if (gameStatData.value) return gameStatData.value['rounds']
  return 2
})

const gameBaseValueMultiple = computed(() => {
  if (gameStatData.value && gameStatData.value['rounds'] === 3) return 100
  return 200
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

function contestantLinkPretext (contestantStatData) {
  return '<span style="color: ' + 
    color.value(contestantStatData['Jometry Contestant Id']) + 
    '">&#9632;</span>&nbsp;'
}

function contestantLinkLink (contestantStatData) {
  return { path: '/contestant', query: { data_source: dataSourceId, contestant_id: contestantStatData['Jometry Contestant Id'] } }
}

function contestantLinkText (contestantStatData) {
  return contestantStatData['Contestant']
}

const gameScoreChartData = computed(() => {
  if (!gameClueData.value || !gameContestantStatData.value) return undefined
  var x = ['0'].concat(d3.map(gameClueData.value, d => d['Round of Game'] + "-" + d['Clue of Round']));
  return {
    'traces': d3.map([1,2,3], idx => ({
      x: x,
      y: [0].concat(d3.map(gameClueData.value, d => d['PostScore' + idx])),
      type: 'scatter',
      mode: 'lines',
      name: gameContestantStatData.value[idx-1]['Contestant'],
      line: {
          color: threeColorSet[idx-1]
      }
    })),
    'layout': {}
  }
})

const leadRatioChartData = computed(() => {
  if (!gameScoreChartData.value) return undefined
  var x = ['0'].concat(d3.map(gameClueData.value, d => d['Round of Game'] + "-" + d['Clue of Round']));
  return {
    'traces': d3.map([1,2,3], idx => ({
      x: x,
      y: [0].concat(d3.map(d3.filter(gameClueData.value, d1 => d1['Round of Game'] <= gameRounds.value), d => {
        const scoresSorted = d3.map([1,2,3], psIdx => d['PostScore' + psIdx])
        scoresSorted.sort(d3.descending)
        if (scoresSorted[0] <= 0) return 0
        if (scoresSorted[0] === d['PostScore' + idx]) return d['PostScore' + idx] * 1.0 / Math.max(0, scoresSorted[1])
        return d['PostScore' + idx] * 1.0 / scoresSorted[0]
      })),
      type: 'scatter',
      mode: 'lines',
      name: gameContestantStatData.value[idx-1]['Contestant'],
      line: {
          color: threeColorSet[idx-1]
      }
    })),
    'layout': {}
  }
})

const finalJeopardyMatrixCells = computed(() => {
  if (!gameClueData.value || !gameRounds.value) return [[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1]]
  var combinations = [[true, true, true],
                        [true, true, false],
                        [true, false, true],
                        [true, false, false],
                        [false, true, true],
                        [false, true, false],
                        [false, false, true],
                        [false, false, false]]
  var fjRecord = d3.filter(gameClueData.value, d => d['Round of Game'] === gameRounds.value + 1 && d['Clue of Round'] === 1)[0];
  var fjInitialScores = d3.map([1,2,3], p => fjRecord['PreScore' + p]);  
  var fjWagers = d3.map([1,2,3], p => fjRecord['Wager' + p]);
  var mapped = d3.map(combinations, combo => {
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

const scoringTablePanels = computed(() => {
  var columns = [
        { label: 'Contestant', sortValueFunction: d => -d['Podium'], prelinkTextFunction: contestantLinkPretext, linkFunction: contestantLinkLink, linkTextFunction: contestantLinkText},
        { label: 'JDDF', attributeFunction: d => d['JDDF'], description: 'Daily Doubles found in Jeopardy round'},
        { label: 'JDD+', sortValueFunction: d => d['JDD+'], attributeFunction: d => formatNumber(d['JDD+'], 2, false, true), description: 'Daily Doubles found above expectation in Jeopardy round'},
        { label: 'JDD$', attributeFunction: d => d['JDD$'], description: 'Score on Daily Doubles in Jeopardy round'},
        { label: 'JBuz$', attributeFunction: d => d['JBuz$'], description: 'Score on buzzing in Jeopardy round'},
        { label: 'JFinal$', attributeFunction: d => d['JFinal$'], description: 'Score at end of Jeopardy round'},
        { label: 'DJDDF', attributeFunction: d => d['DJDDF'], description: 'Daily Doubles found in Double Jeopardy round'},
        { label: 'DJDD+', sortValueFunction: d => d['DJDD+'], attributeFunction: d => formatNumber(d['DJDD+'], 2, false, true), description: 'Daily Doubles found above expectation in Double Jeopardy round'},
        { label: 'DJDD$', attributeFunction: d => d['DJDD$'], description: 'Score on Daily Doubles in Double Jeopardy round'},
        { label: 'DJBuz$', attributeFunction: d => d['DJBuz$'], description: 'Score on buzzing in Double Jeopardy round'},
        { label: 'DJFinal$', attributeFunction: d => d['DJFinal$'], description: 'Score at end of Double Jeopardy round'}
      ]
  if (gameRounds.value >= 3) {
    columns = columns.concat([
        { label: 'TJDDF', attributeFunction: d => d['TJDDF'], description: 'Daily Doubles found in Triple Jeopardy round'},
        { label: 'TJDD+', sortValueFunction: d => d['TJDD+'], attributeFunction: d => formatNumber(d['TJDD+'], 2, false, true), description: 'Daily Doubles found above expectation in Triple Jeopardy round'},
        { label: 'TJDD$', attributeFunction: d => d['TJDD$'], description: 'Score on Daily Doubles in Triple Jeopardy round'},
        { label: 'TJBuz$', attributeFunction: d => d['TJBuz$'], description: 'Score on buzzing in Triple Jeopardy round'},
        { label: 'TJFinal$', attributeFunction: d => d['TJFinal$'], description: 'Score at end of Triple Jeopardy round'}
      ])
  } 
  columns = columns.concat([
        { label: 'FJ$', attributeFunction: d => d['FJ$'], description: 'Score change in Final Jeopardy'},
        { label: 'FJFinal$', attributeFunction: d => d['FJFinal$'], description: 'Score at end of Final Jeopardy'},
      ])
  return [
    {
      label: 'Standard',
      columns: [
        { label: 'Contestant', sortValueFunction: d => -d['Podium'], prelinkTextFunction: contestantLinkPretext, linkFunction: contestantLinkLink, linkTextFunction: contestantLinkText},
        { label: 'Buz', attributeFunction: d => d['Buz'], description: 'Buzzes'},
        { label: 'BuzC', attributeFunction: d => d['BuzC'], description: 'Correct responses on buzzes'},
        { label: 'Buz$', attributeFunction: d => d['Buz$'], description: 'Score on buzzing'},
        { label: 'DDF', attributeFunction: d => d['DDF'], description: 'Daily Doubles found'},
        { label: 'DD+', sortValueFunction: d => d['DD+'], attributeFunction: d => formatNumber(d['DD+'], 2, false, true), description: 'Daily Doubles found above expectation'},
        { label: 'DD$', attributeFunction: d => d['DD$'], description: 'Score on Daily Doubles'},
        { label: 'FJStart$', attributeFunction: d => gameRounds.value >= 3 ? d['TJFinal$'] : d['DJFinal$'], description: 'Score at end of regular play'},
        { label: 'FJ$', attributeFunction: d => d['FJ$'], description: 'Score change in Final Jeopardy'},
        { label: 'FJFinal$', attributeFunction: d => d['FJFinal$'], description: 'Score at end of Final Jeopardy'},
      ]
    },
    {
      label: 'Standard (J)',
      columns: [
        { label: 'Contestant', sortValueFunction: d => -d['Podium'], prelinkTextFunction: contestantLinkPretext, linkFunction: contestantLinkLink, linkTextFunction: contestantLinkText},
        { label: 'Buz', attributeFunction: d => d['JBuz'], description: 'Buzzes'},
        { label: 'BuzC', attributeFunction: d => d['JBuzC'], description: 'Correct responses on buzzes'},
        { label: 'Buz$', attributeFunction: d => d['JBuz$'], description: 'Score on buzzing'},
        { label: 'DDF', attributeFunction: d => d['JDDF'], description: 'Daily Doubles found'},
        { label: 'DD+', sortValueFunction: d => d['JDD+'], attributeFunction: d => formatNumber(d['JDD+'], 2, false, true), description: 'Daily Doubles found above expectation'},
        { label: 'DD$', attributeFunction: d => d['JDD$'], description: 'Score on Daily Doubles'},
        { label: 'JFinal$', attributeFunction: d => d['JFinal$'], description: 'Score at end of round'},
      ]
    },
    {
      label: 'Standard (DJ)',
      columns: [
        { label: 'Contestant', sortValueFunction: d => -d['Podium'], prelinkTextFunction: contestantLinkPretext, linkFunction: contestantLinkLink, linkTextFunction: contestantLinkText},
        { label: 'Buz', attributeFunction: d => d['DJBuz'], description: 'Buzzes'},
        { label: 'BuzC', attributeFunction: d => d['DJBuzC'], description: 'Correct responses on buzzes'},
        { label: 'Buz$', attributeFunction: d => d['DJBuz$'], description: 'Score on buzzing'},
        { label: 'DDF', attributeFunction: d => d['DJDDF'], description: 'Daily Doubles found'},
        { label: 'DD+', sortValueFunction: d => d['DJDD+'], attributeFunction: d => formatNumber(d['DJDD+'], 2, false, true), description: 'Daily Doubles found above expectation'},
        { label: 'DD$', attributeFunction: d => d['DJDD$'], description: 'Score on Daily Doubles'},
        { label: 'DJFinal$', attributeFunction: d => d['DJFinal$'], description: 'Score at end ofround'},
      ]
    }
  ].concat(gameRounds.value >= 3 ? [
    {
      label: 'Standard (TJ)',
      columns: [
        { label: 'Contestant', sortValueFunction: d => -d['Podium'], prelinkTextFunction: contestantLinkPretext, linkFunction: contestantLinkLink, linkTextFunction: contestantLinkText},
        { label: 'Buz', attributeFunction: d => d['TJBuz'], description: 'Buzzes'},
        { label: 'BuzC', attributeFunction: d => d['TJBuzC'], description: 'Correct responses on buzzes'},
        { label: 'Buz$', attributeFunction: d => d['TJBuz$'], description: 'Score on buzzing'},
        { label: 'DDF', attributeFunction: d => d['TJDDF'], description: 'Daily Doubles found'},
        { label: 'DD+', sortValueFunction: d => d['TJDD+'], attributeFunction: d => formatNumber(d['DJDD+'], 2, false, true), description: 'Daily Doubles found above expectation'},
        { label: 'DD$', attributeFunction: d => d['TJDD$'], description: 'Score on Daily Doubles'},
        { label: 'TJFinal$', attributeFunction: d => d['TJFinal$'], description: 'Score at end ofround'},
      ]
    }
  ] : [])
})

const conversionMetricTablePanels = computed(() => {
  var panels = [
    {
      label: 'Conversion',
      columns: [
        { label: 'Contestant', sortValueFunction: d => -d['Podium'], prelinkTextFunction: contestantLinkPretext, linkFunction: contestantLinkLink, linkTextFunction: contestantLinkText},
        { label: 'Att', attributeFunction: d => d['Att'], description: 'Attempts'},
        { label: 'Buz', attributeFunction: d => d['Buz'], description: 'Buzzes'},
        { label: 'Buz%', attributeFunction: d => formatNumber(d['Buz%'], 1, false, false), description: 'Buz as percentage of Att'},
        { label: 'BuzC', attributeFunction: d => d['BuzC'], description: 'Correct responses on buzzes'},
        { label: 'Acc%', attributeFunction: d => formatNumber(100.0 * d['BuzC'] / d['Buz'], 1, false, false), description: 'Accuracy: BuzC as percentage of Buz'},
        { label: 'Conv%', attributeFunction: d => formatNumber(100.0 * d['BuzC'] / d['Att'], 1, false, false), description: 'Conversion: BuzC as percentage of Att'},
        { label: 'Time', sortValueFunction: d => d['Timing'], attributeFunction: d => formatNumber(d['Timing'], 1, false, true), description: 'Estimated buzzes earned through timing'},
        { label: 'Solo', attributeFunction: d => formatNumber(d['Solo'], 1, false, false), description: 'Estimated buzzes as solo attempter'},
        { label: 'AttV', attributeFunction: d => formatNumber(d['AttValue'], 0, false, false), description: 'Estimated clue value attempted'},
        { label: 'BuzV', attributeFunction: d => d['BuzValue'], description: 'Clue value buzzed in on'},
        { label: 'BuzV%', attributeFunction: d => formatNumber(100.0 * d['BuzValue'] / d['AttValue'], 1, false, false), description: 'BuzV as percentage of AttV'},
        { label: 'Buz$', attributeFunction: d => d['Buz$'], description: 'Score on buzzes'},
        { label: 'AccV%', attributeFunction: d => formatNumber(100.0 * d['Buz$'] / d['BuzValue'], 1, false, false), description: 'Accuracy Value: Buz$ as percentage of BuzV'},
        { label: 'ConvV%', attributeFunction: d => formatNumber(100.0 * d['Buz$'] / d['AttValue'], 1, false, false), description: 'Conversion Value: Buz$ as percentage of AttV'},
        { label: 'TimeV', sortValueFunction: d => d['TimingValue'], attributeFunction: d => formatNumber(d['TimingValue'], 0, false, true), description: 'Estimated clue value of buzzes earned through timing'},
        { label: 'SoloV', attributeFunction: d => formatNumber(d['SoloValue'], 0, false, false), description: 'Estimated clue value of buzzes as solo attempter'}
      ]
    },
    {
      label: 'Conversion (J)',
      columns: [
        { label: 'Contestant', sortValueFunction: d => -d['Podium'], prelinkTextFunction: contestantLinkPretext, linkFunction: contestantLinkLink, linkTextFunction: contestantLinkText},
        { label: 'Att', attributeFunction: d => d['JAtt'], description: 'Attempts'},
        { label: 'Buz', attributeFunction: d => d['JBuz'], description: 'Buzzes'},
        { label: 'Buz%', attributeFunction: d => formatNumber(d['JBuz%'], 1, false, false), description: 'Buz as percentage of Att'},
        { label: 'BuzC', attributeFunction: d => d['JBuzC'], description: 'Correct responses on buzzes'},
        { label: 'Acc%', attributeFunction: d => formatNumber(100.0 * d['JBuzC'] / d['JBuz'], 1, false, false), description: 'Accuracy: BuzC as percentage of Buz'},
        { label: 'Conv%', attributeFunction: d => formatNumber(100.0 * d['JBuzC'] / d['JAtt'], 1, false, false), description: 'Conversion: BuzC as percentage of Att'},
        { label: 'Time', sortValueFunction: d => d['JTiming'], attributeFunction: d => formatNumber(d['JTiming'], 1, false, true), description: 'Estimated buzzes earned through timing'},
        { label: 'Solo', attributeFunction: d => formatNumber(d['JSolo'], 1, false, false), description: 'Estimated buzzes as solo attempter'},
        { label: 'AttV', attributeFunction: d => formatNumber(d['JAttValue'], 0, false, false), description: 'Estimated clue value attempted'},
        { label: 'BuzV', attributeFunction: d => d['JBuzValue'], description: 'Clue value buzzed in on'},
        { label: 'BuzV%', attributeFunction: d => formatNumber(100.0 * d['JBuzValue'] / d['JAttValue'], 1, false, false), description: 'BuzV as percentage of AttV'},
        { label: 'Buz$', attributeFunction: d => d['JBuz$'], description: 'Score on buzzes'},
        { label: 'AccV%', attributeFunction: d => formatNumber(100.0 * d['JBuz$'] / d['JBuzValue'], 1, false, false), description: 'Accuracy Value: Buz$ as percentage of BuzV'},
        { label: 'ConvV%', attributeFunction: d => formatNumber(100.0 * d['JBuz$'] / d['JAttValue'], 1, false, false), description: 'Conversion Value: Buz$ as percentage of AttV'},
        { label: 'TimeV', sortValueFunction: d => d['JTimingValue'], attributeFunction: d => formatNumber(d['JTimingValue'], 0, false, true), description: 'Estimated clue value of buzzes earned through timing'},
        { label: 'SoloV', attributeFunction: d => formatNumber(d['JSoloValue'], 0, false, false), description: 'Estimated clue value of buzzes as solo attempter'}
      ]
    },
    {
      label: 'Conversion (DJ)',
      columns: [
        { label: 'Contestant', sortValueFunction: d => -d['Podium'], prelinkTextFunction: contestantLinkPretext, linkFunction: contestantLinkLink, linkTextFunction: contestantLinkText},
        { label: 'Att', attributeFunction: d => d['DJAtt'], description: 'Attempts'},
        { label: 'Buz', attributeFunction: d => d['DJBuz'], description: 'Buzzes'},
        { label: 'Buz%', attributeFunction: d => formatNumber(d['DJBuz%'], 1, false, false), description: 'Buz as percentage of Att'},
        { label: 'BuzC', attributeFunction: d => d['DJBuzC'], description: 'Correct responses on buzzes'},
        { label: 'Acc%', attributeFunction: d => formatNumber(100.0 * d['DJBuzC'] / d['DJBuz'], 1, false, false), description: 'Accuracy: BuzC as percentage of Buz'},
        { label: 'Conv%', attributeFunction: d => formatNumber(100.0 * d['DJBuzC'] / d['DJBuz'], 1, false, false), description: 'Conversion: BuzC as percentage of Buz'},
        { label: 'Time', sortValueFunction: d => d['DJTiming'], attributeFunction: d => formatNumber(d['DJTiming'], 1, false, true), description: 'Estimated buzzes earned through timing'},
        { label: 'Solo', attributeFunction: d => formatNumber(d['DJSolo'], 1, false, false), description: 'Estimated buzzes as solo attempter'},
        { label: 'AttV', attributeFunction: d => formatNumber(d['DJAttValue'], 0, false, false), description: 'Estimated clue value attempted'},
        { label: 'BuzV', attributeFunction: d => d['DJBuzValue'], description: 'Clue value buzzed in on'},
        { label: 'BuzV%', attributeFunction: d => formatNumber(100.0 * d['DJBuzValue'] / d['DJAttValue'], 1, false, false), description: 'BuzV as percentage of AttV'},
        { label: 'Buz$', attributeFunction: d => d['DJBuz$'], description: 'Score on buzzes'},
        { label: 'AccV%', attributeFunction: d => formatNumber(100.0 * d['DJBuz$'] / d['DJBuzValue'], 1, false, false), description: 'Accuracy Value: Buz$ as percentage of BuzV'},
        { label: 'ConvV%', attributeFunction: d => formatNumber(100.0 * d['DJBuz$'] / d['DJAttValue'], 1, false, false), description: 'Conversion Value: Buz$ as percentage of AttV'},
        { label: 'TimeV', sortValueFunction: d => d['DJTimingValue'], attributeFunction: d => formatNumber(d['DJTimingValue'], 0, false, true), description: 'Estimated clue value of buzzes earned through timing'},
        { label: 'SoloV', attributeFunction: d => formatNumber(d['DJSoloValue'], 0, false, false), description: 'Estimated clue value of buzzes as solo attempter'}
      ]
    }
  ]
  if (gameRounds.value >= 3) {
    panels.push({
      label: 'Conversion (TJ)',
      columns: [
        { label: 'Contestant', sortValueFunction: d => -d['Podium'], prelinkTextFunction: contestantLinkPretext, linkFunction: contestantLinkLink, linkTextFunction: contestantLinkText},
        { label: 'Att', attributeFunction: d => d['TJAtt']},
        { label: 'Buz', attributeFunction: d => d['TJBuz']},
        { label: 'Buz%', attributeFunction: d => formatNumber(d['TJBuz%'], 1, false, false)},
        { label: 'BuzC', attributeFunction: d => d['TJBuzC']},
        { label: 'Acc%', attributeFunction: d => formatNumber(100.0 * d['TJBuzC'] / d['TJBuz'], 1, false, false), description: 'Accuracy: BuzC as percentage of Buz'},
        { label: 'Conv%', attributeFunction: d => formatNumber(100.0 * d['TJBuzC'] / d['TJBuz'], 1, false, false), description: 'Conversion: BuzC as percentage of Att'},
        { label: 'Time', sortValueFunction: d => d['TJTiming'], attributeFunction: d => formatNumber(d['TJTiming'], 1, false, true)},
        { label: 'Solo', attributeFunction: d => formatNumber(d['TJSolo'], 1, false, false)},
        { label: 'AttV', attributeFunction: d => formatNumber(d['TJAttValue'], 0, false, false)},
        { label: 'BuzV', attributeFunction: d => d['TJBuzValue']},
        { label: 'BuzV%', attributeFunction: d => formatNumber(100.0 * d['TJBuzValue'] / d['TJAttValue'], 1, false, false), description: 'BuzV as percentage of AttV'},
        { label: 'Buz$', attributeFunction: d => d['TJBuz$']},
        { label: 'AccV%', attributeFunction: d => formatNumber(100.0 * d['TJBuz$'] / d['TJBuzValue'], 1, false, false), description: 'Accuracy Value: Buz$ as percentage of BuzV'},
        { label: 'ConvV%', attributeFunction: d => formatNumber(100.0 * d['TJBuz$'] / d['TJAttValue'], 1, false, false), description: 'Conversion Value: Buz$ as percentage of AttV'},
        { label: 'TimeV', sortValueFunction: d => d['TJTimingValue'], attributeFunction: d => formatNumber(d['TJTimingValue'], 0, false, true)},
        { label: 'SoloV', attributeFunction: d => formatNumber(d['TJSoloValue'], 0, false, false)}
      ]
    })
  }
  return panels
})

const gameStatisticPanels = computed(() => {
  return [
    {
      label: 'Game',
      columns: [
        { label: 'Date', attributeFunction: d => dateFormat(d['date'])},
        { label: 'Buz$', attributeFunction: d => d['Buz$']},
        { label: 'BuzC$', attributeFunction: d => d['BuzC$']},
        { label: 'Contention', attributeFunction: d => formatNumber(100 * d['Contention'], 1, false), description: 'Percentage of clues attempted by multiple contestants averages across rounds'},
      ]
    },
    {
      label: 'J',
      columns: [
        { label: 'Date', attributeFunction: d => dateFormat(d['date'])},
        { label: 'Buz$', attributeFunction: d => d['JBuz$']},
        { label: 'BuzC$', attributeFunction: d => d['JBuzC$']},
        { label: 'Contention', attributeFunction: d => formatNumber(100 * d['JContention'], 1, false), description: 'Percentage of clues attempted by multiple contestants in Jeopardy round'},
      ]
    },
    {
      label: 'DJ',
      columns: [
        { label: 'Date', attributeFunction: d => dateFormat(d['date'])},
        { label: 'Buz$', attributeFunction: d => d['DJBuz$']},
        { label: 'BuzC$', attributeFunction: d => d['DJBuzC$']},
        { label: 'Contention', attributeFunction: d => formatNumber(100 * d['DJContention'], 1, false), description: 'Percentage of clues attempted by multiple contestants in Double Jeopardy round'},
      ]
    }
  ].concat(gameRounds.value >= 3 ? [
    {
      label: 'TJ',
      columns: [
        { label: 'Date', attributeFunction: d => dateFormat(d['date'])},
        { label: 'Buz$', attributeFunction: d => d['TJBuz$']},
        { label: 'BuzC$', attributeFunction: d => d['TJBuzC$']},
        { label: 'Contention', attributeFunction: d => formatNumber(100 * d['TJContention'], 1, false), description: 'Percentage of clues attempted by multiple contestants in Triple Jeopardy round'},
      ]
    }
  ] : [])
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
const graphAttributesList = computed(() => graphAttributes(gameRounds.value))

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
    scatterData: xAttr['requiresBox'] || yAttr['requiresBox'] ? gameContestantStatDataWithBox.value : gameContestantStatData.value,
    scatterLabelFunction: d => d['Contestant'],
    scatterColorFunction: d => color.value(d['Jometry Contestant Id']),
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
    scatterData: xAttr['requiresBox'] ? gameContestantStatDataWithBox.value : gameContestantStatData.value,
    scatterLabelFunction: d => d['Contestant'],
    scatterColorFunction: d => color.value(d['Jometry Contestant Id']),
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
    <div v-if="gameStatData" class="section">
      <h1>Season <span id="season">{{ gameStatData.season }}</span> Game <span id="game-number">{{ gameStatData.gameInSeason }}</span>, <span id="game-date">{{ dateFormat(gameStatData.date) }}</span></h1>
      <h2>Player Statistics</h2>
      <CarouselTable 
        :panels="scoringTablePanels.concat(conversionMetricTablePanels)"
        :rowData="gameContestantStatData"
        :defaultSortFunction="d => d['Podium']"
        />
      <h2>Game Statistics</h2>
      <CarouselTable v-if="gameStatData"
        :panels="gameStatisticPanels"
        :rowData="[gameStatData]"
        :defaultSortFunction="d => 1"
        />
    </div>
    <h2>Correct Responses</h2>
    <div id="view-boards" class="section">
      <div v-for="round in d3.range(1, gameRounds + 1)">
        <h3>{{ roundName(round) }} Round</h3>
        <table class="view-board" v-if="gameClueCorrectResponses && gameClueCorrectResponses.get(round)" >
          <tr v-for="row in d3.range(1,6)">
            <td v-for="column in d3.range(1,7)">
              <div v-if="gameClueCorrectResponses.get(round).get(row * round * gameBaseValueMultiple).get(column)"
                  :class="gameClueCorrectResponses.get(round).get(row * round * gameBaseValueMultiple).get(column)['dd'] === 1 ? 'daily-double' : ''">
                <div v-for="correctResponseItem in gameClueCorrectResponses.get(round).get(row * round * gameBaseValueMultiple).get(column)['corrects']"
                  :style="'background-color: ' + (correctResponseItem === -1 ? 'black' : (correctResponseItem === 0 ? 'gray' : threeColorSet[correctResponseItem-1]))"
                  >
                </div>
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
    <h2>Final Jeopardy! Win Matrix</h2>
    <div id="fj-matrix-container" class="section">
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
    <div class="section">
      <h2>Score</h2>
      <ReactiveChart :chart="gameScoreChartData"/>
    </div>
    <div class="section">
      <h2>Lead Ratio</h2>
      <ReactiveChart :chart="leadRatioChartData"/>
    </div>
    <div class="section">
      <h2>Attempts</h2>
      <StackValueBarChart
        :data="gameContestantStatData"
        :xCoreLabelFunction="d => d['Contestant']"
        :xGroupLabels="['J','DJ'].concat(gameRounds >= 3 ? ['TJ'] : [])"
        :yFunctionGroups="[[d => d['JBuzC'], d => d['JBuz'], d => d['JAtt']],[d => d['DJBuzC'], d => d['DJBuz'], d => d['DJAtt']]].concat(gameRounds >= 3 ? [[d => d['TJBuzC'], d => d['TJBuz'], d => d['TJAtt']]] : [])"
        :colorFunction="d => color(d['Jometry Contestant Id'])"
        :yLabel="'BuzC -> Buz -> Att'"
        :title="'Attempts'"/>
    </div>
    <div class="section">
      <h2>Attempt Value</h2>
      <StackValueBarChart
        :data="gameContestantStatData"
        :xCoreLabelFunction="d => d['Contestant']"
        :xGroupLabels="['J','DJ'].concat(gameRounds >= 3 ? ['TJ'] : [])"
        :yFunctionGroups="[[d => d['JBuz$'], d => d['JBuzValue'], d => formatNumber(d['JAttValue'], 0)],[d => d['DJBuz$'], d => d['DJBuzValue'], d => formatNumber(d['DJAttValue'],0)]].concat(gameRounds >= 3 ? [[d => d['TJBuz$'], d => d['TJBuzValue'], d => formatNumber(d['TJAttValue'], 0)]] : [])"
        :colorFunction="d => color(d['Jometry Contestant Id'])"
        :yLabel="'Buz$ -> BuzValue -> AttValue'"
        :title="'Attempt Value'"/>
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
        <option v-if="gameRounds >= 3" :value="3">TJ! Round</option>
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
        <option v-for="(graphAttribute, idx) in graphAttributesList" :value="idx">
          {{ graphAttribute.label }}
        </option>
      </select>
      <select v-model="scatterGraphRoundIdx">
        <option :value="0">Full Game</option>
        <option :value="1">J! Round</option>
        <option :value="2">DJ! Round</option>
        <option v-if="gameRounds >= 3" :value="3">TJ! Round</option>
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

table.view-board td {
    width: 40px;
    height: 30px;
    border: 1px solid black;
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

table.view-board div div {
    height: 100%;
    width: auto;
    flex-grow: 1;
}

table#fj-matrix td, table#fj-matrix th {
    width: 70px;
    height: 40px;
    border: 1px solid black;
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
    flex-flow: row-wrap;
    justify-content: space-around;
}

</style>
