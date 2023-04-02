<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import * as d3 from 'd3'
import ReactiveChart from './ReactiveChart.vue'

const props = defineProps({
  orderedKeys: Array,
  dataByKey: Object,
  title: String,
  idColorFunction: Function,
  xLabel: Function,
  yLabel: Function,
  yFunction: Function,
  additionalBoxes: Array
})

const traces = computed(() => {
  var t = []
  if (props.orderedKeys && props.dataByKey) {
    for (const key of props.orderedKeys) {
      const color = props.idColorFunction(key)
      const trace = {
        type: 'box',
        y: d3.map(props.dataByKey.get(key), props.yFunction),
        name: props.xLabel(props.dataByKey.get(key)),
        text: d3.map(props.dataByKey.get(key), props.yLabel),
        boxpoints: 'all',
        jitter: 0.3,
        whiskerwidth: 0.2,
        marker: {
            size: 4,
            color: color,
            line: {
              color: 'black',
              width: 1
            }
        },
        fillcolor: color,
        line: {
            width: 1.5,
            color: 'black'
        }
      }
      t.push(trace)
    }
  }
  if (props.additionalBoxes && props.dataByKey) {
    for (const additionalBox of props.additionalBoxes) {
      const boxData = d3.filter(d3.merge(props.dataByKey.values()), additionalBox.filter)
      const trace = {
        type: 'box',
        y: d3.map(boxData, props.yFunction),
        name: additionalBox.label,
        text: d3.map(boxData, additionalBox.yLabel),
        boxpoints: 'all',
        jitter: 0.3,
        whiskerwidth: 0.2,
        marker: {
            size: 4,
            color: additionalBox['color'],
        },
        fillcolor: additionalBox['color'],
        line: {
            width: 1.5,
            color: 'black'
        }
      }
      t.push(trace)
    }
  }
  return t
})
const layout = computed(() => ({
  title: props.title,
  yaxis: {
      autorange: true,
      showgrid: true,
      zeroline: true,
      gridwidth: 1,
      zerolinewidth: 2,
      zeroline: true,
      title: props.title
  },
  margin: {
      l: 60,
      r: 30,
      b: 80,
      t: 100
  },
  showlegend: false
}))


</script>

<template>
  <ReactiveChart :chart="{ traces: traces, layout: layout }"/>
</template>