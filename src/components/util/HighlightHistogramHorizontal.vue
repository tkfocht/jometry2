<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import * as d3 from 'd3'
import ReactiveChart from './ReactiveChart.vue'

const props = defineProps({
  histogramData: Array,
  trendData: Array,
  trendColor: String,
  trendHoverTemplate: String,
  trendLabelFunction: Function,
  title: String,
  yLabel: String,
  yFunction: Function,
  yBins: Object
})

const traces = computed(() => {
  var t = []
  if (props.histogramData) {
    t.push({
      y: d3.map(props.histogramData, props.yFunction),
      autobiny: false,
      ybins: props.yBins,
      bingroup: 1,
      type: 'histogram',
      marker: {
        color: '#CCCCCC'
      },
      showlegend: false,
      xaxis: 'x1'
    })
  }
  if (props.trendData) {
    t.push({
      y: d3.map(props.trendData, props.yFunction),
      autobiny: false,
      ybins: props.yBins,
      bingroup: 1,
      type: 'histogram',
      marker: {
        color: props.trendColor,
        opacity: 0.3
      },
      showlegend: false,
      xaxis: 'x1'
    })

    t.push({
      x: d3.range(0, props.trendData.length, 1),
      y: d3.map(props.trendData, props.yFunction),
      autobiny: false,
      ybins: props.yBins,
      type: 'scatter',
      mode: 'lines+markers',
      hovertemplate: props.trendHoverTemplate,
      marker: {
        symbol: 'circle',
        size: 6,
        opacity: 1,
        line: {
            color: 'black',
            width: 0.5
        },
        color: props.trendColor
      },
      textcolor: 'black',
      textfont: {
          family: 'Roboto'
      },
      textposition: 'center bottom',
      text: d3.map(props.trendData, props.trendLabelFunction),
      showlegend: false,
      xaxis: 'x2'
    })
  }
  return t
})
const layout = computed(() => {
  var s = []

  return {
    bargap: 0.05,
    title: props.title,
    shapes: s,
    xaxis: {
      title: 'Count',
      fixedrange: true,
      autorangeoptions: {
        include: 3
      }
    },
    xaxis2: {
      fixedrange: true,
      overlaying: 'x',
      showgrid: false,
      zeroline: false,
      showline: false,
      showticklabels: false,
    },
    yaxis: {
      title: props.yLabel,
      fixedrange: true
    },
    barmode: props.trendData === undefined ? undefined : 'overlay' 
  }
})

</script>

<template>
  <ReactiveChart :chart="{ traces: traces, layout: layout }"/>
</template>