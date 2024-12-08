import { ref } from 'vue'
import * as d3 from 'd3'
import * as _ from 'lodash'
import { computedIfRefHasValue, computedIfRefHasValues } from '@/data'

const summaryDataConstructor = function(
  gameData,
  gameWinnerExtractionFn,
  gameCompetitorStatDataByGameIdAndCompetitorId,
  gameCompetitorStatData,
  competitorExtractionFn,
  displayContestantIdParameters,
  competitorIds,
  gameDataById,
  graphDisplayLimitString,
  winThresholdString,
  winLimitString
) {
    const competitorWins = computedIfRefHasValue(gameData, gData => d3.rollup(gData, v => v.length, gameWinnerExtractionFn))
    const competitorWinnings = computedIfRefHasValues([gameData, gameCompetitorStatDataByGameIdAndCompetitorId], (gData, gcsData) => {
      const aggregateWinnings = function(games) {
        return games
          .filter(g => !_.isNil(gameWinnerExtractionFn(g)))
          .map(g => {
            return gcsData.get(g.game_id).get(gameWinnerExtractionFn(g)).score
          })
          .reduce((a, b) => a + b, 0)
      }
      return d3.rollup(gData, aggregateWinnings, gameWinnerExtractionFn)
    })
    const competitorTotalScores = computedIfRefHasValue(gameCompetitorStatData, gcsData => {
      return d3.rollup(gcsData, v => v.map(gcs => gcs.score).reduce((a, b) => a + b, 0), competitorExtractionFn)
    })
    const competitorSort = computedIfRefHasValues(
      [competitorWins, competitorWinnings, competitorTotalScores],
      (wins, winnings, totalScores) => (
        (a, b) =>
          d3.descending(_.defaultTo(wins.get(a), 0), _.defaultTo(wins.get(b), 0)) ||
          d3.descending(_.defaultTo(winnings.get(a), 0), _.defaultTo(winnings.get(b), 0)) ||
          d3.descending(_.defaultTo(totalScores.get(a), 0), _.defaultTo(totalScores.get(b), 0))))
    const displayCompetitorIds = computedIfRefHasValues(
      [displayContestantIdParameters, competitorIds, competitorSort, competitorWins],
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
    const displayCompetitorGameCompetitorStatData = computedIfRefHasValues(
      [displayCompetitorIds, gameCompetitorStatData],
      (dCids, gcsData) => gcsData.filter(gcs => dCids.includes(competitorExtractionFn(gcs)))
    )
    const winnerCompetitorGameCompetitorStatData = computedIfRefHasValues(
      [gameDataById, gameCompetitorStatData],
      (gData, gcsData) => gcsData.filter(gcs => gameWinnerExtractionFn(gData.get(gcs.game_id)) === competitorExtractionFn(gcs))
    )
    const graphDisplayLimit = ref(graphDisplayLimitString.value ? +graphDisplayLimitString.value : undefined)
    
    return {
      displayCompetitorGameCompetitorStatData: displayCompetitorGameCompetitorStatData,
      displayCompetitorIds: displayCompetitorIds,
      competitorSort: competitorSort,
      competitorWins: competitorWins,
      winnerCompetitorGameCompetitorStatData: winnerCompetitorGameCompetitorStatData,
      graphDisplayLimit: graphDisplayLimit,
    }
}

const constructSpecificationConstuctors = function(
  baseScoringTableRows,
  gameDataById,
  competitorDataById,
  baseScoringTableData,
  baseScoringTableAggregation,
  baseScoringTableDisplayFunction,
  competitorLink,
  competitorIdFn,
  winningCompetitorIdFn,
  competitorLabel
) {
  const constructScoringTableSpecification = function(attrSpecs) {
    return computedIfRefHasValues(
      [baseScoringTableRows, gameDataById, competitorDataById,
        baseScoringTableData, baseScoringTableAggregation, baseScoringTableDisplayFunction],
      (baseRows, gData, cData, gcsData, aggrFn, attrDisplayFn) => {
        var columns = [
          {
            label: competitorLabel + ' (Wins)'
          }
        ]
        columns = columns.concat(attrSpecs.map(attr => ({
          label: attr.short_label,
          description: attr.description
        })))

        var rows = baseRows.map(baseRow => {
          const cid = competitorIdFn(baseRow)
          var row = [
            {
              value: competitorLink(cid, cData.get(cid).name) + '&nbsp;(' + baseRow.wins + ')',
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
          const competitorIds = baseRows.map(competitorIdFn)
          const gcses = competitorIds.flatMap(cid => gcsData.get(cid))
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
          const gcses = [...gcsData.values()].flatMap(l => l).filter(gcs => winningCompetitorIdFn(gData.get(gcs.game_id)) === competitorIdFn(gcs))
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

  return {
    constructScoringTableSpecification: constructScoringTableSpecification
  }
}




export { summaryDataConstructor, constructSpecificationConstuctors }