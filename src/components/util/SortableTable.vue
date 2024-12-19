<script setup>
import { ref, computed } from 'vue'
import * as _ from 'lodash'
import * as d3 from 'd3'
import { subdomainIdentifier } from '@/util'

const props = defineProps({
  columns: Array,
  rows: Array,
  footerRows: Array,
  initialSortColumnIndex: Number,
  initialSortDescending: Boolean
})

const nilsLast = (a, b) => {
    if (_.isNil(a) && _.isNil(b)) return NaN
    if (_.isNil(a)) return 1
    if (_.isNil(b)) return -1
    return NaN
}

const sortColumn = ref(props.initialSortColumnIndex ? props.initialSortColumnIndex : 0)
const sortDirectionDescending = ref(props.initialSortDescending ? props.initialSortDescending : false)
const sortedRows = computed(() => {
    var sortedData = props.rows.slice()
    if (sortedData.length <= 0) {
        return []
    }
    var sortDirection = sortDirectionDescending.value ? d3.descending : d3.ascending
    const referenceValue = sortedData[0][sortColumn.value].sortValue
    const cmp = (a,b) => {
        const nilsLastValue = nilsLast(a,b)
        if (nilsLastValue) return nilsLastValue

        if (Array.isArray(referenceValue)) {
            for (var idx in referenceValue) {
                if (sortDirection(a[sortColumn.value].sortValue[idx], b[sortColumn.value].sortValue[idx])) {
                    return sortDirection(a[sortColumn.value].sortValue[idx], b[sortColumn.value].sortValue[idx])
                }
            }
        }

        return sortDirection(a[sortColumn.value].sortValue, b[sortColumn.value].sortValue)
    }
    sortedData.sort(cmp)
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
    <div class="table-container" :data-bs-theme="subdomainIdentifier()">
        <table v-if="props.columns && sortedRows">
            <thead>
                <tr>
                    <th v-for="column, colIdx in columns">
                        <div class="column-header-container" @click="setSortColumn(colIdx)">
                            <div class="column-label">
                                {{ column.label }}
                            </div>
                            <div class="sort-control">
                                <div :class="'sort-ascend ' + (sortColumn === colIdx && !sortDirectionDescending ? 'active' : 'inactive')">&#9650;</div>
                                <div :class="'sort-descend ' + (sortColumn === colIdx && sortDirectionDescending ? 'active' : 'inactive')">&#9660;</div>
                            </div>
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in sortedRows">
                    <td v-for="cell in row">
                        <span v-html="cell.value"></span>
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr v-for="row in props.footerRows">
                    <td v-for="cell in row">
                        <span v-html="cell.value"></span>
                    </td>
                </tr>
            </tfoot>
        </table>
    </div>
</template>

<style lang="scss" scoped>
@import '@/assets/_variables.scss';
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';


.table-container {
    overflow-x: auto;
    overflow-y: visible;
}

th .column-header-container {
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
}

th .column-header-container .sort-control {
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    font-size: 60%;
    margin-left: 2px;
}

th .column-header-container .sort-control .sort-ascend {
    margin-bottom: -100%;
}

th .column-header-container .sort-control .inactive {
    color: #999999;
}

th .column-header-container .sort-control .active {
    color: #000000;
}


table {
    border-collapse: collapse;
    font-size: 0.8rem;
}

table th, table td {
    padding: 2px 5px;
    border-top: 1px solid #999999;
    border-bottom: 1px solid #999999;
}

table tr:first-child th, table tr:first-child td {
    border-top: 2px solid black;
}

table tr:last-child th, table tr:last-child td {
    border-bottom: 2px solid black;
}

table th {
    background-color: var(--bs-secondary);
}

table th:hover {
    background-color: #AAAAAA;
}

table tbody tr:nth-child(even) td {
    background: #EEEEEE;
}

table tbody tr:nth-child(odd) td {
    background: #FFFFFF;
}

table tbody tr:hover td {
    background-color: #CCCCCC;
}

table tfoot tr:nth-child(even) td {
    background: #EEEEEE;
}

table tfoot tr:nth-child(odd) td {
    background: #FFFFFF;
}

table tfoot tr:hover td {
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

table th {
    cursor: pointer;
}

table th.sort-control {
    cursor: pointer;
}

</style>