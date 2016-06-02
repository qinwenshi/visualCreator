/**
 * Created by hua on 16/6/2.
 */
var model = raw.model();

var label = model.dimension()
    .title("名称")
    .multiple(false)
    .required(1);

var dimension = model.dimension()
    .title("数值")
    .multiple(false)
    .types(Number)
    .required(1);

var chart = raw.chart()
    .title('Basic BarChart')
    .description(
        "普通柱状图")
    .thumbnail("imgs/basicBarChart.png")
    .category('Others')
    .model(model)

var width = chart.number()
    .title("宽度")
    .defaultValue(1000)
    .fitToWidth(true);

var height = chart.number()
    .title("高度")
    .defaultValue(600)
    .fitToWidth(true);

var colors = chart.color()
    .title("颜色分布");

model.map(function (data) {
    if (!dimension()) return;
    return data.map(function (d) {
        var obj = {label: label(d)};
        dimension().forEach(function (l) {
            obj['dimension'] = d[l];
        });
        return obj;
    })
})

chart.draw(function (selection, data) {
    var margin = {top: 20, right: 20, bottom: 30, left: 40};

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width()], .1);

    var y = d3.scale.linear()
        .range([height(), 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var svg = selection
        .attr("width", width() + margin.left + margin.right)
        .attr("height", height() + margin.top + margin.bottom)
        .append("svg")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(data.map(function (d) {
        return d.label;
    }));
    y.domain([0, d3.max(data, function (d) {
        return d.dimension;
    })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height() + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(dimension());

    colors.domain(data, function (d) {
        return d.label;
    });
    svg.selectAll(".basicbar")
        .data(data)
        .enter().append("rect")
        .attr("class", "basicbar")
        .style("fill", function (d) {
            return colors()(d.label);
        })
        .attr("x", function (d) {
            return x(d.label);
        })
        .attr("width", x.rangeBand())
        .attr("y", function (d) {
            return y(d.dimension);
        })
        .attr("height", function (d) {
            return height() - y(d.dimension);
        })
        .on('mousemove',function () {
            var e = window.event;
            newX = e.offsetX;
            newY = e.offsetY;
            tooltip
                .attr('x', newX)
                .attr('y', newY);
        })
        .on('mouseover', function (d) {
            // newX = parseFloat(d3.select(this).attr('x'));
            // newY = parseFloat(d3.select(this).attr('y'));
            var e = window.event;
            newX = e.offsetX;
            newY = e.offsetY;
            tooltip
                .attr('x', newX)
                .attr('y', newY)
                .text(d.label + "(" + d.dimension + ")")
                .transition(200)
                .style('opacity', 1);
        })
        .on('mouseout', function () {
            tooltip
                .transition(200)
                .style('opacity', 0);
        });
    var tooltip = svg.append('text')
        .style('opacity', 0)
        .style('font-family', 'sans-serif')
        .style('font-size', '13px');
})