<script setup>

const props = defineProps({
  optionLabels: Array,
  selectedIndices: Array,
  label: String
})

</script>

<template>
    <div class="dropdown">
        <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" v-if="optionLabels">
            {{ label }}: {{ selectedIndices.length > 0 ? selectedIndices.map(idx => optionLabels[idx]).join(', ') : 'Any' }}
        </button>
        <ul class="dropdown-menu">
            <li v-for="(optionLabel, index) in optionLabels">
                <li v-if="selectedIndices.indexOf(index) >= 0"><a class="dropdown-item" @click="$emit('removeSelectionIndex', index)">{{ optionLabel }}</a></li>
                <li v-else><a class="dropdown-item" @click="$emit('addSelectionIndex', index)">{{ optionLabel }}</a></li>
            </li>
        </ul>
    </div>
</template>