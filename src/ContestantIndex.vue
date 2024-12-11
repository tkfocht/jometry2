<script setup>
import * as d3 from 'd3'
import * as data from '@/data'
import { filterValues, isPopCulture, subdomainIdentifier, contestantIdToTeamIdMapFromGameData } from '@/util'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'


const displayAsTeamListing = window.location.pathname === '/team_index.html'

data.loadContestantData()
data.loadGameContestantStatData()
if (isPopCulture()) {
  data.loadTeamData()
  data.loadGameData()
}
if (isPopCulture() && displayAsTeamListing) {
  data.loadGameTeamStatData()
}

const gameContestantStatDataByContestantId = data.gameContestantStatDataByContestantId
const gameTeamStatDataByTeamId = data.gameTeamStatDataByTeamId

const contestantsByName = data.computedIfRefHasValue(data.contestantData, cData => d3.group(cData, c => c.name))
const duplicateContestants = data.computedIfRefHasValue(contestantsByName, cData => {
  console.log(cData)
  cData = filterValues(cData, v => v.length > 1)
  return cData
})

const teamsByName = data.computedIfRefHasValue(data.teamData, cData => d3.group(cData, c => c.name))
const duplicateTeams = data.computedIfRefHasValue(teamsByName, cData => {
  console.log(cData)
  cData = filterValues(cData, v => v.length > 1)
  return cData
})

const contestantData = data.computedIfRefHasValues(
  [data.contestantData, gameContestantStatDataByContestantId],
  (cData, gcsData) => {
    cData = cData.filter(c => gcsData.get(c.contestant_id)?.length > 0)
    cData.sort((a, b) => d3.ascending(a.name, b.name))
    return cData
  }
)

const teamData = data.computedIfRefHasValues(
  [data.teamData, gameTeamStatDataByTeamId],
  (cData, gcsData) => {
    cData = cData.filter(c => gcsData.get(c.team_id)?.length > 0)
    cData.sort((a, b) => d3.ascending(a.name, b.name))
    return cData
  }
)

const gameData = data.gameData
const contestantIdToTeamIdMap = contestantIdToTeamIdMapFromGameData(gameData)
const teamDataById = data.teamDataById

</script>

<template>
  <Header />
  <div class="component-body" :data-bs-theme="subdomainIdentifier()">
    <div class="section" v-if="!displayAsTeamListing && contestantData && gameContestantStatDataByContestantId">
      <div class="section-header">Contestant Index</div>
      <div v-for="c in contestantData">
        <a :href="'/contestant.html?data_source=standard&contestant_id=' + c.contestant_id">{{ c.name }}</a>&nbsp;
        <span v-if="contestantIdToTeamIdMap && teamDataById">({{ contestantIdToTeamIdMap.get(c.contestant_id).map(tid => teamDataById.get(tid).name).join('/') }})&nbsp;</span>
        <span v-if="gameContestantStatDataByContestantId.get(c.contestant_id)?.length > 0">
          {{ gameContestantStatDataByContestantId.get(c.contestant_id)?.length }} game<template v-if="gameContestantStatDataByContestantId.get(c.contestant_id)?.length > 1">s</template>
        </span>
      </div>
    </div>
    <div class="section" v-if="displayAsTeamListing && teamData && gameTeamStatDataByTeamId">
      <div class="section-header">Team Index</div>
      <div v-for="c in teamData">
        <a :href="'/team.html?data_source=standard&team_id=' + c.team_id">{{ c.name }}</a>&nbsp;
        <span v-if="gameTeamStatDataByTeamId.get(c.team_id)?.length > 0">
          {{ gameTeamStatDataByTeamId.get(c.team_id)?.length }} game<template v-if="gameTeamStatDataByTeamId.get(c.team_id)?.length > 1">s</template>
        </span>
      </div>
    </div>
  </div>
  <Footer />

</template>

<style scoped>




</style>
