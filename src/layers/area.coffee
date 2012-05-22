class rene.Area extends rene.Layer

    constructor: ->
        super
        @y0 = d3.functor(0)
        @y1 = d3.functor(0)
        @interpolate = d3.functor('monotone')
        @stack = d3.layout.stack()

    position: (data) ->
        @stack(rene.utils.naiveFill(data))

    aesthetics: ->
        aes = super()
        aes.push(['y0', @y0])
        aes.push(['y1', @y1])
        aes

    scales:
        x: d3.scale.linear
        y: d3.scale.linear
        color: d3.scale.category20
        size: d3.scale.linear

    render: (group, scales, width, height) =>
        pathFn = d3.svg.area()
            .interpolate(@interpolate())
            .x((d)  -> scales.x(d.x))
            .y0((d) -> height - scales.y(d.y0))
            .y1((d) -> height - scales.y(d.y + d.y0))

        group.classed('area', true)

        group.each (data) ->
            areaGroups = d3.select(this)
                .selectAll('g.area')
                .data(Object)

            areaGroups.enter()
                .append('g')
                .attr('class', 'area')

            d3.transition(areaGroups.exit())
                .remove()

            areas = areaGroups.selectAll('path')
                .data((pathset) -> [pathset])

            areasEnter = areas.enter()
                .append('path')

            areasExit = d3.transition(areas.exit())
                .remove()

            areasUpdate = d3.transition(areas)
            #pathFn.y0(scales.y.range()[0])(d)
            areasUpdate.attr('d', pathFn)

            if scales.color
                areasUpdate.style('fill', (pathset) -> if pathset[0]? then scales.color(pathset[0].color))