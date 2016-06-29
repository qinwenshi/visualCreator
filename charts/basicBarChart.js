/**
 * Created by hua on 16/6/2.
 */
(function () {
    var model = raw.model();

    var labels = model.dimension()
        .title("名称")
        .multiple(false)
        .required(1);

    var valueList = model.dimension()
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
        .model(model);

    var width = chart.number()
        .title("宽度")
        .defaultValue(getDesireWidth(304))
        .fitToWidth(false);

    var height = chart.number()
        .title("高度")
        .defaultValue(getDesireHeight(280))
        .fitToWidth(false);

    var colors = chart.color()
        .title("颜色分布");

    model.map(function (data) {
        if (!valueList()) return;
        return data.map(function (d) {
            var obj = {'label': labels(d),'unit':valueList()[0]};
            valueList().forEach(function (l) {
                obj['barValue'] = d[l];
            });
            return obj;
        })
    });

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

        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([0, 0])
            .html(function (d) {
                return d.label + ": <span style='color:orangered'>" + d.barValue + "</span>(" + d.unit + ")";
            });
        svg.call(tip);

        x.domain(data.map(function (d) {
            return d.label;
        }));
        y.domain([0, d3.max(data, function (d) {
            return d.barValue;
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
            .text(valueList()[0]);

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
                return y(d.barValue);
            })
            .attr("height", function (d) {
                return height() - y(d.barValue);
            })
            .on('mouseover', tip.show)
            .on('mousemove', tip.show)
            .on('mouseout', tip.hide);

    });
})();