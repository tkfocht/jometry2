<script setup>
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'
</script>

<template>
  <Header />
  <div class="component-body">
    <div class="section">
        <h1>October 27, 2022 - Paths to Victory in Second Chance Week 2</h1>
        <div class="entry">
            <p>
                I want to start out with an acknoweldgement that there's something up with ATT stats that I have
                not properly incorporated. In backfilling attempt value estimates to the start of the box score
                era, I came across a game where Luigi de Guzman had 29 recorded attempts in DJ. Now, I have been
                interpreting "attempts" as the number of <i>clues</i> on which a player attempts. However, I have
                come to believe, as Omar Khalid suggested to me on Twitter and as Andrew He messaged me as a
                possibility as well, that each non-DD clue can generate up to three opportunities to attempt, once
                when the clue is read and one after each of the first two possible incorrect responses. That raises
                the maximum number of "attempts" from 29 in J and 28 in DJ (and 27 in TJ) to three times as much, but
                in practice the actual maximum is somewhere in the low 30s. There's no record of anyone <i>doing</i>
                that, but it seems like someone could.
            </p>
            <p>
                For now, I am also not <i>doing</i> anything with that possible information as
                I ruminate on how to incorporate it. If I were making predictive metrics, I'd care a lot
                more strongly about how the differences works as input to those, but j-ometry is currently
                a site of descriptive metrics. Since all estimates derived from this likely flawed interpretation
                are subject to the same issues, the estimates still work about as well as comparative measures. Just
                something to keep in mind.
            </p>
            <p>
                Today's post is, overall, an look at how different paths to victory work.
            </p>
            <h3>Monday</h3>
            <table>
                <tr>
                    <th>Contestant</th>
                    <th>Min Att Total</th>
                    <th>Max Att Total</th>
                    <th>Est Att Total</th>
                    <th>Buz Value Total</th>
                    <th>Buz$</th>
                </tr>
                <tr>
                    <td>Sarah</td>
                    <td>26600</td>
                    <td>40200</td>
                    <td>32576</td>
                    <td>15200 (47%)</td>
                    <td>5200 (34%)</td>
                </tr>
                <tr>
                    <td>Jeff</td>
                    <td>37600</td>
                    <td>46200</td>
                    <td>43125</td>
                    <td>19200 (45%)</td>
                    <td>11600 (60%)</td>
                </tr>
                <tr>
                    <td>Sadie</td>
                    <td>28400</td>
                    <td>41000</td>
                    <td>32952</td>
                    <td>20800 (63%)</td>
                    <td>13600 (65%)</td>
                </tr>
            </table>
            <p>
                Because the net money on DDs in this game was only -$1200, this game was much more about the
                57 regular clues. The attempt breakdown was 39-47-38. Jeff's 47 is obviously quite high, but 38
                and 39 are right at the sweet spot where gameplay shifts into a battle of high value clues. The
                behavior across rounds changes - Jeff and Sarah had similar numbers, higher than Sadie's, in J, but
                there was a clearer Jeff > Sadie > Sarah ordering in DJ. The key factor appears to be Sadie's
                better timing (again, particularly in DJ), allowing her to overcome Jeff's higher attempt rates
                and value by better converting attempts to buzzes.
            </p>
            <p>
                It probably helped Sadie's game that she really gained her lead early in DJ between the high value
                Europe and lyrics clues, which set the tone for rest of the game. I wouldn't fully characterize
                Sarah as entering a death spiral as a result in trying to remain in the game and pushing the risk, but she did
                end up negative overall for DJ. Sadie was able to snag the DDs, which even without getting a lot
                of direct value from them did deny them to the others. A solid performance to build a lead. Not
                an insurmountable one, but if you can get FJ right, that's all you need.
            </p>
            <h3>Tuesday</h3>
            <table>
                <tr>
                    <th>Contestant</th>
                    <th>Min Att Total</th>
                    <th>Max Att Total</th>
                    <th>Est Att Total</th>
                    <th>Buz Value Total</th>
                    <th>Buz$</th>
                </tr>
                <tr>
                    <td>Tom</td>
                    <td>22600</td>
                    <td>30400</td>
                    <td>26114</td>
                    <td>13200 (51%)</td>
                    <td>10000 (76%)</td>
                </tr>
                <tr>
                    <td>Alicia</td>
                    <td>22600</td>
                    <td>30200</td>
                    <td>26230</td>
                    <td>15000 (57%)</td>
                    <td>13000 (87%)</td>
                </tr>
                <tr>
                    <td>Jack</td>
                    <td>31000</td>
                    <td>39800</td>
                    <td>36497</td>
                    <td>21200 (58%)</td>
                    <td>14400 (68%)</td>
                </tr>
            </table>
            <p>
                Jack put together a runaway based on DDs. His underlying regular play metrics are strong,
                and he definitely attempted more than Tom or Alicia and at higher value, but the raw money
                building was not that much stronger than his opponents'. There's just not much to be done
                when someone snags all three and puts together an extra $12000 as a result.
            </p>
            <p>
                I haven't yet worked on untangling how DD+ (the number of DDs found above what one
                might expect based on the number of correct responses a player gives, which drives the number
                of times they get to pick) separates into components based on the player's clue selection
                and outright luck, but Jack did do some small things to better his chances. Although the competition has
                seen most players start in the third or fourth row of categories, it caught my eye that after
                finding DD2 in Revolts, a category he seemed comfortable in, Jack nonetheless abandoned the
                category immediately to look elsewhere. Often, contestants will grab another high value clue
                in the same category first if one is still available, but I'm willing to bet this is a
                strategic mistake. Maybe not a mental mistake, if you need to stay in the mindset of the category,
                but the last DD is incredibly valuable in most cases.
            </p>
            <h3>Wednesday</h3>
            <table>
                <tr>
                    <th>Contestant</th>
                    <th>Min Att Total</th>
                    <th>Max Att Total</th>
                    <th>Est Att Total</th>
                    <th>Buz Value Total</th>
                    <th>Buz$</th>
                </tr>
                <tr>
                    <td>Nikkee</td>
                    <td>17200</td>
                    <td>31400</td>
                    <td>23698</td>
                    <td>9800 (41%)</td>
                    <td>8200 (84%)</td>
                </tr>
                <tr>
                    <td>Do</td>
                    <td>23400</td>
                    <td>34400</td>
                    <td>28034</td>
                    <td>13200 (47%)</td>
                    <td>6800 (52%)</td>
                </tr>
                <tr>
                    <td>Rowan</td>
                    <td>39400</td>
                    <td>42600</td>
                    <td>41535</td>
                    <td>27000 (65%)</td>
                    <td>14200 (53%)</td>
                </tr>
            </table>
            <p>
                Rowan's performance feels like an all-out assault. The number of attempts they had is
                significantly higher than Nikkee or Do, particularly in DJ, which broke 14-16-25, so the
                underlying value is significantly higher as well. The overall numbers mask more differences
                between the two rounds. After a frustrating J round, Nikkee found better timing in DJ, and
                as a result actually outperformed both Rowan and Do on Buz$ in that round. Rowan took a
                100% correctness rate in J and fell to 73% in DJ based on four incorrect responses. That
                often has a huge effect on converting buzzes into score, and it did - they buzzed in $17600
                in value in DJ but only netted $4800 off of it. That still resulted in a lot of raw correct
                responses, so getting both DJ DDs was likelier (though still a full DD over expectation).
            </p>
            <p>
                Overall, a game where if Nikkee or Do had been able to get to a DJ DD, that might have made a
                difference (as opposed to Jack's game, where it seems more certain to have made one with the right
                wager and response), but Rowan demonstrated both ability on the buzzer and a broader base of
                clues to work from.
            </p>
        </div>
        <h1>October 20, 2022 - Attempt Scores and Second Chance Week 1</h1>
        <div class="entry">
            <p>
                <i>This entry has been edited on October 22 with updated, more stablized metrics.</i>
            </p>
            <p>
                I've been playing with some metrics for Second Chance and while they're not yet up on the site, I think
                they're worth using to review the Week 1 semifinals.
            </p>
            <p>
                I've spent some time trying to estimate how much total
                money players are attempting on. The attempt counts are new and shiny from the box scores, and although I
                think we still can't say very much about them very confidently, I do think something happens in the high 30s
                to low 40s. Which makes some sense intuitively! You can get to 30 attempts just with the top three rows of
                both boards. You can only get to 40 if you're playing at the bottom with some consistency. Games with
                multiple players in the 30s are sometimes very close and sometimes very lopsided, as someone plays the
                bottom more. This could just be stuff they happen to know more than the top rows, or it could be that
                although J! mostly rewards knowing a little about a lot of things, it can also reward knowing a lot about
                some specific things. It's better to know a whole column of five than five clues scattered around the top.
            </p>
            <p>
                Using the attempt numbers in combination with the J-Archive game record of known responses, I made some
                initial assumptions about how unseen attempts might be distributed for each player. The first assumption
                is that attempts at the top are more common than at the bottom, which is probably true for an individual.
                It's definitely true across the universe of players. I adapted the overall ratios into weights for
                probability calculations. I also made an assumption that most of the time a player attempts but is blocked
                by an incorrect answer, they would go on to attempt again. That's obviously not true all the time (what
                if they had the same wrong answer?), but I'm just documenting an assumption here. I expect that the exact
                magic that goes into this is something I'll work on over time. For instance, I think it's likely that
                knowing someone got correct answers at the bottom of a column makes it more likely they attempted at the
                top, generally. But there's not really a way to actually know that right now, so it's still just thoughts.
                The min and max range for the cash value of the attempt distribution <i>is</i> fully calculable, so I'm
                including the bounds in this post.
            </p>
            <p>
                My basic conception of the buzzing part of the game is that there's three big filters.
                <ul>
                    <li>What do you think you know (attempting)</li>
                    <li>Do you get to answer it (timing)</li>
                    <li>Are you right if you do (correctness)</li>
                </ul>
                The estimate of what players are attempting on is an attempt to get a better handle on the first, and
                then tools with the known responses and scores are reflections of the second and third within that context.
                With that, let's get to putting this lens on this week's games. In each table, where a percentage is listed,
                it is of the value to the left, and can be thought of as a measure of how each of the filters above got applied.
            </p>
            <h3>Monday</h3>
            <table>
                <tr>
                    <th>Contestant</th>
                    <th>Min Att Total</th>
                    <th>Max Att Total</th>
                    <th>Est Att Total</th>
                    <th>Buz Value Total</th>
                    <th>Buz$</th>
                </tr>
                <tr>
                    <td>Cindy</td>
                    <td>20400</td>
                    <td>31800</td>
                    <td>25419</td>
                    <td>12000 (47%)</td>
                    <td>9600 (80%)</td>
                </tr>
                <tr>
                    <td>Aaron</td>
                    <td>21600</td>
                    <td>31400</td>
                    <td>25293</td>
                    <td>17400 (69%)</td>
                    <td>5800 (33%)</td>
                </tr>
                <tr>
                    <td>Jessica</td>
                    <td>25600</td>
                    <td>36400</td>
                    <td>29943</td>
                    <td>17400 (58%)</td>
                    <td>14600 (84%)</td>
                </tr>
            </table>
            <p>
                In <a href="/game.html?toc_period_id=TOC2022SC&game_id=1544">Monday's game</a>, the raw counts on
                timing metrics favored Aaron. His buzz% was significantly higher than Cindy's or Jessica's and he got
                around 4 or 5 extra buzzes because of it. The raw attempt counts favored Jessica. My estimate
                is that Jessica attempted on just under $30000 worth of clues, while Cindy and Aaron
                were each attempting in the $25000s. The additional attempts and the tilt of them towards the bottom
                meant that Jessica buzzed in on $17400 of clues, the same as Aaron's, even with his better timing.
                That seems like a direct effect of playing strongly at the bottom in DJ!.
                Cindy got in on $12000. Of those possible earnings on buzzing, Jessica actually earned $14600,
                Aaron $5800, and Cindy $9600. With the DDs spread across all three players and Jessica being the only
                one correct, what initially looks somewhat even on the counting metrics for attempts and buzzes
                resulted in a runaway game for her.
            </p>
            <h3>Tuesday</h3>
            <table>
                <tr>
                    <th>Contestant</th>
                    <th>Min Att Total</th>
                    <th>Max Att Total</th>
                    <th>Est Att Total</th>
                    <th>Buz Value Total</th>
                    <th>Buz$</th>
                </tr>
                <tr>
                    <td>Erica</td>
                    <td>24400</td>
                    <td>32800</td>
                    <td>27532</td>
                    <td>13200 (48%)</td>
                    <td>12000 (91%)</td>
                </tr>
                <tr>
                    <td>Tracy</td>
                    <td>23200</td>
                    <td>32400</td>
                    <td>26845</td>
                    <td>16200 (57%)</td>
                    <td>6600 (41%)</td>
                </tr>
                <tr>
                    <td>Molly</td>
                    <td>29600</td>
                    <td>36800</td>
                    <td>34483</td>
                    <td>17400 (50%)</td>
                    <td>5400 (31%)</td>
                </tr>
            </table>
            <p>
                On <a href="/game.html?toc_period_id=TOC2022SC&game_id=1545">Tuesday</a>, the attempt counts are all
                very similar at 36-36-38. However, Molly attempted many clues at the bottom of the DJ! board, so her
                total attempted value was around $34000 while Erica and Tracy were both closer to $27000. Erica maintained
                a high correctness rate, actually earning $12000 of the $13200 she got in on, while Tracy earned $6600
                and Molly earned $5400. The DDs were key for Molly to keep it close enough to bet strategically in FJ!, which does emphasize
                another point: opportunities to get DDs are earned just by being correct, without regard to the dollar value
                of the clue, so her better play in the top and mid rows helped in this without contributing a lot of money
                to offset her incorrect answers at the bottom.
            </p>
            <h3>Wednesday</h3>
            <table>
                <tr>
                    <th>Contestant</th>
                    <th>Min Att Total</th>
                    <th>Max Att Total</th>
                    <th>Est Att Total</th>
                    <th>Buz Value Total</th>
                    <th>Buz$</th>
                </tr>
                <tr>
                    <td>James</td>
                    <td>22200</td>
                    <td>32200</td>
                    <td>26794</td>
                    <td>17800 (66%)</td>
                    <td>16200 (91%)</td>
                </tr>
                <tr>
                    <td>Ren&eacute;e</td>
                    <td>21800</td>
                    <td>31800</td>
                    <td>26889</td>
                    <td>11400 (42%)</td>
                    <td>4200 (37%)</td>
                </tr>
                <tr>
                    <td>Pam</td>
                    <td>22000</td>
                    <td>31800</td>
                    <td>26633</td>
                    <td>15400 (58%)</td>
                    <td>15400 (100%)</td>
                </tr>
            </table>
            <p>
                These metrics support the idea that <a href="/game.html?toc_period_id=TOC2022SC&game_id=1546">Wednesday</a> was
                a shootout. James, Ren&eacute;e, and Pam all attempted 33 or 34 times, all for roughly equal distributions. James
                had better raw numbers for timing, but Pam was close when looking at it through this idea of value, which passes
                the eye test in that she seemed to pick up rhythm late in the game with valuable clues. My guess is that Ren&eacute;e
                found herself squeezed, not just in rhythm itself, but in overlapping on attempts with both James and Pam, who were
                possibly overlapping with each other less. That forced her to go riskier, especially after the missed DD. 
            </p>
            <h3>Overall</h3>
            <p>
                Overall, this is... useful, maybe? The error bars on the estimated attempt value totals are unknown, and this is
                an obviously small sample, but I'm pleased with the way the numbers tie in with the results well and tell stories
                that match what I think I saw. I've looked at some other games with this, especially
                <a href="/game.html?toc_period_id=TOC2023R&game_id=1529">September 30's game</a> of David Sibley v Pam Warren v
                Cris Panullo, where the attempt value totals agree with the story that Cris was playing stronger on high values.
            </p>
            <p>
                As I grow more satisfied with these estimates, I'll start rolling it out to the stat pages. I suspect that
                attempt value total may be a measure that is pretty consistent for a player from day to day, and that variations
                might represent specific differences in difficulty or in player approach, rather than luck or level of
                competition. This is also part of a larger effort to incorporate more direct knowledge from J-Archive game records
                into estimates of Timing and Solo, which are still based solely on data from the box scores.
            </p>
            <p>
                Looking at these with percentages attached, it also brings home just what a trade-off incorrect answers are. You
                have to try sometimes (that's some jeopardy), but each one can crush the amount of money you're making, with the
                lost opportunity and the actual lost money compounding on each other. I'm interested in looking for signs of the
                vicious cycle at work, where some bad results (incorrect responses or getting locked out) push riskier behavior,
                which in turn push bad results.
            </p>
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

h3 {
  margin-top: 1.5em;
}

table {
    border-collapse: collapse;
}

table th, table td {
    padding: 2px 8px;
    border: 1px solid #999999;
}

table th.empty {
    border: 0;
}

table td {
    text-align: right;
}

table td:first-child {
    text-align: left;
}

div.entry {
    margin-left: 3em;
    margin-bottom: 4em;
}

div.entry p {
    margin-top: 1.5em;
}



</style>
