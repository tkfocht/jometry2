import { isPopCulture } from '@/util'

var playClassificationGenericName = function(playClassification) {
    if (playClassification === 'regular') return 'Regular Play'
    if (playClassification === 'popculture') return 'Pop Culture'
    if (playClassification === 'champions') return 'Tournament of Champions'
    if (playClassification === 'invitational') return 'Invitational'
    if (playClassification === 'exhibition') return 'Exhibition'
    if (playClassification === 'secondchance') return 'Second Chance'
    if (playClassification === 'professors') return 'Professors'
    if (playClassification === 'teachers') return 'Teachers'
    if (playClassification === 'teen') return 'Teen'
    if (playClassification === 'celebrity') return 'Celebrity'
    if (playClassification === 'hsreunion') return 'High School Reunion'
    if (playClassification === 'masters') return 'Masters'
    if (playClassification === 'wildcard') return 'Champions Wildcard'
    if (playClassification === 'college') return 'College'
    return null
}

var playClassificationName = function(playClassification, season) {
    if (playClassification === 'regular') return 'Regular Play'
    if (playClassification === 'popculture') return 'Pop Culture'
    if (playClassification === 'champions') return 'Tournament of Champions'
    if (playClassification === 'invitational') return 'Invitational Tournament'
    if (playClassification === 'exhibition') return 'Exhibition'
    if (playClassification === 'secondchance') return 'Second Chance'
    if (playClassification === 'professors') return 'Professors Tournament'
    if (playClassification === 'teachers') return 'Teachers Tournament'
    if (playClassification === 'teen') return 'Teen Tournament'
    if (playClassification === 'celebrity' && season.substring(0,3) === 'PCJ') return 'Primetime Celebrity Tournament'
    if (playClassification === 'celebrity' && season === '32') return 'Power Players'
    if (playClassification === 'hsreunion') return 'High School Reunion Tournament'
    if (playClassification === 'masters') return 'Masters'
    if (playClassification === 'wildcard') return 'Champions Wildcard'
    if (playClassification === 'college') {
        if (season === 'NCC2022') return 'National College Championship'
        return 'College Tournament'
    }
    return null
}

var playClassificationNameByTocPeriod = function(playClassification, toc_period) {
    if (playClassification === 'regular') return 'Regular Play'
    if (playClassification === 'popculture') return 'Pop Culture'
    if (playClassification === 'champions') return 'Tournament of Champions'
    if (playClassification === 'invitational') return 'Invitational Tournament'
    if (playClassification === 'exhibition') return 'Exhibition'
    if (playClassification === 'secondchance') return 'Second Chance'
    if (playClassification === 'professors') return 'Professors Tournament'
    if (playClassification === 'teachers') return 'Teachers Tournament'
    if (playClassification === 'teen') return 'Teen Tournament'
    if (playClassification === 'celebrity') return 'Primetime Celebrity Tournament'
    if (playClassification === 'hsreunion') return 'High School Reunion Tournament'
    if (playClassification === 'masters') return 'Masters'
    if (playClassification === 'wildcard') return 'Champions Wildcard'
    if (playClassification === 'college') {
        if (toc_period === '2022') return 'National College Championship'
        return 'College Tournament'
    }
    return null
}

var seasonIds = [
    '32', '33', '34', '35', '36', '37', '38', '39', '40', '40A', '41',
    'M2023', 'M2024', 'PCJ1', 'PCJ2', 'PCJ3'
]

var seasonDisplayId = function(seasonId) {
    if (seasonId === 'PCJ1') return 'Celeb 1'
    if (seasonId === 'PCJ2') return 'Celeb 2'
    if (seasonId === 'PCJ3') return 'Celeb 3'
    if (seasonId === 'M2023') return 'Masters 1'
    if (seasonId === 'M2024') return 'Masters 2'
    if (seasonId.startsWith('POP') && isPopCulture()) return seasonId.substring(3)
    if (seasonId.endsWith('A')) return seasonId.substring(0, seasonId.length - 1) + " Audio"
    return seasonId
}

var tocPeriodIds = [
    '2017', '2019', '2021', '2022', '2024', '2025', '2026',
    'M2023', 'M2024'
]

var playClassifications = [
    'regular', 'champions', 'invitational', 'exhibition', 'secondchance', 'professors', 'teachers', 'teen',
    'celebrity', 'hsreunion', 'masters', 'wildcard', 'college'
]

var popCultureSeasonIds = [
    'POP1'
]

var popCultureTocPeriodIds = [
    'POP1'
]

var popCulturePlayClassifications = [
    'popculture'
]

var dataSourceAddress = function(dataSourceId) {
    if (dataSourceId === 'celebrity') {
        return '/csvs/PCJ2023_full.csv'
    }
    if (dataSourceId === 'standard') {
        return '/csvs/all_standard.csv'
    }
}

export { playClassificationName, playClassificationGenericName,
    playClassificationNameByTocPeriod, seasonDisplayId,
    seasonIds, tocPeriodIds, playClassifications,
    popCultureSeasonIds, popCultureTocPeriodIds, popCulturePlayClassifications,
    dataSourceAddress };