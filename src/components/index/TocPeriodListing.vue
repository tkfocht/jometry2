<script setup>
import TocPeriodPlayClassificationListing from './TocPeriodPlayClassificationListing.vue'

const props = defineProps({
  tocPeriodConfiguration: Object,
  contestantStatData: Object
})
</script>

<template>
    <div class="toc-period">
        <div class="toc-period-header"><span class="toc-period-play-class-label">{{ tocPeriodConfiguration.label }}</span></div>
        <TocPeriodPlayClassificationListing
            v-for="playClassificationConfiguration in tocPeriodConfiguration.playClassifications" 
            :tocPeriodConfiguration="tocPeriodConfiguration"
            :playClassificationConfiguration="playClassificationConfiguration" 
            :contestantStatData="contestantStatData[playClassificationConfiguration.id]" />
    </div>
</template>

<style scoped>

.toc-period {
    margin: 2em 0;
}

.toc-period .toc-period-header {
    font-size: 36px;
}

</style>