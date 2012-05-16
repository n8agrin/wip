class rene.Layer

    # Default positioning is the identity function
    position: Object

    aesthetics: -> [
        ['x', @x],
        ['y', @y],
        ['color', @color],
        ['group', @group]
    ]

    mapData: (dataset) ->
        # Ouch, iterate over every data point...
        newPoints = []
        for point in dataset
            newPoint = {}
            for aesthetic in @aesthetics()
                newPoint[aesthetic[0]] = aesthetic[1](point)
            newPoints.push(newPoint)
        @position(@groupData(newPoints))

    groupData: (dataset) ->
        console.log('dataset', dataset)
        if dataset[0]?.group
            (v for k, v of d3.nest().key((d) -> d.group).map(dataset))
        else
            [dataset]