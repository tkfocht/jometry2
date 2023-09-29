<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import * as _ from 'lodash'
import Plotly from 'plotly.js-dist'

const c = ref(null)

const props = defineProps({
  chart: Object
})

onMounted(() => {
    if (props.chart) Plotly.newPlot(c.value, props.chart.traces, props.chart.layout, {responsive: true})
    else Plotly.newPlot(c.value, [], {})
})

watch(() => props.chart, (newValue, oldValue) => {
    Plotly.react(c.value, newValue.traces, newValue.layout, newValue.config)
}, { deep: true })

</script>

<template>
    <div ref="c" class="graph ratio"></div>
</template>

<style lang="scss" scoped>
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins';

div.graph {
    width: min(95vw, 900px);
    --bs-aspect-ratio: 100%;
    @include media-breakpoint-up(sm) {
        --bs-aspect-ratio: calc(9 / 16 * 100%);
    }
}
</style>