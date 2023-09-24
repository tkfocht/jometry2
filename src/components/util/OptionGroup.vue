<script setup>
import { ref, computed, watch } from 'vue'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as data from '@/data'

const props = defineProps({
  optionLabels: Array,
  selectionIndex: Number
})

</script>

<template>
    <div class="option-group-container" v-if="props.optionLabels && !_.isNil(props.selectionIndex)">
        <div
            v-for="(optionLabel, index) in props.optionLabels"
            :class="index === props.selectionIndex ? 'selected' : ''"
            @click="$emit('newSelectionIndex', index)"
        >
            {{ optionLabel }}
        </div>
    </div>
</template>

<style scoped>

div.option-group-container {
    display: flex;
    flex-flow: row nowrap;
}

div.option-group-container > div {
    padding: 2px 7px;
    border-top: 1px solid gray;
    border-bottom: 1px solid gray;
    border-left: 1px solid gray;
    cursor: pointer;
}

div.option-group-container > div:last-child {
    border-right: 1px solid gray;
}

div.option-group-container > div.selected {
    background-color: #0072B2;
    color: white;
}

div.option-group-container > div {
    background-color: white;
    color: black;
}

</style>