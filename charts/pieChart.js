
(function(){

    var model = raw.model();

    var category = model.dimension()
        .title("Category")
        .required(1);

    var color = model.dimension()
        .title("Color")

    var list = model.dimension()
        .title('Dimensions')
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
        .title('Pie Chart')
        .description(
            "饼图，用于对数据按照比例统计展示。为了展示效果，建议最多不超过15个分类。 ")
        .thumbnail("imgs/pieChart.png")
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

        radius = Math.min(w, h) / 2,  
        // Pie layout will use the "val" property of each data object entry
        pieChart = d3.layout.pie().sort(null).value(function(d){return d.dimensions.Amount;}), 
        arc = d3.svg.arc().outerRadius(radius),
        MAX_SECTORS = 15; // Less than 20 please
        //colors = d3.scale.category20();

    // Synthetic data generation ------------------------------------------------
    //var data = [];
    /*var numSectors = Math.ceil(Math.random()*MAX_SECTORS);
    for(i = -1; i++ < numSectors; ){
      var children = [];
      var numChildSectors = Math.ceil(Math.random()*MAX_SECTORS);
      var color = colors(i);
      for( j=-1; j++ < numChildSectors; ){
        // Add children categories with shades of the parent color
        children.push(
          { cat: "cat"+((i+1)*100+j), 
            val: Math.random(), 
            color: d3.rgb(color).darker(1/(j+1))
          });  
      }
      data.push({ 
        cat: "cat"+i, 
        val: Math.random(), 
        color: color, 
        children: children});
    }*/

    // --------------------------------------------------------------------------



    // SVG elements init
    var svg = selection
            .attr("width", +width())
            .attr("height", +height())
            .append("svg");

        colors.domain(layers, function (d){ 
            return d.category; 
        });

        defs = svg.append("svg:defs"),
        // Declare a main gradient with the dimensions for all gradient entries to refer
        mainGrad = defs.append("svg:radialGradient")
          .attr("gradientUnits", "userSpaceOnUse")  
          .attr("cx", 0).attr("cy", 0).attr("r", radius).attr("fx", 0).attr("fy", 0)
          .attr("id", "master"),
        // The pie sectors container
        arcGroup = svg.append("svg:g")
          .attr("class", "arcGroup")
          .attr("filter", "url(#shadow)")
          .attr("transform", "translate(" + (width() / 2) + "," + (height() / 2) + ")"),
        // Header text
        header = svg.append("text").text("Parent")
                  .attr("transform", "translate(10, 20)").attr("class", "header");

        // Declare shadow filter
        var shadow = defs.append("filter").attr("id", "shadow")
                      .attr("filterUnits", "userSpaceOnUse")
                      .attr("x", -1*(width() / 2)).attr("y", -1*(height() / 2))
                      .attr("width", width()).attr("height", height());
        shadow.append("feGaussianBlur")
          .attr("in", "SourceAlpha")
          .attr("stdDeviation", "4")
          .attr("result", "blur");
        shadow.append("feOffset")
          .attr("in", "blur")
          .attr("dx", "4").attr("dy", "4")
          .attr("result", "offsetBlur");
        shadow.append("feBlend")
          .attr("in", "SourceGraphic")
          .attr("in2", "offsetBlur")
          .attr("mode", "normal");



    // Redraw the graph given a certain level of data
    function updateGraph(cat){
      var currData = data;
      
      // Simple header text
      if(cat != undefined){
        currData = findChildenByCat(cat);
        d3.select(".header").text("Parent → "+cat);
      } else {
        d3.select(".header").text("Parent");
      }

      // Create a gradient for each entry (each entry identified by its unique category)
      var gradients = defs.selectAll(".gradient").data(currData, function(d){return d.category;});      
      gradients.enter().append("svg:radialGradient")
        .attr("id", function(d, i) { return "gradient" + d.category; })
        .attr("class", "gradient")
        .attr("xlink:href", "#master");    

      gradients.append("svg:stop").attr("offset", "0%").attr("stop-color", getColor );
      gradients.append("svg:stop").attr("offset", "90%").attr("stop-color", getColor );
      gradients.append("svg:stop").attr("offset", "100%").attr("stop-color", getDarkerColor );      


      // Create a sector for each entry in the enter selection
      var paths = arcGroup.selectAll("path")
                    .data(pieChart(currData), function(d) {return d.data.category;} );            
      paths.enter().append("svg:path").attr("class", "sector");
      
      // Each sector will refer to its gradient fill
      paths.attr("fill", function(d, i) { return "url(#gradient"+ d.data.category+")"; })
        .transition().duration(1000).attrTween("d", tweenIn).each("end", function(){
          this._listenToEvents = true;
        });
      
      // Mouse interaction handling
      paths.on("click", function(d){ 
                if(this._listenToEvents){
                  // Reset inmediatelly
                  d3.select(this).attr("transform", "translate(0,0)")
                  // Change level on click if no transition has started                
                  paths.each(function(){
                     this._listenToEvents = false;
                  });
                  updateGraph(d.data.children? d.data.category : undefined); 
                }
              })
            .on("mouseover", function(d){ 
                 // Mouseover effect if no transition has started                
                if(this._listenToEvents){
                  // Calculate angle bisector
                  var ang = d.startAngle + (d.endAngle - d.startAngle)/2; 
                  // Transformate to SVG space
                  ang = (ang - (Math.PI / 2) ) * -1;

                  // Calculate a 10% radius displacement
                  var x = Math.cos(ang) * radius * 0.1;
                  var y = Math.sin(ang) * radius * -0.1;

                  d3.select(this).transition()
                    .duration(250).attr("transform", "translate("+x+","+y+")"); 
                }
              })
            .on("mouseout", function(d){
              // Mouseout effect if no transition has started                
              if(this._listenToEvents){
                d3.select(this).transition()
                  .duration(150).attr("transform", "translate(0,0)"); 
              }
            });

      // Collapse sectors for the exit selection
      paths.exit().transition()
        .duration(1000)
        .attrTween("d", tweenOut).remove();            
    }


    // "Fold" pie sectors by tweening its current start/end angles
    // into 2*PI
    function tweenOut(data) {
      data.startAngle = data.endAngle = (2 * Math.PI);      
      var interpolation = d3.interpolate(this._current, data);
      this._current = interpolation(0);
      return function(t) {
          return arc(interpolation(t));
      };
    }


    // "Unfold" pie sectors by tweening its start/end angles
    // from 0 into their final calculated values
    function tweenIn(data) {
      var interpolation = d3.interpolate({startAngle: 0, endAngle: 0}, data);
      this._current = interpolation(0);
      return function(t) {
          return arc(interpolation(t));
      };
    }


    // Helper function to extract color from data object
    function getColor(data, index){
      return colors()(data.category);
    }


    // Helper function to extract a darker version of the color
    function getDarkerColor(data, index){
      return d3.rgb(getColor(data, index)).darker();
    }
    

    function findChildenByCat(cat){      
      for(i=-1; i++ < data.length - 1; ){
        if(data[i].cat == cat){
          return data[i].children;
        }
      }
      return data;
    }
    
    // Start by updating graph at root level
    updateGraph();


  })
})();
