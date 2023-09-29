<script setup>
import * as _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'

const props = defineProps({
  optionLabels: Array,
  selectionIndex: Number,
  idSuffix: String
})

const componentId = uuidv4()

</script>

<template>
    <div class="btn-group" role="group" aria-label="Select full game/round">
        <template v-for="(optionLabel, index) in props.optionLabels">
            <input 
                type="radio" class="btn-check" :name="'btnradio' + componentId"
                :id="'btnradio' + componentId + index" autocomplete="off"
                :checked="index === props.selectionIndex"
                @click="$emit('newSelectionIndex', index)"/>
            <label class="btn btn-outline-primary" :for="'btnradio' + componentId + index">{{ optionLabel }}</label>
        </template>
    </div>
</template>

<style scoped>

.btn-group {
    margin: 0.25em 0.25em;
}

.btn-group label {
    background-color: white;
}

</style>