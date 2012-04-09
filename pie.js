var data = [[0,0], [1, 1], [2,2], [3, 3], [3,3], [4,4], [5,5]];
var lineLayer = rene2.line().interpolate("linear");
var scatterLayer = rene2.scatter();
var plot = rene2.plot()
    .addLayer(lineLayer)
    .addLayer(scatterLayer);

d3.select("#scatter")
    .datum([data, data])
    .call(plot);

// setInterval(function() {
//     var remapped = data.map(function(c) { return [c[0] * Math.random(), c[1] * Math.random()]; });
//
//     var s = d3.select("#scatter");
//         s.datum([remapped, remapped]);
//         s.transition()
//             .duration(1000)
//             .call(plot);
// }, 1800)

//
// Pie chart
//
//

var p1 = rene2.pie()
    .innerRadius(10)
    .outerRadius(50);

var p2 = rene2.pie()
    .innerRadius(30)
    .outerRadius(110);

var pie = rene2.plot()
    .addLayer(p2)
    .legend(function(layers, scales) {
            var legendUl = d3.select("#pie-legend ul");
            var lis = legendUl.selectAll("li")
                .data(layers.datum());

            var lisEnter = lis.enter()
                    .append("li")
                    .style("opacity", 1e-6);

                lisEnter.append("div")
                    .classed("icon", true);

            lis.selectAll("div.icon")
                .data(Object);

            d3.transition(lis.exit()).style("opacity", 1e-6).remove();
            d3.transition(lis).style("opacity", 1);

            var textDivs = lis.selectAll("div.text")
                .data(function(d) { return [d]; });

            var textDivsEnter = textDivs.enter()
                .append("div")
                .classed("text", true);

            d3.transition(textDivs)
                .text(function(d) {
                    return d;
                });

            var iconDivs = lis.selectAll("div.icon")
                .data(function(d) {
                    return [d];
                });

            var iconDivsEnter = iconDivs.enter()
                .append("div")
                .classed("icon", true);

            d3.transition(iconDivs)
                .style("background", function(d) { return scales.color(d) });

            var chart = this;
            lis.on("click", function(d, i) {
                var li = d3.select(this);
                var data = layers.datum();
                var newData = pieData.concat();

                if (li.classed("inactive")) {
                    li.classed("inactive", false);
                    newData.splice(i, 0, d);
                } else {
                    li.classed("inactive", true);
                    newData.splice(i, 1);
                }

                d3.select("#pie")
                    .datum([newData])
                    .transition()
                    .call(pie);
            });
    });

var pieData = [10,20,30,40,50];
var pieData2 = [150,400,500];
d3.select("#pie")
    .datum([pieData])
    .transition()
    .call(pie);

// setInterval(function() {
//     var remapped = pieData.map(function(c) { return c * Math.floor((Math.random() * 50)); });
//     // var remapped2 = pieData2.map(function(c) { return c * Math.floor((Math.random() * 50)); });
//     var s = d3.select("#pie");
//         s.data([[remapped]]);
//         s.transition()
//             .duration(1000)
//             .call(pie);
// }, 2000)