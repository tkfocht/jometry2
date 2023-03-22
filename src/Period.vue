<script setup>
import { ref, computed } from 'vue'
import { rollupData, csvDataAccessor, formatNumber, gameStatDataFromContestantStatData, movingAverageOfLast, dateFormat } from '@/util'
import { dataSourceAddress, playClassificationName } from '@/configuration'
import { graphAttributes } from '@/graphAttributes'
import { gameGraphAttributes } from '@/gameGraphAttributes'
import * as d3 from 'd3'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'
import BoxWhiskerChart from './components/util/BoxWhiskerChart.vue'
import CarouselTable from './components/util/CarouselTable.vue'
import LineChart from './components/util/LineChart.vue'
import ScatterHistogram from './components/util/ScatterHistogram.vue'
import StackValueBarChart from './components/util/StackValueBarChart.vue'

let urlParams = new URLSearchParams(window.location.search);
const dataSourceString = urlParams.get('data_source')
const dataSourceId = dataSourceString ? dataSourceString : 'standard'

const seasonSearchParameterString = urlParams.get('season')
const tocPeriodSearchParameterString = urlParams.get('toc_period')
const playClassificationSearchParameterString = urlParams.get('play_classification')

const winThresholdString = urlParams.get('win_threshold')
const winLimitString = urlParams.get('win_limit')
const graphDisplayLimitString = urlParams.get('graph_display_limit')
const displayContestantIdsString = urlParams.get('contestants')

const allContestantStatData = ref(null)
const allGameStatData = ref(null)
const displayRounds = ref(dataSourceString === 'celebrity' ? 3 : 2)

const seasonSearchParameters = ref(seasonSearchParameterString ? seasonSearchParameterString.split(',') : [])
const tocPeriodSearchParameters = ref(tocPeriodSearchParameterString ? tocPeriodSearchParameterString.split(',') : [])
const playClassificationSearchParameters = ref(playClassificationSearchParameterString ? playClassificationSearchParameterString.split(',') : [])
const displayContestantIdParameters = ref(displayContestantIdsString ? displayContestantIdsString.split(',') : [])

async function fetchContestantStatData(dataSourceId) {
  const res = await d3.csv(
    dataSourceAddress(dataSourceId),
    csvDataAccessor
  )
  var resResult = await res
  allContestantStatData.value = resResult
  var gameResResult = gameStatDataFromContestantStatData(resResult)
  gameResResult.sort((a,b) => d3.ascending(a['date'], b['date'] || d3.ascending(a['gameInSeason'], b['gameInSeason'])))
  allGameStatData.value = gameResResult
}
fetchContestantStatData(dataSourceId)

const filteredAllContestantStatData = computed(() => {
  if (!allContestantStatData.value) return undefined

  const satisfiesSeason = seasonSearchParameters.value.length === 0 ? 
    d => true :
    d => seasonSearchParameters.value.includes(d['Season'])
  const satisfiesTocPeriod = tocPeriodSearchParameters.value.length === 0 ? 
    d => true :
    d => tocPeriodSearchParameters.value.includes(d['TOC Period'])
  const satisfiesPlayClassification = playClassificationSearchParameters.value.length === 0 ? 
    d => true :
    d => playClassificationSearchParameters.value.includes(d['Play Classification'])
  const satisfiesAllFilters = d => satisfiesSeason(d) && satisfiesTocPeriod(d) && satisfiesPlayClassification(d)

  return d3.filter(allContestantStatData.value, satisfiesAllFilters)
})

const filteredAllGameStatData = computed(() => {
  if (!allGameStatData.value) return undefined

  const satisfiesSeason = seasonSearchParameters.value.length === 0 ? 
    d => true :
    d => seasonSearchParameters.value.includes(d['season'])
  const satisfiesTocPeriod = tocPeriodSearchParameters.value.length === 0 ? 
    d => true :
    d => tocPeriodSearchParameters.value.includes(d['tocPeriod'])
  const satisfiesPlayClassification = playClassificationSearchParameters.value.length === 0 ? 
    d => true :
    d => playClassificationSearchParameters.value.includes(d['playClassification'])
  const satisfiesAllFilters = d => satisfiesSeason(d) && satisfiesTocPeriod(d) && satisfiesPlayClassification(d)

  const filtered = d3.filter(allGameStatData.value, satisfiesAllFilters)
  return filtered
})

const filteredAllContestantStatDataByContestant = computed(() => {
  if (!filteredAllContestantStatData.value) return undefined
  return d3.group(filteredAllContestantStatData.value, d => d['Jometry Contestant Id'])
})

const filteredAllContestantStatSummariesByContestant = computed(() => {
  if (!filteredAllContestantStatDataByContestant.value) return undefined
  return new d3.InternMap(d3.map(filteredAllContestantStatDataByContestant.value,
    ([k, rs]) => [k, {
      'Jometry Contestant Id': k,
      'Contestant': rs[0]['Contestant'],
      'mean': rollupData(rs, d3.mean),
      'max': rollupData(rs, d3.max),
      'sum': rollupData(rs, d3.sum),
      'count': rollupData(rs, d3.count)
    }]))
})

const displayContestantIds = computed(() => {
  if (displayContestantIdParameters.value && displayContestantIdParameters.value.length > 0) {
    return d3.map(displayContestantIdParameters.value, v => +v)
  }
  if (!filteredAllContestantStatData.value) return undefined
  const winRollup = d3.rollup(filteredAllContestantStatData.value, v => d3.sum(v, d1 => d1['Wins']), d => d['Jometry Contestant Id'])
  const winScoreRollup = d3.rollup(filteredAllContestantStatData.value, v => d3.sum(v, d1 => d1['Win$']), d => d['Jometry Contestant Id'])
  const finalScoreRollup = d3.rollup(filteredAllContestantStatData.value, v => d3.sum(v, d1 => d1['FJFinal$']), d => d['Jometry Contestant Id'])
  const contestantIds = Array.from(winRollup.keys())
  contestantIds.sort((a,b) => d3.descending(winRollup.get(a), winRollup.get(b)) || d3.descending(winScoreRollup.get(a), winScoreRollup.get(b)) || d3.descending(finalScoreRollup.get(a), finalScoreRollup.get(b)))
  if (contestantIds.length <= 10) {
    return contestantIds
  }
  var winThreshold = winThresholdString ? +winThresholdString : Math.max(Math.min(winRollup.get(contestantIds[9]), 4), contestantIds.length > 21 ? 1 + winRollup.get(contestantIds[20]) : 0)
  //Okay fine, if anyone ever wins 10001 games this will be a bug,
  //but truthy values are weird when winLimit=0 is a primary case
  var winLimit = winLimitString ? +winLimitString : 10000
  return d3.filter(contestantIds, i => winRollup.get(i) >= winThreshold && winRollup.get(i) <= winLimit)
})
const graphDisplayLimit = ref(graphDisplayLimitString ? +graphDisplayLimitString : undefined)

const colorSet = computed(() => {
  if (!displayContestantIds.value) return undefined
  return d3.scaleOrdinal()
    .domain(displayContestantIds.value)
    .range(d3.schemeCategory10.concat(d3.schemeDark2).concat(d3.schemeAccent))
})

const color = computed(() => {
  return cid => {
    if (displayContestantIds.value && displayContestantIds.value.includes(cid)) {
      return colorSet.value(cid);
    } else {
      return "black";
    }
  }
})

const filteredAllContestantSummary = computed(() => {
  if (!filteredAllContestantStatData.value) return undefined
  return [{
      'Contestant': 'All Contestants',
      'mean': rollupData(filteredAllContestantStatData.value, d3.mean),
      'max': rollupData(filteredAllContestantStatData.value, d3.max),
      'sum': rollupData(filteredAllContestantStatData.value, d3.sum),
      'count': rollupData(filteredAllContestantStatData.value, d3.count)
  }]
})

const filteredDisplayContestantStatData = computed(() => {
  if (!filteredAllContestantStatData.value || !displayContestantIds.value) return undefined
  return d3.filter(filteredAllContestantStatData.value, d => displayContestantIds.value.includes(d['Jometry Contestant Id']))
})

const filteredDisplayContestantSummary = computed(() => {
  if (!filteredDisplayContestantStatData.value) return undefined
  return [{
      'Contestant': 'All Selected Contestants',
      'mean': rollupData(filteredDisplayContestantStatData.value, d3.mean),
      'max': rollupData(filteredDisplayContestantStatData.value, d3.max),
      'sum': rollupData(filteredDisplayContestantStatData.value, d3.sum),
      'count': rollupData(filteredDisplayContestantStatData.value, d3.count)
  }]
})

const filteredWinningContestantStatData = computed(() => {
  if (!filteredAllContestantStatData.value || !displayContestantIds.value) return undefined
  return d3.filter(filteredAllContestantStatData.value, d => d['Wins'] === 1)
})

const filteredWinningContestantSummary = computed(() => {
  if (!filteredWinningContestantStatData.value) return undefined
  return [{
      'Contestant': 'All Winning Contestants',
      'mean': rollupData(filteredWinningContestantStatData.value, d3.mean),
      'max': rollupData(filteredWinningContestantStatData.value, d3.max),
      'sum': rollupData(filteredWinningContestantStatData.value, d3.sum),
      'count': rollupData(filteredWinningContestantStatData.value, d3.count)
  }]
})

const filteredDisplayContestantStatSummaries = computed(() => {
  if (!filteredAllContestantStatSummariesByContestant.value || !displayContestantIds.value) return undefined
  return d3.map(displayContestantIds.value, id => filteredAllContestantStatSummariesByContestant.value.get(id))
})

function contestantLink (contestantStatData) {
  if (!contestantStatData['Jometry Contestant Id']) return contestantStatData['Contestant']
  return '<span style="color: ' + 
    color.value(contestantStatData['Jometry Contestant Id']) + 
    '">&#9632;</span>&nbsp;<a href="/contestant.html?data_source=' + dataSourceId + '&contestant_id=' + 
    contestantStatData['Jometry Contestant Id'] + 
    '">' + contestantStatData['Contestant'] + '</a>'
}

const leaderboardTablePanels = computed(() => {
  const panels = [
    {
      label: 'Totals',
      columns: [
        { label: 'Contestant', sortValueFunction: d => displayContestantIds.value.indexOf(d['Jometry Contestant Id']), attributeFunction: contestantLink},
        { label: 'W', sortValueFunction: d => d['sum']['Wins'], attributeFunction: d => formatNumber(d['sum']['Wins'], 0, false), description: 'Wins'},
        { label: 'Lk', sortValueFunction: d => d['sum']['Locks'], attributeFunction: d => formatNumber(d['sum']['Locks'], 0, false), description: 'Locks (Games finished at > 2x opponents)'},
        { label: 'Cr', sortValueFunction: d => d['sum']['Crushes'], attributeFunction: d => formatNumber(d['sum']['Crushes'], 0, false), description: 'Crushes (Games finished at > 1.5x opponents)'},
        { label: 'Ld', sortValueFunction: d => d['sum']['Leads'], attributeFunction: d => formatNumber(d['sum']['Leads'], 0, false), description: 'Locks (Games finished with lead)'},
        { label: 'Win$', sortValueFunction: d => d['sum']['Win$'], attributeFunction: d => formatNumber(d['sum']['Win$'], 0, false)},
        { label: 'Att', sortValueFunction: d => d['sum']['Att'] === undefined ? -Infinity : d['sum']['Att'], attributeFunction: d => formatNumber(d['sum']['Att'], 0, false)},
        { label: 'Buz', sortValueFunction: d => d['sum']['Buz'], attributeFunction: d => formatNumber(d['sum']['Buz'], 0, false)},
        { label: 'BuzC', sortValueFunction: d => d['sum']['BuzC'], attributeFunction: d => formatNumber(d['sum']['BuzC'], 0, false)},
        { label: 'AttV', sortValueFunction: d => d['sum']['AttValue'] === undefined ? -Infinity : d['sum']['AttValue'], attributeFunction: d => formatNumber(d['sum']['AttValue'], 0, false)},
        { label: 'BuzV', sortValueFunction: d => d['sum']['BuzValue'], attributeFunction: d => formatNumber(d['sum']['BuzValue'], 0, false)},
        { label: 'Buz$', sortValueFunction: d => d['sum']['Buz$'], attributeFunction: d => formatNumber(d['sum']['Buz$'], 0, false)},
        { label: 'DDF', sortValueFunction: d => d['sum']['DDF'], attributeFunction: d => formatNumber(d['sum']['DDF'], 0)},
        { label: 'DD+', sortValueFunction: d => d['sum']['DD+'], attributeFunction: d => formatNumber(d['sum']['DD+'], 1, false, true)},
        { label: 'DD$', sortValueFunction: d => d['sum']['DD$'], attributeFunction: d => formatNumber(d['sum']['DD$'], 0, false)},
        { label: 'FJ', sortValueFunction: d => d['sum']['FJCor'] === undefined ? 0 : d['sum']['FJCor'], attributeFunction: d => formatNumber(d['sum']['FJCor'] === undefined ? 0 : d['sum']['FJCor'], 0, false) + '/' + formatNumber(d['count']['FJCor'] === undefined ? 0 : d['count']['FJCor'], 0, false)},
        { label: 'FJ$', sortValueFunction: d => d['sum']['FJ$'], attributeFunction: d => formatNumber(d['sum']['FJ$'], 0, false)},
      ]
    },
    {
      label: 'Standard (Game Avg)',
      columns: [
        { label: 'Contestant', sortValueFunction: d => displayContestantIds.value.indexOf(d['Jometry Contestant Id']), attributeFunction: contestantLink},
        { label: 'Buz', sortValueFunction: d => d['mean']['Buz'], attributeFunction: d => formatNumber(d['mean']['Buz'], 1, false)},
        { label: 'BuzC', sortValueFunction: d => d['mean']['BuzC'], attributeFunction: d => formatNumber(d['mean']['BuzC'], 1, false)},
        { label: 'Buz$', sortValueFunction: d => d['mean']['Buz$'], attributeFunction: d => formatNumber(d['mean']['Buz$'], 0, false)},
        { label: 'DDF', sortValueFunction: d => d['mean']['DDF'], attributeFunction: d => formatNumber(d['mean']['DDF'], 1, false)},
        { label: 'DD+', sortValueFunction: d => d['mean']['DD+'], attributeFunction: d => formatNumber(d['mean']['DD+'], 2, false, true)},
        { label: 'DD$', sortValueFunction: d => d['mean']['DD$'], attributeFunction: d => formatNumber(d['mean']['DD$'], 0, false)},
        { label: 'JFinal$', sortValueFunction: d => d['mean']['JFinal$'], attributeFunction: d => formatNumber(d['mean']['JFinal$'], 0, false)},
        { label: 'DJFinal$', sortValueFunction: d => d['mean']['DJFinal$'], attributeFunction: d => formatNumber(d['mean']['DJFinal$'], 0, false)},
        { label: 'FJ$', sortValueFunction: d => d['mean']['FJ$'], attributeFunction: d => formatNumber(d['mean']['FJ$'], 0, false)},
        { label: 'FJFinal$', sortValueFunction: d => d['mean']['FJFinal$'], attributeFunction: d => formatNumber(d['mean']['FJFinal$'], 0, false)},
      ]
    },
    {
      label: 'Conversion (Game Avg)',
      columns: [
        { label: 'Contestant', sortValueFunction: d => displayContestantIds.value.indexOf(d['Jometry Contestant Id']), attributeFunction: contestantLink},
        { label: 'Att', sortValueFunction: d => d['mean']['Att'] === undefined ? -Infinity : d['mean']['Att'], attributeFunction: d => formatNumber(d['mean']['Att'], 1, false)},
        { label: 'Buz', sortValueFunction: d => d['mean']['Buz'], attributeFunction: d => formatNumber(d['mean']['Buz'], 1, false)},
        { label: 'Buz%', sortValueFunction: d => d['mean']['Buz%'] === undefined ? -Infinity : d['mean']['Buz%'], attributeFunction: d => formatNumber(d['mean']['Buz%'], 1, false)},
        { label: 'BuzC', sortValueFunction: d => d['mean']['BuzC'], attributeFunction: d => formatNumber(d['mean']['BuzC'], 1, false)},
        { label: 'Acc%', sortValueFunction: d => d['mean']['Acc%'], attributeFunction: d => formatNumber(d['mean']['Acc%'], 1, false)},
        { label: 'Conv%', sortValueFunction: d => d['mean']['Conv%'] === undefined ? -Infinity : d['mean']['Conv%'], attributeFunction: d => formatNumber(d['mean']['Conv%'], 1, false)},
        { label: 'Time', sortValueFunction: d => d['mean']['Timing'] === undefined ? -Infinity : d['mean']['Timing'], attributeFunction: d => formatNumber(d['mean']['Timing'], 1, false, true)},
        { label: 'Solo', sortValueFunction: d => d['mean']['Solo'] === undefined ? -Infinity : d['mean']['Solo'], attributeFunction: d => formatNumber(d['mean']['Solo'], 1, false)},
        { label: 'AttV', sortValueFunction: d => d['mean']['AttValue'] === undefined ? -Infinity : d['mean']['AttValue'], attributeFunction: d => formatNumber(d['mean']['AttValue'], 0, false)},
        { label: 'BuzV', sortValueFunction: d => d['mean']['BuzValue'], attributeFunction: d => formatNumber(d['mean']['BuzValue'], 0, false)},
        { label: 'BuzV%', sortValueFunction: d => d['mean']['BuzValue%'] === undefined ? -Infinity : d['mean']['BuzValue%'], attributeFunction: d => formatNumber(d['mean']['BuzValue%'], 1, false)},
        { label: 'Buz$', sortValueFunction: d => d['mean']['Buz$'], attributeFunction: d => formatNumber(d['mean']['Buz$'], 0, false)},
        { label: 'AccV%', sortValueFunction: d => d['mean']['AccValue%'], attributeFunction: d => formatNumber(d['mean']['AccValue%'], 1, false)},
        { label: 'ConvV%', sortValueFunction: d => d['mean']['ConvValue%'] === undefined ? -Infinity : d['mean']['ConvValue%'], attributeFunction: d => formatNumber(d['mean']['ConvValue%'], 1, false)},
        { label: 'TimeV', sortValueFunction: d => d['mean']['TimingValue'] === undefined ? -Infinity : d['mean']['TimingValue'], attributeFunction: d => formatNumber(d['mean']['TimingValue'], 0, false, true)},
        { label: 'SoloV', sortValueFunction: d => d['mean']['SoloValue'] === undefined ? -Infinity : d['mean']['SoloValue'], attributeFunction: d => formatNumber(d['mean']['SoloValue'], 0, false)},
      ]
    },
    {
      label: 'Standard (Game Max)',
      columns: [
        { label: 'Contestant', sortValueFunction: d => displayContestantIds.value.indexOf(d['Jometry Contestant Id']), attributeFunction: contestantLink},
        { label: 'Buz', sortValueFunction: d => d['max']['Buz'], attributeFunction: d => formatNumber(d['max']['Buz'], 1, false)},
        { label: 'BuzC', sortValueFunction: d => d['max']['BuzC'], attributeFunction: d => formatNumber(d['max']['BuzC'], 1, false)},
        { label: 'Buz$', sortValueFunction: d => d['max']['Buz$'], attributeFunction: d => formatNumber(d['max']['Buz$'], 0, false)},
        { label: 'DDF', sortValueFunction: d => d['max']['DDF'], attributeFunction: d => formatNumber(d['max']['DDF'], 1, false)},
        { label: 'DD+', sortValueFunction: d => d['max']['DD+'], attributeFunction: d => formatNumber(d['max']['DD+'], 2, false, true)},
        { label: 'DD$', sortValueFunction: d => d['max']['DD$'], attributeFunction: d => formatNumber(d['max']['DD$'], 0, false)},
        { label: 'JFinal$', sortValueFunction: d => d['max']['JFinal$'], attributeFunction: d => formatNumber(d['max']['JFinal$'], 0, false)},
        { label: 'DJFinal$', sortValueFunction: d => d['max']['DJFinal$'], attributeFunction: d => formatNumber(d['max']['DJFinal$'], 0, false)},
        { label: 'FJ$', sortValueFunction: d => d['max']['FJ$'], attributeFunction: d => formatNumber(d['max']['FJ$'], 0, false)},
        { label: 'FJFinal$', sortValueFunction: d => d['max']['FJFinal$'], attributeFunction: d => formatNumber(d['max']['FJFinal$'], 0, false)},
      ]
    },
    {
      label: 'Conversion (Game Max)',
      columns: [
        { label: 'Contestant', sortValueFunction: d => displayContestantIds.value.indexOf(d['Jometry Contestant Id']), attributeFunction: contestantLink},
        { label: 'Att', sortValueFunction: d => d['max']['Att'] === undefined ? -Infinity : d['max']['Att'], attributeFunction: d => formatNumber(d['mean']['Att'], 1, false)},
        { label: 'Buz', sortValueFunction: d => d['max']['Buz'], attributeFunction: d => formatNumber(d['max']['Buz'], 1, false)},
        { label: 'Buz%', sortValueFunction: d => d['max']['Buz%'] === undefined ? -Infinity : d['max']['Buz%'], attributeFunction: d => formatNumber(d['mean']['Buz%'], 1, false)},
        { label: 'BuzC', sortValueFunction: d => d['max']['BuzC'], attributeFunction: d => formatNumber(d['max']['BuzC'], 1, false)},
        { label: 'Acc%', sortValueFunction: d => d['max']['Acc%'], attributeFunction: d => formatNumber(d['max']['Acc%'], 1, false)},
        { label: 'Conv%', sortValueFunction: d => d['max']['Conv%'] === undefined ? -Infinity : d['max']['Conv%'], attributeFunction: d => formatNumber(d['max']['Conv%'], 1, false)},
        { label: 'Time', sortValueFunction: d => d['max']['Timing'] === undefined ? -Infinity : d['max']['Timing'], attributeFunction: d => formatNumber(d['mean']['Timing'], 1, false, true)},
        { label: 'Solo', sortValueFunction: d => d['max']['Solo'] === undefined ? -Infinity : d['max']['Solo'], attributeFunction: d => formatNumber(d['mean']['Solo'], 1, false)},
        { label: 'AttV', sortValueFunction: d => d['max']['AttValue'] === undefined ? -Infinity : d['max']['AttValue'], attributeFunction: d => formatNumber(d['mean']['AttValue'], 0, false)},
        { label: 'BuzV', sortValueFunction: d => d['max']['BuzValue'], attributeFunction: d => formatNumber(d['max']['BuzValue'], 0, false)},
        { label: 'BuzV%', sortValueFunction: d => d['max']['BuzValue%'] === undefined ? -Infinity : d['max']['BuzValue%'], attributeFunction: d => formatNumber(d['mean']['BuzValue%'], 1, false)},
        { label: 'Buz$', sortValueFunction: d => d['max']['Buz$'], attributeFunction: d => formatNumber(d['max']['Buz$'], 0, false)},
        { label: 'AccV%', sortValueFunction: d => d['max']['AccValue%'], attributeFunction: d => formatNumber(d['max']['AccValue%'], 1, false)},
        { label: 'ConvV%', sortValueFunction: d => d['max']['ConvValue%'] === undefined ? -Infinity : d['max']['ConvValue%'], attributeFunction: d => formatNumber(d['max']['ConvValue%'], 1, false)},
        { label: 'TimeV', sortValueFunction: d => d['max']['TimingValue'] === undefined ? -Infinity : d['max']['TimingValue'], attributeFunction: d => formatNumber(d['mean']['TimingValue'], 0, false, true)},
        { label: 'SoloV', sortValueFunction: d => d['max']['SoloValue'] === undefined ? -Infinity : d['max']['SoloValue'], attributeFunction: d => formatNumber(d['mean']['SoloValue'], 0, false)},
      ]
    },
  ]
  if (displayRounds.value >= 3) {
    panels[1]['columns'].splice(9, 0, { label: 'TJFinal$', sortValueFunction: d => d['mean']['TJFinal$'], attributeFunction: d => formatNumber(d['mean']['TJFinal$'], 0, false)})
    panels[3]['columns'].splice(9, 0, { label: 'TJFinal$', sortValueFunction: d => d['max']['TJFinal$'], attributeFunction: d => formatNumber(d['max']['TJFinal$'], 0, false)})
  }
  return panels
})

//Charts
const graphAttributesList = computed(() => graphAttributes(displayRounds.value))
const gameGraphAttributesList = ref(gameGraphAttributes)

const boxWhiskerGraphAttributeIdx = ref(0)
const boxWhiskerGraphAttribute = computed(() => graphAttributesList.value[boxWhiskerGraphAttributeIdx.value])
const boxWhiskerGraphRoundIdx = ref(0)

const xScatterGraphAttributeIdx = ref(0)
const yScatterGraphAttributeIdx = ref(1)
const xScatterGraphAttribute = computed(() => graphAttributesList.value[xScatterGraphAttributeIdx.value])
const yScatterGraphAttribute = computed(() => graphAttributesList.value[yScatterGraphAttributeIdx.value])
const scatterGraphRoundIdx = ref(0)
const scatterGraphColorAttributeIdx = ref(null)
const scatterGraphColorAttribute = computed(() => graphAttributesList.value[scatterGraphColorAttributeIdx.value])

const rollingAverageGraphAttributeIdx = ref(0)
const rollingAverageRollCount = ref(5)
const rollingAverageGraphAttribute = computed(() => gameGraphAttributesList.value[rollingAverageGraphAttributeIdx.value])

const boxWhiskerGraphSpecification = computed(() => {
  if (!filteredAllContestantStatDataByContestant.value || !displayContestantIds.value) return undefined
  var sortedKeys = displayContestantIds.value.slice()
  sortedKeys = d3.filter(sortedKeys, k => filteredAllContestantStatDataByContestant.value.get(k).some(d => boxWhiskerGraphAttribute.value['generatingFunctions'][boxWhiskerGraphRoundIdx.value](d) !== undefined))
  sortedKeys.sort((a,b) => d3.descending(
    d3.mean(filteredAllContestantStatDataByContestant.value.get(a), boxWhiskerGraphAttribute.value['generatingFunctions'][boxWhiskerGraphRoundIdx.value]),
    d3.mean(filteredAllContestantStatDataByContestant.value.get(b), boxWhiskerGraphAttribute.value['generatingFunctions'][boxWhiskerGraphRoundIdx.value])
  ))
  if (graphDisplayLimit.value) {
    sortedKeys = sortedKeys.slice(0, graphDisplayLimit.value)
  }
  return {
    dataByKey: filteredAllContestantStatDataByContestant.value,
    orderedKeys: sortedKeys,
    xLabel: ds => ds[0]['Contestant'],
    yFunction: boxWhiskerGraphAttribute.value['generatingFunctions'][boxWhiskerGraphRoundIdx.value],
    yLabel: d => d['Season'] + '-' + d['Game In Season'],
    idColorFunction: color.value,
    title: boxWhiskerGraphAttribute.value['label'],
    additionalBoxes: [
      {
        label: 'All Others',
        yLabel: d => d['Contestant'] + ' ' + d['Season'] + '-' + d['Game In Season'],
        filter: d => !sortedKeys.includes(d['Jometry Contestant Id']),
        color: 'black'
      }
    ]
  }
})

const scatterHistogramSpecification = computed(() => {
  var scatterColorFunction = d => color.value(d['Jometry Contestant Id'])
  if (scatterGraphColorAttributeIdx.value != null) {
    const attrValues = d3.map(filteredAllContestantStatData.value, scatterGraphColorAttribute.value['generatingFunctions'][scatterGraphRoundIdx.value])
    const colorRange = d3.scaleLinear()
      .domain([d3.min(attrValues), d3.median(attrValues), d3.max(attrValues)])
      .range(["blue", "white", "red"])
    scatterColorFunction = d => colorRange(scatterGraphColorAttribute.value['generatingFunctions'][scatterGraphRoundIdx.value](d))
  }
  return {
    histogramData: filteredAllContestantStatData.value,
    scatterData: d3.filter(filteredAllContestantStatData.value, d => displayContestantIds.value.includes(d['Jometry Contestant Id'])),
    scatterLabelFunction: d => d['Contestant'] + ' ' + d['Season'] + '-' + d['Game In Season'],
    scatterColorFunction: scatterColorFunction,
    title: xScatterGraphAttribute.value['label'] + ' vs ' + yScatterGraphAttribute.value['label'],
    xLabel: xScatterGraphAttribute.value['label'],
    xFunction: xScatterGraphAttribute.value['generatingFunctions'][scatterGraphRoundIdx.value],
    xBins: xScatterGraphAttribute.value['bins'],
    yLabel: yScatterGraphAttribute.value['label'],
    yFunction: yScatterGraphAttribute.value['generatingFunctions'][scatterGraphRoundIdx.value],
    yBins: yScatterGraphAttribute.value['bins'],
    scatterMode: 'markers'
  }
})

const scatterAverageHistogramSpecification = computed(() => ({
  histogramData: Array.from(filteredAllContestantStatSummariesByContestant.value.values()),
  scatterData: d3.filter(filteredAllContestantStatSummariesByContestant.value.values(), d => displayContestantIds.value.includes(d['Jometry Contestant Id'])),
  scatterLabelFunction: d => d['Contestant'],
  scatterColorFunction: d => color.value(d['Jometry Contestant Id']),
  title: 'Average ' + xScatterGraphAttribute.value['label'] + ' vs ' + yScatterGraphAttribute.value['label'],
  xLabel: xScatterGraphAttribute.value['label'],
  xFunction: d => xScatterGraphAttribute.value['generatingFunctions'][scatterGraphRoundIdx.value](d['mean']),
  xBins: xScatterGraphAttribute.value['bins'],
  yLabel: yScatterGraphAttribute.value['label'],
  yFunction: d => yScatterGraphAttribute.value['generatingFunctions'][scatterGraphRoundIdx.value](d['mean']),
  yBins: yScatterGraphAttribute.value['bins'],
}))

const attemptBarChartSpecification = computed(() => ({
  data: filteredDisplayContestantStatSummaries.value,
  xCoreLabelFunction: d => d['Contestant'],
  xGroupLabels: ['Contestants'],
  yFunctionGroups: [[d => formatNumber(d['mean']['BuzC'],1,false), d => formatNumber(d['mean']['Buz'],1,false), d => formatNumber(d['mean']['Att'],1,false)]],
  colorFunction: d => color.value(d['Jometry Contestant Id']),
  sortFunction: (a,b) => d3.descending(a['mean']['BuzC'], b['mean']['BuzC']),
  displayLimit: graphDisplayLimit.value,
  yLabel: 'BuzC -> Buz -> Att',
  title: 'Attempts'
}))

const attemptValueBarChartSpecification = computed(() => ({
  data: filteredDisplayContestantStatSummaries.value,
  xCoreLabelFunction: d => d['Contestant'],
  xGroupLabels: ['Contestants'],
  yFunctionGroups: [[d => formatNumber(d['mean']['Buz$'],0), d => formatNumber(d['mean']['BuzValue'],0), d => formatNumber(d['mean']['AttValue'],0)]],
  colorFunction: d => color.value(d['Jometry Contestant Id']),
  sortFunction: (a,b) => d3.descending(a['mean']['Buz$'], b['mean']['Buz$']),
  displayLimit: graphDisplayLimit.value,
  yLabel: 'Buz$ -> BuzV -> AttV',
  title: 'Attempt Values'
}))

const totalAttemptsLineChartSpecification = computed(() => {
  if (filteredAllGameStatData.value === undefined) return
  return {
    data: d3.zip(filteredAllGameStatData.value,
      movingAverageOfLast(5, d3.map(filteredAllGameStatData.value, d => d['Att'])),
      movingAverageOfLast(5, d3.map(filteredAllGameStatData.value, d => d['AttMax'])),
      movingAverageOfLast(5, d3.map(filteredAllGameStatData.value, d => d['AttMed'])),
      movingAverageOfLast(5, d3.map(filteredAllGameStatData.value, d => d['AttMin']))), //filteredAllGameStatData.value,//d3.zip(filteredAllGameStatData.value, movingAverageOfLast(10, d3.map(filteredAllGameStatData.value, d => d['Att']))),
    xFunction: d => dateFormat(d[0]['date']),
    yFunctions: [d => d[1], d => d[2], d => d[3], d => d[4]],//[d => d['Att'], d => d['Buz'], d => d['BuzC'], d => d['BuzI']], //[d => d[1]], //
    labels: ['Att Total', 'Att Max', 'Att Median', 'Att Min'],// 'Buz', 'BuzC', 'BuzI'], //'BuzC'], //
    xLabel: 'Airdate',
    yLabel: 'Count',
    title: '5 Game Rolling Average'
  }
})

const rollingLineChartSpecification = computed(() => {
  if (filteredAllGameStatData.value === undefined) return
  return {
    data: d3.zip(filteredAllGameStatData.value,
      movingAverageOfLast(rollingAverageRollCount.value, d3.map(filteredAllGameStatData.value, rollingAverageGraphAttribute.value.generatingFunction))),
    xFunction: d => dateFormat(d[0]['date']),
    yFunctions: [d => d[1]],
    labels: [rollingAverageGraphAttribute.value.label],
    xLabel: 'Airdate',
    yLabel: rollingAverageGraphAttribute.value.label,
    title: rollingAverageRollCount.value + ' Game Rolling Average'
  }
})

</script>

<template>
  <Header />
  <div class="component-body">
    <h1>
      <span v-if="tocPeriodSearchParameters && tocPeriodSearchParameters.length > 0">{{ tocPeriodSearchParameters.join(', ') }} TOC Period<span v-if="tocPeriodSearchParameters.length > 1">s</span>&nbsp;</span>
      <span v-if="seasonSearchParameters && seasonSearchParameters.length > 0">Season<span v-if="seasonSearchParameters.length > 1">s</span> {{ seasonSearchParameters.join(', ') }}&nbsp;</span>
      <span v-if="playClassificationSearchParameters && playClassificationSearchParameters.length > 0">{{ d3.map(playClassificationSearchParameters, p => playClassificationName(p, undefined)).join(", ") }}&nbsp;</span>Summary
    </h1>
    <div v-if="displayContestantIds && filteredDisplayContestantStatSummaries" class="section">
      <h2>Leaders</h2>
      <CarouselTable 
          :panels="leaderboardTablePanels"
          :rowData="filteredDisplayContestantStatSummaries"
          :footerRowData="filteredDisplayContestantSummary.concat(filteredWinningContestantSummary).concat(filteredAllContestantSummary)"
          :defaultSortFunction="d => displayContestantIds.indexOf(d['Jometry Contestant Id'])"
          />
    </div>
    <div class="section">
      <h2>Attempts</h2>
      <StackValueBarChart v-bind="attemptBarChartSpecification" />
    </div>
    <div class="section">
      <h2>Attempt Values</h2>
      <StackValueBarChart v-bind="attemptValueBarChartSpecification" />
    </div>
    <div class="section">
      <h2>Total Attempts</h2>
      <LineChart v-bind="totalAttemptsLineChartSpecification" />
    </div>
    <div class="section">
      <h2>Rolling Averages</h2>
      <select v-model="rollingAverageRollCount">
        <option :value="5">5 games</option>
        <option :value="10">10 games</option>
        <option :value="20">20 games</option>
      </select>
      <select v-model="rollingAverageGraphAttributeIdx">
        <option v-for="(gameGraphAttribute, idx) in gameGraphAttributesList" :value="idx">
          {{ gameGraphAttribute.label }}
        </option>
      </select>
      <LineChart v-bind="rollingLineChartSpecification" />
    </div>
    <div v-if="filteredAllContestantStatDataByContestant && displayContestantIds" class="section">
      <h2>Selectable Box and Whisker Plots</h2>
      <select v-model="boxWhiskerGraphAttributeIdx">
        <option v-for="(graphAttribute, idx) in graphAttributesList" :value="idx">
          {{ graphAttribute.label }}
        </option>
      </select>
      <select v-model="boxWhiskerGraphRoundIdx">
        <option :value="0">Full Game</option>
        <option :value="1">J! Round</option>
        <option :value="2">DJ! Round</option>
        <option v-if="displayRounds >= 3" :value="3">TJ! Round</option>
      </select><br/>
      <BoxWhiskerChart v-bind="boxWhiskerGraphSpecification" />
    </div>
    <div v-if="filteredAllContestantStatData && displayContestantIds" class="section">
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
      </select>
      <select v-model="scatterGraphColorAttributeIdx">
        <option :value="null">By Contestant</option>
        <option v-for="(graphAttribute, idx) in graphAttributesList" :value="idx">
          {{ graphAttribute.label }}
        </option>
      </select>
      <div class="graph-subsection">
        <h3>All Games</h3>
        <ScatterHistogram v-bind="scatterHistogramSpecification" />
      </div>
      <div class="graph-subsection">
        <h3>Average by Contestant</h3>
        <ScatterHistogram v-bind="scatterAverageHistogramSpecification" />
      </div>
    </div>
  </div>
  <Footer />
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

.graph-subsection {
  margin-top: 1em;
}

</style>
