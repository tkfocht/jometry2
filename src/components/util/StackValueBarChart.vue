<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import * as d3 from 'd3'
import ReactiveChart from './ReactiveChart.vue'

const props = defineProps({
  data: Array,
  xCoreLabelFunction: Function,
  xGroupLabels: Array,
  yFunctionGroups: Array,
  colorFunction: Function,
  sortFunction: Function,
  displayLimit: Number,
  title: String,
  yLabel: String
})

const sortedData = computed(() => {
  if (!props.data) return undefined
  if (!props.sortFunction) return props.data
  const sortedData = props.data.slice()
  sortedData.sort(props.sortFunction)
  if (props.displayLimit) return sortedData.slice(0, props.displayLimit)
  return sortedData
})

const traces = computed(() => {
  if (!sortedData.value) return undefined
  var traces = []

  for (const yFunctionGroupIdx in props.yFunctionGroups) {
    const yFunctionGroup = props.yFunctionGroups[yFunctionGroupIdx]
    for (const yFunctionIdx in yFunctionGroup) {
      var t = {
        x: d3.map(sortedData.value, props.xCoreLabelFunction),
        y: d3.map(sortedData.value, d => yFunctionGroup[yFunctionIdx](d) - (yFunctionIdx > 0 ? yFunctionGroup[yFunctionIdx-1](d) : 0)),
        text: d3.map(sortedData.value, yFunctionGroup[yFunctionIdx]),
        type: 'bar',
        marker: {
            color: d3.map(sortedData.value, props.colorFunction),
            line: {
                color: 'black',
                width: 1
            },
            opacity: 1.0 - (yFunctionIdx * (0.8 / yFunctionGroup.length))
        },
        xaxis: 'x' + (+yFunctionGroupIdx + 1),
        yaxis: 'y'
      }
      traces.push(t)
    }
  }
  return traces
})
const layout = computed(() => {
  if (!props.xGroupLabels) return undefined
  var l = {
    barmode: 'stack',
    showlegend: false,
    grid: {
      rows: 1,
      columns: props.xGroupLabels.length,
      subplots: d3.map(d3.range(1, props.xGroupLabels.length + 1), idx => 'x' + idx + 'y')
    },
    title: props.title,
    yaxis: { title: props.yLabel },
    xaxis: { automargin: true }
  }
  for (var idx in d3.range(1, props.xGroupLabels.length + 1)) {
    l['xaxis' + (+idx+1)] = {
      title: {
        text: props.xGroupLabels[idx],
        standoff: 10
      },
      type: 'category'
    }
  }
  return l
})


</script>

<template>
  <ReactiveChart :chart="{ traces: traces, layout: layout }"/>
</template>