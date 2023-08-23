<script setup>
import { ref, computed } from 'vue'
import { csvDataAccessor, gameClueDataAccessor, formatNumber, gameStatDataFromContestantStatData,
  dateFormat, roundName, jschemaCsvDataAccessor } from '@/util'
import { dataSourceAddress } from '@/configuration'
import { graphAttributes } from '@/graphAttributes'
import * as d3 from 'd3'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'
import CarouselTable from './components/util/CarouselTable.vue'
import CumulativeLineChart from './components/util/CumulativeLineChart.vue'
import LineChart from './components/util/LineChart.vue'
import ReactiveChart from './components/util/ReactiveChart.vue'
import HighlightHistogram from './components/util/HighlightHistogram.vue'
import ScatterHistogram from './components/util/ScatterHistogram.vue'
import StackValueBarChart from './components/util/StackValueBarChart.vue'
import { formatDate } from 'plotly.js-dist'

let urlParams = new URLSearchParams(window.location.search);
const dataSourceString = urlParams.get('data_source')
const dataSourceId = dataSourceString ? dataSourceString : 'standard'

const gameId = +urlParams.get('game_id')

const contestantData = ref(null)
async function fetchContestantData() {
  const contestantResult = await d3.csv('https://j-ometry.com/csvs/jschema_contestant.csv', jschemaCsvDataAccessor)
  contestantData.value = d3.index(contestantResult, c => c.contestant_id)
}
fetchContestantData()

const jschemaAllGameData = ref(null)
const jschemaGameData = computed(() => {
  if (jschemaAllGameData.value) return jschemaAllGameData.value.get(gameId)
  else return null
})
const gameRounds = computed(() => {
  if (jschemaGameData.value) return jschemaGameData.value.play_classification == 'celebrity' ? 3 : 2
  else return null
})
const gameContestantIds = computed(() => {
  if (jschemaGameData.value) return [jschemaGameData.value.podium_1_contestant_id, jschemaGameData.value.podium_2_contestant_id, jschemaGameData.value.podium_3_contestant_id]
  else return null
})
async function fetchJschemaAllGameData() {
  const res = await d3.csv('https://j-ometry.com/csvs/jschema_game.csv', jschemaCsvDataAccessor)
  jschemaAllGameData.value = d3.index(res, r => r.game_id)
}
fetchJschemaAllGameData()

const jschemaAllGameStatData = ref(null)
const jschemaGameStatData = computed(() => {
  if (jschemaAllGameStatData.value) return jschemaAllGameStatData.value.get(gameId)
  else return null
})
async function fetchJschemaAllGameStatData() {
  const res = await d3.csv('https://j-ometry.com/csvs/jschema_stat_game.csv', jschemaCsvDataAccessor)
  jschemaAllGameStatData.value = d3.index(res, r => r.game_id)
}
fetchJschemaAllGameStatData()

const jschemaAllGameContestantStatDataFlat = ref(null)
const jschemaAllGameContestantStatData = computed(() => {
  if (jschemaAllGameContestantStatDataFlat.value) return d3.index(jschemaAllGameContestantStatDataFlat.value, r => r.game_id, r => r.contestant_id)
  else return null
})
const jschemaGameContestantStatData = computed(() => {
  if (jschemaAllGameContestantStatData.value) return jschemaAllGameContestantStatData.value.get(gameId)
  else return null
})
const jschemaGameContestantStatDataFlat = computed(() => {
  if (jschemaGameContestantStatData.value && gameContestantIds.value) return d3.map(gameContestantIds.value, cid => jschemaGameContestantStatData.value.get(cid))
  else return null
})
async function fetchJschemaAllGameContestantStatData() {
  const res = await d3.csv('https://j-ometry.com/csvs/jschema_stat_game_contestant.csv', jschemaCsvDataAccessor)
  jschemaAllGameContestantStatDataFlat.value = res
}
fetchJschemaAllGameContestantStatData()

const jschemaAllGameRoundContestantStatDataFlat = ref(null)
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
async function fetchJschemaAllGameRoundContestantStatData() {
  const res = await d3.csv('https://j-ometry.com/csvs/jschema_stat_round_contestant.csv', jschemaCsvDataAccessor)
  jschemaAllGameRoundContestantStatDataFlat.value = res
}
fetchJschemaAllGameRoundContestantStatData()

const jschemaClueContestantStatData = ref(null)
async function fetchJschemaClueContestantStatData() {
  const res = await d3.csv('https://j-ometry.com/csvs/jschema_stat_clue_contestant/' + gameId + '.csv', jschemaCsvDataAccessor)
  jschemaClueContestantStatData.value = res
}
fetchJschemaClueContestantStatData()
const jschemaClueContestantStatDataByContestant = computed(() => {
  if (!jschemaClueContestantStatData.value) return null
  return d3.group(jschemaClueContestantStatData.value, r => r.contestant_id)
})

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

const standardScoringTablePanels = computed(() => {
  if (!contestantData.value) return []
  if (!jschemaGameContestantStatData.value) return []
  if (!jschemaGameRoundContestantStatData.value) return []
  var panels = [
    {
      label: 'Full Game',
      columns: [
        {label: 'Contestant', sortValueFunction: d => -d['podium'], attributeFunction: d => contestantLink(d['contestant_id'], contestantData.value.get(d['contestant_id']).name)},
        {label: 'Buz', sortValueFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).buz,
          attributeFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).buz,
          description: 'Buzzes'},
        {label: 'BuzC', sortValueFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).buzc,
          attributeFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).buzc,
          description: 'Correct responses on buzzes'},
        {label: 'Buz$', sortValueFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).buz_score,
          attributeFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).buz_score,
          description: 'Scoring from buzzes'},
        {label: 'DDF', sortValueFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).dd_found,
          attributeFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).dd_found},
        {label: 'DD+C', sortValueFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).dd_plus_buzc,
          attributeFunction: d => formatNumber(jschemaGameContestantStatData.value.get(d['contestant_id']).dd_plus_buzc, 2, false, true)},
        {label: 'DD+S', sortValueFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).dd_plus_selection,
          attributeFunction: d => formatNumber(jschemaGameContestantStatData.value.get(d['contestant_id']).dd_plus_selection, 2, false, true)},
        {label: 'DD$', sortValueFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).dd_score,
          attributeFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).dd_score,
          description: 'Scoring from Daily Doubles'},
        {label: 'FJStart$', sortValueFunction: d => jschemaGameRoundContestantStatData.value.get(gameRounds.value).get(d['contestant_id']).postscore,
          attributeFunction: d => jschemaGameRoundContestantStatData.value.get(gameRounds.value).get(d['contestant_id']).postscore,
          description: 'Score at start of Final Jeopardy'},
        {label: 'FJ$', sortValueFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).fj_score,
          attributeFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).fj_score,
          description: 'Scoring from Final Jeopardy'},
        {label: 'FJFinal$', sortValueFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).postscore,
          attributeFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).postscore,
          description: 'Score at end of Final Jeopardy'},
      ]
    }
  ]
  for (const [rid, roundContestantStatData] of jschemaGameRoundContestantStatData.value) {
    if (rid > gameRounds.value) continue
    const round_label = rid == 1 ? 'J' : (rid == 2 ? 'DJ' : (rid == 3 ? 'TJ' : '?'))
    panels.push({
      label: round_label + ' Round',
      columns: [
        {label: 'Contestant', sortValueFunction: d => -d['podium'], attributeFunction: d => contestantLink(d['contestant_id'], contestantData.value.get(d['contestant_id']).name)},
        {label: 'Buz', sortValueFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).buz,
          attributeFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).buz,
          description: 'Buzzes'},
        {label: 'BuzC', sortValueFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).buzc,
          attributeFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).buzc,
          description: 'Correct responses on buzzes'},
        {label: 'Buz$', sortValueFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).buz_score,
          attributeFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).buz_score,
          description: 'Scoring from buzzes'},
        {label: 'DDF', sortValueFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).dd_found,
          attributeFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).dd_found},
        {label: 'DD+C', sortValueFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).dd_plus_buzc,
          attributeFunction: d => formatNumber(jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).dd_plus_buzc, 2, false, true)},
        {label: 'DD+S', sortValueFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).dd_plus_selection,
          attributeFunction: d => formatNumber(jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).dd_plus_selection, 2, false, true)},
        {label: 'DD$', sortValueFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).dd_score,
          attributeFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).dd_score,
          description: 'Scoring from Daily Doubles'}
      ]
    })
  }

  return panels
})
const conversionScoringTablePanels = computed(() => {
  if (!contestantData.value) return []
  if (!jschemaGameContestantStatData.value) return []
  if (!jschemaGameRoundContestantStatData.value) return []
  var panels = [
    {
      label: 'Full Game',
      columns: [
        {label: 'Contestant', sortValueFunction: d => -d['podium'], attributeFunction: d => contestantLink(d['contestant_id'], contestantData.value.get(d['contestant_id']).name)},
        {label: 'Att', sortValueFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).att,
          attributeFunction: d => formatNumber(jschemaGameContestantStatData.value.get(d['contestant_id']).att, 0),
          description: 'Attempts'},
        {label: 'AttCl', sortValueFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).att_clue,
          attributeFunction: d => formatNumber(jschemaGameContestantStatData.value.get(d['contestant_id']).att_clue, 1, false),
          description: 'Attempted clues'},
        {label: 'Buz', sortValueFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).buz,
          attributeFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).buz,
          description: 'Buzzes'},
        {label: 'Buz%', sortValueFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).buz_percent,
          attributeFunction: d => formatNumber(100.0 * jschemaGameContestantStatData.value.get(d['contestant_id']).buz_percent, 1, false),
          description: 'Buz as percentage of Att'},
        {label: 'BuzC', sortValueFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).buzc,
          attributeFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).buzc,
          description: 'Correct responses on buzzes'},
        {label: 'Acc%', sortValueFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).acc_percent,
          attributeFunction: d => formatNumber(100.0 * jschemaGameContestantStatData.value.get(d['contestant_id']).acc_percent, 1, false),
          description: 'Accuracy: BuzC as percentage of Buz'},
        {label: 'Conv%', sortValueFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).conversion_percent,
          attributeFunction: d => formatNumber(100.0 * jschemaGameContestantStatData.value.get(d['contestant_id']).conversion_percent, 1, false),
          description: 'Conversion: BuzC as percentage of Att'},
        {label: 'Time', sortValueFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).timing,
          attributeFunction: d => formatNumber(jschemaGameContestantStatData.value.get(d['contestant_id']).timing, 1, false, true),
          description: 'Estimated buzzes earned through timing'},
        {label: 'Solo', sortValueFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).solo,
          attributeFunction: d => formatNumber(jschemaGameContestantStatData.value.get(d['contestant_id']).solo, 1, false),
          description: 'Estimated buzzes as solo attempter'}
      ]
    }
  ]

  for (const [rid, roundContestantStatData] of jschemaGameRoundContestantStatData.value) {
    if (rid > gameRounds.value) continue
    const round_label = rid == 1 ? 'J' : (rid == 2 ? 'DJ' : (rid == 3 ? 'TJ' : '?'))
    panels.push({
      label: round_label + ' Round',
      columns: [
      {label: 'Contestant', sortValueFunction: d => -d['podium'], attributeFunction: d => contestantLink(d['contestant_id'], contestantData.value.get(d['contestant_id']).name)},
        {label: 'Att', sortValueFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).att,
          attributeFunction: d => formatNumber(jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).att, 0),
          description: 'Attempts'},
        {label: 'AttCl', sortValueFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).att_clue,
          attributeFunction: d => formatNumber(jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).att_clue, 1, false),
          description: 'Attempted clues'},
        {label: 'Buz', sortValueFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).buz,
          attributeFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).buz,
          description: 'Buzzes'},
        {label: 'Buz%', sortValueFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).buz_percent,
          attributeFunction: d => formatNumber(100.0 * jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).buz_percent, 1, false),
          description: 'Buz as percentage of Att'},
        {label: 'BuzC', sortValueFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).buzc,
          attributeFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).buzc,
          description: 'Correct responses on buzzes'},
        {label: 'Acc%', sortValueFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).acc_percent,
          attributeFunction: d => formatNumber(100.0 * jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).acc_percent, 1, false),
          description: 'Accuracy: BuzC as percentage of Buz'},
        {label: 'Conv%', sortValueFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).conversion_percent,
          attributeFunction: d => formatNumber(100.0 * jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).conversion_percent, 1, false),
          description: 'Conversion: BuzC as percentage of Att'},
        {label: 'Time', sortValueFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).timing,
          attributeFunction: d => formatNumber(jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).timing, 1, false, true),
          description: 'Estimated buzzes earned through timing'},
        {label: 'Solo', sortValueFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).solo,
          attributeFunction: d => formatNumber(jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).solo, 1, false),
          description: 'Estimated buzzes as solo attempter'}
      ]
    })
  }

  return panels
})
const conversionValueScoringTablePanels = computed(() => {
  if (!contestantData.value) return []
  if (!jschemaGameContestantStatData.value) return []
  if (!jschemaGameRoundContestantStatData.value) return []
  var panels = [
    {
      label: 'Full Game',
      columns: [
        {label: 'Contestant', sortValueFunction: d => -d['podium'], attributeFunction: d => contestantLink(d['contestant_id'], contestantData.value.get(d['contestant_id']).name)},
        {label: 'AttV', sortValueFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).att_value,
          attributeFunction: d => formatNumber(jschemaGameContestantStatData.value.get(d['contestant_id']).att_value, 0, false),
          description: 'Estimated clue value attempted'},
        {label: 'BuzV', sortValueFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).buz_value,
          attributeFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).buz_value,
          description: 'Clue value buzzed in on'},
        {label: 'BuzV%', sortValueFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).buz_value_percent,
          attributeFunction: d => formatNumber(100.0 * jschemaGameContestantStatData.value.get(d['contestant_id']).buz_value_percent, 1, false),
          description: 'BuzV as percentage of AttV'},
        {label: 'Buz$', sortValueFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).buz_score,
          attributeFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).buz_score,
          description: 'Scoring from buzzes'},
        {label: 'AccV%', sortValueFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).acc_value_percent,
          attributeFunction: d => formatNumber(100.0 * jschemaGameContestantStatData.value.get(d['contestant_id']).acc_value_percent, 1, false),
          description: 'Accuracy Value: Buz$ as percentage of BuzV'},
        {label: 'ConvV%', sortValueFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).conversion_value_percent,
          attributeFunction: d => formatNumber(100.0 * jschemaGameContestantStatData.value.get(d['contestant_id']).conversion_value_percent, 1, false),
          description: 'Conversion Value: Buz$ as percentage of AttV'},
        {label: 'TimeV', sortValueFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).timing_value,
          attributeFunction: d => formatNumber(jschemaGameContestantStatData.value.get(d['contestant_id']).timing_value, 0, true),
          description: 'Estimated clue value of buzzes earned through timing'},
        {label: 'Time$', sortValueFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).timing_score,
          attributeFunction: d => formatNumber(jschemaGameContestantStatData.value.get(d['contestant_id']).timing_score, 0, false),
          description: 'Estimated scoring of buzzes earned through timing'},
        {label: 'SoloV', sortValueFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).solo_value,
          attributeFunction: d => formatNumber(jschemaGameContestantStatData.value.get(d['contestant_id']).solo_value, 0),
          description: 'Estimated clue value of buzzes as solo attempter'},
        {label: 'Solo$', sortValueFunction: d => jschemaGameContestantStatData.value.get(d['contestant_id']).solo_score,
          attributeFunction: d => formatNumber(jschemaGameContestantStatData.value.get(d['contestant_id']).solo_score, 0),
          description: 'Estimated scoring of buzzes as solo attempter'},
      ]
    }
  ]

  for (const [rid, roundContestantStatData] of jschemaGameRoundContestantStatData.value) {
    if (rid > gameRounds.value) continue
    const round_label = rid == 1 ? 'J' : (rid == 2 ? 'DJ' : (rid == 3 ? 'TJ' : '?'))
    panels.push({
      label: round_label + ' Round',
      columns: [
      {label: 'Contestant', sortValueFunction: d => -d['podium'], attributeFunction: d => contestantLink(d['contestant_id'], contestantData.value.get(d['contestant_id']).name)},
        {label: 'AttV', sortValueFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).att_value,
          attributeFunction: d => formatNumber(jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).att_value, 0, false),
          description: 'Estimated clue value attempted'},
        {label: 'BuzV', sortValueFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).buz_value,
          attributeFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).buz_value,
          description: 'Clue value buzzed in on'},
        {label: 'BuzV%', sortValueFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).buz_value_percent,
          attributeFunction: d => formatNumber(100.0 * jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).buz_value_percent, 1, false),
          description: 'BuzV as percentage of AttV'},
        {label: 'Buz$', sortValueFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).buz_score,
          attributeFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).buz_score,
          description: 'Scoring from buzzes'},
        {label: 'AccV%', sortValueFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).acc_value_percent,
          attributeFunction: d => formatNumber(100.0 * jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).acc_value_percent, 1, false),
          description: 'Accuracy Value: Buz$ as percentage of BuzV'},
        {label: 'ConvV%', sortValueFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).conversion_value_percent,
          attributeFunction: d => formatNumber(100.0 * jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).conversion_value_percent, 1, false),
          description: 'Conversion Value: Buz$ as percentage of AttV'},
        {label: 'TimeV', sortValueFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).timing_value,
          attributeFunction: d => formatNumber(jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).timing_value, 0, true),
          description: 'Estimated clue value of buzzes earned through timing'},
        {label: 'Time$', sortValueFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).timing_score,
          attributeFunction: d => formatNumber(jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).timing_score, 0, false),
          description: 'Estimated scoring of buzzes earned through timing'},
        {label: 'SoloV', sortValueFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).solo_value,
          attributeFunction: d => formatNumber(jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).solo_value, 0),
          description: 'Estimated clue value of buzzes as solo attempter'},
        {label: 'Solo$', sortValueFunction: d => jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).solo_score,
          attributeFunction: d => formatNumber(jschemaGameRoundContestantStatData.value.get(rid).get(d['contestant_id']).solo_score, 0),
          description: 'Estimated scoring of buzzes as solo attempter'},
      ]
    })
  }

  return panels
})
const scoringTableRows = computed(() => {
  if (!gameContestantIds.value) return null
  if (!jschemaGameContestantStatData.value) return null
  return gameContestantIds.value.map((contestant_id, idx) => {
    return {
      'contestant_id': contestant_id,
      'podium': idx + 1
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

const byClueLineChartData = computed(() => {
  if (!jschemaClueContestantStatData.value) return null
  if (!gameContestantIds.value) return null

  var groupedData = d3.group(jschemaClueContestantStatData.value, c => c.round_of_game, c => c.clue_of_round, c => c.contestant_id)
  var traceData = []
  var rounds = [...groupedData.keys()].sort((a,b) => d3.ascending(a, b))
  for (var r of rounds) {
    var clue_numbers = [...groupedData.get(r).keys()].sort((a,b) => d3.ascending(a, b))
    for (var c of clue_numbers) {
      traceData.push({
        'clue_identifier': r + '-' + c,
        'contestant_data': gameContestantIds.value.map(
          cid => groupedData.get(r).get(c).get(cid)[0])
      })
    }
  }
  return traceData
})

/*
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
*/

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

/*
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
})*/

//Charts
const graphAttributesList = computed(() => graphAttributes)

const histogramGraphAttributeIdx = ref(0)
const histogramGraphAttribute = computed(() => graphAttributesList.value[histogramGraphAttributeIdx.value])
const histogramGraphRoundIdx = ref(0)

const xScatterGraphAttributeIdx = ref(0)
const xScatterGraphAttribute = computed(() => graphAttributesList.value[xScatterGraphAttributeIdx.value])
const yScatterGraphAttributeIdx = ref(2)
const yScatterGraphAttribute = computed(() => graphAttributesList.value[yScatterGraphAttributeIdx.value])
const scatterGraphRoundIdx = ref(0)

const scatterSpecification = computed(() => {
  if (!contestantData.value || !jschemaAllGameRoundContestantStatDataFlat.value || !jschemaAllGameContestantStatDataFlat.value) return null
  const xAttr = xScatterGraphAttribute.value
  const yAttr = yScatterGraphAttribute.value
  var histogramData = jschemaAllGameContestantStatDataFlat.value
  var scatterData = jschemaGameContestantStatDataFlat.value
  if (scatterGraphRoundIdx.value > 0) {
    histogramData = jschemaAllGameRoundContestantStatByRound.value.get(scatterGraphRoundIdx.value)
    scatterData = jschemaGameRoundContestantStatDataByRound.value[scatterGraphRoundIdx.value]
  }
  if (xAttr['requiresBox'] || yAttr['requiresBox']) {
    histogramData = d3.filter(histogramData, r => r.att !== undefined)
    scatterData = d3.filter(scatterData, r => r.att !== undefined)
  }
  return {
    histogramData: histogramData,
    scatterData: scatterData,
    scatterLabelFunction: d => contestantData.value.get(d.contestant_id).name,
    scatterColorFunction: d => color.value(d.contestant_id),
    title: xAttr['label'] + ' vs ' + yAttr['label'],
    xLabel: xAttr['label'],
    xFunction: xAttr['generatingFunctionFromSplit'],
    xBins: xAttr['bins'],
    yLabel: yAttr['label'],
    yFunction: yAttr['generatingFunctionFromSplit'],
    yBins: yAttr['bins'],
  }
})

const histogramSpecification = computed(() => {
  if (!contestantData.value || !jschemaAllGameRoundContestantStatDataFlat.value || !jschemaAllGameContestantStatDataFlat.value) return null
  const xAttr = histogramGraphAttribute.value
  var histogramData = jschemaAllGameContestantStatDataFlat.value
  var scatterData = jschemaGameContestantStatDataFlat.value
  if (histogramGraphRoundIdx.value > 0) {
    histogramData = jschemaAllGameRoundContestantStatByRound.value.get(histogramGraphRoundIdx.value)
    scatterData = jschemaGameRoundContestantStatDataByRound.value[histogramGraphRoundIdx.value]
  }
  if (xAttr['requiresBox']) {
    histogramData = d3.filter(histogramData, r => r.att !== undefined)
    scatterData = d3.filter(scatterData, r => r.att !== undefined)
  }
  return {
    histogramData: histogramData,
    scatterData: scatterData,
    scatterLabelFunction: d => contestantData.value.get(d.contestant_id).name,
    scatterColorFunction: d => color.value(d.contestant_id),
    title: xAttr['label'],
    xLabel: xAttr['label'],
    xFunction: xAttr['generatingFunctionFromSplit'],
    xBins: xAttr['bins']
  }
})

</script>

<template>
  <Header />
  <div class="component-body">
    <div v-if="jschemaGameData" class="section">
      <h1>Season <span id="season">{{ jschemaGameData.season_id }}</span> Game <span id="game-number">{{ jschemaGameData.game_in_season }}</span>, <span id="game-date">{{ dateFormat(jschemaGameData.airdate) }}</span></h1>
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
      <h2>Game Progress</h2>
      <select v-model="byClueLineChartAttributeIdx">
        <option v-for="(graphAttribute, idx) in cumulativeDataAttributesList" :value="idx">
          {{ graphAttribute.label }}
        </option>
      </select>
      <CumulativeLineChart v-if="gameContestantIds && byClueLineChartData && contestantData"
        :data="byClueLineChartData"
        :xFunction="d => d['clue_identifier']"
        :yFunctions="[0,1,2].map(idx => (d => byClueLineChartAttribute.generatingFunction(d.contestant_data[idx])))"
        :labels="gameContestantIds.map(cid => contestantData.get(cid).name)"
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
    <div class="section" v-if="gameContestantIds && jschemaGameRoundContestantStatData && contestantData">
      <h2>Attempts</h2>
      <StackValueBarChart 
        :data="gameContestantIds"
        :xCoreLabelFunction="cid => contestantData.get(cid).name"
        :xGroupLabels="['J','DJ'].concat(gameRounds >= 3 ? ['TJ'] : [])"
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
    <div class="section" v-if="gameContestantIds && jschemaGameRoundContestantStatData && contestantData">
      <h2>Attempt Values</h2>
      <StackValueBarChart 
        :data="gameContestantIds"
        :xCoreLabelFunction="cid => contestantData.get(cid).name"
        :xGroupLabels="['J','DJ'].concat(gameRounds >= 3 ? ['TJ'] : [])"
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
          {{ graphAttribute.label }}
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
