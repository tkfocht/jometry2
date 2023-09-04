<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import * as d3 from 'd3'
import ReactiveChart from './ReactiveChart.vue'

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

const traces = computed(() => {
  if (!props.data) return undefined
  var traces = []

  for (const yFunctionIdx in props.yFunctions) {
    const yFunction = props.yFunctions[yFunctionIdx]
    var t = {
      x: d3.map(props.data, props.xFunction),
      y: d3.map(props.data, yFunction),
      text: d3.map(props.data, yFunction),
      type: 'scatter',
      mode: 'lines',
      marker: {},
      name: props.labels[yFunctionIdx],
      line: {
          color: props.colors[yFunctionIdx]
      }
    }
    traces.push(t)
  }
  return traces
})
const layout = computed(() => {
  var l = {
    showlegend: true,
    title: props.title,
    xaxis: { title: props.xLabel, type: 'category', automargin: true, fixedrange: true },
    yaxis: { title: props.yLabel, automargin: true, fixedrange: true }
  }
  return l
})


</script>

<template>
  <ReactiveChart :chart="{ traces: traces, layout: layout }"/>
</template>