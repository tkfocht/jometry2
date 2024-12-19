import * as d3 from 'd3'
import * as _ from 'lodash'
import { computedIfRefHasValue } from '@/data'

var csvDateParse = d3.timeParse("%m/%d/%Y");
var ymdDateParse = d3.timeParse("%Y-%m-%d");
var urlDateParse = d3.timeParse("%m-%d-%Y");
var dateFormat = d3.timeFormat("%m-%d-%Y");

var subdomainIdentifier = function() {
    const hostname = window.location.hostname
    var countback = 2
    if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
        countback = 1
    }
    const subdomain = hostname.split('.').slice(0, -countback).join('.')
    if (['celebrity','masters','popculture'].includes(subdomain)) {
        return subdomain
    }
    return 'syndicated'
}
    
const SUBDOMAIN_TITLES = {
    'syndicated': '',
    'celebrity': 'Celebrity',
    'popculture': 'Pop Culture',
    'masters': 'Masters',
}

var subdomainTitle = function() {
    const subdomain = subdomainIdentifier()
    return SUBDOMAIN_TITLES[subdomain]
}

var isSyndicated = function() {
    return subdomainIdentifier() === 'syndicated'
}

var isPopCulture = function() {
    return subdomainIdentifier() === 'popculture'
}

var getContestantNameFromData = function(data, contestantId) {
    if (d3.map(data, cd => cd['Jometry Contestant Id']).includes(contestantId)) {
        return d3.filter(data, cd => cd['Jometry Contestant Id'] === contestantId)[0]['Contestant'];
    } else {
        return undefined;
    }
};

var rollupData = function(rows, rollupFunction) {
    const attrs = new Set()
    for (const row of rows) {
        for (const attr in row) {
            attrs.add(attr)
        }
    }
    const r = {}
    for (const attr of attrs) {
        if (d3.every(rows, d => d[attr] === undefined)) {
            r[attr] = undefined
        } else {
            r[attr] = rollupFunction(rows, d => d[attr])
        }
    }
    return r
}

var averageData = function(rows) {
    return rollupData(rows, d3.mean)
}

var jschemaCsvDataAccessor = function(row) {
    var r = {};
    for (var k in row) {
        if (k === 'airdate') {
            r[k] = ymdDateParse(row[k]);
        } else if (k === 'season_id' || k === 'toc_period') {
            r[k] = row[k];
        } else if (row[k] === '') {
            r[k] = undefined;
        } else {
            r[k] = +row[k];
            if (isNaN(r[k])) {
                r[k] = row[k];
            }
        }
    }
    return r;
}

var csvDataAccessor = function(row) {
    var r = {};
    for (var k in row) {
        if (k === 'Date') {
            r[k] = csvDateParse(row[k]);
        } else if (k === 'Season' || k === 'TOC Period') {
            r[k] = row[k];
        } else if (row[k] === '') {
            r[k] = undefined;
        } else {
            r[k] = +row[k];
            if (isNaN(r[k])) {
                r[k] = row[k];
            }
        }
    }
    if (r['FJCor'] === '') r['FJCor'] = undefined;

    r['Buz%'] = r['Att'] === undefined ? undefined : 100.0 * r['Buz'] / r['Att'];
    r['JBuz%'] = r['JAtt'] === undefined ? undefined : 100.0 * r['JBuz'] / r['JAtt'];
    r['DJBuz%'] = r['DJAtt'] === undefined ? undefined : 100.0 * r['DJBuz'] / r['DJAtt'];
    r['TJBuz%'] = r['TJAtt'] === undefined ? undefined : 100.0 * r['TJBuz'] / r['TJAtt'];
    r['BuzC'] = r['JBuzC'] + r['DJBuzC'] + ('TJBuzC' in r ? r['TJBuzC'] : 0);
    r['BuzInc'] = r['JBuzInc'] + r['DJBuzInc'] + ('TJBuzInc' in r ? r['TJBuzInc'] : 0);
    r['BuzI'] = r['BuzInc'];
    r['JBuzI'] = r['JBuzInc'];
    r['DJBuzI'] = r['DJBuzInc'];
    r['TJBuzI'] = r['TJBuzInc'];
    r['BuzC%'] = 100.0 * r['BuzC'] / r['Buz'];
    r['JBuzC%'] = 100.0 * r['JBuzC'] / r['JBuz'];
    r['DJBuzC%'] = 100.0 * r['DJBuzC'] / r['DJBuz'];
    r['TJBuzC%'] = 100.0 * r['TJBuzC'] / r['TJBuz'];
    r['Acc%'] = 100.0 * r['BuzC'] / r['Buz'];
    r['JAcc%'] = 100.0 * r['JBuzC'] / r['JBuz'];
    r['DJAcc%'] = 100.0 * r['DJBuzC'] / r['DJBuz'];
    r['TJAcc%'] = 100.0 * r['TJBuzC'] / r['TJBuz'];
    r['Conv%'] = r['Att'] === undefined ? undefined : 100.0 * r['BuzC'] / r['Att'];
    r['JConv%'] = r['JAtt'] === undefined ? undefined : 100.0 * r['JBuzC'] / r['JAtt'];
    r['DJConv%'] = r['DJAtt'] === undefined ? undefined : 100.0 * r['DJBuzC'] / r['DJAtt'];
    r['TJConv%'] = r['TJAtt'] === undefined ? undefined : 100.0 * r['TJBuzC'] / r['TJAtt'];
    r['BuzC$'] = r['JBuzC$'] + r['DJBuzC$'] + ('TJBuzC$' in r ? r['TJBuzC$'] : 0);
    r['BuzI$'] = r['JBuzI$'] + r['DJBuzI$'] + ('TJBuzI$' in r ? r['TJBuzI$'] : 0);
    r['BuzValue%'] = r['AttValue'] === undefined ? undefined : 100.0 * r['BuzValue'] / r['AttValue'];
    r['JBuzValue%'] = r['JAttValue'] === undefined ? undefined : 100.0 * r['JBuzValue'] / r['JAttValue'];
    r['DJBuzValue%'] = r['DJAttValue'] === undefined ? undefined : 100.0 * r['DJBuzValue'] / r['DJAttValue'];
    r['TJBuzValue%'] = r['TJAttValue'] === undefined ? undefined : 100.0 * r['TJBuzValue'] / r['TJAttValue'];
    r['Buz$%'] = 100.0 * r['Buz$'] / r['BuzValue'];
    r['AccValue%'] = 100.0 * r['Buz$'] / r['BuzValue'];
    r['JAccValue%'] = 100.0 * r['JBuz$'] / r['JBuzValue'];
    r['DJAccValue%'] = 100.0 * r['DJBuz$'] / r['DJBuzValue'];
    r['TJAccValue%'] = 100.0 * r['TJBuz$'] / r['TJBuzValue'];
    r['ConvValue%'] = r['AttValue'] === undefined ? undefined : 100.0 * r['Buz$'] / r['AttValue'];
    r['JConvValue%'] = r['JAttValue'] === undefined ? undefined : 100.0 * r['JBuz$'] / r['JAttValue'];
    r['DJConvValue%'] = r['DJAttValue'] === undefined ? undefined : 100.0 * r['DJBuz$'] / r['DJAttValue'];
    r['TJConvValue%'] = r['TJAttValue'] === undefined ? undefined : 100.0 * r['TJBuz$'] / r['TJAttValue'];
    r['DDF'] = r['JDDF'] + r['DJDDF'] + ('TJDDF' in r ? r['TJDDF'] : 0);
    r['DD+'] = r['JDD+'] + r['DJDD+'] + ('TJDD+' in r ? r['TJDD+'] : 0);
    r['JDD$'] = d3.sum(d3.map(['JDD'], k => r[k] === undefined ? 0 : r[k]));
    r['DJDD$'] = d3.sum(d3.map(['DJDD1','DJDD2'], k => r[k] === undefined ? 0 : r[k]));
    r['TJDD$'] = d3.sum(d3.map(['TJDD1','TJDD2','TJDD3'], k => r[k] === undefined ? 0 : r[k]));
    r['DD$'] = r['JDD$'] + r['DJDD$'] + r['TJDD$'];
    r['FJ$'] = r['FJCor'] === undefined ? (r['FJWager'] === 0 || r['FJWager'] === undefined ? 0 : undefined) : (-1 + (2 * r['FJCor'])) * r['FJWager'];
    r['Win$'] = r['FJFinal$'] * r['Wins'];
    return r;
};

var formatNumber = function(n, p, dropZeros = true, sign = false) {
    if (_.isNil(n)) {
        return undefined;
    }
    if (isNaN(n)) {
        return undefined;
    }
    var s = n.toFixed(p);
    if (dropZeros) {
        s = s.replace(/[.,]0+$/, "");
    }
    if (sign && n >= 0) {
        s = '+' + s;
    }
    return s;
};

var movingAverageOfLast = function(n, data) {
    const means = []
    for(var i=0 ; i < data.length; ++i) {
        if (i < n-1) {
            means.push(undefined)
        } else {
            const sliced = data.slice(i-n+1, i+1)
            means.push(d3.mean(sliced))
        }
    }
    return means
}

var gameStatDataFromContestantStatData = function(data) {
    return Array.from(d3.group(data, d => d['Jometry Game Id']),
        ([gameId,gameData]) => ({
            gameId: gameId,
            date: gameData[0]['Date'],
            contestants: [
                { id: gameData[0]['Jometry Contestant Id'], name: gameData[0]['Contestant'] },            
                { id: gameData[1]['Jometry Contestant Id'], name: gameData[1]['Contestant'] },            
                { id: gameData[2]['Jometry Contestant Id'], name: gameData[2]['Contestant'] }
            ],
            tocPeriod: gameData[0]['TOC Period'],
            playClassification: gameData[0]['Play Classification'],
            season: gameData[0]['Season'],
            gameInSeason: gameData[0]['Game In Season'],
            rounds: gameData[0]['TJRead'] === undefined || gameData[0]['TJRead'] === 0 ? 2 : 3,
            'JContention': gameData[0]['JGCon'],
            'DJContention': gameData[0]['DJGCon'],
            'TJContention': gameData[0]['TJGCon'],
            'Contention': d3.mean([gameData[0]['JGCon'], gameData[0]['DJGCon']].concat(gameData[0]['TJGCon'] ? [gameData[0]['TJGCon']] : [])),
            'JBuz$': d3.sum(d3.map(gameData, gd => gd['JBuz$'])),
            'DJBuz$': d3.sum(d3.map(gameData, gd => gd['DJBuz$'])),
            'TJBuz$': d3.sum(d3.map(gameData, gd => gd['TJBuz$'])),
            'Buz$': d3.sum(d3.map(gameData, gd => gd['Buz$'])),
            'JBuzC$': d3.sum(d3.map(gameData, gd => gd['JBuzC$'])),
            'DJBuzC$': d3.sum(d3.map(gameData, gd => gd['DJBuzC$'])),
            'TJBuzC$': d3.sum(d3.map(gameData, gd => gd['TJBuzC$'])),
            'BuzC$': d3.sum(d3.map(gameData, gd => gd['BuzC$'])),
            'Win$': d3.sum(d3.map(gameData, gd => gd['FJFinal$'] * gd['Wins'])),
            'Att': d3.sum(d3.map(gameData, gd => gd['Att'])),
            'AttMax': d3.max(d3.map(gameData, gd => gd['Att'])),
            'AttMed': d3.median(d3.map(gameData, gd => gd['Att'])),
            'AttMin': d3.min(d3.map(gameData, gd => gd['Att'])),
            'Buz': d3.sum(d3.map(gameData, gd => gd['Buz'])),
            'BuzC': d3.sum(d3.map(gameData, gd => gd['BuzC'])),
            'BuzCMed': d3.median(d3.map(gameData, gd => gd['BuzC'])),
            'BuzI': d3.sum(d3.map(gameData, gd => gd['BuzI'])),
            'FJCor': d3.sum(d3.map(gameData, gd => gd['FJCor'])),
            'FJOpp': d3.sum(d3.map(gameData, gd => gd['FJCor'] === undefined ? 0 : 1)),
        }));
}

var gameClueDataAccessor = function(row) {
    var r = {};
    for (var k in row) {
        if (k === 'Date') {
            r[k] = csvDateParse(row[k]);
        } else if (row[k] === '') {
            r[k] = undefined;
        } else {
            r[k] = +row[k];
            if (isNaN(r[k])) {
                r[k] = row[k];
            }
        }
    }
    return r;
};

var clueBaseValue = function(roundCount) {
    if (roundCount === 3) return 100
    return 200
}

var roundName = function(roundNumber) {
    if (roundNumber === 1) {
        return 'Jeopardy!'
    } else if (roundNumber === 2) {
        return 'Double Jeopardy!'
    } else if (roundNumber === 3) {
        return 'Triple Jeopardy!'
    }
    return ''
}

var roundAbbreviation = function(roundNumber) {
    if (roundNumber === 1) {
        return 'J!'
    } else if (roundNumber === 2) {
        return 'DJ!'
    } else if (roundNumber === 3) {
        return 'TJ!'
    }
    return ''
}

var transformValues = function(map, lambda) {
    return new Map([...map].map(([k, v]) => [k, lambda(v)]))
}

var filterValues = function(map, lambda) {
    return new Map([...map].filter(([k, v]) => lambda(v)))
}

var initializeString = function(s) {
    if (!s) {
        return undefined
    }
    var sArray = s.split(' ')
    return sArray.map(s0 => s0[0]).join('')
}


const teamIdToContestantIdMapFromGameData = function(gameData) {
    return computedIfRefHasValue(gameData,
      gData => {
        var retMap = new d3.InternMap()
        for (var g of gData) {
            if (g.podium_1_team_id !== undefined) {
            if (!retMap.has(g.podium_1_team_id)) {
                retMap.set(g.podium_1_team_id, [])
            }
            if (!retMap.has(g.podium_2_team_id)) {
                retMap.set(g.podium_2_team_id, [])
            }
            if (!retMap.has(g.podium_3_team_id)) {
                retMap.set(g.podium_3_team_id, [])
            }
            if (!retMap.get(g.podium_1_team_id).includes(g.podium_1_1_contestant_id)) {
                retMap.get(g.podium_1_team_id).push(g.podium_1_1_contestant_id)
            }
            if (!retMap.get(g.podium_1_team_id).includes(g.podium_1_2_contestant_id)) {
                retMap.get(g.podium_1_team_id).push(g.podium_1_2_contestant_id)
            }
            if (!retMap.get(g.podium_1_team_id).includes(g.podium_1_3_contestant_id)) {
                retMap.get(g.podium_1_team_id).push(g.podium_1_3_contestant_id)
            }
            if (!retMap.get(g.podium_2_team_id).includes(g.podium_2_1_contestant_id)) {
                retMap.get(g.podium_2_team_id).push(g.podium_2_1_contestant_id)
            }
            if (!retMap.get(g.podium_2_team_id).includes(g.podium_2_2_contestant_id)) {
                retMap.get(g.podium_2_team_id).push(g.podium_2_2_contestant_id)
            }
            if (!retMap.get(g.podium_2_team_id).includes(g.podium_2_3_contestant_id)) {
                retMap.get(g.podium_2_team_id).push(g.podium_2_3_contestant_id)
            }
            if (!retMap.get(g.podium_3_team_id).includes(g.podium_3_1_contestant_id)) {
                retMap.get(g.podium_3_team_id).push(g.podium_3_1_contestant_id)
            }
            if (!retMap.get(g.podium_3_team_id).includes(g.podium_3_2_contestant_id)) {
                retMap.get(g.podium_3_team_id).push(g.podium_3_2_contestant_id)
            }
            if (!retMap.get(g.podium_3_team_id).includes(g.podium_3_3_contestant_id)) {
                retMap.get(g.podium_3_team_id).push(g.podium_3_3_contestant_id)
            }
            }
        }
        return retMap
    });
}

const contestantIdToTeamIdMapFromGameData = function(gameData) {
  return computedIfRefHasValue(gameData,
    gData => {
      var retMap = new d3.InternMap()
      for (var g of gData) {
        if (g.podium_1_team_id !== undefined) {
          if (!retMap.has(g.podium_1_1_contestant_id)) {
            retMap.set(g.podium_1_1_contestant_id, [])
          }
          if (!retMap.has(g.podium_1_2_contestant_id)) {
            retMap.set(g.podium_1_2_contestant_id, [])
          }
          if (!retMap.has(g.podium_1_3_contestant_id)) {
            retMap.set(g.podium_1_3_contestant_id, [])
          }
          if (!retMap.has(g.podium_2_1_contestant_id)) {
            retMap.set(g.podium_2_1_contestant_id, [])
          }
          if (!retMap.has(g.podium_2_2_contestant_id)) {
            retMap.set(g.podium_2_2_contestant_id, [])
          }
          if (!retMap.has(g.podium_2_3_contestant_id)) {
            retMap.set(g.podium_2_3_contestant_id, [])
          }
          if (!retMap.has(g.podium_3_1_contestant_id)) {
            retMap.set(g.podium_3_1_contestant_id, [])
          }
          if (!retMap.has(g.podium_3_2_contestant_id)) {
            retMap.set(g.podium_3_2_contestant_id, [])
          }
          if (!retMap.has(g.podium_3_3_contestant_id)) {
            retMap.set(g.podium_3_3_contestant_id, [])
          }
          if (!retMap.get(g.podium_1_1_contestant_id).includes(g.podium_1_team_id)) {
            retMap.get(g.podium_1_1_contestant_id).push(g.podium_1_team_id)
          }
          if (!retMap.get(g.podium_1_2_contestant_id).includes(g.podium_1_team_id)) {
            retMap.get(g.podium_1_2_contestant_id).push(g.podium_1_team_id)
          }
          if (!retMap.get(g.podium_1_3_contestant_id).includes(g.podium_1_team_id)) {
            retMap.get(g.podium_1_3_contestant_id).push(g.podium_1_team_id)
          }
          if (!retMap.get(g.podium_2_1_contestant_id).includes(g.podium_2_team_id)) {
            retMap.get(g.podium_2_1_contestant_id).push(g.podium_2_team_id)
          }
          if (!retMap.get(g.podium_2_2_contestant_id).includes(g.podium_2_team_id)) {
            retMap.get(g.podium_2_2_contestant_id).push(g.podium_2_team_id)
          }
          if (!retMap.get(g.podium_2_3_contestant_id).includes(g.podium_2_team_id)) {
            retMap.get(g.podium_2_3_contestant_id).push(g.podium_2_team_id)
          }
          if (!retMap.get(g.podium_3_1_contestant_id).includes(g.podium_3_team_id)) {
            retMap.get(g.podium_3_1_contestant_id).push(g.podium_3_team_id)
          }
          if (!retMap.get(g.podium_3_2_contestant_id).includes(g.podium_3_team_id)) {
            retMap.get(g.podium_3_2_contestant_id).push(g.podium_3_team_id)
          }
          if (!retMap.get(g.podium_3_3_contestant_id).includes(g.podium_3_team_id)) {
            retMap.get(g.podium_3_3_contestant_id).push(g.podium_3_team_id)
          }
        }
      }
      return retMap
    })
}



const threeColorSet = ['#0072B2','#E69F00','#009E73']

export { subdomainIdentifier, subdomainTitle, isSyndicated, isPopCulture,
    teamIdToContestantIdMapFromGameData, contestantIdToTeamIdMapFromGameData,
    averageData, rollupData, initializeString,
    csvDataAccessor, gameClueDataAccessor, formatNumber, gameStatDataFromContestantStatData, dateFormat, urlDateParse,
    clueBaseValue, roundName, roundAbbreviation, movingAverageOfLast, jschemaCsvDataAccessor, transformValues, filterValues, threeColorSet };