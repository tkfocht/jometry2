<script setup>
import { ref, computed } from 'vue'
import { playClassificationConfigurationData } from '@/configuration'
import { gameStatDataFromContestantStatData, dateFormat } from '@/util'
import * as d3 from 'd3'

const showGames = ref(false)
const props = defineProps({
  tocPeriodConfiguration: Object,
  playClassificationId: String,
  contestantStatData: Array
})

const playClassificationConfiguration = ref(playClassificationConfigurationData[props.playClassificationId])

const gameStatData = computed(() => {
    if (props.contestantStatData) {
        var data = gameStatDataFromContestantStatData(props.contestantStatData)
        data.sort(d => d[0]);
        data.reverse();
        return data;
    } else return props.contestantStatData;
})

function toggleGames() {
    showGames.value = !showGames.value
}

</script>

<template>
    <div class="toc-period-play-class">
        <div class="toc-period-play-class-header">
            <span class="toc-period-play-class-label">{{ playClassificationConfiguration.label }}</span>
            <span v-for="quicklink in playClassificationConfiguration.quicklinks" class="toc-period-play-class-item">
                <a class="toc-period-play-class-navigation-item"
                    :href="quicklink.link">{{ quicklink.label }}</a>
            </span>
            <span v-if="!playClassificationConfiguration.quicklinks" class="toc-period-play-class-item">
                <a class="toc-period-play-class-navigation-item"
                    :href="'/toc_period.html?toc_period=' + playClassificationConfiguration.id">Leaders</a>
            </span>
        </div>
        <div class="toc-period-play-class-controls">
            <span v-if="showGames" class="toc-period-play-class-control" @click="toggleGames">Hide Games</span>
            <span v-else class="toc-period-play-class-control" @click="toggleGames">Show Games</span>
        </div>
        <div v-if="showGames" class="toc-period-play-game-list">
            <table class="game-list">
                <tbody>
                    <tr v-for="game in gameStatData">
                        <td><a :href="'game.html?toc_period_id=' + playClassificationConfiguration.id + '&game_id=' + game.gameId">Season {{ game.season }} Game {{ game.gameInSeason }}</a></td>
                        <td>{{ dateFormat(game.date) }}</td>
                        <td>{{ game.contestants.join(' vs ') }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>

.toc-period-play-class {
    margin: 1em 1em;
}

.toc-period-play-class .toc-period-play-class-header span.toc-period-play-class-label {
    font-size: 24px;
}

span.toc-period-play-class-item {
    margin-left: 1em;
}

.toc-period-play-class .toc-period-play-game-list {
    margin: 0.5em 2em;
}
span.toc-period-play-class-control {
    cursor: pointer;
}

</style>