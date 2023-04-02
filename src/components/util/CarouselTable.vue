<script setup>
import { ref, computed, watch } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  panels: Array,
  rowData: Array,
  footerRowData: Array,
  defaultSortFunction: Function
})

const displayPanelIndex = ref(0)
const displayPanel = computed(() => {
    if (props.panels) return props.panels[displayPanelIndex.value]
    else return {}
})

const sortAttrFunction = ref(props.defaultSortFunction)
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

function setDisplayPanel(index) {
    displayPanelIndex.value = index
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
    <div class="table-display-control">
        <div v-for="(panel, idx) in props.panels"
            :class="'table-display-control-tab' + (displayPanelIndex === idx ? ' current' : '')"
            @click="setDisplayPanel(idx)">
            {{ panel.label }}
        </div>
    </div>
    <table v-if="displayPanel && props.rowData">
        <thead>
            <tr>
                <th v-for="attr in displayPanel.columns"
                    @click="setSortAttrFunction(attr.sortValueFunction ? attr.sortValueFunction : attr.attributeFunction)"
                    class="sort-control tooltip">
                    <span :style="attr.description ? 'text-decoration-line: underline; text-decoration-style: dotted;' : ''">{{ attr.label }}</span>
                    <span class="tooltiptext" v-if="attr.description">{{ attr.description }}</span>
                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="row in sortedRowData">
                <td v-for="attr in displayPanel.columns"><span v-html="attr.attributeFunction(row)"></span></td>
            </tr>
            <tr v-for="row in props.footerRowData">
                <td v-for="attr in displayPanel.columns"><span v-html="attr.attributeFunction(row)"></span></td>
            </tr>
        </tbody>
    </table>
    <div class="table-footer">
        Click on column headers to sort. Columns marked with dotted underlines can be hovered on for a description.
    </div>
</template>

<style scoped>

.table-display-control {
    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: flex-end;
}

.table-display-control-tab {
    padding: 0.25em 0.5em;
    cursor: pointer;
    border-width: 1px 1px 0 0;
    border-color: #999999;
    border-style: solid;
}

.table-display-control-tab:first-child {
    border-left-width: 1px;
}

.table-display-control-tab.current {
    background-color: #0072B2;
    color: white;
}

th.tooltip {
    position: relative;
}

th.tooltip span.tooltiptext {
  visibility: hidden;
  background-color: black;
  color: #fff;
  text-align: center;
  padding: 6px 6px;
  border-radius: 6px; 
  position: absolute;
  z-index: 1;
  left: 50%;
  bottom: 100%;
}

th.tooltip:hover span.tooltiptext {
  visibility: visible;
}

table {
    border-collapse: collapse;
    font-size: 13px;
    width: 100%;
}

table th, table td {
    padding: 2px 5px;
    border: 1px solid #999999;
}

table tr:hover td {
    background-color: #EEEEEE;
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

.table-footer {
    font-style: italic;
    font-size: 12px;
}

</style>