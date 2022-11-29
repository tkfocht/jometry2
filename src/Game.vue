<script setup>
import { ref, reactive, computed } from 'vue'
import { csvDataAccessor, gameClueDataAccessor, formatNumber, gameStatDataFromContestantStatData,
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
const gameId = +urlParams.get('game_id')

const allContestantStatData = ref(null)
const gameClueData = ref(null)

async function fetchContestantStatData() {
  const res = await d3.csv(
    'https://j-ometry.com/csvs/all_standard.csv',
    csvDataAccessor
  )
  var resResult = await res
  allContestantStatData.value = resResult
}
fetchContestantStatData()

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

function contestantLink (contestantStatData) {
  return '<span style="color: ' + 
    color.value(contestantStatData['Jometry Contestant Id']) + 
    '">&#9632;</span>&nbsp;<a href="/contestant.html?contestant_id=' + 
    contestantStatData['Jometry Contestant Id'] + 
    '">' + contestantStatData['Contestant'] + '</a>'
}

const gameScoreChartData = computed(() => {
  if (!gameClueData.value || !gameContestantStatData.value) {
    return {
      'traces': [],
      'layout': {}
    }
  }
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
const graphAttributesList = computed(() => graphAttributes(gameRounds.value))
const xGraphAttributeIdx = ref(0)
const xGraphAttribute = computed(() => graphAttributesList.value[xGraphAttributeIdx.value])
const yGraphAttributeIdx = ref(null)
const yGraphAttribute = computed(() => graphAttributesList.value[yGraphAttributeIdx.value])
const graphRoundIdx = ref(0)

function specifyScatterHistogram(xAttr, yAttr) {
  return {
    histogramData: xAttr['requiresBox'] || yAttr['requiresBox'] ? allContestantStatDataWithBox.value : allContestantStatData.value,
    scatterData: xAttr['requiresBox'] || yAttr['requiresBox'] ? gameContestantStatDataWithBox.value : gameContestantStatData.value,
    scatterLabelFunction: d => d['Contestant'],
    scatterColorFunction: d => color.value(d['Jometry Contestant Id']),
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
    scatterData: xAttr['requiresBox'] ? gameContestantStatDataWithBox.value : gameContestantStatData.value,
    scatterLabelFunction: d => d['Contestant'],
    scatterColorFunction: d => color.value(d['Jometry Contestant Id']),
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
    <div v-if="gameStatData" class="section">
      <h1>Season <span id="season">{{ gameStatData.season }}</span> Game <span id="game-number">{{ gameStatData.gameInSeason }}</span>, <span id="game-date">{{ dateFormat(gameStatData.date) }}</span></h1>
      <h2>Scoring and Daily Doubles</h2>
      <CarouselTable 
        :panels="scoringTablePanels"
        :rowData="gameContestantStatData"
        :defaultSortFunction="d => d['Podium']"
        />
      <h2>Buzzing and Conversion Metrics</h2>
      <CarouselTable 
        :panels="conversionMetricTablePanels"
        :rowData="gameContestantStatData"
        :defaultSortFunction="d => d['Podium']"
        />
    </div>
    <div id="view-boards">
      <h2>Correct Responses</h2>
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
    <div>
      <h2>Final Jeopardy! Win Matrix</h2>
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
    <div>
      <h2>Score</h2>
      <ReactiveChart :chart="gameScoreChartData"/>
    </div>
    <div>
      <h2>Attempts</h2>
      <StackValueBarChart
        :data="gameContestantStatData"
        :xCoreLabelFunction="d => d['Contestant']"
        :xGroupLabels="['J','DJ']"
        :yFunctionGroups="[[d => d['JBuzC'], d => d['JBuz'], d => d['JAtt']],[d => d['DJBuzC'], d => d['DJBuz'], d => d['DJAtt']]]"
        :colorFunction="d => color(d['Jometry Contestant Id'])"
        :yLabel="'BuzC -> Buz -> Att'"
        :title="'Attempts'"/>
    </div>
    <div>
      <h2>Attempt Value</h2>
      <StackValueBarChart
        :data="gameContestantStatData"
        :xCoreLabelFunction="d => d['Contestant']"
        :xGroupLabels="['J','DJ']"
        :yFunctionGroups="[[d => d['JBuz$'], d => d['JBuzValue'], d => formatNumber(d['JAttValue'], 0)],[d => d['DJBuz$'], d => d['DJBuzValue'], d => formatNumber(d['DJAttValue'],0)]]"
        :colorFunction="d => color(d['Jometry Contestant Id'])"
        :yLabel="'Buz$ -> BuzValue -> AttValue'"
        :title="'Attempt Value'"/>
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
      <option v-if="gameRounds >= 3" :value="3">TJ! Round</option>
    </select><br/>
    <ScatterHistogram v-if="yGraphAttribute" v-bind="specifyScatterHistogram(xGraphAttribute, yGraphAttribute)" />
    <HighlightHistogram v-else v-bind="specifyHighlightHistogram(xGraphAttribute)" />
  </div>
</template>

<style scoped>

.body-section {
  margin: 2em 1em;
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

</style>
