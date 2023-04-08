const attTotal = {
    label: 'Att',
    generatingFunction: d => d['Att']
}

const buzScoreTotal = {
    label: 'Buz$',
    generatingFunction: d => d['Buz$']
}

const buzCTotal = {
    label: 'BuzC',
    generatingFunction: d => d['BuzC']
}

const buzCScoreTotal = {
    label: 'BuzC$',
    generatingFunction: d => d['BuzC$']
}

const contention = {
    label: 'Contention',
    generatingFunction: d => d['Contention']
}

const fjCor = {
    label: 'FJCor',
    generatingFunction: d => d['FJCor']
}

const fjOpp = {
    label: 'FJOpp',
    generatingFunction: d => d['FJOpp']
}

const fjPct = {
    label: 'FJ%',
    generatingFunction: d => d['FJCor'],
    denominatorGeneratingFunction: d => d['FJOpp']
}

const winScore = {
    label: 'Win$',
    generatingFunction: d => d['Win$']
}

const gameGraphAttributes = [
    attTotal, buzCTotal, buzScoreTotal, buzCScoreTotal, contention, winScore
]

export { gameGraphAttributes };