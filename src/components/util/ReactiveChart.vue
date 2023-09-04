<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import * as _ from 'lodash'
import Plotly from 'plotly.js-dist'

const c = ref(null)

const props = defineProps({
  chart: Object
})

const screenWidth = ref(0)
const onResize = function() {
    screenWidth.value = window.innerWidth
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

</script>

<template>
    <div ref="c" class="graph"></div>
</template>

<style scoped>
div.graph {
    max-width: min(95vw, 900px);
}
</style>