var playClassificationName = function(playClassification, season) {
    if (playClassification === 'regular') return 'Regular Play'
    if (playClassification === 'champions') return 'Tournament of Champions'
    if (playClassification === 'exhibition') return 'Exhibition'
    if (playClassification === 'secondchance') return 'Second Chance'
    if (playClassification === 'professors') return 'Professors Tournament'
    if (playClassification === 'teachers') return 'Teachers Tournament'
    if (playClassification === 'teen') return 'Teen Tournament'
    if (playClassification === 'college') {
        if (season === 'NCC2022') return 'National College Championship'
        return 'College Tournament'
    }
    return 'p ' + playClassification
}

export { playClassificationName };