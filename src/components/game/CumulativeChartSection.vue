<script setup>
import { computed, ref } from 'vue'
import * as d3 from 'd3'
import * as _ from 'lodash'
import OptionDropdown from '@/components/util/OptionDropdown.vue'
import CumulativeLineChart from '@/components/util/CumulativeLineChart.vue'
import TrendLineChart from '@/components/util/TrendLineChart.vue'

const props = defineProps({
    jschemaClueCompetitorStatData: Array,
    jschemaClueData: Array,
    competitorIdExtractionFn: Function,
    gameHasAttemptData: Boolean,
    gameCompetitorIds: Array,
    competitorDataById: Object,
    competitorColorFn: Function,
})

const byClueLineChartData2 = computed(() => {
    if (!props.jschemaClueCompetitorStatData ||
        !props.jschemaClueData ||
        !props.gameCompetitorIds) {
            return undefined
    }

    var groupedCSData = d3.group(props.jschemaClueCompetitorStatData, c => c.round_of_game, c => c.clue_of_round, props.competitorIdExtractionFn)
    var indexedClueData = d3.index(props.jschemaClueData, c => c.round_of_game, c => c.clue_of_round)
    var traceData = []
    var rounds = [...groupedCSData.keys()].sort((a,b) => d3.ascending(a, b))
    for (var r of rounds) {
      var clue_numbers = [...groupedCSData.get(r).keys()].sort((a,b) => d3.ascending(a, b))
      for (var c of clue_numbers) {
        traceData.push({
          'clue_identifier': r + '-' + c,
          'contestant_data': props.gameCompetitorIds.map(cid => groupedCSData.get(r).get(c).get(cid)[0]),
          'clue_data': indexedClueData.get(r).get(c)
        })
      }
    }
    return traceData
  }
)

function defaultUndefinedForBuzzing(clueStatValue, clueInfo, defaultValue, forceUndefinedForNonbuzz = false) {
  if (forceUndefinedForNonbuzz) {
    if (clueInfo.is_daily_double === 1) return undefined
    if (clueInfo.is_final_jeopardy === 1) return undefined
  }
  if (clueStatValue !== undefined) return clueStatValue
  if (clueInfo.is_daily_double === 1) return undefined
  if (clueInfo.is_final_jeopardy === 1) return undefined
  return defaultValue
}

const gameProgressGraphTypeList = [
  'Cumulative',
  'Trend'
]
const gameProgressGraphTypeIdx = ref(0)
const cumulativeDataAttributesFullList = [
  {
    label: 'Score',
    generatingFunction: (c, cl) => defaultUndefinedForBuzzing(c.score, cl, 0, false),
    includeIfNoAttemptData: true
  },
  {
    label: 'Score (excluding FJ)',
    generatingFunction: (c, cl) => cl.is_final_jeopardy ? undefined : c.score,
    includeIfNoAttemptData: true
  },
  {
    label: 'Buzz Score',
    generatingFunction: (c, cl) => defaultUndefinedForBuzzing(c.buz_score, cl, 0, true),
    includeIfNoAttemptData: true
  },
  {
    label: 'Attempts',
    generatingFunction: (c, cl) => defaultUndefinedForBuzzing(c.att, cl, 0, true),
    includeIfNoAttemptData: false
  },
  {
    label: 'Attempted Clues',
    generatingFunction: (c, cl) => defaultUndefinedForBuzzing(c.att_clue, cl, 0, true),
    includeIfNoAttemptData: false
  },
  {
    label: 'Attempt %',
    generatingFunction: (c, cl) => defaultUndefinedForBuzzing(c.att_clue, cl, 0, true),
    generatingDenominatorFunction: (c, cl) => cl.is_daily_double === 1 || cl.is_final_jeopardy === 1 ? 0 : 1,
    includeIfNoAttemptData: false
  },
  {
    label: 'Attempt Value',
    generatingFunction: (c, cl) => defaultUndefinedForBuzzing(c.att_value, cl, 0, true),
    includeIfNoAttemptData: false
  },
  {
    label: 'Attempt Value %',
    generatingFunction: (c, cl) => defaultUndefinedForBuzzing(c.att_value, cl, 0, true),
    generatingDenominatorFunction: (c, cl) => cl.is_daily_double === 1 || cl.is_final_jeopardy === 1 ? 0 : cl.value,
    includeIfNoAttemptData: false
  },
  {
    label: 'Buzzes',
    generatingFunction: (c, cl) => defaultUndefinedForBuzzing(c.buz_value === 0 ? 0 : 1, cl, 0, true),
    includeIfNoAttemptData: true
  },
  {
    label: 'Buzz Value',
    generatingFunction: (c, cl) => defaultUndefinedForBuzzing(c.buz_value, cl, 0, true),
    includeIfNoAttemptData: true
  },
  {
    label: 'Buzz %',
    generatingFunction: (c, cl) => defaultUndefinedForBuzzing(c.buz_value === 0 ? 0 : 1, cl, 0, true),
    generatingDenominatorFunction: c => c.att,
    includeIfNoAttemptData: false
  },
  {
    label: 'Accuracy %',
    generatingFunction: c => c.buz_score > 0 ? 1 : 0,
    generatingDenominatorFunction: c => c.buz_score !== 0 ? 1 : 0,
    includeIfNoAttemptData: true
  },
  {
    label: 'Conversion %',
    generatingFunction: c => c.buz_score > 0 ? 1 : 0,
    generatingDenominatorFunction: c => c.att,
    includeIfNoAttemptData: false
  },
  {
    label: 'Buzz Value %',
    generatingFunction: c => c.buz_value,
    generatingDenominatorFunction: c => c.att_value,
    includeIfNoAttemptData: false
  },
  {
    label: 'Accuracy Value %',
    generatingFunction: c => c.buz_score,
    generatingDenominatorFunction: c => c.buz_value,
    includeIfNoAttemptData: true
  },
  {
    label: 'Conversion Value %',
    generatingFunction: c => c.buz_score,
    generatingDenominatorFunction: c => c.att_value,
    includeIfNoAttemptData: false
  },
  {
    label: 'Timing',
    generatingFunction: c => c.timing,
    includeIfNoAttemptData: false
  },
  {
    label: 'Timing Value',
    generatingFunction: c => c.timing_value,
    includeIfNoAttemptData: false
  },
  {
    label: 'Timing Score',
    generatingFunction: c => c.timing_score,
    includeIfNoAttemptData: false
  },
  {
    label: 'Solo',
    generatingFunction: c => c.solo,
    includeIfNoAttemptData: false
  },
  {
    label: 'Solo Value',
    generatingFunction: c => c.solo_value,
    includeIfNoAttemptData: false
  },
  {
    label: 'Solo Score',
    generatingFunction: c => c.solo_score,
    includeIfNoAttemptData: false
  }
]

const cumulativeDataAttributesList = computed(()  => {
  if (props.gameHasAttemptData) return cumulativeDataAttributesFullList
  return cumulativeDataAttributesFullList.filter(attr => attr.includeIfNoAttemptData)
})
const byClueLineChartAttributeIdx = ref(0)
const byClueLineChartAttribute = computed(() => cumulativeDataAttributesList.value[byClueLineChartAttributeIdx.value])


</script>

<template>
    {{ props.gameContestantIds }}
    <div class="section" v-if="cumulativeDataAttributesList">
        <div class="section-header">Game Progress</div>
        <div class="option-groups">
        <OptionDropdown
            :optionLabels="cumulativeDataAttributesList.map(attr => attr.label)"
            :selectionIndex="byClueLineChartAttributeIdx"
            @newSelectionIndex="(idx) => byClueLineChartAttributeIdx = idx"
        />
        <OptionDropdown
            :optionLabels="gameProgressGraphTypeList"
            :selectionIndex="gameProgressGraphTypeIdx"
            @newSelectionIndex="(idx) => gameProgressGraphTypeIdx = idx"
        />
        </div>
        <CumulativeLineChart v-if="props.gameCompetitorIds && byClueLineChartData2 && props.competitorDataById && gameProgressGraphTypeList[gameProgressGraphTypeIdx] === 'Cumulative'"
            :data="byClueLineChartData2"
            :xFunction="d => d['clue_identifier']"
            :yFunctions="_.range(gameCompetitorIds.length).map(idx => (d => byClueLineChartAttribute.generatingFunction(d.contestant_data[idx], d.clue_data)))"
            :yDenominatorFunctions="_.range(gameCompetitorIds.length).map(idx => byClueLineChartAttribute.generatingDenominatorFunction === undefined ? undefined : (d => byClueLineChartAttribute.generatingDenominatorFunction(d.contestant_data[idx], d.clue_data)))"
            :labels="props.gameCompetitorIds.map(cid => props.competitorDataById.get(cid).name)"
            :colors="props.gameCompetitorIds.map(cid => competitorColorFn(cid))"
            :title="'Cumulative ' + byClueLineChartAttribute.label"
            :xLabel="'Clues'"
            :yLabel="'Cumulative ' + byClueLineChartAttribute.label"
        />
        <TrendLineChart v-if="props.gameCompetitorIds && byClueLineChartData2 && props.competitorDataById && gameProgressGraphTypeList[gameProgressGraphTypeIdx] === 'Trend'"
            :data="byClueLineChartData2"
            :xFunction="d => d['clue_identifier']"
            :yFunctions="_.range(gameCompetitorIds.length).map(idx => (d => byClueLineChartAttribute.generatingFunction(d.contestant_data[idx], d.clue_data)))"
            :yDenominatorFunctions="_.range(gameCompetitorIds.length).map(idx => byClueLineChartAttribute.generatingDenominatorFunction === undefined ? undefined : (d => byClueLineChartAttribute.generatingDenominatorFunction(d.contestant_data[idx], d.clue_data)))"
            :labels="props.gameCompetitorIds.map(cid => props.competitorDataById.get(cid).name)"
            :colors="props.gameCompetitorIds.map(cid => competitorColorFn(cid))"
            :title="byClueLineChartAttribute.label + ' Trend'"
            :xLabel="'Clues'"
            :yLabel="byClueLineChartAttribute.label"
            :blur="2"
        />
    </div>
</template>