class rene.Pie extends rene.Layer

    constructor: ->
        @location = 'center'
        @locationMargin = 10
        @arc = d3.svg.arc().innerRadius(0).outerRadius(200)
        @pie = d3.layout.pie().value((d) -> d.value)
        @color = Object
        @value = Object

    scales:
        color: d3.scale.category20

    aesthetics: -> [
        ['value', @value],
        ['color', @color]
    ]

    render: (group, scales, width, height) =>
        layer = this
        group.classed('pie', true)
        group.each (d, i) ->
            pied = layer.pie(d[0])
            arcs = d3.select(this).selectAll('path.arc').data(pied)
            arcsEnter = arcs.enter().append('path').attr('class', 'arc').style('opacity', 1e-6)
            arcsExit = d3.transition(arcs.exit()).style('opacity', 1e-6).remove()
            arcsUpdate = d3.transition(arcs).style('opacity', 1)
            arcsUpdate.attr('d', (d, i) -> layer.arc(d)).attr('fill', (d, i) -> scales.color(d.data.color))

    move: (layer, width, height, margins) =>
        switch @location
            when "center"
                layer.attr("transform", rene.utils.translate(width / 2, height / 2))
            when "left"
                layer.attr("transform", rene.utils.translate((@arc.outerRadius())(), height / 2))