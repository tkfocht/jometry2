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
            v-for="playClassificationId of tocPeriodConfiguration.playClassifications" 
            :tocPeriodConfiguration="tocPeriodConfiguration"
            :playClassificationId="playClassificationId" 
            :contestantStatData="contestantStatData[playClassificationId]" />
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