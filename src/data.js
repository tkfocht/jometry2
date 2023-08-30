import * as d3 from 'd3'
import { ref, computed } from 'vue'
import { jschemaCsvDataAccessor } from '@/util'

function loadDataReference(reference, csvUrl) {
    async function fetchData() {
        const retrievalResult = await d3.csv(csvUrl, jschemaCsvDataAccessor)
        reference.value = retrievalResult
    }
    fetchData()
    return reference
}

function computedIfRefHasValue(reference, lambdaFunction) {
    return computed(() => reference.value ? lambdaFunction(reference.value) : null)
}

function computedIfRefHasValues(references, lambdaFunction) {
    return computed(() => references.every(r => r.value) ? lambdaFunction(...(references.map(r => r.value))) : null)
}


//Contestant data
const contestantData = ref(null)
function loadContestantData() {
    loadDataReference(contestantData, 'https://j-ometry.com/csvs/jschema_contestant.csv')
}
const contestantDataById = computedIfRefHasValue(contestantData, cData => d3.index(cData, c => c.contestant_id))


//Game data
const gameData = ref(null)
function loadGameData() {
    loadDataReference(gameData, 'https://j-ometry.com/csvs/jschema_game.csv')
}
const gameDataById = computedIfRefHasValue(gameData, gData => d3.index(gData, g => g.game_id))


//Game stat data
const gameStatData = ref(null)
function loadGameStatData() {
    loadDataReference(gameStatData, 'https://j-ometry.com/csvs/jschema_stat_game.csv')
}
const gameStatDataById = computedIfRefHasValue(gameStatData, gData => d3.index(gData, g => g.game_id))

//Game contestant stat data
const gameContestantStatData = ref(null)
function loadGameContestantStatData() {
    loadDataReference(gameContestantStatData, 'https://j-ometry.com/csvs/jschema_stat_game_contestant.csv')
}
const gameContestantStatDataByGameId = computedIfRefHasValue(gameContestantStatData, gcsData => d3.group(gcsData, r => r.game_id))
const gameContestantStatDataByContestantId = computedIfRefHasValue(gameContestantStatData, gcsData => d3.group(gcsData, r => r.contestant_id))
const gameContestantStatDataByGameIdContestantId = computedIfRefHasValue(gameContestantStatData, gcsData => d3.index(gcsData, r => r.game_id, r => r.contestant_id))

//Game/round contestant stat data
const gameRoundContestantStatData = ref(null)
function loadGameRoundContestantStatData() {
    loadDataReference(gameRoundContestantStatData, 'https://j-ometry.com/csvs/jschema_stat_round_contestant.csv')
}
const gameRoundContestantStatDataByGameIdRoundIdContestantId = computedIfRefHasValue(
    gameRoundContestantStatData,
    gcsData => d3.index(gcsData, r => r.game_id, r => r.round_of_game, r => r.contestant_id))


export { computedIfRefHasValue, computedIfRefHasValues,
    loadContestantData, contestantData, contestantDataById,
    loadGameData, gameData, gameDataById,
    loadGameStatData, gameStatData, gameStatDataById,
    loadGameContestantStatData, gameContestantStatData, gameContestantStatDataByGameId, gameContestantStatDataByContestantId, gameContestantStatDataByGameIdContestantId,
    loadGameRoundContestantStatData, gameRoundContestantStatData, gameRoundContestantStatDataByGameIdRoundIdContestantId
};