<script setup>
import * as d3 from 'd3'
import { subdomainIdentifier } from '@/util'

const props = defineProps({
  optionLabels: Array,
  selectedIndices: Array,
  label: String
})

function removeSelectionIndex(idxs, s_idx) {
    var idxs_copy = idxs.slice()
    const i_idx = idxs_copy.indexOf(s_idx)
    if (i_idx >= 0) {
        idxs_copy.splice(i_idx, 1)
    }
    return idxs_copy
}

function addSelectionIndex(idxs, s_idx) {
    var idxs_copy = idxs.slice()
    idxs_copy.push(s_idx)
    idxs_copy.sort(d3.ascending)
    return idxs_copy
}

</script>

<template>
    <div class="dropdown" :data-bs-theme="subdomainIdentifier()">
        <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" v-if="optionLabels">
            {{ label }}: {{ selectedIndices.length > 0 ? selectedIndices.length + ' selected' : 'Any' }}
        </button>
        <ul class="dropdown-menu">
            <li><a class="dropdown-item" @click="$emit('updateSelectionIndices', [])">Clear selections</a></li>
            <li v-for="(optionLabel, index) in optionLabels">
                <li v-if="selectedIndices.indexOf(index) >= 0"><a class="dropdown-item"
                    @click="$emit('updateSelectionIndices', removeSelectionIndex(selectedIndices, index))">
                    <input class="form-check-input" type="checkbox" value="" id="flexCheckChecked" checked>{{ optionLabel }}</a></li>
                <li v-else><a class="dropdown-item"
                    @click="$emit('updateSelectionIndices', addSelectionIndex(selectedIndices, index))">
                    <input class="form-check-input" type="checkbox" value="" id="flexCheckChecked">{{ optionLabel }}</a></li>
            </li>
        </ul>
    </div>
</template>

<style lang="scss" scoped>

.dropdown-menu {
    li {
        cursor: pointer;

        input.form-check-input {
            margin-right: 0.5em;
        }
    }
}

</style>