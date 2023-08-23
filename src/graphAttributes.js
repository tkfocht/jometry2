const attGraphAttribute = {
    label: 'Att',
    requiresBox: true,
    generatingFunctionFromSplit: d => d.att,
    bins: { size: 1 }
}

const attClueGraphAttribute = {
    label: 'AttClue',
    requiresBox: true,
    generatingFunctionFromSplit: d => d.att_clue,
    bins: { size: 1 }
}

const buzGraphAttribute = {
    label: 'Buz',
    requiresBox: false,
    generatingFunctionFromSplit: d => d.buz,
    bins: { size: 1 }
}

const attBuzConversionGraphAttribute = {
    label: 'Buz%',
    requiresBox: false,
    generatingFunctionFromSplit: d => 100.0 * d.buz_percent,
    bins: { size: 5 }
}

const buzCGraphAttribute = {
    label: 'BuzC',
    requiresBox: false,
    generatingFunctionFromSplit: d => d.buzc,
    bins: { size: 1 }
}

const buzBuzCConversionGraphAttribute = {
    label: 'Acc%',
    requiresBox: false,
    generatingFunctionFromSplit: d => 100.0 * d.acc_percent,
    bins: { size: 5 }
}

const attBuzCConversionGraphAttribute = {
    label: 'Conv%',
    requiresBox: false,
    generatingFunctionFromSplit: d => 100.0 * d.conversion_percent,
    bins: { size: 5 }
}

const attValueGraphAttribute = {
    label: 'AttValue',
    requiresBox: true,
    generatingFunctionFromSplit: d => d.att_value,
    bins: { size: 1000 }
}

const buzValueGraphAttribute = {
    label: 'BuzValue',
    requiresBox: false,
    generatingFunctionFromSplit: d => d.buz_value,
    bins: { size: 1000 }
}

const attValueBuzValueConversionGraphAttribute = {
    label: 'BuzValue%',
    requiresBox: false,
    generatingFunctionFromSplit: d => 100.0 * d.buz_value_percent,
    bins: { size: 5 }
}

const buzScoreGraphAttribute = {
    label: 'Buz$',
    requiresBox: false,
    generatingFunctionFromSplit: d => d.buz_score,
    bins: { size: 1000 }
}

const buzValueScoreConversionGraphAttribute = {
    label: 'AccValue%',
    requiresBox: false,
    generatingFunctionFromSplit: d => 100.0 * d.acc_value_percent,
    bins: { size: 5 }
}

const attValueBuzScoreConversionGraphAttribute = {
    label: 'ConvValue%',
    requiresBox: false,
    generatingFunctionFromSplit: d => 100.0 * d.conversion_value_percent,
    bins: { size: 5 }
}

const timingGraphAttribute = {
    label: 'Timing',
    requiresBox: true,
    generatingFunctionFromSplit: d => d.timing,
    bins: { size: 0.5 }
}

const soloGraphAttribute = {
    label: 'Solo',
    requiresBox: true,
    generatingFunctionFromSplit: d => d.solo,
    bins: { start:0, size: 0.5 }
}

const timingValueGraphAttribute = {
    label: 'TimingValue',
    requiresBox: true,
    generatingFunctionFromSplit: d => d.timing_value,
    bins: { size: 500 }
}

const timingScoreGraphAttribute = {
    label: 'TimingScore',
    requiresBox: true,
    generatingFunctionFromSplit: d => d.timing_score,
    bins: { start: 0, size: 500 }
}

const soloValueGraphAttribute = {
    label: 'SoloValue',
    requiresBox: true,
    generatingFunctionFromSplit: d => d.solo_value,
    bins: { start:0, size: 500 }
}

const soloScoreGraphAttribute = {
    label: 'SoloScore',
    requiresBox: true,
    generatingFunctionFromSplit: d => d.solo_score,
    bins: { size: 500 }
}

const ddPlusBuzCGraphAttribute = {
    label: 'DD+C',
    requiresBox: false,
    generatingFunctionFromSplit: d => d.dd_plus_buzc,
    bins: { size: 0.2 }
}

const ddPlusSelectionGraphAttribute = {
    label: 'DD+S',
    requiresBox: false,
    generatingFunctionFromSplit: d => d.dd_plus_selection,
    bins: { size: 0.2 }
}

const ddScoreGraphAttribute = {
    label: 'DD$',
    requiresBox: false,
    generatingFunctionFromSplit: d => d.dd_score,
    bins: { size: 1000 }
}

const graphAttributes = [
    attGraphAttribute, attClueGraphAttribute, buzGraphAttribute, attBuzConversionGraphAttribute,
    buzCGraphAttribute, buzBuzCConversionGraphAttribute, attBuzCConversionGraphAttribute,
    timingGraphAttribute, soloGraphAttribute,
    attValueGraphAttribute, buzValueGraphAttribute,
    attValueBuzValueConversionGraphAttribute,
    buzScoreGraphAttribute, buzValueScoreConversionGraphAttribute, attValueBuzScoreConversionGraphAttribute,
    timingValueGraphAttribute, timingScoreGraphAttribute, soloValueGraphAttribute, soloScoreGraphAttribute,
    ddPlusBuzCGraphAttribute, ddPlusSelectionGraphAttribute, ddScoreGraphAttribute
]

export { graphAttributes };