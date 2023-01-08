import * as d3 from 'd3'

var csvDateParse = d3.timeParse("%m/%d/%Y");
var urlDateParse = d3.timeParse("%m-%d-%Y");
var dateFormat = d3.timeFormat("%m-%d-%Y");

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
    if (n === undefined) {
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
        return 'J'
    } else if (roundNumber === 2) {
        return 'DJ'
    } else if (roundNumber === 3) {
        return 'TJ'
    }
    return ''
}

export { averageData, rollupData, 
    csvDataAccessor, gameClueDataAccessor, formatNumber, gameStatDataFromContestantStatData, dateFormat,
    clueBaseValue, roundName, roundAbbreviation };