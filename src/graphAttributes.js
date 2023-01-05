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

const attBuzConversionGraphAttribute = (rounds) => ({
    label: 'Buz/Att %',
    requiresBox: false,
    generatingFunctions: [d => d['Att'] === undefined ? undefined : 100.0 * d['Buz'] / d['Att'], 
        d => d['JAtt'] === undefined ? undefined : 100.0 * d['JBuz'] / d['JAtt'], 
        d => d['DJAtt'] === undefined ? undefined : 100.0 * d['DJBuz'] / d['DJAtt']].concat(rounds >= 3 ? [d => d['TJAtt'] === undefined ? undefined : 100.0 * d['TJBuz'] / d['TJAtt']] : []),
    bins: { size: 5 }
})

const buzCGraphAttribute = (rounds) => ({
    label: 'BuzC',
    requiresBox: false,
    generatingFunctions: [d => d['BuzC'], d => d['JBuzC'], d => d['DJBuzC']].concat(rounds >= 3 ? [d => d['TJBuzC']] : []),
    bins: { size: 1 }
})

const buzBuzCConversionGraphAttribute = (rounds) => ({
    label: 'BuzC/Buz %',
    requiresBox: false,
    generatingFunctions: [d => 100.0 * d['BuzC'] / d['Buz'], 
        d => 100.0 * d['JBuzC'] / d['JBuz'], 
        d => 100.0 * d['DJBuzC'] / d['DJBuz']].concat(rounds >= 3 ? [d => 100.0 * d['TJBuzC'] / d['TJBuz']] : []),
    bins: { size: 5 }
})

const attBuzCConversionGraphAttribute = (rounds) => ({
    label: 'BuzC/Att %',
    requiresBox: false,
    generatingFunctions: [d => d['Att'] === undefined ? undefined : 100.0 * d['BuzC'] / d['Att'], 
        d => d['JAtt'] === undefined ? undefined : 100.0 * d['JBuzC'] / d['JAtt'], 
        d => d['DJAtt'] === undefined ? undefined : 100.0 * d['DJBuzC'] / d['DJAtt']].concat(rounds >= 3 ? [d => d['TJAtt'] === undefined ? undefined : 100.0 * d['TJBuzC'] / d['TJAtt']] : []),
    bins: { size: 5 }
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

const attValueBuzValueConversionGraphAttribute = (rounds) => ({
    label: 'BuzV/AttV %',
    requiresBox: false,
    generatingFunctions: [d => d['AttValue'] === undefined ? undefined : 100.0 * d['BuzValue'] / d['AttValue'], 
        d => d['JAttValue'] === undefined ? undefined : 100.0 * d['JBuzValue'] / d['JAttValue'], 
        d => d['DJAttValue'] === undefined ? undefined : 100.0 * d['DJBuzValue'] / d['DJAttValue']].concat(rounds >= 3 ? [d => d['TJAttValue'] === undefined ? undefined : 100.0 * d['TJBuzValue'] / d['TJAttValue']] : []),
    bins: { size: 5 }
})

const buzScoreGraphAttribute = (rounds) => ({
    label: 'Buz$',
    requiresBox: false,
    generatingFunctions: [d => d['Buz$'], d => d['JBuz$'], d => d['DJBuz$']].concat(rounds >= 3 ? [d => d['TJBuz$']] : []),
    bins: { size: 1000 }
})

const buzValueScoreConversionGraphAttribute = (rounds) => ({
    label: 'Buz$/BuzV %',
    requiresBox: false,
    generatingFunctions: [d => 100.0 * d['Buz$'] / d['BuzValue'], 
        d => 100.0 * d['JBuz$'] / d['JBuzValue'], 
        d => 100.0 * d['DJBuz$'] / d['DJBuzValue']].concat(rounds >= 3 ? [d => 100.0 * d['TJBuz$'] / d['TJBuzValue']] : []),
    bins: { size: 5 }
})

const attValueBuzScoreConversionGraphAttribute = (rounds) => ({
    label: 'Buz$/AttV %',
    requiresBox: false,
    generatingFunctions: [d => d['AttValue'] === undefined ? undefined : 100.0 * d['Buz$'] / d['AttValue'], 
        d => d['JAttValue'] === undefined ? undefined : 100.0 * d['JBuz$'] / d['JAttValue'], 
        d => d['DJAttValue'] === undefined ? undefined : 100.0 * d['DJBuz$'] / d['DJAttValue']].concat(rounds >= 3 ? [d => d['TJAttValue'] === undefined ? undefined : 100.0 * d['TJBuz$'] / d['TJAttValue']] : []),
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

const ddPlusGraphAttribute = (rounds) => ({
    label: 'DD+',
    requiresBox: false,
    generatingFunctions: [d => d['DD+'], d => d['JDD+'], d => d['DJDD+']].concat(rounds >= 3 ? [d => d['TJDD+']] : []),
    bins: { size: 0.2 }
})

const ddScoreGraphAttribute = (rounds) => ({
    label: 'DD$',
    requiresBox: false,
    generatingFunctions: [d => d['DD$'], d => d['JDD$'], d => d['DJDD$']].concat(rounds >= 3 ? [d => d['TJDD$']] : []),
    bins: { size: 1000 }
})

const djFinalScoreGraphAttribute = (rounds) => ({
    label: 'End of Regulation $',
    requiresBox: false,
    generatingFunctions: [d => d['DJFinal$'], d => d['DJFinal$'], d => d['DJFinal$']].concat(rounds >= 3 ? [d => d['TJFinal$']] : []),
    bins: { size: 1000 }
})

const endOfRegulationBuzScoreRatio = (rounds) => ({
    label: 'End of Regulation Buz$ Lead Ratio',
    requiresBox: false,
    generatingFunctions: [d => d['Buz$LeadRatio'], d => d['Buz$LeadRatio'], d => d['Buz$LeadRatio']].concat(rounds >= 3 ? [d => d['Buz$LeadRatio']] : []),
    bins: { size: 0.2 }
})

const endOfRegulationRatio = (rounds) => ({
    label: 'End of Regulation Lead Ratio',
    requiresBox: false,
    generatingFunctions: [d => d['LeadRatio'], d => d['LeadRatio'], d => d['LeadRatio']].concat(rounds >= 3 ? [d => d['LeadRatio']] : []),
    bins: { size: 0.2 }
})

const fjScoreGraphAttribute = (rounds) => ({
    label: 'FJ$',
    requiresBox: false,
    generatingFunctions: [d => d['FJ$'], d => d['FJ$'], d => d['FJ$']].concat(rounds >= 3 ? [d => d['FJ$']] : []),
    bins: { size: 1000 }
})

const finalScoreGraphAttribute = (rounds) => ({
    label: 'Final $',
    requiresBox: false,
    generatingFunctions: [d => d['FJFinal$'], d => d['FJFinal$'], d => d['FJFinal$']].concat(rounds >= 3 ? [d => d['FJFinal$']] : []),
    bins: { size: 1000 }
})

const graphAttributes = (rounds) => [
    attGraphAttribute(rounds), buzGraphAttribute(rounds), attBuzConversionGraphAttribute(rounds),
    buzCGraphAttribute(rounds), buzBuzCConversionGraphAttribute(rounds), attBuzCConversionGraphAttribute(rounds),
    timingGraphAttribute(rounds), soloGraphAttribute(rounds),
    attValueGraphAttribute(rounds), buzValueGraphAttribute(rounds),
    attValueBuzValueConversionGraphAttribute(rounds),
    buzScoreGraphAttribute(rounds), buzValueScoreConversionGraphAttribute(rounds), attValueBuzScoreConversionGraphAttribute(rounds),
    timingValueGraphAttribute(rounds), soloValueGraphAttribute(rounds),
    ddPlusGraphAttribute(rounds), ddScoreGraphAttribute(rounds),
    djFinalScoreGraphAttribute(rounds),
    fjScoreGraphAttribute(rounds), finalScoreGraphAttribute(rounds)
]

export { graphAttributes };