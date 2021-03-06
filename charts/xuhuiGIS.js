(function() {

        var model = raw.model();

        var streetName = model.dimension()
            .title("街道名称")
            .required(1);

        var color = model.dimension()
            .title("颜色")

        var list = model.dimension()
            .title('展示数据')
            .multiple(true)
            .types(Number)
            .required(1);

        model.map(function(data) {
            if (!list()) return;
            return data.map(function(d) {
                var obj = {
                    values: {},
                    color: color(d),
                    streetName: streetName(d)
                };
                list().forEach(function(l) {
                    obj.values[l] = d[l];
                })
                return obj;
            })
        })


        var chart = raw.chart()
            .title('GIS')
            .description(
                "基于地图的区域展示应用")
            .thumbnail("imgs/map.png")
            .category('Others')
            .model(model)

        var width = chart.number()
            .title("宽度")
            .defaultValue(getDesireWidth(850))
            .fitToWidth(false)

        var height = chart.number()
            .title("高度")
            .defaultValue(getDesireHeight(330))
            .fitToWidth(false)

        var colors = chart.color()
            .title("颜色分布")


        chart.draw(function(selection, data) {

            //- m[1] - m[3]
            //- m[0] - m[2]
            var m = [50, 50, 50, 50],
                w = +width() ,
                h = +height();
            
            var streetData = {  };
            
            for (var i = 0; i < data.length; i++)
            {
                modelObj = data[i];
                var streetDataDecription = '';
                for (var key in modelObj.values){
                    streetDataDecription = streetDataDecription + "<br>"+ [key, modelObj.values[key]].join(':'); 
                }
                
                streetData[modelObj.streetName] = streetDataDecription;
            }

            var mapElement = selection
            .node().parentNode;
            
            angular
            .element(mapElement)
            .width(w)
            .height(h);
            
            var map = $(mapElement).data('map');
            if(!!map)
                map.remove();

            // if(typeof map != 'undefined' && map._container.id == mapElement.id) 
            //     map.remove();
            var map = L.map(mapElement, {
                center: [31.18222689072537, 121.43519994932613],
                zoom: 12
            });
            $(mapElement).data('map', map);
            /*var tiles = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg', {
                attribution: 'x-Lab GIS 数据可视化',
                subdomains: '1234'
            });*/
            ACCESS_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw';
            MB_ATTR = 'created by x-Lab';
            MB_URL = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + ACCESS_TOKEN;
            OSM_URL = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            OSM_ATTRIB = '&copy; <a href="http://x-lab.wondersgroup.com">X-Data</a>';

            var tiles = L.tileLayer(MB_URL, {attribution: MB_ATTR, id: 'mapbox.streets'});
            
            
            //access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw
            tiles.addTo(map);


            var countries = [];
            var countriesOverlay = L.d3SvgOverlay(function(sel, proj) {

                var upd = sel.selectAll('path').data(countries)
                    .each(
                        function(v) {
                            $(this).tipsy({
                                gravity: "s",
                                opacity: 1,
                                html: true
                            });
                        });
                var styleTooltip = function(name, description) {
                    return "<p class='name'>" + name + "</p><p class='description'>" + description + "</p>";
                };
                var p = upd.enter()
                    .append('path')
                    .attr('d', proj.pathFromGeojson)
                    .attr('stroke', 'black')
                    .attr('fill', function() {
                        return d3.hsl(Math.random() * 360, 0.9, 0.5)
                    })
                    .attr('fill-opacity', '0.5')
                    .attr("title",
                        function(v) {
                            title = v.properties['name'];
                            description = streetData[v.properties['name']];
                            
                            return styleTooltip(title, description);
                        });

                upd.attr('stroke-width', 1 / proj.scale);

            });

            d3.json("lib/gis/XuhuiStreetGeo.json", function(data) {
                countries = data.features;

                for (var i in countries) {
                    feature = countries[i];
                    coordinates = feature.geometry.coordinates[0]
                    for (var j in coordinates) {
                        coordinate = coordinates[j];
                        for (var k in coordinate) {
                            coordinate[k] = bd09towgs84(coordinate[k][0], coordinate[k][1]);
                        }
                    }
                }

                countriesOverlay.addTo(map);
            });
        
    });
})();