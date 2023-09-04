<script setup>
import * as d3 from 'd3'
import * as data from '@/data'
import { filterValues } from '@/util'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'

data.loadContestantData()
data.loadGameContestantStatData()

const gameContestantStatDataByContestantId = data.gameContestantStatDataByContestantId

const contestantsByName = data.computedIfRefHasValue(data.contestantData, cData => d3.group(cData, c => c.name))
const duplicateContestants = data.computedIfRefHasValue(contestantsByName, cData => {
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

</script>

<template>
  <Header />
  <div class="component-body">
    <div class="section" v-if="contestantData && gameContestantStatDataByContestantId">
      <h1>Contestant Index</h1>
      <div v-for="c in contestantData">
        <a :href="'/contestant.html?data_source=standard&contestant_id=' + c.contestant_id">{{ c.name }}</a>&nbsp;
        <span v-if="gameContestantStatDataByContestantId.get(c.contestant_id)?.length > 0">
          {{ gameContestantStatDataByContestantId.get(c.contestant_id)?.length }} game<template v-if="gameContestantStatDataByContestantId.get(c.contestant_id)?.length > 1">s</template>
        </span>
      </div>
    </div>
  </div>
  <Footer />

</template>

<style scoped>

.component-body {
  margin: 0 2em;
}

.section {
  padding: 0.5em 0 2em 0;
  border-bottom: 1px solid black;
  width: 960px;
}



</style>
