<script setup>
import Header from './components/Header.vue'
</script>

<template>
  <Header />
  <div class="component-body">
    <div class="section">
      <h1>Statistics</h1>
      <div class="entry">
        <h2>Att: Attempts</h2>
        <div class="definition">
          Number of attempts to ring in, as given in the box score.
        </div>
      </div>
      <div class="entry">
        <h2>AttValue (AttV): Attempt Value</h2>
        <div class="definition">
          Estimate of the value of clues attempted on.
        </div>
      </div>
      <div class="entry">
        <h2>BuzC: Correct on Buzz</h2>
        <div class="definition">
            Correct answers on buzz. Equivalent to COR from the box score, minus any correct Daily Doubles.
        </div>
      </div>
      <div class="entry">
        <h2>BuzValue (BuzV): Buzz Value</h2>
        <div class="definition">
          The total value of clues a player buzzes in on.
        </div>
      </div>
      <div class="entry">
        <h2>Buz$: Score on Buzz</h2>
        <div class="definition">
            Score using only buzz-in responses. Equivalent to actual score and to Coryat score, except
            it ignores Daily Doubles entirely. <i>Why not just use Coryat?</i> The earliest version of
            this site was based soley on the box scores, and Coryat is not derivable from them. After that,
            I mostly just decided I liked Buz$ as an in-game contestant statistic better, as it only covers clues available
            to all players. I do believe Coryat is better for comparing performance at home, though.
        </div>
      </div>
      <div class="entry">
          <h2>DDF: Daily Doubles Found</h2>
          <div class="definition">
              Daily Doubles found by the player.
          </div>
      </div>
      <div class="entry">
          <h2>DD+: Daily Doubles Over Expectation</h2>
          <div class="definition">
              An estimate of how many more Daily Doubles a player found versus an expectation that each correct
              response in a round is equally likely to lead to finding a Daily Double. This statistic is zero-sum:
              all positive DD+ must be balanced by negative DD+ for another contestant.
          </div>
      </div>
      <div class="entry">
        <h2>Solo: Buzzes that are uncontested</h2>
        <div class="definition">
          An estimate of how many correct responses did not block an opponent's attempt at a correct response.
          That is, it is an estimate of how many clues the contestant alone was correct on.
        </div>
      </div>
      <div class="entry">
        <h2>SoloValue (SoloV): Value of buzzes that are uncontested</h2>
        <div class="definition">
          An estimate of the clue value of correct responses did not block an opponent's attempt at a correct response.
          That is, it is an estimate of the value of clues the contestant alone was correct on.
        </div>
      </div>
      <div class="entry">
          <h2>Timing: Buzzes created through buzzer timing</h2>
          <div class="definition">
              An estimate of how many additional response attempts a player gains through good timing, or
              gains through opponents' lack of timing. This statistic is almost zero-sum: most positive Timing
              must be balanced by negative Timing for another contestant, but attempts that are blocked by
              incorrect responses and then not retried on the rebound keep this from balancing exactly.
          </div>
      </div>
      <div class="entry">
          <h2>TimingValue (TimeV): Value of buzzes created through buzzer timing</h2>
          <div class="definition">
              An estimate of the value of additional response attempts a player gains through good timing, or
              gains through opponents' lack of timing. This statistic is almost zero-sum: most positive Timing
              must be balanced by negative Timing for another contestant, but attempts that are blocked by
              incorrect responses and then not retried on the rebound keep this from balancing exactly.
          </div>
      </div>
    </div>
  </div>

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

.entry {
  margin: 0 0 1em 0;
}

.definition {
  margin: 0 0 0 1em;
}



</style>
