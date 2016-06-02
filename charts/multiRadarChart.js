/**
 * Created by hua on 16/5/31.
 */
(function () {

    var model = raw.model();

    var label = model.dimension()
        .title("名称")
        .required(1);

    var list = model.dimension()
        .title("数值")
        .multiple(true)
        .types(Number)
        .required(3);

    var chart = raw.chart()
        .title('Multi Radar Chart')
        .description(
            "多层雷达图")
        .thumbnail("imgs/multiRadarChart.png")
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
        if (!list()) return;
        return data.map(function (d) {
            var obj = {};
            obj['name'] = label(d);
            var properties = {};
            list().forEach(function (l) {
                properties[l] = d[l];
            });
            obj["properties"] = properties;
            return obj;
        })
    })

    chart.draw(function (selection, data) {
        model.isValid(true);
        var svg = selection
            .attr("width", +width())
            .attr("height", +height())
            .attr("id", "my-radar-chart")
        var resultData = [];
        var legendTitles = [];
        var maxValue = Number.MIN_SAFE_INTEGER;
        data.forEach(function (item, i) {
            var newSeries = [];
            legendTitles.push(item['name']);
            var properties = eval(item['properties']);
            for (var p in properties) {
                if (parseFloat(properties[p]) > maxValue) {
                    maxValue = parseFloat(properties[p]);
                }
                newSeries.push({"axis": p, "value": properties[p]});
            }

            resultData.push(newSeries);
        });
        var levels = maxValue / 5 + 1;
        if(levels <=0) {
            levels = resultData.length;
        }
        var radarChartOptions = {
            w: width() - 100,
            h: height() - 100,
            maxValue: maxValue,
            levels: levels,
            color: colors()
        };
        RadarChart.draw("#my-radar-chart", resultData, radarChartOptions);

        ////////////////////////////////////////////
/////////// Initiate legend ////////////////
////////////////////////////////////////////

        var w = 500;

        var colorscale = d3.scale.category10();

        //Create the title for the legend
        var text = svg.append("text")
            .attr("class", "title")
            .attr('transform', 'translate(90,0)')
            .attr("x", w - 70)
            .attr("y", 10)
            .attr("font-size", "12px")
            .attr("fill", "#404040")
            .text("");

        //Initiate Legend
        var legend = svg.append("g")
                .attr("class", "legend")
                .attr("height", 100)
                .attr("width", 200)
                .attr('transform', 'translate(90,20)')
            ;
        //Create colour squares
        legend.selectAll('rect')
            .data(legendTitles)
            .enter()
            .append("rect")
            .attr("x", w - 65)
            .attr("y", function (d, i) {
                return i * 20;
            })
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", function (d, i) {
                return colorscale(i);
            })
        ;
        //Create text next to squares
        legend.selectAll('text')
            .data(legendTitles)
            .enter()
            .append("text")
            .attr("x", w - 52)
            .attr("y", function (d, i) {
                return i * 20 + 9;
            })
            .attr("font-size", "11px")
            .attr("fill", "#737373")
            .text(function (d) {
                return d;
            })
        ;
    });
})();