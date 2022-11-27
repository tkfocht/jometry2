const attGraphAttribute = (rounds) => ({
    label: 'Att',
    requiresBox: true,
    generatingFunctions: [d => d['Att'], d => d['JAtt'], d => d['DJAtt']].concat(rounds >= 3 ? [d => d['TJAtt']] : []),
    bins: { size: 1 }
})

const buzGraphAttribute = (rounds) => ({
    label: 'Buz',
    requiresBox: false,
    generatingFunctions: [d => d['Buz'], d => d['JBuz'], d => d['DJBuz']].concat(rounds >= 3 ? [d => d['TJBuz']] : []),
    bins: { size: 1 }
})

const attValueGraphAttribute = (rounds) => ({
    label: 'AttValue',
    requiresBox: true,
    generatingFunctions: [d => d['AttValue'], d => d['JAttValue'], d => d['DJAttValue']].concat(rounds >= 3 ? [d => d['TJAttValue']] : []),
    bins: { size: 1000 }
})

const buzValueGraphAttribute = (rounds) => ({
    label: 'BuzValue',
    requiresBox: false,
    generatingFunctions: [d => d['BuzValue'], d => d['JBuzValue'], d => d['DJBuzValue']].concat(rounds >= 3 ? [d => d['TJBuzValue']] : []),
    bins: { size: 1000 }
})

const buzScoreGraphAttribute = (rounds) => ({
    label: 'Buz$',
    requiresBox: false,
    generatingFunctions: [d => d['Buz$'], d => d['JBuz$'], d => d['DJBuz$']].concat(rounds >= 3 ? [d => d['TJBuz$']] : []),
    bins: { size: 1000 }
})

const buzValueScoreConversionGraphAttribute = (rounds) => ({
    label: 'Buz$%',
    requiresBox: false,
    generatingFunctions: [d => 100.0 * d['Buz$'] / d['BuzValue'], 
        d => 100.0 * d['JBuz$'] / d['JBuzValue'], 
        d => 100.0 * d['DJBuz$'] / d['DJBuzValue']].concat(rounds >= 3 ? [d => 100.0 * d['TJBuz$'] / d['TJBuzValue']] : []),
    bins: { size: 5 }
})

const timingGraphAttribute = (rounds) => ({
    label: 'Timing',
    requiresBox: true,
    generatingFunctions: [d => d['Timing'], d => d['JTiming'], d => d['DJTiming']].concat(rounds >= 3 ? [d => d['TJTiming']] : []),
    bins: { size: 0.5 }
})

const soloGraphAttribute = (rounds) => ({
    label: 'Solo',
    requiresBox: true,
    generatingFunctions: [d => d['Solo'], d => d['JSolo'], d => d['DJSolo']].concat(rounds >= 3 ? [d => d['TJSolo']] : []),
    bins: { start:0, size: 0.5 }
})

const timingValueGraphAttribute = (rounds) => ({
    label: 'TimingValue',
    requiresBox: true,
    generatingFunctions: [d => d['TimingValue'], d => d['JTimingValue'], d => d['DJTimingValue']].concat(rounds >= 3 ? [d => d['TJTimingValue']] : []),
    bins: { size: 500 }
})

const soloValueGraphAttribute = (rounds) => ({
    label: 'SoloValue',
    requiresBox: true,
    generatingFunctions: [d => d['SoloValue'], d => d['JSoloValue'], d => d['DJSoloValue']].concat(rounds >= 3 ? [d => d['TJSoloValue']] : []),
    bins: { start:0, size: 500 }
})

const graphAttributes = (rounds) => [
    attGraphAttribute(rounds), buzGraphAttribute(rounds), attValueGraphAttribute(rounds), buzValueGraphAttribute(rounds),
    buzScoreGraphAttribute(rounds), buzValueScoreConversionGraphAttribute(rounds), timingGraphAttribute(rounds), soloGraphAttribute(rounds),
    timingValueGraphAttribute(rounds), soloValueGraphAttribute(rounds)
]

export { graphAttributes };