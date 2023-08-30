import * as d3 from 'd3'
import { formatNumber } from '@/util'

const att_total = {
    short_label: 'Att',
    label: 'Attempts',
    description: 'Total attempts',
    generatingFunction: (gs, gcs) => gs.att_total,
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

const coryat_score_total = {
    short_label: 'Coryat',
    label: 'Coryat',
    description: 'Total Coryat',
    generatingFunction: (gs, gcs) => gs.coryat_score_total,
    valueDisplayFormat: v => formatNumber(v, 0),
    averageDisplayFormat: v => formatNumber(v, 0, false)
}

export { att_total, att_max, att_med, att_min, coryat_score_total };