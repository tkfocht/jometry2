<script setup>
import * as d3 from 'd3'
import { ref, computed } from 'vue'
import { formatNumber, dateFormat, roundName, jschemaCsvDataAccessor, roundAbbreviation } from '@/util'
import { playClassificationName } from '@/configuration'
import * as data from '@/data'
import * as gcsAttributes from '@/gameContestantStatAttributes'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'
import CarouselTable from './components/util/CarouselTable.vue'
import CumulativeLineChart from './components/util/CumulativeLineChart.vue'
import HighlightHistogram from './components/util/HighlightHistogram.vue'
import ScatterHistogram from './components/util/ScatterHistogram.vue'
import StackValueBarChart from './components/util/StackValueBarChart.vue'

let urlParams = new URLSearchParams(window.location.search);

const gameId = +urlParams.get('game_id')

data.loadContestantData()
data.loadGameData()
data.loadGameContestantStatData()
data.loadGameRoundContestantStatData()

const contestantDataById = data.contestantDataById
const gameData = data.computedIfRefHasValue(data.gameDataById, gData => gData.get(gameId))
const gamePlayClassification = data.computedIfRefHasValue(gameData, gData => gData.play_classification)
const gameTocPeriod = data.computedIfRefHasValue(gameData, gData => gData.toc_period)
const gameRounds = data.computedIfRefHasValue(gameData, gData => gData.play_classification == 'celebrity' ? 3 : 2)
const gameContestantIds = data.computedIfRefHasValue(gameData, gData => [gData.podium_1_contestant_id, gData.podium_2_contestant_id, gData.podium_3_contestant_id])

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

const jschemaAllGameRoundContestantStatDataFlat = data.gameRoundContestantStatData
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

const jschemaClueContestantStatData = ref(null)
async function fetchJschemaClueContestantStatData() {
  const res = await d3.csv('https://j-ometry.com/csvs/jschema_stat_clue_contestant/' + gameId + '.csv', jschemaCsvDataAccessor)
  jschemaClueContestantStatData.value = res
}
fetchJschemaClueContestantStatData()
const jschemaClueContestantStatDataByRoundClueAndContestantId = data.computedIfRefHasValue(jschemaClueContestantStatData,
  ccsData => d3.index(ccsData, ccs => ccs.round_of_game, ccs => ccs.clue_of_round, ccs => ccs.contestant_id))

const jschemaClueData = ref(null)
async function fetchJschemaClueData() {
  const res = await d3.csv('https://j-ometry.com/csvs/jschema_clue/' + gameId + '.csv', jschemaCsvDataAccessor)
  jschemaClueData.value = res
}
fetchJschemaClueData()
const jschemaClueByRoundRowColumn = computed(() => {
  if (!jschemaClueData.value) return null
  return d3.index(jschemaClueData.value, c => c.round_of_game, c => c.row, c => c.column)
})

const jschemaResponseData = ref(null)
async function fetchJschemaResponseData() {
  const res = await d3.csv('https://j-ometry.com/csvs/jschema_response/' + gameId + '.csv', jschemaCsvDataAccessor)
  jschemaResponseData.value = res
}
fetchJschemaResponseData()
const jschemaResponseByRoundClue = computed(() => {
  if (!jschemaResponseData.value) return null
  return d3.group(jschemaResponseData.value, c => c.round_of_game, c => c.clue_of_round)
})


const threeColorSet = ['#0072B2','#E69F00','#009E73']
const color = computed(() => {
  if (gameContestantIds.value) return d3.scaleOrdinal().domain(gameContestantIds.value).range(threeColorSet)
  else return null
})

function contestantLink (contestant_id, contestant_name) {
  return '<span style="color: ' + 
    color.value(contestant_id) + 
    '">&#9632;</span>&nbsp;<a href="/contestant.html?contestant_id=' + 
    contestant_id + 
    '">' + contestant_name + '</a>'
}

function contestantLegend (contestant_id, contestant_name) {
  return '<span style="color: ' + 
    color.value(contestant_id) + 
    '">&#9632;</span>&nbsp;' + contestant_name
}

const standardScoringTablePanels = data.computedIfRefHasValues(
  [gameRounds, contestantDataById, gameContestantStatDataByContestantId, data.gameRoundContestantStatDataByGameIdRoundIdContestantId],
  (rounds, cData, gcsData, grcsData) => {
    const leadColumns = [
      {label: 'Contestant', sortValueFunction: d => -d.podium, attributeFunction: d => contestantLink(d.contestant_id, cData.get(d.contestant_id).name)}
    ]
    const attrColumnDefs = [
      gcsAttributes.buz,
      gcsAttributes.buzc,
      gcsAttributes.buz_score,
      gcsAttributes.dd_found,
      gcsAttributes.dd_plus_buzc,
      gcsAttributes.dd_plus_selection,
      gcsAttributes.dd_score,
      gcsAttributes.fj_start_score,
      gcsAttributes.fj_score,
      gcsAttributes.fj_final_score,
    ]
    const fullGameAttrColumns = attrColumnDefs.map(attrDef => ({
      label: attrDef.short_label,
      sortValueFunction: r => attrDef.generatingFunction(gcsData.get(r.contestant_id)),
      attributeFunction: r => attrDef.valueDisplayFormat(attrDef.generatingFunction(gcsData.get(r.contestant_id))),
      description: attrDef.description
    }))
    var panels = [
      {
        label: 'Full Game',
        columns: leadColumns.concat(fullGameAttrColumns)
      }
    ]
    const rids = Array.from(grcsData.get(gameId).keys()).filter(r => r <= rounds)
    for (const rid of rids) {
      const roundAttrColumns = attrColumnDefs.slice(0, -3).map(attrDef => ({
        label: attrDef.short_label,
        sortValueFunction: r => attrDef.generatingFunction(grcsData.get(gameId).get(rid).get(r.contestant_id)),
        attributeFunction: r => attrDef.valueDisplayFormat(attrDef.generatingFunction(grcsData.get(gameId).get(rid).get(r.contestant_id))),
        description: attrDef.description
      }))
      const panel = {
        label: roundAbbreviation(rid) + ' Round',
        columns: leadColumns.concat(roundAttrColumns)
      }
      panels.push(panel)
    }
    return panels
  }
)

const conversionScoringTablePanels = data.computedIfRefHasValues(
  [gameRounds, contestantDataById, gameContestantStatDataByContestantId, data.gameRoundContestantStatDataByGameIdRoundIdContestantId],
  (rounds, cData, gcsData, grcsData) => {
    const leadColumns = [
      {label: 'Contestant', sortValueFunction: d => -d.podium, attributeFunction: d => contestantLink(d.contestant_id, cData.get(d.contestant_id).name)}
    ]
    const attrColumnDefs = [
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
    const fullGameAttrColumns = attrColumnDefs.map(attrDef => ({
      label: attrDef.short_label,
      sortValueFunction: r => attrDef.generatingFunction(gcsData.get(r.contestant_id)),
      attributeFunction: r => attrDef.valueDisplayFormat(attrDef.generatingFunction(gcsData.get(r.contestant_id))),
      description: attrDef.description
    }))
    var panels = [
      {
        label: 'Full Game',
        columns: leadColumns.concat(fullGameAttrColumns)
      }
    ]
    const rids = Array.from(grcsData.get(gameId).keys()).filter(r => r <= rounds)
    for (const rid of rids) {
      const roundAttrColumns = attrColumnDefs.map(attrDef => ({
        label: attrDef.short_label,
        sortValueFunction: r => attrDef.generatingFunction(grcsData.get(gameId).get(rid).get(r.contestant_id)),
        attributeFunction: r => attrDef.valueDisplayFormat(attrDef.generatingFunction(grcsData.get(gameId).get(rid).get(r.contestant_id))),
        description: attrDef.description
      }))
      const panel = {
        label: roundAbbreviation(rid) + ' Round',
        columns: leadColumns.concat(roundAttrColumns)
      }
      panels.push(panel)
    }
    return panels
  }
)


const conversionValueScoringTablePanels = data.computedIfRefHasValues(
  [gameRounds, contestantDataById, gameContestantStatDataByContestantId, data.gameRoundContestantStatDataByGameIdRoundIdContestantId],
  (rounds, cData, gcsData, grcsData) => {
    const leadColumns = [
      {label: 'Contestant', sortValueFunction: d => -d.podium, attributeFunction: d => contestantLink(d.contestant_id, cData.get(d.contestant_id).name)}
    ]
    const attrColumnDefs = [
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
    const fullGameAttrColumns = attrColumnDefs.map(attrDef => ({
      label: attrDef.short_label,
      sortValueFunction: r => attrDef.generatingFunction(gcsData.get(r.contestant_id)),
      attributeFunction: r => attrDef.valueDisplayFormat(attrDef.generatingFunction(gcsData.get(r.contestant_id))),
      description: attrDef.description
    }))
    var panels = [
      {
        label: 'Full Game',
        columns: leadColumns.concat(fullGameAttrColumns)
      }
    ]
    const rids = Array.from(grcsData.get(gameId).keys()).filter(r => r <= rounds)
    for (const rid of rids) {
      const roundAttrColumns = attrColumnDefs.map(attrDef => ({
        label: attrDef.short_label,
        sortValueFunction: r => attrDef.generatingFunction(grcsData.get(gameId).get(rid).get(r.contestant_id)),
        attributeFunction: r => attrDef.valueDisplayFormat(attrDef.generatingFunction(grcsData.get(gameId).get(rid).get(r.contestant_id))),
        description: attrDef.description
      }))
      const panel = {
        label: roundAbbreviation(rid) + ' Round',
        columns: leadColumns.concat(roundAttrColumns)
      }
      panels.push(panel)
    }
    return panels
  }
)

const scoringTableRows = computed(() => {
  if (!gameContestantIds.value) return null
  if (!gameContestantStatDataByContestantId.value) return null
  return gameContestantIds.value.map((contestant_id, idx) => {
    return {
      contestant_id: contestant_id,
      podium: idx + 1
    }
  })
})

const cumulativeDataAttributesList = [
  {
    label: 'Score',
    generatingFunction: c => c.score
  },
  {
    label: 'Buzz Score',
    generatingFunction: c => c.buz_score
  },
  {
    label: 'Attempts',
    generatingFunction: c => c.att
  },
  {
    label: 'Attempted Clues',
    generatingFunction: c => c.att_clue
  },
  {
    label: 'Attempt Value',
    generatingFunction: c => c.att_value
  },
  {
    label: 'Buzzes',
    generatingFunction: c => c.buz_value === 0 ? 0 : 1
  },
  {
    label: 'Buzz Value',
    generatingFunction: c => c.buz_value
  },
  {
    label: 'Timing',
    generatingFunction: c => c.timing
  },
  {
    label: 'Timing Value',
    generatingFunction: c => c.timing_value
  },
  {
    label: 'Timing Score',
    generatingFunction: c => c.timing_score
  },
  {
    label: 'Solo',
    generatingFunction: c => c.solo
  },
  {
    label: 'Solo Value',
    generatingFunction: c => c.solo_value
  },
  {
    label: 'Solo Score',
    generatingFunction: c => c.solo_score
  }
]
const byClueLineChartAttributeIdx = ref(0)
const byClueLineChartAttribute = computed(() => cumulativeDataAttributesList[byClueLineChartAttributeIdx.value])

const byClueLineChartData = data.computedIfRefHasValues(
  [jschemaClueContestantStatData, gameContestantIds],
  (clueCSData, cids) => {
    var groupedData = d3.group(clueCSData, c => c.round_of_game, c => c.clue_of_round, c => c.contestant_id)
    var traceData = []
    var rounds = [...groupedData.keys()].sort((a,b) => d3.ascending(a, b))
    for (var r of rounds) {
      var clue_numbers = [...groupedData.get(r).keys()].sort((a,b) => d3.ascending(a, b))
      for (var c of clue_numbers) {
        traceData.push({
          'clue_identifier': r + '-' + c,
          'contestant_data': cids.map(cid => groupedData.get(r).get(c).get(cid)[0])
        })
      }
    }
    return traceData
  }
)


const finalJeopardyMatrixCells = computed(() => {
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



//Charts
const graphAttributesList = gcsAttributes.all_attributes

const histogramGraphAttributeIdx = ref(0)
const histogramGraphAttribute = computed(() => graphAttributesList[histogramGraphAttributeIdx.value])
const histogramGraphRoundIdx = ref(0)

const xScatterGraphAttributeIdx = ref(0)
const xScatterGraphAttribute = computed(() => graphAttributesList[xScatterGraphAttributeIdx.value])
const yScatterGraphAttributeIdx = ref(2)
const yScatterGraphAttribute = computed(() => graphAttributesList[yScatterGraphAttributeIdx.value])
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
    scatterColorFunction: d => color.value(d.contestant_id),
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
    scatterData: scatterData,
    scatterLabelFunction: d => contestantDataById.value.get(d.contestant_id).name,
    scatterColorFunction: d => color.value(d.contestant_id),
    title: xAttr['label'],
    xLabel: xAttr['label'],
    xFunction: xAttr.generatingFunction,
    xBins: xAttr['bins']
  }
})

</script>

<template>
  <Header />
  <div class="component-body">
    <div v-if="gameData" class="section">
      <h1>Season <span id="season">{{ gameData.season_id }}</span> Game <span id="game-number">{{ gameData.game_in_season }}</span>, <span id="game-date">{{ dateFormat(gameData.airdate) }}</span></h1>
      <h1>{{ playClassificationName(gameData?.play_classification, gameData?.season_id) }} ({{ gameData?.toc_period }} TOC period)</h1>
      <h2>Player Statistics</h2>
      <h4>Standard</h4>
      <CarouselTable 
        :panels="standardScoringTablePanels"
        :rowData="scoringTableRows"
        :defaultSortFunction="d => d['podium']"
        />
      <h4>Conversion</h4>
      <CarouselTable 
        :panels="conversionScoringTablePanels"
        :rowData="scoringTableRows"
        :defaultSortFunction="d => d['podium']"
        />
      <h4>Conversion Value</h4>
      <CarouselTable 
        :panels="conversionValueScoringTablePanels"
        :rowData="scoringTableRows"
        :defaultSortFunction="d => d['podium']"
        />
    </div>
    <h2>Correct Responses</h2>
    <div id="view-boards" class="section">
      <div v-for="round in d3.range(1, gameRounds + 1)">
        <h3>{{ roundName(round) }} Round</h3>
        <table class="view-board" v-if="jschemaClueByRoundRowColumn && jschemaClueByRoundRowColumn.get(round) && jschemaResponseByRoundClue && jschemaResponseByRoundClue.get(round)" >
          <tr v-for="row in d3.range(1,6)">
            <td v-for="column in d3.range(1,7)">
              <div v-if="jschemaClueByRoundRowColumn.get(round).get(row).get(column)"
                  :class="jschemaClueByRoundRowColumn.get(round).get(row).get(column)['is_daily_double'] === 1 ? 'daily-double' : ''">
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
    <h2>Daily Doubles</h2>
    <div class="section game-stat-listing" v-if="jschemaClueData && contestantDataById && jschemaClueContestantStatDataByRoundClueAndContestantId && gameContestantIds">
      <table>
        <thead>
          <tr>
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
    <h2>Final Jeopardy! Win Matrix</h2>
    <div id="fj-matrix-container" class="section">
      <div class="game-stat-listing">
        <table>
          <thead>
            <tr>
              <th>Contestant</th>
              <th>If Incorrect</th>
              <th>If Correct</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="gcsData in gameContestantStatData">
              <td><span :style="'color: ' + color(gcsData.contestant_id)">&#9632;</span>&nbsp;{{ contestantDataById.get(gcsData.contestant_id).name }}</td>
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
    <div class="section">
      <h2>Game Progress</h2>
      <select v-model="byClueLineChartAttributeIdx">
        <option v-for="(graphAttribute, idx) in cumulativeDataAttributesList" :value="idx">
          {{ graphAttribute.label }}
        </option>
      </select>
      <CumulativeLineChart v-if="gameContestantIds && byClueLineChartData && contestantDataById"
        :data="byClueLineChartData"
        :xFunction="d => d['clue_identifier']"
        :yFunctions="[0,1,2].map(idx => (d => byClueLineChartAttribute.generatingFunction(d.contestant_data[idx])))"
        :labels="gameContestantIds.map(cid => contestantDataById.get(cid).name)"
        :colors="gameContestantIds.map(cid => color(cid))"
        :title="'Cumulative ' + byClueLineChartAttribute.label"
        :xLabel="'Clues'"
        :yLabel="'Cumulative ' + byClueLineChartAttribute.label"
      />
    </div>
    <!--
    <div class="section">
      <h2>Lead Ratio</h2>
      <ReactiveChart :chart="leadRatioChartData"/>
    </div>-->
    <div class="section" v-if="gameContestantIds && jschemaGameRoundContestantStatData && contestantDataById">
      <h2>Attempts</h2>
      <StackValueBarChart 
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
        :yLabel="'BuzC -> Buz -> Att'"
        :title="'Attempts'"/>
    </div>
    <div class="section" v-if="gameContestantIds && jschemaGameRoundContestantStatData && contestantDataById">
      <h2>Attempt Values</h2>
      <StackValueBarChart 
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
        :yLabel="'Buz$ -> BuzValue -> AttValue'"
        :title="'Attempt Values'"/>
    </div>
    <div class="section" v-if="histogramSpecification">
      <h2>Selectable Histograms</h2>
      <select v-model="histogramGraphAttributeIdx">
        <option v-for="(graphAttribute, idx) in graphAttributesList" :value="idx">
          {{ graphAttribute.short_label }}
        </option>
      </select>
      <select v-model="histogramGraphRoundIdx">
        <option :value="0">Full Game</option>
        <option :value="1">J! Round</option>
        <option :value="2">DJ! Round</option>
        <option v-if="gameRounds >= 3" :value="3">TJ! Round</option>
      </select><br/>
      <HighlightHistogram v-bind="histogramSpecification" />
    </div>
    <div class="section" v-if="scatterSpecification">
      <h2>Selectable Scatter Plots</h2>
      <select v-model="xScatterGraphAttributeIdx">
        <option v-for="(graphAttribute, idx) in graphAttributesList" :value="idx">
          {{ graphAttribute.short_label }}
        </option>
      </select>
      <select v-model="yScatterGraphAttributeIdx">
        <option v-for="(graphAttribute, idx) in graphAttributesList" :value="idx">
          {{ graphAttribute.short_label }}
        </option>
      </select>
      <select v-model="scatterGraphRoundIdx">
        <option :value="0">Full Game</option>
        <option :value="1">J! Round</option>
        <option :value="2">DJ! Round</option>
        <option v-if="gameRounds >= 3" :value="3">TJ! Round</option>
      </select><br/>
      <ScatterHistogram v-bind="scatterSpecification" />
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
  justify-content: space-around;  
}

.game-stat-listing table {
    border-collapse: collapse;
    font-size: 13px;
}

.game-stat-listing table th, .game-stat-listing table td {
    padding: 2px 5px;
    border-top: 1px solid #999999;
    border-bottom: 1px solid #999999;
}

.game-stat-listing table thead tr th {
    background: #CCCCCC;
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
</style>
