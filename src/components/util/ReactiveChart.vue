<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import * as _ from 'lodash'
import Plotly from 'plotly.js-dist'

const c = ref(null)

const props = defineProps({
  chart: Object
})

const screenWidth = ref(0)
const screenHeight = ref(0)
const onResize = function() {
    screenWidth.value = window.innerWidth
    screenHeight.value = window.innerHeight
}
const debouncedOnResize = _.debounce(onResize, 100, {leading: false, trailing: true})
window.addEventListener("resize", debouncedOnResize);

onMounted(() => {
    screenWidth.value = window.innerWidth

    if (props.chart) Plotly.newPlot(c.value, props.chart.traces, props.chart.layout)
    else Plotly.newPlot(c.value, [], {})
})

watch(() => props.chart, (newValue, oldValue) => {
    Plotly.react(c.value, newValue.traces, newValue.layout)
}, { deep: true })

watch(() => screenWidth, (newValue, oldValue) => {
    Plotly.newPlot(c.value, props.chart.traces, props.chart.layout)
}, { deep: true })
watch(() => screenHeight, (newValue, oldValue) => {
    Plotly.newPlot(c.value, props.chart.traces, props.chart.layout)
}, { deep: true })

</script>

<template>
    <div ref="c" class="graph"></div>
</template>

<style scoped>
div.graph {
    width: min(95vw, 900px);
    height: max(min(95vh, 450px), 200px);
}
</style>