<script setup>
import { ref, computed } from 'vue'
import { averageData, rollupData, csvDataAccessor, formatNumber, gameStatDataFromContestantStatData,
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
const seasonSearchParameterString = urlParams.get('season')
const tocPeriodSearchParameterString = urlParams.get('toc_period')
const playClassificationSearchParameterString = urlParams.get('play_classification')

const displayContestantIdsString = urlParams.get('contestants')

const allContestantStatData = ref(null)
const displayRounds = ref(2)

const seasonSearchParameters = ref(seasonSearchParameterString ? seasonSearchParameterString.split(',') : [])
const tocPeriodSearchParameters = ref(tocPeriodSearchParameterString ? tocPeriodSearchParameterString.split(',') : [])
const playClassificationSearchParameters = ref(playClassificationSearchParameterString ? playClassificationSearchParameterString.split(',') : [])
const displayContestantIdParameters = ref(displayContestantIdsString ? displayContestantIdsString.split(',') : [])

async function fetchContestantStatData() {
  const res = await d3.csv(
    'https://j-ometry.com/csvs/all_standard.csv',
    csvDataAccessor
  )
  var resResult = await res
  allContestantStatData.value = resResult
}
fetchContestantStatData()

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
      'sum': rollupData(rs, d3.sum)
    }]))
})

const displayContestantIds = computed(() => {
  if (displayContestantIdParameters.value && displayContestantIdParameters.value.length > 0) {
    return d3.map(displayContestantIdParameters.value, v => +v)
  }
  if (!filteredAllContestantStatData.value) return undefined
  const winRollup = d3.rollup(filteredAllContestantStatData.value, v => d3.sum(v, d1 => d1['Wins']), d => d['Jometry Contestant Id'])
  const winScoreRollup = d3.rollup(filteredAllContestantStatData.value, v => d3.sum(v, d1 => d1['Win$']), d => d['Jometry Contestant Id'])
  const contestantIds = Array.from(winRollup.keys())
  contestantIds.sort((a,b) => d3.descending(winRollup.get(a), winRollup.get(b)) || d3.descending(winScoreRollup.get(a), winScoreRollup.get(b)))
  if (contestantIds.length <= 10) {
    return contestantIds
  }
  var winThreshold = Math.max(Math.min(winRollup.get(contestantIds[9]), 4), contestantIds.length > 21 ? 1 + winRollup.get(contestantIds[20]) : 0)
  return d3.filter(contestantIds, i => winRollup.get(i) >= winThreshold)
})

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

const filteredDisplayContestantStatData = computed(() => {
  if (!filteredAllContestantStatData.value || !displayContestantIds.value) return undefined
  return d3.filter(filteredAllContestantStatData.value, d => displayContestantIds.value.includes(d['Jometry Contestant Id']))
})

const filteredDisplayContestantStatSummaries = computed(() => {
  if (!filteredAllContestantStatSummariesByContestant.value || !displayContestantIds.value) return undefined
  return d3.map(displayContestantIds.value, id => filteredAllContestantStatSummariesByContestant.value.get(id))
})

function contestantLink (contestantStatData) {
  return '<span style="color: ' + 
    color.value(contestantStatData['Jometry Contestant Id']) + 
    '">&#9632;</span>&nbsp;<a href="/contestant.html?contestant_id=' + 
    contestantStatData['Jometry Contestant Id'] + 
    '">' + contestantStatData['Contestant'] + '</a>'
}

const leaderboardTablePanels = computed(() => {
  var panels = [
    {
      label: 'Totals',
      columns: [
        { label: 'Contestant', sortValueFunction: d => displayContestantIds.value.indexOf(d['Jometry Contestant Id']), attributeFunction: contestantLink},
        { label: 'W', sortValueFunction: d => d['sum']['Wins'], attributeFunction: d => formatNumber(d['sum']['Wins'], 0, false)},
        { label: 'Win$', sortValueFunction: d => d['sum']['Win$'], attributeFunction: d => formatNumber(d['sum']['Win$'], 0, false)},
        { label: 'Att', sortValueFunction: d => d['sum']['Att'], attributeFunction: d => formatNumber(d['sum']['Att'], 0, false)},
        { label: 'Buz', sortValueFunction: d => d['sum']['Buz'], attributeFunction: d => formatNumber(d['sum']['Buz'], 0, false)},
        { label: '%', sortValueFunction: d => d['sum']['Buz'] / d['sum']['Att'], attributeFunction: d => formatNumber(100.0 * d['sum']['Buz'] / d['sum']['Att'], 1, false)},
        { label: 'BuzC', sortValueFunction: d => d['sum']['BuzC'], attributeFunction: d => formatNumber(d['sum']['BuzC'], 0, false)},
        { label: '%', sortValueFunction: d => d['sum']['BuzC'] / d['sum']['Buz'], attributeFunction: d => formatNumber(100.0 * d['sum']['BuzC'] / d['sum']['Buz'], 1, false)},
        { label: 'DDF', sortValueFunction: d => d['sum']['DDF'], attributeFunction: d => formatNumber(d['sum']['DDF'], 0)},
        { label: 'DD+', sortValueFunction: d => d['sum']['DD+'], attributeFunction: d => formatNumber(d['sum']['DD+'], 1, false, true)},
      ]
    },
    {
      label: 'Game Averages',
      columns: [
        { label: 'Contestant', sortValueFunction: d => displayContestantIds.value.indexOf(d['Jometry Contestant Id']), attributeFunction: contestantLink},
        { label: 'Att', sortValueFunction: d => d['mean']['Att'], attributeFunction: d => formatNumber(d['mean']['Att'], 1, false)},
        { label: 'Buz', sortValueFunction: d => d['mean']['Buz'], attributeFunction: d => formatNumber(d['mean']['Buz'], 1, false)},
        { label: '%', sortValueFunction: d => d['mean']['Buz%'], attributeFunction: d => formatNumber(d['mean']['Buz%'], 1, false)},
        { label: 'DDF', sortValueFunction: d => d['mean']['DDF'], attributeFunction: d => formatNumber(d['mean']['DDF'], 1, false)},
        { label: 'DD+', sortValueFunction: d => d['mean']['DD+'], attributeFunction: d => formatNumber(d['mean']['DD+'], 1, false, true)},
      ]
    },
  ]

  return panels
})

//Charts
const graphAttributesList = computed(() => graphAttributes(displayRounds.value))

const histogramGraphAttributeIdx = ref(0)
const histogramGraphAttribute = computed(() => graphAttributesList.value[histogramGraphAttributeIdx.value])
const histogramGraphRoundIdx = ref(0)

const xScatterGraphAttributeIdx = ref(0)
const yScatterGraphAttributeIdx = ref(1)
const xScatterGraphAttribute = computed(() => graphAttributesList.value[xScatterGraphAttributeIdx.value])
const yScatterGraphAttribute = computed(() => graphAttributesList.value[yScatterGraphAttributeIdx.value])
const scatterGraphRoundIdx = ref(0)

const scatterHistogramSpecification = computed(() => ({
  histogramData: filteredAllContestantStatData.value,
  scatterData: d3.filter(filteredAllContestantStatData.value, d => displayContestantIds.value.includes(d['Jometry Contestant Id'])),
  scatterLabelFunction: d => '',
  scatterColorFunction: d => color.value(d['Jometry Contestant Id']),
  title: xScatterGraphAttribute.value['label'] + ' vs ' + yScatterGraphAttribute.value['label'],
  xLabel: xScatterGraphAttribute.value['label'],
  xFunction: xScatterGraphAttribute.value['generatingFunctions'][scatterGraphRoundIdx.value],
  xBins: xScatterGraphAttribute.value['bins'],
  yLabel: yScatterGraphAttribute.value['label'],
  yFunction: yScatterGraphAttribute.value['generatingFunctions'][scatterGraphRoundIdx.value],
  yBins: yScatterGraphAttribute.value['bins']
}))

const scatterAverageHistogramSpecification = computed(() => ({
  histogramData: Array.from(filteredAllContestantStatSummariesByContestant.value.values()),
  scatterData: d3.filter(filteredAllContestantStatSummariesByContestant.value.values(), d => displayContestantIds.value.includes(d['Jometry Contestant Id'])),
  scatterLabelFunction: d => d['Contestant'],
  scatterColorFunction: d => color.value(d['Jometry Contestant Id']),
  title: xScatterGraphAttribute.value['label'] + ' vs ' + yScatterGraphAttribute.value['label'],
  xLabel: xScatterGraphAttribute.value['label'],
  xFunction: d => xScatterGraphAttribute.value['generatingFunctions'][scatterGraphRoundIdx.value](d['mean']),
  xBins: xScatterGraphAttribute.value['bins'],
  yLabel: yScatterGraphAttribute.value['label'],
  yFunction: d => yScatterGraphAttribute.value['generatingFunctions'][scatterGraphRoundIdx.value](d['mean']),
  yBins: yScatterGraphAttribute.value['bins'],
}))

const highlightHistogramSpecification = computed(() => ({
  histogramData: filteredAllContestantStatData.value,
  scatterData: d3.filter(filteredAllContestantStatData.value, d => displayContestantIds.value.includes(d['Jometry Contestant Id'])),
  scatterLabelFunction: d => d['Season'] + '-' + d['Game In Season'],
  scatterColorFunction: d => color.value(d['Jometry Contestant Id']),
  title: histogramGraphAttribute.value['label'],
  xLabel: histogramGraphAttribute.value['label'],
  xFunction: histogramGraphAttribute.value['generatingFunctions'][histogramGraphRoundIdx.value],
  xBins: histogramGraphAttribute.value['bins']
}))

const attemptBarChartSpecification = computed(() => ({
  data: filteredDisplayContestantStatSummaries.value,
  xCoreLabelFunction: d => d['Contestant'],
  xGroupLabels: ['Contestants'],
  yFunctionGroups: [[d => formatNumber(d['mean']['BuzC'],1,false), d => formatNumber(d['mean']['Buz'],1,false), d => formatNumber(d['mean']['Att'],1,false)]],
  colorFunction: d => color.value(d['Jometry Contestant Id']),
  sortFunction: (a,b) => d3.descending(a['mean']['BuzC'], b['mean']['BuzC']),
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
  yLabel: 'Buz$ -> BuzV -> AttV',
  title: 'Attempt Values'
}))

</script>

<template>
  <Header />
  <div class="body-section">
    <div v-if="displayContestantIds && filteredDisplayContestantStatSummaries">
      <h2>Leaders</h2>
      <CarouselTable 
          :panels="leaderboardTablePanels"
          :rowData="filteredDisplayContestantStatSummaries"
          :defaultSortFunction="d => displayContestantIds.indexOf(d['Jometry Contestant Id'])"
          />
    </div>
    <div>
      <h2>Attempts</h2>
      <StackValueBarChart v-bind="attemptBarChartSpecification" />
    </div>
    <div>
      <h2>Attempt Values</h2>
      <StackValueBarChart v-bind="attemptValueBarChartSpecification" />
    </div>
    <div v-if="filteredAllContestantStatData && displayContestantIds">
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
      <HighlightHistogram v-bind="highlightHistogramSpecification" />
    </div>
    <div v-if="filteredAllContestantStatData && displayContestantIds">
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
      <ScatterHistogram v-bind="scatterHistogramSpecification" />
      <ScatterHistogram v-bind="scatterAverageHistogramSpecification" />
    </div>
  </div>

</template>

<style scoped>

.body-section {
  margin: 2em 1em;
}



</style>
