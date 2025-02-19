<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
})

const legendY = ref(-0.25)

const updateLegendPosition = () => {
  const smBreakpoint = parseInt(getComputedStyle(document.body).getPropertyValue('--bs-breakpoint-sm'))
  if (window.innerWidth < smBreakpoint) {
    legendY.value = -0.4
  } else {
    legendY.value = -0.25
  }
}

onMounted(() => {
  updateLegendPosition()
  window.addEventListener('resize', updateLegendPosition)
  window.addEventListener('orientationchange', updateLegendPosition)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateLegendPosition)
  window.removeEventListener('orientationchange', updateLegendPosition)
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
      orientation: 'h',
      y: legendY.value,
      x: 0.5,
      xanchor: 'center',
      yanchor: 'top',
      bgcolor: 'rgba(0,0,0,0)'
    }
  }
  return l
})


</script>

<template>
  <ReactiveChart :chart="{ traces: traces, layout: layout }"/>
</template>