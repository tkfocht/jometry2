<script setup>
import { ref } from 'vue'
import { dateFormat } from '@/util'
import * as d3 from 'd3'

const showGames = ref(false)
const props = defineProps({
  gameData: Array,
  contestantData: Object
})

function toggleGames() {
    showGames.value = !showGames.value
}

</script>

<template>
    <div class="toc-period-play-class-controls small">
        <span v-if="showGames" class="toc-period-play-class-control" @click="toggleGames">Hide Games</span>
        <span v-else class="toc-period-play-class-control" @click="toggleGames">Show Games</span>
    </div>
    <div v-if="showGames" class="toc-period-play-game-list small">
        <table class="game-list">
            <tbody>
                <tr v-for="game in gameData">
                    <td><a :href="'game.html?game_id=' + game.game_id">Season {{ game.season_id }} Game {{ game.game_in_season }}</a></td>
                    <td>{{ dateFormat(game.airdate) }}</td>
                    <td>{{ d3.map([game.podium_1_contestant_id, game.podium_2_contestant_id, game.podium_3_contestant_id], c => contestantData.get(c).name).join(' vs ') }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>

span.toc-period-play-class-control {
    cursor: pointer;
}

table.game-list td {
    padding: 0.05rem 0.35rem;
}

table.game-list td:first-child {
    padding-left: 0;
}

</style>