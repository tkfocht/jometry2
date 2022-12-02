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
  xBins: Object,
  yLabel: String,
  yFunction: Function,
  yBins: Object,
  scatterMode: String
})

const traces = computed(() => {
  var t = []
  if (props.histogramData) {
    t.push({
      x: d3.map(props.histogramData, props.xFunction),
      y: d3.map(props.histogramData, props.yFunction),
      autobinx: false,
      xbins: props.xBins,
      ybins: props.yBins,
      type: 'histogram2d',
      colorscale : [['0' , '#FFFFFF00'],['1', '#999999FF']]
    })
  }
  if (props.scatterData) {
    t.push({
      x: d3.map(props.scatterData, props.xFunction),
      y: d3.map(props.scatterData, props.yFunction),
      mode: props.scatterMode ? props.scatterMode : 'markers+text',
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
      text: d3.map(props.scatterData, props.scatterLabelFunction)
    })
  }
  return t
})
const layout = computed(() => ({
  title: props.title, xaxis: { title: props.xLabel }, yaxis: { title: props.yLabel } }))


</script>

<template>
  <ReactiveChart :chart="{ traces: traces, layout: layout }"/>
</template>