/**
 * Created by hua on 16/6/3.
 */
(function () {
    var model = raw.model();

    var label = model.dimension()
        .title("时间")
        .multiple(false)
        .types(Date)
        .required(1);

    var valueList = model.dimension()
        .title("数值")
        .multiple(false)
        .types(Number)
        .required(1);

    var chart = raw.chart()
        .title('Single Line Chart')
        .description(
            "单根线图")
        .thumbnail("imgs/singleLineChart.png")
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

    var formatDate = d3.time.format("%d-%b-%y");

    model.map(function (data) {
        if (!valueList()) return;
        return data.map(function (d) {
            var obj = {'label': formatDate.parse(label(d))};
            valueList().forEach(function (l) {
                obj['lineValue'] = d[l];
            });
            return obj;
        })
    });

    chart.draw(function (selection, data) {
        var margin = {top: 20, right: 20, bottom: 30, left: 50}

        var x = d3.time.scale()
            .range([0, width()]);

        var y = d3.scale.linear()
            .range([height(), 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var line = d3.svg.line()
            .x(function (d) {
                return x(d.label);
            })
            .y(function (d) {
                return y(d.lineValue);
            });

        var svg = selection
            .attr("width", width() + margin.left + margin.right)
            .attr("height", height() + margin.top + margin.bottom)
            .append("svg")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        x.domain(d3.extent(data, function (d) {
            return d.label;
        }));
        y.domain(d3.extent(data, function (d) {
            return d.lineValue;
        }));

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

        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line);

    });
})();