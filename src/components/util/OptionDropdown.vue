<script setup>
import * as _ from 'lodash'

const props = defineProps({
  optionLabels: Array,
  selectionIndex: Number
})

</script>

<template>
    <div class="dropdown">
    <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" v-if="optionLabels">
        {{ optionLabels[selectionIndex] }}
    </button>
    <ul class="dropdown-menu">
        <li v-for="(optionLabel, index) in optionLabels">
            <li><a class="dropdown-item" @click="$emit('newSelectionIndex', index)">{{ optionLabel }}</a></li>
        </li>
    </ul>
    </div>
</template>

<style scoped>

a.dropdown-item {
    cursor: pointer;
}

</style>