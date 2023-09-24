<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { movingAverageOfLast, dateFormat, transformValues, threeColorSet } from '@/util'
import { playClassificationName } from '@/configuration'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as data from '@/data'
import * as gsAttributes from '@/gameStatAttributes'
import * as gcsAttributes from '@/gameContestantStatAttributes'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'
import BoxWhiskerChart from './components/util/BoxWhiskerChart.vue'
import CarouselTable from './components/util/CarouselTable.vue'
import LineChart from './components/util/LineChart.vue'
import OptionGroup from './components/util/OptionGroup.vue'
import ScatterHistogram from './components/util/ScatterHistogram.vue'
import SortableTable from './components/util/SortableTable.vue'
import StackValueBarChart from './components/util/StackValueBarChart.vue'

let urlParams = new URLSearchParams(window.location.search);

data.loadContestantData()
data.loadGameData()
data.loadGameStatData()
data.loadGameContestantStatData()
data.loadGameRoundContestantStatData()

const seasonSearchParameters = ref(urlParams.get('season') ? urlParams.get('season').split(',') : [])
const tocPeriodSearchParameters = ref(urlParams.get('toc_period') ? urlParams.get('toc_period').split(',') : [])
const playClassificationSearchParameters = ref(urlParams.get('play_classification') ? urlParams.get('play_classification').split(',') : [])

const winThresholdString = ref(urlParams.get('win_threshold'))
const winLimitString = ref(urlParams.get('win_limit'))
const graphDisplayLimitString = ref(urlParams.get('graph_display_limit'))
const displayContestantIdParameters = ref(urlParams.get('contestants') ? urlParams.get('contestants').split(',') : [])

const displayRounds = ref(2)

const queryString = computed(() => {
  var queryStr = '?foo=bar'
  if (seasonSearchParameters.value.length > 0) {
    queryStr += '&season=' + seasonSearchParameters.value.join(',')
  }
  if (tocPeriodSearchParameters.value.length > 0) {
    queryStr += '&toc_period=' + tocPeriodSearchParameters.value.join(',')
  }
  if (playClassificationSearchParameters.value.length > 0) {
    queryStr += '&play_classification=' + playClassificationSearchParameters.value.join(',')
  }
  if (winThresholdString.value !== null) {
    queryStr += '&win_threshold=' + winThresholdString.value
  }
  if (winLimitString.value !== null) {
    queryStr += '&win_limit=' + winLimitString.value
  }
  if (graphDisplayLimitString.value !== null) {
    queryStr += '&graph_display_limit=' + graphDisplayLimitString.value
  }
  if (displayContestantIdParameters.value.length > 0) {
    queryStr += '&contestants=' + displayContestantIdParameters.value.join(',')
  }
  return queryStr
})

onMounted(() => {
  window.history.replaceState(null, null, queryString.value );
})

watch(() => queryString, (newValue, oldValue) => {
  window.history.replaceState(null, null, queryString.value );
}, { deep: true })

const gameFilter = computed(() => {
  const satisfiesSeason = seasonSearchParameters.value.length === 0 ? 
    d => true :
    d => seasonSearchParameters.value.includes(d.season_id)
  const satisfiesTocPeriod = tocPeriodSearchParameters.value.length === 0 ? 
    d => true :
    d => tocPeriodSearchParameters.value.includes(d.toc_period)
  const satisfiesPlayClassification = playClassificationSearchParameters.value.length === 0 ? 
    d => true :
    d => playClassificationSearchParameters.value.includes(d.play_classification)
  return d => satisfiesSeason(d) && satisfiesTocPeriod(d) && satisfiesPlayClassification(d)
})
const gameData = data.computedIfRefHasValue(data.gameData, gData => gData.filter(gameFilter.value))
const gameDataById = data.computedIfRefHasValue(gameData, gData => d3.index(gData, g => g.game_id))
const gameIds = data.computedIfRefHasValue(gameData, gData => gData.map(g => g.game_id))
const contestantDataById = data.contestantDataById
const contestantIds = data.computedIfRefHasValue(gameData, gData => [...new Set(gData.flatMap(g => [g.podium_1_contestant_id, g.podium_2_contestant_id, g.podium_3_contestant_id]))])
const gameStatData = data.computedIfRefHasValues([data.gameStatData, gameIds], (gsData, gIds) => gsData.filter(gs => gIds.includes(gs.game_id)))
const gameStatDataById = data.computedIfRefHasValue(gameStatData, gsData => d3.index(gsData, gs => gs.game_id))
const gameContestantStatData = data.computedIfRefHasValues([data.gameContestantStatData, gameIds], (gcsData, gIds) => gcsData.filter(gs => gIds.includes(gs.game_id)))
const gameContestantStatDataByGameId = data.computedIfRefHasValue(gameContestantStatData, gcsData => d3.group(gcsData, gcs => gcs.game_id))
const gameContestantStatDataByContestantId = data.computedIfRefHasValue(gameContestantStatData, gcsData => d3.group(gcsData, gcs => gcs.contestant_id))
const gameContestantStatDataByGameIdAndContestantId = data.computedIfRefHasValue(gameContestantStatData, gcsData => d3.index(gcsData, gcs => gcs.game_id, gcs => gcs.contestant_id))
const gameRoundContestantStatDataByRoundIdContestantId = data.computedIfRefHasValues(
    [data.gameRoundContestantStatData, gameIds],
    (gcsData, gIds) => d3.group(gcsData.filter(gr => gIds.includes(gr.game_id)), r => r.round_of_game, r => r.contestant_id))

const contestantWins = data.computedIfRefHasValue(gameData, gData => d3.rollup(gData, v => v.length, g => g.winning_contestant_id))
const contestantWinnings = data.computedIfRefHasValues([gameData, gameContestantStatDataByGameIdAndContestantId], (gData, gcsData) => {
  const aggregateWinnings = function(games) {
    return games.map(g => gcsData.get(g.game_id).get(g.winning_contestant_id).score).reduce((a, b) => a + b, 0)
  }
  return d3.rollup(gData, aggregateWinnings, g => g.winning_contestant_id)
})
const contestantTotalScores = data.computedIfRefHasValue(gameContestantStatData, gcsData => {
  return d3.rollup(gcsData, v => v.map(gcs => gcs.score).reduce((a, b) => a + b, 0), g => g.contestant_id)
})
const contestantSort = data.computedIfRefHasValues(
  [contestantWins, contestantWinnings, contestantTotalScores],
  (wins, winnings, totalScores) => (
    (a, b) =>
      d3.descending(_.defaultTo(wins.get(a), 0), _.defaultTo(wins.get(b), 0)) ||
      d3.descending(_.defaultTo(winnings.get(a), 0), _.defaultTo(winnings.get(b), 0)) ||
      d3.descending(_.defaultTo(totalScores.get(a), 0), _.defaultTo(totalScores.get(b), 0))))
const displayContestantIds = data.computedIfRefHasValues(
  [displayContestantIdParameters, contestantIds, contestantSort, contestantWins],
  (dcIdParameters, cids, cSort, wins) => {
    if (dcIdParameters.length > 0) {
      return dcIdParameters.map(v => +v)
    }
    cids.sort(cSort)
    if (cids.length <= 10) {
      return cids
    }
    var winThreshold = winThresholdString.value ? +winThresholdString.value : Math.max(Math.min((wins.get(cids[9]) ? wins.get(cids[9]) : 0), 4), cids.length > 21 ? 1 + (wins.get(cids[20]) ? wins.get(cids[20]) : 0) : 0)
    //Okay fine, if anyone ever wins 10001 games this will be a bug,
    //but truthy values are weird when winLimit=0 is a primary case
    var winLimit = winLimitString.value ? +winLimitString.value : 10000
    return cids.filter(i => {
      var cwin = wins.get(i)
      if (cwin === undefined) cwin = 0
      return cwin >= winThreshold && cwin <= winLimit
    })
  })
const displayContestantGameContestantStatData = data.computedIfRefHasValues(
  [displayContestantIds, gameContestantStatData],
  (dCids, gcsData) => gcsData.filter(gcs => dCids.includes(gcs.contestant_id))
)
const winnerContestantGameContestantStatData = data.computedIfRefHasValues(
  [gameDataById, gameContestantStatData],
  (gData, gcsData) => gcsData.filter(gcs => gData.get(gcs.game_id).winning_contestant_id === gcs.contestant_id)
)
const graphDisplayLimit = ref(graphDisplayLimitString.value ? +graphDisplayLimitString.value : undefined)

const colorSet = computed(() => {
  if (!displayContestantIds.value) return undefined
  return d3.scaleOrdinal()
    .domain(displayContestantIds.value)
    .range(d3.schemeCategory10.concat(d3.schemeDark2).concat(d3.schemeAccent))
})

const color = computed(() => {
  return cid => {
    if (displayContestantIds.value && displayContestantIds.value.includes(cid)) {
      return colorSet.value(cid);
    } else {
      return "black";
    }
  }
})

function contestantLink (contestant_id, contestant_name) {
  return '<span style="color: ' + 
    color.value(contestant_id) + 
    '">&#9632;</span>&nbsp;<a href="/contestant.html?contestant_id=' + 
    contestant_id + 
    '">' + contestant_name + '</a>'
}

//Tables
const roundOptionLabels = ref(['Full Game', 'J Round', 'DJ Round'])
const selectedRoundIndex = ref(0)
const aggregationOptionLabels = ref(['Game Average', 'Total', 'Game Max', 'Game Median', 'Game Min'])
const selectedAggregationIndex = ref(0)

const baseScoringTableData = data.computedIfRefHasValues(
  [selectedRoundIndex, gameContestantStatDataByContestantId, gameRoundContestantStatDataByRoundIdContestantId],
  (rIdx, gcsDataByCId, grcsDataByRIdCId) => {
    if (rIdx === 0) {
      return gcsDataByCId
    }
    return grcsDataByRIdCId.get(rIdx)
  }
)
const baseScoringTableAggregation = data.computedIfRefHasValue(
  selectedAggregationIndex, idx => [d3.mean, d3.sum, d3.max, d3.median, d3.min][idx])
const baseScoringTableDisplayFunction = data.computedIfRefHasValue(
  selectedAggregationIndex, idx => [
    attrSpec => attrSpec.averageDisplayFormat,
    attrSpec => attrSpec.valueDisplayFormat,
    attrSpec => attrSpec.valueDisplayFormat,
    attrSpec => attrSpec.valueDisplayFormat,
    attrSpec => attrSpec.valueDisplayFormat][idx])

const baseScoringTableRows = data.computedIfRefHasValues([displayContestantIds, contestantSort, contestantWins], (cIds, cSort, cWins) => {
  cIds.sort(cSort)
  return cIds.map((contestant_id, idx) => {
    return {
      'contestant_id': contestant_id,
      'wins': cWins.get(contestant_id),
      'ranking': cIds.length - idx - 1
    }
  })
})

const constructScoringTableSpecification = function(attrSpecs) {
  return data.computedIfRefHasValues(
    [baseScoringTableRows, gameDataById, contestantDataById, baseScoringTableData, baseScoringTableAggregation, baseScoringTableDisplayFunction],
    (baseRows, gData, cData, gcsData, aggrFn, attrDisplayFn) => {
      var columns = [
        {
          label: 'Contestant (Wins)'
        }
      ]
      columns = columns.concat(attrSpecs.map(attr => ({
        label: attr.short_label
      })))

      var rows = baseRows.map(baseRow => {
        const cid = baseRow.contestant_id
        var row = [
          {
            value: contestantLink(cid, cData.get(cid).name) + '&nbsp;(' + baseRow.wins + ')',
            sortValue: baseRow.ranking
          }
        ]
        row = row.concat(attrSpecs.map(attr => ({
          value: attrDisplayFn(attr)(aggrFn(gcsData.get(cid).map(attr.generatingFunction))),
          sortValue: aggrFn(gcsData.get(cid).map(attr.generatingFunction))
        })))
        return row
      })

      var footerRows = [
        [ { value: 'Selected' } ],
        [ { value: 'All' } ],
        [ { value: 'Winners' } ]
      ]

      footerRows[0] = footerRows[0].concat(attrSpecs.map(attr => {
        const contestantIds = baseRows.map(baseRow => baseRow.contestant_id)
        const gcses = contestantIds.flatMap(cid => gcsData.get(cid))
        return {
          value: attrDisplayFn(attr)(aggrFn(gcses.map(attr.generatingFunction)))
        }
      }))

      footerRows[1] = footerRows[1].concat(attrSpecs.map(attr => {
        const gcses = [...gcsData.values()].flatMap(l => l)
        return {
          value: attrDisplayFn(attr)(aggrFn(gcses.map(attr.generatingFunction)))
        }
      }))

      footerRows[2] = footerRows[2].concat(attrSpecs.map(attr => {
        const gcses = [...gcsData.values()].flatMap(l => l).filter(gcs => gData.get(gcs.game_id).winning_contestant_id === gcs.contestant_id)
        return {
          value: attrDisplayFn(attr)(aggrFn(gcses.map(attr.generatingFunction)))
        }
      }))

      return {
        columns: columns,
        rows: rows,
        footerRows: footerRows,
        initialSortColumnIndex: 0,
        initialSortDescending: true
      }
    }
  )
}

const standardScoringAttributes = [gcsAttributes.buz, gcsAttributes.buzc, gcsAttributes.buz_score, gcsAttributes.coryat_score,
  gcsAttributes.dd_found, gcsAttributes.dd_plus_buzc, gcsAttributes.dd_plus_selection, gcsAttributes.dd_score,
  gcsAttributes.fj_start_score, gcsAttributes.fj_score, gcsAttributes.fj_final_score]
const standardScoringTableSpec = constructScoringTableSpecification(standardScoringAttributes)

const conversionScoringAttributes = [gcsAttributes.att, gcsAttributes.att_clue, gcsAttributes.buz,
    gcsAttributes.buz_percent, gcsAttributes.buzc, gcsAttributes.acc_percent, gcsAttributes.conversion_percent,
    gcsAttributes.time, gcsAttributes.solo]
const conversionScoringTableSpec = constructScoringTableSpecification(conversionScoringAttributes)

const conversionValueScoringAttributes = [gcsAttributes.att_value, gcsAttributes.buz_value, gcsAttributes.buz_value_percent,
    gcsAttributes.buz_score, gcsAttributes.acc_value_percent, gcsAttributes.conversion_value_percent,
    gcsAttributes.time_value, gcsAttributes.time_score,
    gcsAttributes.solo_value, gcsAttributes.solo_score]
const conversionValueScoringTableSpec = constructScoringTableSpecification(conversionValueScoringAttributes)


//Stacked bars
const buildStackedBarSpecificationLambda = function(yAttrs, title) {
  return (cids, cData, gcsData, displayGcsData, allGcsData, winGcsData) => {
    const dataSet = cids.map(cid => ({
      contestant_id: cid,
      values: yAttrs.map(attr => d3.mean(gcsData.get(cid).map(attr.generatingFunction))),
      displayValues: yAttrs.map(attr => attr.averageDisplayFormat(d3.mean(gcsData.get(cid).map(attr.generatingFunction)))),
    }))
    const aggregateDataSet = [
      {
        label: 'Selected contestant avg',
        values: yAttrs.map(attr => d3.mean(displayGcsData.map(attr.generatingFunction))),
        displayValues: yAttrs.map(attr => attr.averageDisplayFormat(d3.mean(displayGcsData.map(attr.generatingFunction)))),
        color: 'black'
      },
      {
        label: 'Winner avg',
        values: yAttrs.map(attr => d3.mean(winGcsData.map(attr.generatingFunction))),
        displayValues: yAttrs.map(attr => attr.averageDisplayFormat(d3.mean(winGcsData.map(attr.generatingFunction)))),
        color: 'black'
      },
      {
        label: 'All contestant avg',
        values: yAttrs.map(attr => d3.mean(allGcsData.map(attr.generatingFunction))),
        displayValues: yAttrs.map(attr => attr.averageDisplayFormat(d3.mean(allGcsData.map(attr.generatingFunction)))),
        color: 'black'
      }
    ]
    return {
      data: dataSet,
      aggregateData: aggregateDataSet,
      xCoreLabelFunction: d => cData.get(d.contestant_id).name,
      xGroupLabels: ['Contestants'],
      yFunctionGroups: [d3.range(0, yAttrs.length).map(i => (d => d.displayValues[i]))],
      colorFunction: d => color.value(d.contestant_id),
      sortFunction: (a, b) => d3.descending(a.values[0], b.values[0]),
      displayLimit: graphDisplayLimit.value,
      yLabel: yAttrs.map(attr => attr.short_label).join(' -> '),
      title: title
    }
  }
}

const attemptBarChartSpecification = data.computedIfRefHasValues(
  [displayContestantIds, contestantDataById, gameContestantStatDataByContestantId,
    displayContestantGameContestantStatData, gameContestantStatData, winnerContestantGameContestantStatData],
  buildStackedBarSpecificationLambda([gcsAttributes.buzc, gcsAttributes.buz, gcsAttributes.att], 'Attempts'))

const attemptValueBarChartSpecification = data.computedIfRefHasValues(
  [displayContestantIds, contestantDataById, gameContestantStatDataByContestantId,
    displayContestantGameContestantStatData, gameContestantStatData, winnerContestantGameContestantStatData],
  buildStackedBarSpecificationLambda([gcsAttributes.buz_score, gcsAttributes.buz_value, gcsAttributes.att_value], 'Attempt Values'))

//Charts
const totalAttemptsChartSpecification = data.computedIfRefHasValues(
  [gameIds, gameDataById, gameStatDataById, gameContestantStatDataByGameId],
  (gIds, gData, gsData, gcsData) => {
    const values = d3.zip(
      movingAverageOfLast(5, gIds.map(gid => gsAttributes.att_total.generatingFunction(gsData.get(gid), gcsData.get(gid)))),
      movingAverageOfLast(5, gIds.map(gid => gsAttributes.att_max.generatingFunction(gsData.get(gid), gcsData.get(gid)))),
      movingAverageOfLast(5, gIds.map(gid => gsAttributes.att_med.generatingFunction(gsData.get(gid), gcsData.get(gid)))),
      movingAverageOfLast(5, gIds.map(gid => gsAttributes.att_min.generatingFunction(gsData.get(gid), gcsData.get(gid))))
    )
    return {
      data: d3.zip(gIds, values),
      xFunction: d => dateFormat(gData.get(d[0]).airdate),
      yFunctions: [d => d[1][0], d => d[1][1], d => d[1][2], d => d[1][3]],
      colors: d3.schemeCategory10,
      labels: [gsAttributes.att_total.label, gsAttributes.att_max.label, gsAttributes.att_med.label, gsAttributes.att_min.label],
      xLabel: 'Airdate',
      yLabel: 'Attempts',
      title: 'Attempts 5 Game Rolling Average'
    }
  })

const rollingAverageGraphAttributeIdx = ref(0)
const rollingAverageRollCount = ref(5)
const rollingGameStatAttributes = gsAttributes.all_attributes
const rollingAverageGraphAttribute = computed(() => rollingGameStatAttributes[rollingAverageGraphAttributeIdx.value])
const rollingChartSpecification = data.computedIfRefHasValues(
  [gameIds, gameDataById, gameStatDataById, gameContestantStatDataByGameId, rollingAverageGraphAttribute, rollingAverageRollCount],
  (gIds, gData, gsData, gcsData, attr, rollCount) => {
    const numerators = movingAverageOfLast(rollCount, gIds.map(gid => attr.generatingFunction(gsData.get(gid), gcsData.get(gid))))
    const denominators = new Array(numerators.length).fill(1.0)
    const values = d3.zip(numerators, denominators).map(a => (1.0 * a[0] / a[1]))
    return {
      data: d3.zip(gIds, values),
      xFunction: d => dateFormat(gData.get(d[0]).airdate),
      yFunctions: [d => d[1]],
      colors: d3.schemeCategory10,
      labels: [attr.label],
      xLabel: 'Airdate',
      yLabel: attr.short_label,
      title: attr.label + ' ' + rollCount + ' Game Rolling Average'
    }
  })

const boxWhiskerGraphAttributeIdx = ref(0)
const boxWhiskerGraphAttributes = gcsAttributes.all_attributes
const boxWhiskerGraphAttribute = computed(() => boxWhiskerGraphAttributes[boxWhiskerGraphAttributeIdx.value])
const boxWhiskerGraphRoundIdx = ref(0)
const boxWhiskerGraphSpecification = data.computedIfRefHasValues(
  [displayContestantIds, contestantDataById, gameDataById, gameContestantStatDataByContestantId, boxWhiskerGraphAttribute],
  (cids, cData, gData, gcsData, attr) => {
    cids = cids.filter(cid => {
      return gcsData.get(cid).some(gcs => !_.isNil(attr.generatingFunction(gcs)))
    })
    cids.sort((a,b) => d3.descending(
      d3.mean(gcsData.get(a).map(attr.generatingFunction)),
      d3.mean(gcsData.get(b).map(attr.generatingFunction))
    ))
    if (graphDisplayLimit.value) {
      cids = cids.slice(0, graphDisplayLimit.value)
    }
    return {
      dataByKey: gcsData,
      orderedKeys: cids,
      xLabel: k => cData.get(k).name,
      yFunction: attr.generatingFunction,
      yLabel: d => gData.get(d.game_id).season_id + '-' + gData.get(d.game_id).game_in_season,
      idColorFunction: color.value,
      title: attr.label,
      additionalBoxes: [
        {
          label: 'All Others',
          color: 'black',
          yLabel: d => cData.get(d.contestant_id).name + ' ' + gData.get(d.game_id).season_id + '-' + gData.get(d.game_id).game_in_season,
          filter: d => !cids.includes(d.contestant_id)
        }
      ]
    }
  }
)

const scatterGraphRoundIdx = ref(0)
const scatterGraphAttributes = gcsAttributes.all_attributes
const xScatterGraphAttributeIdx = ref(0)
const yScatterGraphAttributeIdx = ref(2)
const xScatterGraphAttribute = computed(() => scatterGraphAttributes[xScatterGraphAttributeIdx.value])
const yScatterGraphAttribute = computed(() => scatterGraphAttributes[yScatterGraphAttributeIdx.value])
const scatterGraphSpecification = data.computedIfRefHasValues(
  [displayContestantIds, contestantDataById, gameDataById, gameContestantStatData, xScatterGraphAttribute, yScatterGraphAttribute, color],
  (cids, cData, gData, gcsData, xAttr, yAttr, colorFunction) => {
    return {
      histogramData: gcsData,
      scatterData: gcsData.filter(gcs => cids.includes(gcs.contestant_id)),
      scatterLabelFunction: d => cData.get(d.contestant_id).name + ' ' + gData.get(d.game_id).season_id + '-' + gData.get(d.game_id).game_in_season,
      scatterColorFunction: d => colorFunction(d.contestant_id),
      title: xAttr.label + ' vs ' + yAttr.label,
      xLabel: xAttr.label,
      xFunction: xAttr.generatingFunction,
      xBins: xAttr.bins ? xAttr.bins : {},
      yLabel: yAttr.label,
      yFunction: yAttr.generatingFunction,
      yBins: yAttr.bins ? yAttr.bins : {},
      scatterMode: 'markers'
    }
  }
)


const averageScatterGraphSpecification = data.computedIfRefHasValues(
  [displayContestantIds, contestantDataById, gameContestantStatDataByContestantId, xScatterGraphAttribute, yScatterGraphAttribute, color],
  (cids, cData, gcsData, xAttr, yAttr, colorFunction) => {
    const gcsDataTransformed = transformValues(gcsData, gcsArray => [
      d3.mean(gcsArray.map(xAttr.generatingFunction)),
      d3.mean(gcsArray.map(yAttr.generatingFunction))
    ])
    const gcsDataForDisplay = [...gcsDataTransformed].map(([k, vs]) => [k].concat(vs))
    return {
      histogramData: gcsDataForDisplay,
      scatterData: gcsDataForDisplay.filter(gcs => cids.includes(gcs[0])),
      scatterLabelFunction: d => cData.get(d[0]).name,
      scatterColorFunction: d => colorFunction(d[0]),
      title: 'Average ' + xAttr.label + ' vs ' + yAttr.label,
      xLabel: xAttr.label,
      xFunction: d => d[1],
      xBins: xAttr.bins ? xAttr.bins : {},
      yLabel: yAttr.label,
      yFunction: d => d[2],
      yBins: yAttr.bins ? yAttr.bins : {}
    }
  }
)




</script>

<template>
  <Header />
  <div class="component-body">
    <h1>
      <span v-if="tocPeriodSearchParameters && tocPeriodSearchParameters.length > 0">{{ tocPeriodSearchParameters.join(', ') }} TOC Period<span v-if="tocPeriodSearchParameters.length > 1">s</span>&nbsp;</span>
      <span v-if="seasonSearchParameters && seasonSearchParameters.length > 0">Season<span v-if="seasonSearchParameters.length > 1">s</span> {{ seasonSearchParameters.join(', ') }}&nbsp;</span>
      <span v-if="playClassificationSearchParameters && playClassificationSearchParameters.length > 0">{{ d3.map(playClassificationSearchParameters, p => playClassificationName(p, undefined)).join(", ") }}&nbsp;</span>Summary
    </h1>
    <div v-if="displayContestantIdParameters.length > 0">
      Displaying specified contestants
    </div>
    <div v-else>
      Display contestants between
      <select v-model="winThresholdString">
        <option :value="null">Auto</option>
        <option>0</option>
        <option>1</option>
        <option>2</option>
        <option>3</option>
        <option>4</option>
        <option>5</option>
      </select>
      and 
      <select v-model="winLimitString">
        <option>0</option>
        <option>1</option>
        <option>2</option>
        <option>3</option>
        <option>4</option>
        <option>5</option>
        <option :value="null">No limit</option>
      </select>
      wins
    </div>
    <div class="section">
      <h2>Statistics Tables</h2>
      <div class="option-groups">
        <OptionGroup :optionLabels="roundOptionLabels" :selectionIndex="selectedRoundIndex"
          @newSelectionIndex="(idx) => selectedRoundIndex = idx" />
        <OptionGroup :optionLabels="aggregationOptionLabels" :selectionIndex="selectedAggregationIndex"
          @newSelectionIndex="(idx) => selectedAggregationIndex = idx" />
      </div>
      <div class="subsection">
        <h3>Standard Metrics</h3>
        <SortableTable v-if="standardScoringTableSpec" v-bind="standardScoringTableSpec" />
      </div>
      <div class="subsection">
        <h3>Conversion Metrics</h3>
        <SortableTable v-if="conversionScoringTableSpec" v-bind="conversionScoringTableSpec" />
      </div>
      <div class="subsection">
        <h3>Conversion Value Metrics</h3>
        <SortableTable v-if="conversionValueScoringTableSpec" v-bind="conversionValueScoringTableSpec" />
      </div>
    </div>
    <div class="section">
      <h2>Attempts</h2>
      <StackValueBarChart v-if="attemptBarChartSpecification" v-bind="attemptBarChartSpecification" />
    </div>
    <div class="section">
      <h2>Attempt Values</h2>
      <StackValueBarChart v-if="attemptValueBarChartSpecification" v-bind="attemptValueBarChartSpecification" />
    </div>
    <div class="section">
      <h2>Total Attempts</h2>
      <LineChart v-bind="totalAttemptsChartSpecification" />
    </div>
    <div class="section">
      <h2>Rolling Averages</h2>
      <select v-model="rollingAverageRollCount">
        <option :value="5">5 games</option>
        <option :value="10">10 games</option>
        <option :value="20">20 games</option>
      </select>
      <select v-model="rollingAverageGraphAttributeIdx">
        <option v-for="(attr, idx) in rollingGameStatAttributes" :value="idx">
          {{ attr.short_label }}
        </option>
      </select>
      <LineChart v-bind="rollingChartSpecification" />
    </div>
    <div class="section">
      <h2>Selectable Box and Whisker Plots</h2>
      <select v-model="boxWhiskerGraphAttributeIdx">
        <option v-for="(attr, idx) in boxWhiskerGraphAttributes" :value="idx">
          {{ attr.short_label }}
        </option>
      </select>
      <!--<select v-model="boxWhiskerGraphRoundIdx">
        <option :value="0">Full Game</option>
        <option :value="1">J! Round</option>
        <option :value="2">DJ! Round</option>
        <option v-if="displayRounds >= 3" :value="3">TJ! Round</option>
      </select>--><br/>
      <BoxWhiskerChart v-bind="boxWhiskerGraphSpecification" />
    </div>
    <div class="section">
      <h2>Selectable Scatter Plots</h2>
      <select v-model="xScatterGraphAttributeIdx">
        <option v-for="(graphAttribute, idx) in scatterGraphAttributes" :value="idx">
          {{ graphAttribute.short_label }}
        </option>
      </select>
      <select v-model="yScatterGraphAttributeIdx">
        <option v-for="(graphAttribute, idx) in scatterGraphAttributes" :value="idx">
          {{ graphAttribute.short_label }}
        </option>
      </select>
      <div class="graph-subsection">
        <h3>All Games</h3>
        <ScatterHistogram v-bind="scatterGraphSpecification"/>
      </div>
      <div class="graph-subsection">
        <h3>Average by Contestant</h3>
        <ScatterHistogram v-bind="averageScatterGraphSpecification"/>
      </div>
    </div>
  </div>
  <Footer />
</template>

<style scoped>

.component-body {
  margin: 0 auto;
  width: min(900px, 90vw);
}

.section {
  padding: 2em 0 2em 0;
  text-align: center;
}

.section >>> table {
  width: 100%;
}

.section .subsection {
  padding: 1em 0 0 0;
}

.graph-subsection {
  margin-top: 1em;
}

.option-groups {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-around;
  background-color: #CCCCCC;
  max-width: 75%;
  margin: 0 auto;
}

.option-groups > div {
  padding: 0.5em 0.25em;
}

</style>
