<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { movingAverageOfLast } from '@/util'
import * as d3 from 'd3'
import LineChart from './LineChart.vue'
import { update } from 'plotly.js-dist';
import * as _ from 'lodash'

const props = defineProps({
  data: Array,
  xFunction: Function,
  yFunctions: Array,
  yDenominatorFunctions: Array,
  labels: Array,
  colors: Array,
  title: String,
  xLabel: String,
  yLabel: String
})

const rollingData = computed(() => {
  var updatedData = props.data.map(d => ({
    x: props.xFunction(d),
    y: []
  }))
  var yFunctionSets = d3.zip(props.yFunctions, props.yDenominatorFunctions)
  for (var yFunctionSet of yFunctionSets) {
    var yData = props.data.map(d => yFunctionSet[0](d))
    var yDenominatorData = []
    if (yFunctionSet[1] === undefined) {
      yDenominatorData = new Array(yData.length)
      yDenominatorData.fill(1)
    } else {
      yDenominatorData = props.data.map(d => yFunctionSet[1](d))
    }
    var combinedYData = d3.zip(yData, yDenominatorData).map(p => p[0] / p[1])
    var nanIndices = []
    for (var nanIdx = 0; nanIdx < combinedYData.length; ++nanIdx) {
      if (!(_.isFinite(combinedYData[nanIdx]))) {
        nanIndices.push(nanIdx)
      }
    }
    for (var nanIdx of nanIndices.toReversed()) {
      yData.splice(nanIdx, 1)
      yDenominatorData.splice(nanIdx, 1)
    }
    yData = d3.blur(yData, 2)
    yDenominatorData = d3.blur(yDenominatorData, 2)
    for (var nanIdx of nanIndices) {
      yData.splice(nanIdx, 0, NaN)
      yDenominatorData.splice(nanIdx, 0, NaN)
    }

    var idx = 0
    for (var combinedYDatum of d3.zip(yData, yDenominatorData)) {
      updatedData[idx].y.push(combinedYDatum[0] / combinedYDatum[1])
      idx += 1
    }
  }
  return updatedData
})
</script>

<template>
  <LineChart
    :data="rollingData"
    :xFunction="d => d.x"
    :yFunctions="[...Array(props.yFunctions.length).keys()].map(idx => (d => d.y[idx]))"
    :labels="props.labels"
    :colors="props.colors"
    :title="props.title"
    :xLabel="props.xLabel"
    :yLabel="props.yLabel"
    :trace-properties="{ connectgaps: true }"
  />
</template>