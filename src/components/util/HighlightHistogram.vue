<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import * as d3 from 'd3'
import ReactiveChart from './ReactiveChart.vue'

const props = defineProps({
  histogramData: Array,
  scatterData: Array,
  scatterLabelFunction: Function,
  scatterColorFunction: Function,
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
      type: 'histogram',
      marker: {
        color: '#CCCCCC'
      },
      showlegend: false
    })
  }
  if (props.scatterData) {
    t.push({
      x: d3.map(props.scatterData, props.xFunction),
      y: d3.range(1, 2 * (props.scatterData.length + 1), 2),
      mode: 'markers+text',
      marker: {
          symbol: 'circle',
          size: 6,
          opacity: 1,
          line: {
              color: 'black',
              width: 0.5
          },
          color: d3.map(props.scatterData, props.scatterColorFunction),
      },
      type: 'scatter',
      textcolor: d3.map(props.scatterData, props.scatterColorFunction),
      textfont: {
          family: 'Roboto'
      },
      textposition: 'center right',
      text: d3.map(props.scatterData, props.scatterLabelFunction),
      showlegend: false
    })
  }
  return t
})
const layout = computed(() => ({
  bargap: 0.05,
  title: props.title, xaxis: { title: props.xLabel }, yaxis: { title: 'Count' } }))


</script>

<template>
  <ReactiveChart :chart="{ traces: traces, layout: layout }"/>
</template>