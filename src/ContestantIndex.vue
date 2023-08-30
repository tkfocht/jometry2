<script setup>
import * as d3 from 'd3'
import * as data from '@/data'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'

data.loadContestantData()
const contestantData = data.computedIfRefHasValue(data.contestantData, cData => {
  cData.sort((a, b) => d3.ascending(a.name, b.name))
  return cData
})

</script>

<template>
  <Header />
  <div class="component-body">
    <div class="section" v-if="contestantData">
      <h1>Contestant Index</h1>
      <div v-for="c in contestantData">
        <a :href="'/contestant.html?data_source=standard&contestant_id=' + c.contestant_id">{{ c.name }}</a>
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
