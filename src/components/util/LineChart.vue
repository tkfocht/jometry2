<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import * as d3 from 'd3'
import ReactiveChart from './ReactiveChart.vue'
import * as _ from 'lodash'
const props = defineProps({
  data: Array,
  xFunction: Function,
  yFunctions: Array,
  labels: Array,
  colors: Array,
  title: String,
  xLabel: String,
  yLabel: String,
  traceProperties: Object,
  legendPosition: {
    type: String,
    default: 'right',
    validator: (value) => ['right', 'bottom'].includes(value)
  }
})

const traces = computed(() => {
  if (!props.data) return undefined
  var traces = []

  for (const yFunctionIdx in props.yFunctions) {
    const yFunction = props.yFunctions[yFunctionIdx]
    var traceProperties = props.traceProperties === undefined ? {} : structuredClone(props.traceProperties)
    var defaultTraceProperties = {
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
    var t = _.defaultsDeep(traceProperties, defaultTraceProperties)
    traces.push(t)
  }
  return traces
})
const layout = computed(() => {
  var l = {
    showlegend: true,
    title: {
      text: props.title,
      y: 0.85,
      yanchor: 'bottom',
    },
    xaxis: { title: props.xLabel, type: 'category', automargin: true, fixedrange: true },
    yaxis: { title: props.yLabel, automargin: true, fixedrange: true },
    legend: {
      orientation: props.legendPosition === 'bottom' ? 'h' : 'v',
      y: props.legendPosition === 'bottom' ? -0.5 : 0.95,
      x: props.legendPosition === 'bottom' ? 0.5 : 1.05,
      xanchor: props.legendPosition === 'bottom' ? 'center' : 'left',
      yanchor: props.legendPosition === 'bottom' ? 'top' : 'top',
      bgcolor: 'rgba(0,0,0,0)'
    }
  }
  return l
})


</script>

<template>
  <ReactiveChart :chart="{ traces: traces, layout: layout }"/>
</template>