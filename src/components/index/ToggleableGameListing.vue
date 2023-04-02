<script setup>
import { ref } from 'vue'
import { dateFormat } from '@/util'
import * as d3 from 'd3'

const showGames = ref(false)
const props = defineProps({
  gameStatData: Array,
  dataSourceId: String
})

function toggleGames() {
    showGames.value = !showGames.value
}

</script>

<template>
    <div class="toc-period-play-class-controls">
        <span v-if="showGames" class="toc-period-play-class-control" @click="toggleGames">Hide Games</span>
        <span v-else class="toc-period-play-class-control" @click="toggleGames">Show Games</span>
    </div>
    <div v-if="showGames" class="toc-period-play-game-list">
        <table class="game-list">
            <tbody>
                <tr v-for="game in gameStatData">
                    <td><router-link :to="'game?data_source=' + dataSourceId + '&game_id=' + game.gameId">Season {{ game.season }} Game {{ game.gameInSeason }}</router-link></td>
                    <td>{{ dateFormat(game.date) }}</td>
                    <td>{{ d3.map(game.contestants, c => c.name).join(' vs ') }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>

span.toc-period-play-class-control {
    cursor: pointer;
}

</style>