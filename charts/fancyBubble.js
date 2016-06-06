/**
 * Created by hua on 16/6/3.
 */
(function () {
    var model = raw.model();

    var xValue = model.dimension()
        .title("数值(X)")
        .multiple(false)
        .types(Number)
        .required(1);

    var yValue = model.dimension()
        .title("数值(Y)")
        .multiple(false)
        .types(Number)
        .required(1);

    var scaleValue = model.dimension()
        .title("圆圈大小")
        .multiple(false)
        .types(Number)
        .required(1);

    var chart = raw.chart()
        .title('Fancy Bubble Chart')
        .description(
            "花式气泡图")
        .thumbnail("imgs/fancyBubble.png")
        .category('Others')
        .model(model)

    var w = chart.number()
        .title("宽度")
        .defaultValue(1000)
        .fitToWidth(true);

    var h = chart.number()
        .title("高度")
        .defaultValue(600)
        .fitToWidth(true);

    // var formatDate = d3.time.format("%Y%m%d");

    model.map(function (data) {
        if (!yValue()) return;
        return data.map(function (d) {
            var obj = {'label': xValue(d)};
            yValue().forEach(function (l) {
                obj['value'] = d[l];
            });
            return obj;
        })
    });

    chart.draw(function (selection, data) {
        var helpers = {
            addCommas: d3.format(','),
            portraitUrl: portraitUrl,
            portraitTag: portraitTag,
            formatDate: formatDate,
            formatKincaid: formatKincaid
        };

        var CONFIG = {
            maxBubbleRadius: 20,
            dateDomainPadding: 5, // years
            kincaidDomainPadding: .1,
            xAxisLabel: 'Year of address',
            yAxisLabel: 'Flesch incaid Reading Level',
            keyCircleLabel: 'Number of words',
            noneSelectedOpacity: .3,
            selectedOpacity: 1,
            unselectedOpacity: .07,
            row_cells: 4,
            headingText: 'Presidents in order of reading level'
        };

        var presidents, speeches, selectedSpeech, points;

        var margin = {top: 10, right: 10, bottom: 50, left: 50};

        var width = w() - margin.left - margin.right,
            height = h() - margin.top - margin.bottom;

        var rootNode = d3.select("#chart");

        var svg = selection
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append("g");

        svg = svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        function selectByX(x) {
            var date = new Date(xScale.invert(x)).getTime(), mouseoverSpeech;

            speeches.forEach(function (speech) {
                if (speech.date.getTime() <= date) {
                    mouseoverSpeech = speech;
                    return;
                }
            });

            if (selectedSpeech !== mouseoverSpeech) {
                selectedSpeech = mouseoverSpeech;
                render();
            }
        }

        var background = svg.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', width)
            .attr('height', height)
            .style('fill', '#fff')
            .on('mouseout', function (e) {
                selectedSpeech = null;
                render();
            })
            .on('mousemove', function () {
                selectByX(d3.mouse(this)[0])
            });

        var elPopup = rootNode.append('div')
            .attr('id', 'gia-sotu-popup');

        var yyyymmdd = d3.time.format('%Y-%m-%d');
        var formatDate = d3.time.format('%-d %B %Y');

        var formatKincaid = d3.format('.1f');

        function portraitUrl(name) {
            return 'http://img05.tooopen.com/images/20150531/tooopen_sy_127457023651.jpg';
        }

        function portraitTag(name) {
            return '<img width="150" height="150" src="' + portraitUrl(name) + '" alt="' + name + '">';
        }

        var xScale = d3.time.scale()
            .range([0, width]);

        var yScale = d3.scale.linear()
            .range([height, 0]);

        var colors = d3.scale.category10();

        var wordCountScale = d3.scale.sqrt()
            .range([0, CONFIG.maxBubbleRadius]);

        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom');

        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient('left');

        var keyCircle = scaleKeyCircle()
            .scale(wordCountScale)
            .tickValues([3000, 30000]);

        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0, ' + height + ')')
            .append('text')
            .attr('transform', 'translate(' + (width / 2) + ', 0)')
            .attr('class', 'gia-axisLabel')
            .attr('x', 0)
            .attr('y', 40)
            .style('text-anchor', 'middle')
            .text(CONFIG.xAxisLabel);

        svg.append('g')
            .attr('class', 'y axis')
            .append('text')
            .attr('class', 'gia-axisLabel')
            .attr('transform', 'rotate(90) translate(' + (height / 2) + ' 0)')
            .attr('x', 0)
            .attr('y', 40)
            .style('text-anchor', 'middle')
            .text(CONFIG.yAxisLabel);

        svg.append('g')
            .attr('class', 'circle scale')
            .attr('transform', 'translate(120, ' + (height - CONFIG.maxBubbleRadius * 2) + ')')
            .append('text')
            .attr('class', 'gia-axisLabel')
            .attr('x', 0)
            .attr('y', -CONFIG.maxBubbleRadius * 2 - 4)
            .style('text-anchor', 'middle')
            .text(CONFIG.keyCircleLabel);

        var popupConnectors = svg.append('g')
            .attr('id', 'popupConnectors');

        popupConnectors.append('line').attr('class', 'connector1');
        popupConnectors.append('line').attr('class', 'connector2');

        svg.append('g')
            .attr('class', 'speeches');

        function renderAxis() {
            svg.select('g.x.axis')
                .call(xAxis);

            svg.select('g.y.axis')
                .call(yAxis);

            svg.select('g.circle.scale')
                .call(keyCircle);
        }

        function renderPoints() {
            var g = svg.select('g.speeches');

            points = g.selectAll('circle.speech')
                .data(speeches);

            points.enter()
                .append('circle')
                .attr('class', 'speech')
                .attr('cx', function (d) {
                    return xScale(d.date)
                })
                .attr('cy', function (d) {
                    return yScale(d.kincaid)
                })
                .attr('r', function (d) {
                    return wordCountScale(d.wc)
                })
                .attr('fill', function (d) {
                    return colors(d.president.name)
                })
                .attr('stroke', function(d) { return d.oral ? '#999' : '#966' })
                .attr('stroke', 'rgba(0,0,0, .05)')
                .attr('stroke-dasharray', function(d) { return d.oral ? '1, 1' : '1' })
                .on('mouseover', function (d) {
                    selectedSpeech = d;
                    render();
                });

            points
                .classed('selected', function (d) {
                    return selectedSpeech && d === selectedSpeech
                })
                .attr('fill-opacity', function (d) {
                    if (selectedSpeech) {
                        return d === selectedSpeech ? CONFIG.selectedOpacity : CONFIG.unselectedOpacity;
                    } else {
                        return CONFIG.noneSelectedOpacity;
                    }
                });
        }

        function renderPopup() {
            if (selectedSpeech) {
                var g = svg.select('g.speeches');
                var selectedPoint = g.select('.selected');

                var top = margin.top + 40;
                // var top = Math.round(selectedPoint.attr('cy'));

                var cx = Math.round(selectedPoint.attr('cx'));
                var cy = Math.round(selectedPoint.attr('cy'));
                var flip = cx < width / 2;
                var left = cx;

                popupConnectors
                    .style('display', 'block');

                popupConnectors
                    .select('.connector1')
                    .attr('x1', cx)
                    .attr('x2', cx)
                    .attr('y1', cy)
                    .attr('y2', top + 35);

                popupConnectors
                    .select('.connector2')
                    .attr('x1', cx)
                    .attr('x2', function () {
                        return cx + (flip ? 40 : -40)
                    })
                    .attr('y1', top + 35)
                    .attr('y2', top + 35);

                var leftPadding = Math.round(wordCountScale(selectedSpeech.wc)) + 26;

                if (flip) {
                    left += leftPadding;
                } else {
                    left -= parseInt(elPopup.style('width'));
                    left -= leftPadding - 40;
                }
                left += margin.left;

                elPopup
                    .html('<img width="100" height="100" src="' + portraitUrl(selectedSpeech.president.name) + '" alt="' + selectedSpeech.president.name + '"><h5>'+selectedSpeech.president.name+'</h5>')
                    .style('top', top + 'px')
                    .style('left', left + 'px')
                    .style('display', 'block');
            } else {
                elPopup.style('display', 'none');
                popupConnectors.style('display', 'none');
            }
        }

        function render() {

            renderPoints();
            renderPopup();
        }

        d3.json('data/fancyBubble.json', function (json) {
            presidents = json;

            presidents.forEach(function (president, i) {
                president.id = i;
                president.speeches.forEach(function (speech) {
                    speech.date = yyyymmdd.parse(speech.d);
                });
            });

            speeches = [];

            presidents.forEach(function (president) {
                president.speeches.forEach(function (speech) {
                    speech.president = president;
                    speeches.push(speech);
                });
            });
            // Presidents, assumed to load in speech order, so sorting unnecessary
            // speeches.sort(function(a, b) { return d3.ascending(a.date, b.date) })

            // Sort by least to most readable
            presidents.sort(function (a, b) {
                return d3.ascending(a.avg_kincaid, b.avg_kincaid)
            });

            var extentX = d3.extent(speeches, function (d) {
                return d.date
            });
            var extentY = d3.extent(speeches, function (d) {
                return d.kincaid
            });
            var maxWordCount = d3.max(speeches, function (d) {
                return d.wc
            });

            // // pad the domain of the dates, is there a better way to do this?
            var startDate = new Date(extentX[0].getTime()).setFullYear(extentX[0].getFullYear() - CONFIG.dateDomainPadding);
            var endDate = new Date(extentX[1].getTime()).setFullYear(extentX[1].getFullYear() + CONFIG.dateDomainPadding);

            // // pad the domain of the kincaid, is there a better way to do this?
            extentY[0] *= (1 - CONFIG.kincaidDomainPadding);
            extentY[1] *= (1 + CONFIG.kincaidDomainPadding);

            xScale.domain([startDate, endDate]);
            yScale.domain(extentY);
            wordCountScale.domain([0, maxWordCount]);

            renderAxis();
            render();

        });

        function scaleKeyCircle() {
            var scale,
                orient = "left",
                tickPadding = 3,
                tickExtend = 5,
                tickArguments_ = [5],
                tickValues = null,
                tickFormat_

            function key(g) {
                g.each(function () {
                    var g = d3.select(this);

                    // Ticks, or domain values for ordinal scales.
                    var ticks = tickValues == null ? (scale.ticks ? scale.ticks.apply(scale, tickArguments_) : scale.domain()) : tickValues,
                        tickFormat = tickFormat_ == null ? (scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments_) : String) : tickFormat_;

                    ticks = ticks.slice().reverse()

                    ticks.forEach(function (tick) {
                        var gg = g.append('g')
                            .attr('class', 'circleKey')
                            .attr('transform', 'translate(0,' + -scale(tick) + ')')

                        gg.append('circle')
                            .attr('cx', 0)
                            .attr('cy', 0)
                            .attr('r', scale(tick))

                        var x1 = scale(tick),
                            x2 = tickExtend + scale(ticks[0]),
                            tx = x2 + tickPadding,
                            textAnchor = "start";

                        if ("left" == orient) {
                            x1 = -x1;
                            x2 = -x2;
                            tx = -tx;
                            textAnchor = "end";
                        }

                        gg.append('line')
                            .attr('x1', x1)
                            .attr('x2', x2)
                            .attr('y1', 0)
                            .attr('y2', 0)
                            .attr('stroke', '#000')
                            .text(tick);

                        gg.append('text')
                            .attr('transform', 'translate(' + tx + ', 0)')
                            .attr('dy', '.35em')
                            .style('text-anchor', textAnchor)
                            .text(tickFormat(tick))
                    })

                })
            }

            key.scale = function (value) {
                if (!arguments.length) return scale;
                scale = value;
                return key;
            };

            key.orient = function (value) {
                if (!arguments.length) return orient;
                orient = value;
                return key;
            };

            key.ticks = function () {
                if (!arguments.length) return tickArguments_;
                tickArguments_ = arguments;
                return key;
            };

            key.tickFormat = function (x) {
                if (!arguments.length) return tickFormat_;
                tickFormat_ = x;
                return key;
            };

            key.tickValues = function (x) {
                if (!arguments.length) return tickValues;
                tickValues = x;
                return key;
            };

            key.tickPadding = function (x) {
                if (!arguments.length) return tickPadding;
                tickPadding = +x;
                return key;
            };

            key.tickExtend = function (x) {
                if (!arguments.length) return tickExtend;
                tickExtend = +x;
                return key;
            };

            key.width = function (value) {
                if (!arguments.length) return width;
                width = value;
                return key;
            };

            key.height = function (value) {
                if (!arguments.length) return height;
                height = value;
                return key;
            };

            return key;
        }
    });
})();