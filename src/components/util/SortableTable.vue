<script setup>
import { ref, computed, watch } from 'vue'
import * as d3 from 'd3'
import * as data from '@/data'

const props = defineProps({
  columns: Array,
  rows: Array,
  footerRows: Array
})

const sortColumn = ref(0)
const sortDirectionDescending = ref(false)
const sortedRows = data.computedIfRefHasValue(props.rows, (rows) => {
    var sortedData = rows.slice()
    var sortDirection = sortDirectionDescending.value ? d3.descending : d3.ascending
    sortedData.sort((a,b) => sortDirection(a[sortColumn.value].sortValue, b[sortColumn.value].sortValue))
    return sortedData
})

function setSortColumn(newSortColumn) {
    if (sortColumn.value === newSortColumn) {
        sortDirectionDescending.value = !sortDirectionDescending.value
    } else {
        sortColumn.value = newSortColumn
        sortDirectionDescending.value = true
    }
}

</script>

<template>
    <div class="table-container">
        <table v-if="props.columns && props.rows">
            <thead>
                <tr>
                    <th v-for="column in columns">
                        {{ column.label }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in rows">
                    <td v-for="cell in row">
                        <span v-html="cell.value"></span>
                    </td>
                </tr>
            </tbody>
            <tfoot>

            </tfoot>
        </table>
    </div>
</template>

<style scoped>

span.hover-instructions {
    visibility: hidden;
}

@media (hover: hover) {
    span.tooltip-available {
        text-decoration-line: underline;
        text-decoration-style: dotted;
    }

    span.hover-instructions {
        visibility: visible;
    }
}

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

.table-container {
    overflow-x: auto;
    overflow-y: hidden;
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
  left: 0%;
  top: 100%;
  width: 15em;
}

th.tooltip:hover span.tooltiptext {
  visibility: visible;
}

table {
    border-collapse: collapse;
    font-size: 13px;
}

table th, table td {
    padding: 2px 5px;
    border-top: 1px solid #999999;
    border-bottom: 1px solid #999999;
}

table th:hover {
    background-color: #999999;
}

table thead tr th {
    background: #CCCCCC;
}

table tbody tr:nth-child(even) td {
    background: #EEEEEE;
}

table tbody tr:nth-child(odd) td {
    background: #FFFFFF;
}

table tr:hover td {
    background-color: #CCCCCC;
}

table td {
    text-align: center;
}

table th:first-child, table td:first-child {
    text-align: left;
    position: sticky;
    left: 0px;
    z-index: 1;
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