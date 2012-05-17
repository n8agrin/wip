class rene.Point extends rene.Layer

    constructor: ->
        super
        @x = (point) -> point[0]
        @y = (point) -> point[1]
        @color = (point) -> point[2]
        @size = (point) -> point[3]
        @group = (point) -> point[2]
        @defaultSize = 2

    scales:
        x: d3.scale.linear
        y: d3.scale.linear
        color: d3.scale.category20
        size: d3.scale.linear

    render: (group, scales, width, height) =>
        layer = this
        group.classed('point', true)
        group.each (d) ->
            circleGroups = d3.select(this)
                .selectAll('g.group')
                .data(Object)

            circleGroups.enter()
                .append('g')
                .attr('class', 'group')

            d3.transition(circleGroups.exit())
                .remove()

            circles = circleGroups.selectAll('circle')
                .data(Object)

            circlesEnter = circles.enter()
                .append('circle')
                .attr('opacity', 1e-6)

            circlesExit = d3.transition(circles.exit())
                .attr('opacity', 0)
                .remove()

            circlesUpdate = d3.transition(circles)
                .attr('opacity', 1)

            circlesUpdate.attr('cx', (point) -> scales.x(point.x))
                .attr('cy', (point) -> scales.y(point.y))
                .attr('r', (point) -> layer.defaultSize)

            if scales.color
                circlesUpdate.style('fill', (point) -> scales.color(point.color))