<script setup>
import { computed } from 'vue'
import * as d3 from 'd3'
import ReactiveChart from './ReactiveChart.vue'

const props = defineProps({
  histogramData: Array,
  lineData: Array,
  lineLabelFunction: Function,
  lineColorFunction: Function,
  title: String,
  xLabel: String,
  xFunction: Function,
  xBins: Object
})

const traces = computed(() => {
  var t = []
  if (props.histogramData) {
    t.push({
      x: d3.map(props.histogramData, props.xFunction),
      autobinx: false,
      xbins: props.xBins,
      bingroup: 1,
      type: 'histogram',
      marker: {
        color: '#CCCCCC'
      },
      showlegend: false
    })
  }
  return t
})
const layout = computed(() => {
  var s = []

  if (props.lineData) {
    for (var sd of props.lineData) {
      s.push({
        type: 'line',
        xref: 'x',
        x0: props.xFunction(sd),
        x1: props.xFunction(sd),
        yref: 'paper',
        y0: 0,
        y1: 1,
        line: {
          color: props.lineColorFunction(sd),
          width: 1.5
        },
        label: {
          text: props.lineLabelFunction(sd),
          font: { color: props.lineColorFunction(sd) },
          textposition: 'top center',
        }
      })
    }
  }
  
  return {
    bargap: 0.05,
    title: props.title,
    shapes: s,
    xaxis: { title: props.xLabel, fixedrange: true },
    yaxis: {
      title: 'Count',
      fixedrange: true,
      autorangeoptions: {
        include: 3
      }
    }
  }
})

</script>

<template>
  <ReactiveChart :chart="{ traces: traces, layout: layout }"/>
</template>