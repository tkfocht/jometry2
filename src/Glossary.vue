<script setup>
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'
</script>

<template>
  <Header />
  <div class="component-body">
    <div class="section">
      <div class="section-header">Statistics</div>
      <div class="entry">
        <div class="term">Acc%: Accuracy</div>
        <div class="definition">
          Percentage of buzzes that are correct: BuzC / Buz.
        </div>
      </div>
      <div class="entry">
        <div class="term">AccValue% (AccV%): Accuracy Value</div>
        <div class="definition">
          Percentage of buzz value that becomes buzz score: Buz$ / BuzValue.
        </div>
      </div>
      <div class="entry">
        <div class="term">Att: Attempts</div>
        <div class="definition">
          Number of attempts to ring in, as given in the box score.
        </div>
      </div>
      <div class="entry">
        <div class="term">AttCl: Attempt clues</div>
        <div class="definition">
          Estimate of the number of clues attempted.
        </div>
      </div>
      <div class="entry">
        <div class="term">AttValue (AttV): Attempt Value</div>
        <div class="definition">
          Estimate of the value of clues attempted on.
        </div>
      </div>
      <div class="entry">
        <div class="term">BuzC: Correct on Buzz</div>
        <div class="definition">
            Correct answers on buzz. Equivalent to COR from the box score, minus any correct Daily Doubles.
        </div>
      </div>
      <div class="entry">
        <div class="term">BuzValue (BuzV): Buzz Value</div>
        <div class="definition">
          The total value of clues a player buzzes in on.
        </div>
      </div>
      <div class="entry">
        <div class="term">Buz$: Score on Buzz</div>
        <div class="definition">
            Score using only buzz-in responses. Equivalent to actual score and to Coryat score, except
            it ignores Daily Doubles entirely. <i>Why not just use Coryat?</i> The earliest version of
            this site was based soley on the box scores, and Coryat is not derivable from them. After that,
            I mostly just decided I liked Buz$ as an in-game contestant statistic better, as it only covers clues available
            to all players. I do believe Coryat is better for comparing performance at home, though.
        </div>
      </div>
      <div class="entry">
        <div class="term">Conv%: Conversion</div>
        <div class="definition">
          Percentage of attempts that are correct buzzes: BuzC / Att.
        </div>
      </div>
      <div class="entry">
        <div class="term">ConvValue% (ConvV%): Conversion Value</div>
        <div class="definition">
          Percentage of attempt value that becomes buzz score: Buz$ / AttValue.
        </div>
      </div>
      <div class="entry">
          <div class="term">DDF: Daily Doubles Found</div>
          <div class="definition">
              Daily Doubles found by the player.
          </div>
      </div>
      <div class="entry">
          <div class="term">DD+C: Daily Doubles Over Expectation (Based on Correct Responses)</div>
          <div class="definition">
              An estimate of how many more Daily Doubles a player found versus an expectation that each correct
              response in a round is equally likely to lead to finding a Daily Double. This statistic is zero-sum:
              all positive DD+ must be balanced by negative DD+ for another contestant.
          </div>
      </div>
      <div class="entry">
          <div class="term">DD+S: Daily Doubles Over Expectation (Based on Selections)</div>
          <div class="definition">
              An estimate of how many more Daily Doubles a player found versus an expectation that each clue selection
              in a round is equally likely to lead to finding a Daily Double. This statistic is zero-sum:
              all positive DD+ must be balanced by negative DD+ for another contestant.
          </div>
      </div>
      <div class="entry">
        <div class="term">Solo: Buzzes that are uncontested</div>
        <div class="definition">
          An estimate of how many correct responses that did not block an opponent's attempt at a correct response.
          That is, it is an estimate of how many opportunities the contestant alone was buzzing on.
        </div>
      </div>
      <div class="entry">
        <div class="term">Solo Score (Solo$): Score of buzzes that are uncontested</div>
        <div class="definition">
          An estimate of the scoring on responses that did not block an opponent's attempt at a correct response.
          That is, it is an estimate of the scoring on clues the contestant alone was buzzing on.
        </div>
      </div>
      <div class="entry">
        <div class="term">Solo Value (SoloV): Value of buzzes that are uncontested</div>
        <div class="definition">
          An estimate of the clue value of correct responses did not block an opponent's attempt at a correct response.
          That is, it is an estimate of the value of clues in which there was a buzz opportunity where the contestant
          was alone buzzing in.
        </div>
      </div>
      <div class="entry">
          <div class="term">Timing: Buzzes created through buzzer timing</div>
          <div class="definition">
              An estimate of how many additional response attempts a player gains through good timing, or
              gains through opponents' lack of timing. This statistic is almost zero-sum: most positive Timing
              must be balanced by negative Timing for another contestant, but attempts that are blocked by
              incorrect responses and then not retried on the rebound keep this from balancing exactly.
          </div>
      </div>
      <div class="entry">
          <div class="term">Timing Score (Time$): Score created through buzzer timing</div>
          <div class="definition">
              An estimate of how score a player gains through good timing, or
              gains through opponents' lack of timing. This statistic is a little weird sometimes, as bad timing
              results in no score. A high positive score indicates a player with good timing and accuracy. A negative
              score indicates a player with good timing and bad accuracy.
          </div>
      </div>
      <div class="entry">
          <div class="term">Timing Value (TimeV): Value of buzzes created through buzzer timing</div>
          <div class="definition">
              An estimate of the value of additional response attempts a player gains through good timing, or
              gains through opponents' lack of timing. This statistic is almost zero-sum: most positive Timing
              must be balanced by negative Timing for another contestant, but attempts that are blocked by
              incorrect responses and then not retried on the rebound keep this from balancing exactly.
          </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<style scoped>


.entry {
  margin: 0 0 1em 0;
  text-align: left;
}

.term {
  font-size: 1.5rem;
}

.definition {
  margin: 0 0 0 1em;
}



</style>
