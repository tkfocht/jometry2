const buzScoreTotal = {
    label: 'Buz$',
    generatingFunction: gameData => d3.sum(d3.map(gameData, gd => gd['Buz$']))
}

const gameGraphAttributes = [
    buzScoreTotal
]

export { gameGraphAttributes };