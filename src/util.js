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

var csvDataAccessor = function(row) {
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
    if (r['FJCor'] === '') r['FJCor'] = undefined;

    r['Buz%'] = 100.0 * r['Buz'] / r['Att'];
    r['JBuz%'] = 100.0 * r['JBuz'] / r['JAtt'];
    r['DJBuz%'] = 100.0 * r['DJBuz'] / r['DJAtt'];
    r['TJBuz%'] = 100.0 * r['TJBuz'] / r['TJAtt'];
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
    r['BuzC$'] = r['JBuzC$'] + r['DJBuzC$'] + ('TJBuzC$' in r ? r['TJBuzC$'] : 0);
    r['BuzI$'] = r['JBuzI$'] + r['DJBuzI$'] + ('TJBuzI$' in r ? r['TJBuzI$'] : 0);
    r['DDF'] = r['JDDF'] + r['DJDDF'] + ('TJDDF' in r ? r['TJDDF'] : 0);
    r['DD+'] = r['JDD+'] + r['DJDD+'] + ('TJDD+' in r ? r['TJDD+'] : 0);
    r['JDD$'] = d3.sum(d3.map(['JDD'], k => r[k] === undefined ? 0 : r[k]));
    r['DJDD$'] = d3.sum(d3.map(['DJDD1','DJDD2'], k => r[k] === undefined ? 0 : r[k]));
    r['TJDD$'] = d3.sum(d3.map(['TJDD1','TJDD2','TJDD3'], k => r[k] === undefined ? 0 : r[k]));
    r['DD$'] = r['JDD$'] + r['DJDD$'] + r['TJDD$'];
    r['FJ$'] = r['FJCor'] === undefined ? (r['FJWager'] === 0 || r['FJWager'] === undefined ? 0 : undefined) : (-1 + (2 * r['FJCor'])) * r['FJWager'];
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
            contestants: [gameData[0]['Contestant'], gameData[1]['Contestant'], gameData[2]['Contestant']],
            season: gameData[0]['Season'],
            gameInSeason: gameData[0]['Game In Season']
        }));
}

export { csvDataAccessor, gameStatDataFromContestantStatData, dateFormat };