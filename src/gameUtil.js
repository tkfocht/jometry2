import { computedIfRefHasValues } from '@/data'

const constructSpecificationConstructor = function(
    baseScoringTableRows,
    competitorDataById,
    baseScoringTableData,
    competitorLink,
    competitorIdFn,
    competitorLabel
) {
    const constructScoringTableSpecification = function(attrSpecs) {
        return computedIfRefHasValues(
        [
            baseScoringTableRows,
            competitorDataById,
            baseScoringTableData
        ],
        (baseRows, cData, gcsData) => {
            var columns = [
                {
                    label: competitorLabel
                }
            ]
            columns = columns.concat(attrSpecs.map(attr => ({
                label: attr.short_label,
                description: attr.description
            })))
    
            var rows = baseRows.map(baseRow => {
                const cid = competitorIdFn(baseRow)
                var row = [
                    {
                        value: competitorLink(cid, cData.get(cid).name),
                        sortValue: baseRow.podium
                    }
                ]
                row = row.concat(attrSpecs.map(attr => ({
                    value: attr.valueDisplayFormat(attr.generatingFunction(gcsData.get(cid))),
                    sortValue: attr.generatingFunction(gcsData.get(cid))
                })))
                return row
            })
    
            return {
                columns: columns,
                rows: rows,
                footerRows: [],
                initialSortColumnIndex: 0,
                initialSortDescending: true
            }
        })
    }

    return {
        constructScoringTableSpecification: constructScoringTableSpecification
    }
}

export { constructSpecificationConstructor }