<script setup>
import Footer from '../components/Footer.vue'
import Header from '../components/Header.vue'
</script>

<template>
  <Header />
  <div class="component-body">
    <div class="section">
      <h1>Construction</h1>
      <div class="graph-description">
        <p>
          J!ometry is built and maintained by 2021 4-day champion and 2022 TOC semifinalist
          <router-link to="/contestant?data_source=standard&contestant_id=287">John Focht</router-link>. The origin
          story is that I realized that the published box score PNGs would be difficult to work with in the long run,
          and so I wanted to make sure there was a spreadsheet or CSV or something that research could be done with, once
          there was enough data. Then it turned out that I wanted to do some of that research and talk about it. It became
          useful to put it all in one stable place and semi-standardize the things I found most interesting. And then it also
          became part of my TOC prep.
        </p>
      </div>
    </div>
    <div class="section">
      <h1>Data Usage</h1>
      <div class="graph-description">
        <p>
          Although things have grown beyond that now, the original intent was just to compile and make
          the box score data available. A CSV containing data from all box score games is <a href="https://j-ometry.com/csvs/box.csv">available</a>
          for your own research purposes. This contains only the data from Jeopardy! itself, plus
          some identifiers to link with J!ometry and J!Archive. It does not contain longest streak
          data from the box scores, as I've never collected that.
        </p>
        <p>
          Jeopardy! actively encourages the use of their provided data and I do not own it or claim
          rights to it. This is link is to allow others to easily use the harvested data.
        </p>
      </div>
    </div>
    <div class="section">
      <h1>Issues</h1>
      <div class="graph-description">
        Please report data issues to <a href="https://twitter.com/tkfocht">John Focht (@tkfocht)</a>. The site's
        not really mature enough to take on other kinds of issues systematically yet. There is a work backlog
        but it's not ready for the public.
      </div>
    </div>
    <div class="section">
      <h1>Acknowledgements</h1>
      <div class="graph-description">
        The backbone of data comes from Jeopardy!'s published <a href="https://www.jeopardy.com/jbuzz/news-events/jeopardy-daily-box-scores">box scores</a>.
        Further data and metadata are pulled from <a href="https://j-archive.com">J! Archive</a>.
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
  width: 960px;
}

.entry {
  margin: 0 0 1em 0;
}

.definition {
  margin: 0 0 0 1em;
}



</style>
