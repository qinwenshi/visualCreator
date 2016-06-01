'use strict';

/* Controllers */

angular.module('raw.controllers', [])

    .controller('RawCtrl', function ($scope, dataService) {

        $scope.samples = [
            {title: 'Cars (multivariate)', url: 'data/multivariate.csv'},
            {title: 'Movies (dispersions)', url: 'data/dispersions.csv'},
            {title: 'Music (flows)', url: 'data/flows.csv'},
            {title: 'Cocktails (correlations)', url: 'data/correlations.csv'},
            {title: "Personal Accounting(Pie)", url: 'data/multivariate_tt.csv'},
            {title: "Multi Radar", url: 'data/multiRadar.csv'}
        ]

        $scope.$watch('sample', function (sample) {
            if (!sample) return;
            dataService.loadSample(sample.url).then(
                function (data) {
                    $scope.text = data;
                },
                function (error) {
                    $scope.error = error;
                }
            );
        });

        // init
        $scope.raw = raw;
        $scope.data = [];
        $scope.metadata = [];
        $scope.error = false;
        $scope.loading = true;

        $scope.categories = ['Correlations', 'Distributions', 'Time Series', 'Hierarchies', 'Others'];

        $scope.parse = function (text) {

            if ($scope.model) $scope.model.clear();

            $scope.data = [];
            $scope.metadata = [];
            $scope.error = false;
            $scope.$apply();

            try {
                var parser = raw.parser();
                var scope = $scope;
                parser(text, function (data) {
                    $scope.data = data;
                    $scope.loading = false;
                    $scope.metadata = parser.metadata(data);
                    $scope.error = false;
                });


                /*$scope.data = parser(text);
                 $scope.metadata = parser.metadata(text);
                 $scope.error = false;*/
            } catch (e) {
                $scope.data = [];
                $scope.metadata = [];
                $scope.error = e.name == "ParseError" ? +e.message : false;
            }
            if (!$scope.data.length && $scope.model) $scope.model.clear();
        }

        $scope.delayParse = dataService.debounce($scope.parse, 500, false);

        $scope.$watch("text", function (text) {
            $scope.loading = true;
            $scope.delayParse(text);
        });

        $scope.charts = raw.charts.values().sort(function (a, b) {
            return a.title() < b.title() ? -1 : a.title() > b.title() ? 1 : 0;
        });
        $scope.chart = $scope.charts[0];
        $scope.model = $scope.chart ? $scope.chart.model() : null;

        $scope.$watch('error', function (error) {
            if (!$('.CodeMirror')[0]) return;
            var cm = $('.CodeMirror')[0].CodeMirror;
            if (!error) {
                cm.removeLineClass($scope.lastError, 'wrap', 'line-error');
                return;
            }
            cm.addLineClass(error, 'wrap', 'line-error');
            cm.scrollIntoView(error);
            $scope.lastError = error;

        })

        $('body').mousedown(function (e, ui) {
            if ($(e.target).hasClass("dimension-info-toggle")) return;
            $('.dimensions-wrapper').each(function (e) {
                angular.element(this).scope().open = false;
                angular.element(this).scope().$apply();
            })
        })

        $scope.codeMirrorOptions = {
            lineNumbers: true,
            lineWrapping: true,
            placeholder: '复制你的文本或者拖放一个文件进入此文本框中。如果只会想试试看，可以试用我们准备的上述 Demo 数据。'
        }

        $scope.selectChart = function (chart) {
            if (chart == $scope.chart) return;
            $scope.model.clear();
            $scope.chart = chart;
            $scope.model = $scope.chart.model();
        }

        function refreshScroll() {
            $('[data-spy="scroll"]').each(function () {
                $(this).scrollspy('refresh');
            });
        }

        $(window).scroll(function () {

            // check for mobile
            if ($(window).width() < 760 || $('#mapping').height() < 300) return;

            var scrollTop = $(window).scrollTop() + 0,
                mappingTop = $('#mapping').offset().top + 10,
                mappingHeight = $('#mapping').height(),
                isBetween = scrollTop > mappingTop + 50 && scrollTop <= mappingTop + mappingHeight - $(".sticky").height() - 20,
                isOver = scrollTop > mappingTop + mappingHeight - $(".sticky").height() - 20,
                mappingWidth = mappingWidth ? mappingWidth : $('.col-lg-9').width();

            if (mappingHeight - $('.dimensions-list').height() > 90) return;
            //console.log(mappingHeight-$('.dimensions-list').height())
            if (isBetween) {
                $(".sticky")
                    .css("position", "fixed")
                    .css("width", mappingWidth + "px")
                    .css("top", "20px")
            }

            if (isOver) {
                $(".sticky")
                    .css("position", "fixed")
                    .css("width", mappingWidth + "px")
                    .css("top", (mappingHeight - $(".sticky").height() + 0 - scrollTop + mappingTop) + "px");
                return;
            }

            if (isBetween) return;

            $(".sticky")
                .css("position", "relative")
                .css("top", "")
                .css("width", "");

        })

        $(document).ready(refreshScroll);


    })