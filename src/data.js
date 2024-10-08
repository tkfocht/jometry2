import * as d3 from 'd3'
import * as _ from 'lodash'
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
    return computed(() => _.isUndefined(reference.value) || _.isNull(reference.value) ? null : lambdaFunction(reference.value))
}

function computedIfRefHasValues(references, lambdaFunction) {
    return computed(() => references.some(r => _.isUndefined(r.value) || _.isNull(r.value)) ? null : lambdaFunction(...(references.map(r => r.value))))
}


//Contestant data
const contestantData = ref(null)
function loadContestantData() {
    loadDataReference(contestantData, '/csvs/jschema_contestant.csv')
}
const contestantDataById = computedIfRefHasValue(contestantData, cData => d3.index(cData, c => c.contestant_id))


//Game data
const gameData = ref(null)
function loadGameData() {
    loadDataReference(gameData, '/csvs/jschema_game.csv')
}
const gameDataById = computedIfRefHasValue(gameData, gData => d3.index(gData, g => g.game_id))


//Game stat data
const gameStatData = ref(null)
function loadGameStatData() {
    loadDataReference(gameStatData, '/csvs/jschema_stat_game.csv')
}
const gameStatDataById = computedIfRefHasValue(gameStatData, gData => d3.index(gData, g => g.game_id))

//Game contestant stat data
const gameContestantStatData = ref(null)
function loadGameContestantStatData() {
    loadDataReference(gameContestantStatData, '/csvs/jschema_stat_game_contestant.csv')
}
const gameContestantStatDataByGameId = computedIfRefHasValue(gameContestantStatData, gcsData => d3.group(gcsData, r => r.game_id))
const gameContestantStatDataByContestantId = computedIfRefHasValue(gameContestantStatData, gcsData => d3.group(gcsData, r => r.contestant_id))
const gameContestantStatDataByGameIdContestantId = computedIfRefHasValue(gameContestantStatData, gcsData => d3.index(gcsData, r => r.game_id, r => r.contestant_id))

//Game/round contestant stat data
const gameRoundContestantStatData = ref(null)
function loadGameRoundContestantStatData() {
    loadDataReference(gameRoundContestantStatData, '/csvs/jschema_stat_round_contestant.csv')
}
const gameRoundContestantStatDataByGameIdRoundIdContestantId = computedIfRefHasValue(
    gameRoundContestantStatData,
    gcsData => d3.index(gcsData, r => r.game_id, r => r.round_of_game, r => r.contestant_id))

//Daily Double summary data
const gameDailyDoubleData = ref(null)
function loadGameDailyDoubleData() {
    loadDataReference(gameDailyDoubleData, '/csvs/jschema_dd_summary.csv')
}
const gameDailyDoubleDataByGameId = computedIfRefHasValue(gameDailyDoubleData, gddData => d3.group(gddData, r => r.game_id))
const gameDailyDoubleDataByGameIdRound = computedIfRefHasValue(gameDailyDoubleData, gddData => d3.group(gddData, r => r.game_id, r => r.round_of_game))


export { computedIfRefHasValue, computedIfRefHasValues,
    loadContestantData, contestantData, contestantDataById,
    loadGameData, gameData, gameDataById,
    loadGameStatData, gameStatData, gameStatDataById,
    loadGameContestantStatData, gameContestantStatData, gameContestantStatDataByGameId, gameContestantStatDataByContestantId, gameContestantStatDataByGameIdContestantId,
    loadGameRoundContestantStatData, gameRoundContestantStatData, gameRoundContestantStatDataByGameIdRoundIdContestantId,
    loadGameDailyDoubleData, gameDailyDoubleData, gameDailyDoubleDataByGameId, gameDailyDoubleDataByGameIdRound
};