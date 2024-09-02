var playClassificationGenericName = function(playClassification) {
    if (playClassification === 'regular') return 'Regular Play'
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

var dataSourceAddress = function(dataSourceId) {
    if (dataSourceId === 'celebrity') {
        return '/csvs/PCJ2023_full.csv'
    }
    if (dataSourceId === 'standard') {
        return '/csvs/all_standard.csv'
    }
}

export { playClassificationName, playClassificationGenericName, playClassificationNameByTocPeriod, dataSourceAddress };