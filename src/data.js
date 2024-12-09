import * as d3 from 'd3'
import * as _ from 'lodash'
import { ref, computed } from 'vue'
import { jschemaCsvDataAccessor, subdomainIdentifier } from '@/util'

function dataPrefix() {
    if (subdomainIdentifier() == 'popculture') {
        return 'popculture/'
    }
    return ''
}

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
    loadDataReference(contestantData, `/csvs/${ dataPrefix() }jschema_contestant.csv`)
}
const contestantDataById = computedIfRefHasValue(contestantData, cData => d3.index(cData, c => c.contestant_id))

//Contestant data
const teamData = ref(null)
function loadTeamData() {
    loadDataReference(teamData, `/csvs/${ dataPrefix() }jschema_team.csv`)
}
const teamDataById = computedIfRefHasValue(teamData, cData => d3.index(cData, c => c.team_id))


//Game data
const gameData = ref(null)
function loadGameData() {
    loadDataReference(gameData, `/csvs/${ dataPrefix() }jschema_game.csv`)
}
const gameDataById = computedIfRefHasValue(gameData, gData => d3.index(gData, g => g.game_id))


//Game stat data
const gameStatData = ref(null)
function loadGameStatData() {
    loadDataReference(gameStatData, `/csvs/${ dataPrefix() }jschema_stat_game.csv`)
}
const gameStatDataById = computedIfRefHasValue(gameStatData, gData => d3.index(gData, g => g.game_id))

//Game contestant stat data
const gameContestantStatData = ref(null)
function loadGameContestantStatData() {
    loadDataReference(gameContestantStatData, `/csvs/${ dataPrefix() }jschema_stat_game_contestant.csv`)
}
const gameContestantStatDataByGameId = computedIfRefHasValue(gameContestantStatData, gcsData => d3.group(gcsData, r => r.game_id))
const gameContestantStatDataByContestantId = computedIfRefHasValue(gameContestantStatData, gcsData => d3.group(gcsData, r => r.contestant_id))
const gameContestantStatDataByGameIdContestantId = computedIfRefHasValue(gameContestantStatData, gcsData => d3.index(gcsData, r => r.game_id, r => r.contestant_id))

//Game/round contestant stat data
const gameRoundContestantStatData = ref(null)
function loadGameRoundContestantStatData() {
    loadDataReference(gameRoundContestantStatData, `/csvs/${ dataPrefix() }jschema_stat_round_contestant.csv`)
}
const gameRoundContestantStatDataByGameIdRoundIdContestantId = computedIfRefHasValue(
    gameRoundContestantStatData,
    gcsData => d3.index(gcsData, r => r.game_id, r => r.round_of_game, r => r.contestant_id))

//Game contestant stat data
const gameTeamStatData = ref(null)
function loadGameTeamStatData() {
    loadDataReference(gameTeamStatData, `/csvs/${ dataPrefix() }jschema_stat_game_team.csv`)
}
const gameTeamStatDataByGameId = computedIfRefHasValue(gameTeamStatData, gcsData => d3.group(gcsData, r => r.game_id))
const gameTeamStatDataByTeamId = computedIfRefHasValue(gameTeamStatData, gcsData => d3.group(gcsData, r => r.team_id))
const gameTeamStatDataByGameIdTeamId = computedIfRefHasValue(gameTeamStatData, gcsData => d3.index(gcsData, r => r.game_id, r => r.team_id))

//Game/round contestant stat data
const gameRoundTeamStatData = ref(null)
function loadGameRoundTeamStatData() {
    loadDataReference(gameRoundTeamStatData, `/csvs/${ dataPrefix() }jschema_stat_round_team.csv`)
}
const gameRoundTeamStatDataByGameIdRoundIdTeamId = computedIfRefHasValue(
    gameRoundTeamStatData,
    gcsData => d3.index(gcsData, r => r.game_id, r => r.round_of_game, r => r.team_id))

    
//Daily Double summary data
const gameDailyDoubleData = ref(null)
function loadGameDailyDoubleData() {
    loadDataReference(gameDailyDoubleData, `/csvs/${ dataPrefix() }jschema_dd_summary.csv`)
}
const gameDailyDoubleDataByGameId = computedIfRefHasValue(gameDailyDoubleData, gddData => d3.group(gddData, r => r.game_id))
const gameDailyDoubleDataByGameIdRound = computedIfRefHasValue(gameDailyDoubleData, gddData => d3.group(gddData, r => r.game_id, r => r.round_of_game))


const jschemaClueContestantStatData = ref(null)
function loadJschemaClueContestantStatData(gameId) {
    loadDataReference(jschemaClueContestantStatData, `/csvs/${ dataPrefix() }jschema_stat_clue_contestant/` + gameId + '.csv')
}
const jschemaClueContestantStatDataByRoundClueAndContestantId = computedIfRefHasValue(jschemaClueContestantStatData,
  ccsData => d3.index(ccsData, ccs => ccs.round_of_game, ccs => ccs.clue_of_round, ccs => ccs.contestant_id))

const jschemaClueTeamStatData = ref(null)
function loadJschemaClueTeamStatData(gameId) {
    loadDataReference(jschemaClueTeamStatData, `/csvs/${ dataPrefix() }jschema_stat_clue_team/` + gameId + '.csv')
}
const jschemaClueTeamStatDataByRoundClueAndTeamId = computedIfRefHasValue(jschemaClueTeamStatData,
    ccsData => d3.index(ccsData, ccs => ccs.round_of_game, ccs => ccs.clue_of_round, ccs => ccs.team_id))
   
const jschemaClueData = ref(null)
function loadJschemaClueData(gameId) {
    loadDataReference(jschemaClueData, `/csvs/${ dataPrefix() }jschema_clue/` + gameId + '.csv')
}
const jschemaClueByRoundRowColumn = computed(() => {
  if (!jschemaClueData.value) return null

  const fj_clue = jschemaClueData.value.filter(c => c.is_final_jeopardy)
  const game_rounds = fj_clue[0].round_of_game

  const clueData = jschemaClueData.value.filter(c => c.round_of_game <= game_rounds)
  return d3.index(clueData, c => c.round_of_game, c => c.row, c => c.column)
})

const jschemaResponseData = ref(null)
const jschemaTeamResponseData = ref(null)
function loadJschemaResponseData(gameId) {
    if (dataPrefix() === 'popculture/') {
        loadDataReference(jschemaResponseData, `/csvs/${ dataPrefix() }jschema_contestant_response/` + gameId + '.csv')
        loadDataReference(jschemaTeamResponseData, `/csvs/${ dataPrefix() }jschema_team_response/` + gameId + '.csv')
    } else {
        loadDataReference(jschemaResponseData, `/csvs/${ dataPrefix() }jschema_response/` + gameId + '.csv')
    }
}
const jschemaResponseByRoundClue = computed(() => {
  if (!jschemaResponseData.value) return null
  return d3.group(jschemaResponseData.value, c => c.round_of_game, c => c.clue_of_round)
})
const jschemaTeamResponseByRoundClue = computed(() => {
    if (!jschemaTeamResponseData.value) return null
    return d3.group(jschemaTeamResponseData.value, c => c.round_of_game, c => c.clue_of_round)
  })
  
export { computedIfRefHasValue, computedIfRefHasValues,
    loadContestantData, contestantData, contestantDataById,
    loadTeamData, teamData, teamDataById,
    loadGameData, gameData, gameDataById,
    loadGameStatData, gameStatData, gameStatDataById,
    loadGameContestantStatData, gameContestantStatData, gameContestantStatDataByGameId, gameContestantStatDataByContestantId, gameContestantStatDataByGameIdContestantId,
    loadGameRoundContestantStatData, gameRoundContestantStatData, gameRoundContestantStatDataByGameIdRoundIdContestantId,
    loadGameTeamStatData, gameTeamStatData, gameTeamStatDataByGameId, gameTeamStatDataByTeamId, gameTeamStatDataByGameIdTeamId,
    loadGameRoundTeamStatData, gameRoundTeamStatData, gameRoundTeamStatDataByGameIdRoundIdTeamId,
    loadGameDailyDoubleData, gameDailyDoubleData, gameDailyDoubleDataByGameId, gameDailyDoubleDataByGameIdRound,
    loadJschemaClueContestantStatData, jschemaClueContestantStatData, jschemaClueContestantStatDataByRoundClueAndContestantId,
    loadJschemaClueTeamStatData, jschemaClueTeamStatData, jschemaClueTeamStatDataByRoundClueAndTeamId,
    loadJschemaClueData, jschemaClueData, jschemaClueByRoundRowColumn,
    loadJschemaResponseData, jschemaResponseData, jschemaTeamResponseData, jschemaResponseByRoundClue, jschemaTeamResponseByRoundClue,
};