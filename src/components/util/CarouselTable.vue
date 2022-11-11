<script setup>
import { ref, computed, watch } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  panels: Array,
  rowData: Array
})

const displayPanelIndex = ref(0)
const displayPanel = computed(() => {
    if (props.panels) return props.panels[displayPanelIndex.value]
    else return {}
})

const sortAttrFunction = ref(d => d['Podium'])
const sortDirectionDescending = ref(false)
const sortedRowData = computed(() => {
    var sortedData = props.rowData.slice()
    var sortDirection = sortDirectionDescending.value ? d3.descending : d3.ascending
    sortedData.sort((a,b) => sortDirection(sortAttrFunction.value(a), sortAttrFunction.value(b)))
    return sortedData
})

function setSortAttrFunction(newSortAttrFunction) {
    if (sortAttrFunction.value === newSortAttrFunction) {
        sortDirectionDescending.value = !sortDirectionDescending.value
    } else {
        sortAttrFunction.value = newSortAttrFunction
        sortDirectionDescending.value = true
    }
}

function displayPanelLeft() {
    displayPanelIndex.value = displayPanelIndex.value - 1
    if (displayPanelIndex.value < 0) displayPanelIndex.value = props.panels.length - 1
}

function displayPanelRight() {
    displayPanelIndex.value = displayPanelIndex.value + 1
    if (displayPanelIndex.value >= props.panels.length) displayPanelIndex.value = 0
}

</script>

<template>
    <table v-if="displayPanel && props.rowData">
        <thead>
            <tr>
                <th :colspan="displayPanel.columns.length">
                    <span class="control-container">
                        <span v-if="props.panels.length > 1" @click="displayPanelLeft" class="control">&#9664;</span>
                        <span style="flex-grow: 1;">{{ displayPanel.label }}</span>
                        <span v-if="props.panels.length > 1" @click="displayPanelRight" class="control">&#9654;</span>
                    </span>
                </th>
            </tr>
            <tr>
                <th v-for="attr in displayPanel.columns" @click="setSortAttrFunction(attr.sortValueFunction ? attr.sortValueFunction : attr.attributeFunction)" class="sort-control">{{ attr.label }}</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="row in sortedRowData">
                <td v-for="attr in displayPanel.columns"><span v-html="attr.attributeFunction(row)"></span></td>
            </tr>
        </tbody>
    </table>
</template>

<style scoped>

table {
    border-collapse: collapse;
    font-size: 13px;
}

table th, table td {
    padding: 2px 8px;
    border: 1px solid #999999;
}

table td {
    text-align: right;
}

table td:first-child {
    text-align: left;
    width: 20%;
}

table th span.control-container {
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
    align-content: center;
    justify-content: space-between;
}

table th span.control {
    cursor: pointer;
}

table th.sort-control {
    cursor: pointer;
}

</style>