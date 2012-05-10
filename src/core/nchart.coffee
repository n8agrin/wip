class rene.Chart
    constructor: ->
        @layers         = []
        @xAxis          = d3.svg.axis().orient('bottom')
        @yAxis          = d3.svg.axis().orient('left')
        @xAxisLabel     = null
        @yAxisLabel     = null
        @xGrid          = d3.svg.axis()
        @yGrid          = d3.svg.axis()
        @margin         = {top: 20, bottom: 20, left: 30, right: 20}
        @containerSize  = [0, 0]
        @panelSize      = [0, 0]
        @container      = d3.select()
        @svg            = d3.select()
        @layerGroups    = d3.select()
        @scales         = {}
        @originalScales = {}

    setScale: (aes, scale) =>
        @scales[aes] = scale
        @originalScales[aes] = scale.copy()
        this

    setContainer: (container) =>
        @container = d3.select(container)
        @setDimensionsFromSelection(container)

    resetXYScales: =>
        for scaleName in ['x', 'y']
            if @scales[scaleName] and @originalScales[scaleName]
                @scales[scaleName] = @originalScales[scaleName]

    initSVG: (data) =>
        @svg = @container.selectAll('svg')
            .data([data])

        gEnter = svg.enter()
            .append('svg')
            .attr('class', 'chart')
            .attr('width', @containerSize[0])
            .attr('height', @containerSize[1])
            .append('g')
            .attr('transform', rene.utils.translate(@margin.left, @margin.top))

        gEnter.append('g')
            .attr('class', 'x grid')

        gEnter.append('g')
            .attr('class', 'y grid')

        gEnter.append('g')
            .attr('class', 'geoms')

        gEnter.append('g')
            .attr('class', 'x axis')

        gEnter.append('g')
            .attr('class', 'y axis')

    initScales: =>
        for layer in @layers
            for aes, scale of layer.scales()
                @scales[aes] || @setScale(aes, scale())

    positionData: (data) =>
        (@layers[i].mapData(dataset) for dataset, i in data)

    initLayerGroups: (data) =>
        @layerGroups = @svg.select('g.geoms')
            .selectAll('g.layer')
            .data(data)

        @layerGroups.enter()
            .append('g')
            .attr('class', 'layer')
            .attr('id', (d, i) -> "layer#{i}")

    trainScaleRanges: =>
        if @scales.x?.rangeRoundBands?
            @scales.x.rangeRoundBands([0, @panelSize[0]], 0.1)
        else
            @scales.x?.range([0, @panelSize[0]])
        @scales.y?.range([@panelSize[1], 0])

    trainScaleDomains: (data) =>
        for aesthetic, scale of @scales
            scaleData = scale.domain().concat()
            for dataset in data
                for dataGroup in dataset
                    if scale.rangeBand
                        for point in dataGroup
                            if point[aesthetic] not in scaleData
                                scaleData.push(point[aesthetic])
                    else
                        # Y may be stacked by the y0 attribute
                        if aesthetic is 'y'
                            aesValues = (point[aesthetic] + (point[aesthetic + '0'] || 0) for point in dataGroup)
                        else
                            aesValues = (point[aesthetic] for point in dataGroup)

                        scaleData = d3.extent(scaleData.concat(aesValues))
            scale.domain(scaleData)

    renderLayers: ->
        layer = (index) =>
            scales = @scales
            panelSize = @panelSize
            layer = @layers[i]
            (selection) -> layer.call(selection, scales, panelSize[0], panelSize[1])
        @layerGroups.each((data, i) -> d3.transition(d3.select(this)).call(layer(i)))

    initChart: (data) =>
        @resetXYScales()
        @initSVG(data)
        @initScales()
        data = @positionData(data)
        @initLayerGroups(data)
        @trainScaleRanges()
        @trainScaleDomains(data)

    render: =>
        @renderLayers()
        @renderScales()
        @renderGrid()
        @renderLabels()

    setDimensionsFromSelection: (selection) =>
        @containerSize = [selection.clientWidth, selection.clientHeight]
        @panelSize[0] = selection.clientWidth - (@margin.left + @margin.right)
        @panelSize[1] = selection.clientHeight - (@margin.top + @margin.bottom)

    call: (selection) ->
        chart = this
        selection.each (data) ->
            chart.container = d3.select(this)
            chart.setDimensionsFromSelection(this)
            chart.initChart(data)
            chart.render()

























