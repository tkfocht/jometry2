var playClassificationName = function(playClassification, season) {
    if (playClassification === 'regular') return 'Regular Play'
    if (playClassification === 'champions') return 'Tournament of Champions'
    if (playClassification === 'exhibition') return 'Exhibition'
    if (playClassification === 'secondchance') return 'Second Chance'
    if (playClassification === 'professors') return 'Professors Tournament'
    if (playClassification === 'teachers') return 'Teachers Tournament'
    if (playClassification === 'teen') return 'Teen Tournament'
    if (playClassification === 'celebrity') return 'Primetime Celebrity Tournament'
    if (playClassification === 'hsreunion') return 'High School Reunion Tournament'
    if (playClassification === 'college') {
        if (season === 'NCC2022') return 'National College Championship'
        return 'College Tournament'
    }
    return 'p ' + playClassification
}

var dataSourceAddress = function(dataSourceId) {
    if (dataSourceId === 'celebrity') {
        return 'https://j-ometry.com/csvs/PCJ2023_full.csv'
    }
    if (dataSourceId === 'standard') {
        return 'https://j-ometry.com/csvs/all_standard.csv'
    }
}

export { playClassificationName, dataSourceAddress };