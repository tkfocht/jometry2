<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import * as d3 from 'd3'
import LineChart from './LineChart.vue'
import { update } from 'plotly.js-dist';

const props = defineProps({
  data: Array,
  xFunction: Function,
  yFunctions: Array,
  yDenominatorFunctions: Array,
  labels: Array,
  colors: Array,
  title: String,
  xLabel: String,
  yLabel: String,
  legendPosition: {
    type: String,
    default: 'right',
    validator: (value) => ['right', 'top'].includes(value)
  }
})

const cumulativeData = computed(() => {
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
      yDenominatorData.fill(0)
      yDenominatorData[0] = 1
    } else {
      yDenominatorData = props.data.map(d => yFunctionSet[1](d))
    }
    var sum = 0
    var denominatorSum = 0
    var idx = 0
    for (var yDatumPair of d3.zip(yData, yDenominatorData)) {
      if (yDatumPair[0]) {
        sum += yDatumPair[0]
      }
      if (yDatumPair[1]) {
        denominatorSum += yDatumPair[1]
      }
      updatedData[idx].y.push(sum / denominatorSum)
      idx += 1
    }
  }
  return updatedData
})
</script>

<template>
  <LineChart
    :data="cumulativeData"
    :xFunction="d => d.x"
    :yFunctions="[...Array(props.yFunctions.length).keys()].map(idx => (d => d.y[idx]))"
    :labels="props.labels"
    :colors="props.colors"
    :title="props.title"
    :xLabel="props.xLabel"
    :yLabel="props.yLabel"
    :legendPosition="props.legendPosition"
  />
</template>