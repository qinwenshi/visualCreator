/**
 * Created by hua on 16/6/7.
 */
(function () {
    var model = raw.model();

    var label = model.dimension()
        .title("名称")
        .multiple(false)
        .types(String,Number)
        .required(1);

    /**
     * 对应于角度
     * @type {*|{require, link}}
     */
    var weight = model.dimension()
        .title("占比")
        .multiple(false)
        .types(Number)
        .required(1);

    /**
     * 对应于扇形的半径
     * @type {*|{require, link}}
     */
    var value = model.dimension()
        .title("值")
        .multiple(false)
        .types(Number)
        .required(1);

    var chart = raw.chart()
        .title('Aster plot Chart')
        .description("玫瑰图")
        .thumbnail("imgs/aster.png")
        .category('Others')
        .model(model);

    var w = chart.number()
        .title("宽度")
        .defaultValue(1000)
        .fitToWidth(true);

    var h = chart.number()
        .title("高度")
        .defaultValue(600)
        .fitToWidth(true);

    var colors = chart.color()
        .title("颜色");

    /**
     * 保存最大值,用于后面计算每个扇形的长度
     * 最大的为整个圆的半径
     */
    var maxValue = Number.MIN_SAFE_INTEGER;
    model.map(function (data) {
        if (!label() || !value() || !weight()) {
            return;
        }
        return data.map(function (d) {
            var obj = {};
            label().forEach(function (l) {
                obj.label = d[l];
            });
            weight().forEach(function (l) {
                obj.weight = Math.round(d[l]);
                obj.width = Math.round(d[l]);
            });
            value().forEach(function (l) {
                obj.value = Math.round(d[l]);
                /**
                 * 计算最大值
                 */
                if (obj.value > maxValue) {
                    maxValue = obj.value;
                }
            });
            return obj;
        })
    });

    chart.draw(function (selection, data) {
        var width = w(),
            height = h(),
            radius = Math.min(width, height) / 2,
            innerRadius = 0.3 * radius;

        var pie = d3.layout.pie()
            .sort(null)
            .value(function (d) {
                return d.width;
            });

        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([0, 0])
            .html(function (d) {
                return d.data.label + ": <span style='color:orangered'>" + d.data.value + "</span>(" + value()[0] + ")";
            });

        var arc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(function (d) {
                return (radius - innerRadius) * (1.0 * d.data.value / maxValue) + innerRadius;
            });

        var outlineArc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(radius);

        var svg = selection
            .attr("width", width)
            .attr("height", height)
            .append("svg")
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        svg.call(tip);

        var path = svg.selectAll(".solidArc")
            .data(pie(data))
            .enter().append("path")
            .attr("fill", function (d) {
                return colors()(d.data.label);
            })
            .attr("class", "solidArc")
            .attr("stroke", "gray")
            .attr("d", arc)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        var outerPath = svg.selectAll(".outlineArc")
            .data(pie(data))
            .enter().append("path")
            .attr("fill", "none")
            .attr("stroke", "gray")
            .attr("class", "outlineArc")
            .attr("d", outlineArc);

        // calculate the weighted mean score
        var score =
            data.reduce(function (a, b) {
                return a + Math.round(b.value * b.weight);
            }, 0) /
            data.reduce(function (a, b) {
                return a + Math.round(b.weight);
            }, 0);

        svg.append("svg:text")
            .attr("class", "aster-score")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle") // text-align: right
            .text(Math.round(score));

    });
})();