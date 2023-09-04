<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import * as d3 from 'd3'
import LineChart from './LineChart.vue'
import { update } from 'plotly.js-dist';

const props = defineProps({
  data: Array,
  xFunction: Function,
  yFunctions: Array,
  labels: Array,
  colors: Array,
  title: String,
  xLabel: String,
  yLabel: String
})

const cumulativeData = computed(() => {
  var updatedData = props.data.map(d => ({
    x: props.xFunction(d),
    y: []
  }))
  for (var yFunction of props.yFunctions) {
    var yData = props.data.map(d => yFunction(d))
    var sum = 0
    var idx = 0
    for (var yDatum of yData) {
      if (yDatum) {
        sum += yDatum
      }
      updatedData[idx].y.push(sum)
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
  />
</template>