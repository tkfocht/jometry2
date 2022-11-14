<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Plotly from 'plotly.js-dist'

const c = ref(null)

const props = defineProps({
  chart: Object
})

onMounted(() => {
    Plotly.newPlot(c.value, props.chart.traces, props.chart.layout)
})

watch(() => props.chart, (newValue, oldValue) => {
    Plotly.react(c.value, newValue.traces, newValue.layout)
}, { deep: true })

</script>

<template>
    <div ref="c" class="graph"></div>
</template>

<style scoped>
div.graph {
    max-width: 700px;
}
</style>