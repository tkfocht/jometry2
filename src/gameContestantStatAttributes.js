import { formatNumber } from '@/util'
import * as _ from 'lodash'

const att = {
    short_label: 'Att',
    label: 'Attempts',
    description: 'Attempts',
    generatingFunction: gcs => _.isNil(gcs.att) ? null : Math.round(gcs.att),
    valueDisplayFormat: v => formatNumber(v, 0),
    averageDisplayFormat: v => formatNumber(v, 1, false),
    bins: { size: 1 }
}

const att_value = {
    short_label: 'AttV',
    label: 'Attempt Value',
    description: 'Estimated clue value attempted',
    generatingFunction: gcs => gcs.att_value,
    valueDisplayFormat: v => formatNumber(v, 0),
    averageDisplayFormat: v => formatNumber(v, 0, false),
    bins: { size: 1000 }
}

const att_clue = {
    short_label: 'AttCl',
    label: 'Attempted Clues',
    description: 'Estimate of attempted clues',
    generatingFunction: gcs => gcs.att_clue,
    valueDisplayFormat: v => formatNumber(v, 1, false),
    averageDisplayFormat: v => formatNumber(v, 1, false),
    bins: { size: 1 }
}

const buz = {
    short_label: 'Buz',
    label: 'Buzzes',
    description: 'Buzzes',
    generatingFunction: gcs => gcs.buz,
    valueDisplayFormat: v => formatNumber(v, 0),
    averageDisplayFormat: v => formatNumber(v, 1, false),
    bins: { size: 1 }
}

const buz_value = {
    short_label: 'BuzV',
    label: 'Buzz Value',
    description: 'Clue value buzzed in on',
    generatingFunction: gcs => gcs.buz_value,
    valueDisplayFormat: v => formatNumber(v, 0),
    averageDisplayFormat: v => formatNumber(v, 0, false),
    bins: { size: 1000 }
}

const buz_percent = {
    short_label: 'Buz%',
    label: 'Buzz Percent',
    description: 'Buzzes as a percentage of attempts',
    generatingFunction: gcs => _.isNil(gcs.buz_percent) ? null : 100.0 * gcs.buz_percent,
    valueDisplayFormat: v => formatNumber(v, 1, false),
    averageDisplayFormat: v => formatNumber(v, 1, false),
    bins: { size: 5 }
}

const buz_value_percent = {
    short_label: 'BuzV%',
    label: 'Buzz Value %',
    description: 'Buzz value as percentage of attempt value',
    generatingFunction: gcs => _.isNil(gcs.buz_value_percent) ? null : 100.0 * gcs.buz_value_percent,
    valueDisplayFormat: v => formatNumber(v, 1, false),
    averageDisplayFormat: v => formatNumber(v, 1, false),
    bins: { size: 5 }
}

const buzc = {
    short_label: 'BuzC',
    label: 'Correct Buzzes',
    description: 'Correct responses on buzzes',
    generatingFunction: gcs => gcs.buzc,
    valueDisplayFormat: v => formatNumber(v, 0),
    averageDisplayFormat: v => formatNumber(v, 1, false),
    bins: { size: 1 }
}

const buz_score = {
    short_label: 'Buz$',
    label: 'Buzz Score',
    description: 'Scoring from buzzes',
    generatingFunction: gcs => gcs.buz_score,
    valueDisplayFormat: v => formatNumber(v, 0),
    averageDisplayFormat: v => formatNumber(v, 0, false),
    bins: { size: 1000 }
}

const coryat_score = {
    short_label: 'Coryat$',
    label: 'Coryat Score',
    description: 'Coryat score',
    generatingFunction: gcs => gcs.coryat_score,
    valueDisplayFormat: v => formatNumber(v, 0),
    averageDisplayFormat: v => formatNumber(v, 0, false),
    bins: { size: 1000 }
}

const acc_percent = {
    short_label: 'Acc%',
    label: 'Accuracy',
    description: 'Accuracy: Correct buzzes as a percentage of buzzes',
    generatingFunction: gcs => _.isNil(gcs.acc_percent) ? null : 100.0 * gcs.acc_percent,
    valueDisplayFormat: v => formatNumber(v, 1, false),
    averageDisplayFormat: v => formatNumber(v, 1, false),
    bins: { size: 5 }
}

const acc_value_percent = {
    short_label: 'AccV%',
    label: 'Accuracy Value %',
    description: 'Accuracy Value: Buzz score as percentage of buzz value',
    generatingFunction: gcs => _.isNil(gcs.acc_value_percent) ? null : 100.0 * gcs.acc_value_percent,
    valueDisplayFormat: v => formatNumber(v, 1, false),
    averageDisplayFormat: v => formatNumber(v, 1, false),
    bins: { size: 5 }
}

const conversion_percent = {
    short_label: 'Conv%',
    label: 'Conversion',
    description: 'Conversion: Correct buzzes as percentage of attempts',
    generatingFunction: gcs => _.isNil(gcs.conversion_percent) ? null : 100.0 * gcs.conversion_percent,
    valueDisplayFormat: v => formatNumber(v, 1, false),
    averageDisplayFormat: v => formatNumber(v, 1, false),
    bins: { size: 5 }
}

const conversion_value_percent = {
    short_label: 'ConvV%',
    label: 'Conversion Value %',
    description: 'Conversion Value: Buzz score as percentage of attempt value',
    generatingFunction: gcs => _.isNil(gcs.conversion_value_percent) ? null : 100.0 * gcs.conversion_value_percent,
    valueDisplayFormat: v => formatNumber(v, 1, false),
    averageDisplayFormat: v => formatNumber(v, 1, false),
    bins: { size: 5 }
}

const time = {
    short_label: 'Time',
    label: 'Timing',
    description: 'Estimated buzzes earned through timing',
    generatingFunction: gcs => gcs.timing,
    valueDisplayFormat: v => formatNumber(v, 1, false, true),
    averageDisplayFormat: v => formatNumber(v, 1, false, true),
    bins: { size: 0.5 }
}

const time_value = {
    short_label: 'TimeV',
    label: 'Timing Value',
    description: 'Estimated clue value of buzzes earned through timing',
    generatingFunction: gcs => gcs.timing_value,
    valueDisplayFormat: v => formatNumber(v, 0, false, true),
    averageDisplayFormat: v => formatNumber(v, 0, false, true),
    bins: { size: 500 }
}

const time_score = {
    short_label: 'Time$',
    label: 'Timing Score',
    description: 'Estimated scoring of buzzes earned through timing',
    generatingFunction: gcs => gcs.timing_score,
    valueDisplayFormat: v => formatNumber(v, 0, false),
    averageDisplayFormat: v => formatNumber(v, 0, false),
    bins: { size: 500, start: 0 }
}

const solo = {
    short_label: 'Solo',
    label: 'Solo',
    description: 'Estimated buzzes as solo attempter',
    generatingFunction: gcs => gcs.solo,
    valueDisplayFormat: v => formatNumber(v, 1, false),
    averageDisplayFormat: v => formatNumber(v, 1, false),
    bins: { size: 0.5 }
}

const solo_value = {
    short_label: 'SoloV',
    label: 'Solo Value',
    description: 'Estimated clue value of buzzes as solo attempter',
    generatingFunction: gcs => gcs.solo_value,
    valueDisplayFormat: v => formatNumber(v, 0, false),
    averageDisplayFormat: v => formatNumber(v, 0, false),
    bins: { size: 500 }
}

const solo_score = {
    short_label: 'Solo$',
    label: 'Solo Score',
    description: 'Estimated scoring on buzzes as solo attempter',
    generatingFunction: gcs => gcs.solo_score,
    valueDisplayFormat: v => formatNumber(v, 0, false),
    averageDisplayFormat: v => formatNumber(v, 0, false),
    bins: { size: 500 }
}

const dd_found = {
    short_label: 'DDF',
    label: 'Daily Doubles Found',
    description: 'Daily Doubles found',
    generatingFunction: gcs => gcs.dd_found,
    valueDisplayFormat: v => formatNumber(v, 0, false),
    averageDisplayFormat: v => formatNumber(v, 1, false),
    bins: { size: 0.25 }
}

const dd_plus_buzc = {
    short_label: 'DD+C',
    label: 'DD+ on Correct Buzzes',
    description: 'Daily Doubles found above expectation based on correct buzz responses',
    generatingFunction: gcs => gcs.dd_plus_buzc,
    valueDisplayFormat: v => formatNumber(v, 2, false, true),
    averageDisplayFormat: v => formatNumber(v, 2, false, true),
    bins: { size: 0.25 }
}

const dd_plus_selection = {
    short_label: 'DD+S',
    label: 'DD+ on Selections',
    description: 'Daily Doubles found above expectation based on number of selections',
    generatingFunction: gcs => gcs.dd_plus_selection,
    valueDisplayFormat: v => formatNumber(v, 2, false, true),
    averageDisplayFormat: v => formatNumber(v, 2, false, true),
    bins: { size: 0.25 }
}

const dd_score = {
    short_label: 'DD$',
    label: 'Daily Double Score',
    description: 'Scoring on Daily Doubles',
    generatingFunction: gcs => gcs.dd_score,
    valueDisplayFormat: v => formatNumber(v, 0, false),
    averageDisplayFormat: v => formatNumber(v, 0, false),
    bins: { size: 500 }
}

const fj_start_score = {
    short_label: 'Clue$',
    label: 'Clue Score',
    description: 'Score from clues: Buz$ + DD$',
    generatingFunction: gcs => gcs.score - gcs.fj_score,
    valueDisplayFormat: v => formatNumber(v, 0, false),
    averageDisplayFormat: v => formatNumber(v, 0, false),
    bins: { size: 500 }
}

const fj_score = {
    short_label: 'FJ$',
    label: 'FJ Score',
    description: 'Scoring from Final Jeopardy',
    generatingFunction: gcs => gcs.fj_score,
    valueDisplayFormat: v => formatNumber(v, 0, false),
    averageDisplayFormat: v => formatNumber(v, 0, false),
    bins: { size: 500 }
}

const fj_final_score = {
    short_label: 'Total$',
    label: 'Total Score',
    description: 'Total Score',
    generatingFunction: gcs => gcs.score,
    valueDisplayFormat: v => formatNumber(v, 0, false),
    averageDisplayFormat: v => formatNumber(v, 0, false),
    bins: { size: 500 }
}

const all_attributes = [
    att, att_clue, buz, buz_percent, buzc, acc_percent, conversion_percent, time, solo,
    att_value, buz_value, buz_score, coryat_score, buz_value_percent, acc_value_percent, conversion_value_percent,
    time_value, time_score, solo_value, solo_score,
    dd_found, dd_plus_buzc, dd_plus_selection, dd_score, fj_start_score, fj_score, fj_final_score]

export { att, att_value, att_clue, buz, buz_value, buz_percent, buz_value_percent,
    buzc, buz_score, coryat_score, acc_percent, acc_value_percent, conversion_percent, conversion_value_percent,
    time, time_value, time_score, solo, solo_value, solo_score,
    dd_found, dd_plus_buzc, dd_plus_selection, dd_score,
    fj_start_score, fj_score, fj_final_score,
    all_attributes };