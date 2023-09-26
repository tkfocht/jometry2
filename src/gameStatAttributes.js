import * as d3 from 'd3'
import { formatNumber } from '@/util'

const att_total = {
    short_label: 'Att',
    label: 'Attempts',
    description: 'Total attempts',
    generatingFunction: (gs, gcs) => gs.att_total > 0 ? gs.att_total : undefined,
    valueDisplayFormat: v => formatNumber(v, 0),
    averageDisplayFormat: v => formatNumber(v, 1, false)
}

const att_max = {
    short_label: 'Att Max',
    label: 'Max Attempts',
    description: 'Maximum attempts by a contestant',
    generatingFunction: (gs, gcs) => d3.max(gcs.map(s => s.att)),
    valueDisplayFormat: v => formatNumber(v, 0),
    averageDisplayFormat: v => formatNumber(v, 1, false)
}

const att_med = {
    short_label: 'Att Med',
    label: 'Median Attempts',
    description: 'Median attempts by a contestant',
    generatingFunction: (gs, gcs) => d3.median(gcs.map(s => s.att)),
    valueDisplayFormat: v => formatNumber(v, 0),
    averageDisplayFormat: v => formatNumber(v, 1, false)
}

const att_min = {
    short_label: 'Att Min',
    label: 'Min Attempts',
    description: 'Minimum attempts by a contestant',
    generatingFunction: (gs, gcs) => d3.min(gcs.map(s => s.att)),
    valueDisplayFormat: v => formatNumber(v, 0),
    averageDisplayFormat: v => formatNumber(v, 1, false)
}

const att_value_total = {
    short_label: 'AttV',
    label: 'Attempt Value',
    description: 'Total attempt value',
    generatingFunction: (gs, gcs) => gs.att_value_total > 0 ? gs.att_value_total : undefined,
    valueDisplayFormat: v => formatNumber(v, 0),
    averageDisplayFormat: v => formatNumber(v, 1, false)
}

const buzc_total = {
    short_label: 'BuzC',
    label: 'Correct Buzzes',
    description: 'Total correct buzzes',
    generatingFunction: (gs, gcs) => d3.sum(gcs.map(s => s.buzc)),
    valueDisplayFormat: v => formatNumber(v, 0),
    averageDisplayFormat: v => formatNumber(v, 1, false)
}

const buzi_total = {
    short_label: 'BuzI',
    label: 'Incorrect Buzzes',
    description: 'Total incorrect buzzes',
    generatingFunction: (gs, gcs) => d3.sum(gcs.map(s => s.buzi)),
    valueDisplayFormat: v => formatNumber(v, 0),
    averageDisplayFormat: v => formatNumber(v, 1, false)
}

const buz_score_total = {
    short_label: 'Buz$',
    label: 'Buzz Score',
    description: 'Total scoring from buzzes',
    generatingFunction: (gs, gcs) => d3.sum(gcs.map(s => s.buz_score)),
    valueDisplayFormat: v => formatNumber(v, 0),
    averageDisplayFormat: v => formatNumber(v, 0, false)
}

const coryat_score_total = {
    short_label: 'Coryat',
    label: 'Coryat',
    description: 'Total Coryat',
    generatingFunction: (gs, gcs) => gs.coryat_score_total,
    valueDisplayFormat: v => formatNumber(v, 0),
    averageDisplayFormat: v => formatNumber(v, 0, false)
}

const coryat_positive_score_total = {
    short_label: 'Coryat Positive',
    label: 'Coryat Positive',
    description: 'Total Coryat Positive',
    generatingFunction: (gs, gcs) => gs.coryat_score_positive_total,
    valueDisplayFormat: v => formatNumber(v, 0),
    averageDisplayFormat: v => formatNumber(v, 0, false)
}

const contention = {
    short_label: 'Contention',
    label: 'Contention',
    description: 'Contention',
    generatingFunction: (gs, gcs) => gs.contention,
    valueDisplayFormat: v => formatNumber(v, 2),
    averageDisplayFormat: v => formatNumber(v, 2, false)
}

const all_attributes = [
    att_total, att_max, att_med, att_min, att_value_total, buzc_total, buzi_total, buz_score_total,
    coryat_score_total, coryat_positive_score_total, contention
]

export { all_attributes, att_total, att_max, att_med, att_min, att_value_total,
    buzc_total, buzi_total, buz_score_total, coryat_score_total, coryat_positive_score_total,
    contention };