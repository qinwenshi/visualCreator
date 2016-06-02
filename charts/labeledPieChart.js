
(function(){

    var model = raw.model();

    var category = model.dimension()
        .title("所属类型")
        .required(1);

    var color = model.dimension()
        .title("颜色")

    var list = model.dimension()
        .title('数值')
        .multiple(false)
        .types(Number)
        .required(1);

    //var parentCategory = model.dimension()
    //    .title("Category")

    model.map(function (data){
        if (!list()) return;
        return data.map(function (d){
            var obj = { dimensions: {}, color: color(d), category: category(d) };
            list().forEach(function (l){
                obj.dimensions[l] = d[l];
            })
            return obj;
        })
    })

    var chart = raw.chart()
        .title('Labeled Pie Chart')
        .description(
            "带标签饼图，用于对数据按照比例统计展示。为了展示效果，建议最多不超过15个分类。")
        .thumbnail("imgs/labeledPieChart.png")
        .category('Others')
        .model(model)

    var width = chart.number()
        .title("宽度")
        .defaultValue(1000)
        .fitToWidth(true)

    var height = chart.number()
        .title("高度")
        .defaultValue(500)

    var colors = chart.color()
        .title("颜色分布")


chart.draw(function (selection, data){

        var m = [50, 50, 50, 50],
            w = +width() - m[1] - m[3],
            h = +height() - m[0] - m[2];

        var layers = data;

        radius = Math.min(w, h) / 2;
        // Pie layout will use the "val" property of each data object entry
        

    // SVG elements init
   var svg = selection  
    .attr("width", +width())
    .attr("height", +height())
    .append("svg")
    .append("g")

  svg.append("g")
    .attr("class", "slices");
  svg.append("g")
    .attr("class", "labels");
  svg.append("g")
    .attr("class", "lines");

        colors.domain(layers, function (d){ 
            return d.category; 
        });

        
  var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) {
      return d.dimensions[Object.keys(d.dimensions)[0]];
    });

  var arc = d3.svg.arc()
    .outerRadius(radius * 0.8)
    .innerRadius(radius * 0.4);

  var outerArc = d3.svg.arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9);

  svg.attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

  var key = function(d){ return d.data.category; };
  change(data);

  function change(data) {

  /* ------- PIE SLICES -------*/
    var slice = svg.select(".slices").selectAll("path.slice")
      .data(pie(data), key);

      slice.enter()
          .insert("path")
          .style("fill", function(d) { return colors()(d.data.category); })
          .attr("class", "slice");

      slice   
        .transition().duration(1000)
        .attrTween("d", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
              return arc(interpolate(t));
            };
        })
  
    slice.exit()
      .remove();
  
    /* ------- TEXT LABELS -------*/
  
    var text = svg.select(".labels").selectAll("text")
      .data(pie(data), key);
  
    text.enter()
      .append("text")
      .attr("dy", ".35em")
      .text(function(d) {
        return d.data.category;
      });
    
    function midAngle(d){
      return d.startAngle + (d.endAngle - d.startAngle)/2;
    }
  
    text.transition().duration(1000)
      .attrTween("transform", function(d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          var d2 = interpolate(t);
          var pos = outerArc.centroid(d2);
          pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
          return "translate("+ pos +")";
        };
      })
      .styleTween("text-anchor", function(d){
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          var d2 = interpolate(t);
          return midAngle(d2) < Math.PI ? "start":"end";
        };
      });
  
    text.exit()
      .remove();
  
    /* ------- SLICE TO TEXT POLYLINES -------*/
  
    var polyline = svg.select(".lines").selectAll("polyline")
      .data(pie(data), key);
    
    polyline.enter()
      .append("polyline")
      .attr("opacity", ".3")
      .attr("stroke", "grey")
      .attr("stroke-width", "2px")
      .attr("fill", "none");
      
    polyline.transition().duration(1000)
      .attrTween("points", function(d){
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          var d2 = interpolate(t);
          var pos = outerArc.centroid(d2);
          pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
          return [arc.centroid(d2), outerArc.centroid(d2), pos];
        };      
      });
    
    polyline.exit()
      .remove();
    };
  
  })
})();
