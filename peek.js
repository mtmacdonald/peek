/*! Peek.js (c) 2014 Mark Macdonald | http://mtmacdonald.github.io/peek/LICENSE */

// todo stacked line charts: http://stackoverflow.com/questions/14713503/how-to-handle-layers-with-missing-data-points-in-d3-layout-stack

function Legend(container) {

    this.draw = function (data) {

        var legend = d3.select(container).append("div").attr("class", "legend");
        data.forEach(function(series, i) {
            var row = legend.append("div");

            row.append("span").attr("class", "key")
                .style('background-color', series.color)
                .style('border-color', series.color); //show color when printing

            var text = [], i = -1;
            text[++i] = series.label;
            if (series.units) {
                text[++i] = ' ('+series.units+')';
            };

            row.append("span").html(text.join('')).attr('class', 'key-text');
        });
    }
}

function Plot(container) {

    var labelHeight = 20;

    this.isRadial = false;
    this.showTitle = true;
    this.showXLabel = true;
    this.showYLabel = true;

    this.container = container;
    this.margin = {top: 20, right: 20, bottom: 50, left: 50};
    this.width = 600;
    this.height = 400;
    this.radius = 150; //only applies to radial charts

    this.title = 'Chart Title';
    this.xLabel = 'X Label';
    this.yLabel = 'Y Label';

    this.axes = new Axes(this);

    this.getSvgWidth = function() {
        var yLabelWidth = this.showYLabel === true ? labelHeight : 0;
        var plotWidth = this.width - yLabelWidth - this.margin.left - this.margin.right;
        return plotWidth;
    }

    this.getPlotHeight = function() {
        var titleHeight = this.showTitle === true ? labelHeight : 0;
        var xLabelHeight = this.showXLabel === true ? labelHeight : 0;
        var plotHeight = this.height - titleHeight - xLabelHeight - this.margin.top - this.margin.bottom;
        return plotHeight;
    }

    this.draw = function() {

        //chart div
        var chart = d3.select(container).insert("div").attr("class", "plot p-clear-after");
        //left container with yLabel
        var leftContainer = chart.insert("div").attr("class", "left-container");
        if (this.showYLabel === true) {
            leftContainer.style('width', labelHeight+'px');
        }
        if (this.showYLabel === true) {
            leftContainer.insert("div").html(this.yLabel).attr("class", "yLabel")
                                .style('height', labelHeight+'px').style('line-height', labelHeight+'px')
                                .style('width', '400px'); /*must be same as height of plot area*/
        }
        //main container with xLabel and plot area
        var mainContainer = chart.insert("div").attr("class", "main-container");
        if (this.showTitle === true) {
            mainContainer.insert("div").html(this.title).attr("class", "title")
                                .style('height', labelHeight+'px').style('line-height', labelHeight+'px');
        }
        var svgContainer = mainContainer.insert("div").attr("class", "svgContainer");
        if (this.showXLabel === true) {
            mainContainer.insert("div").html(this.xLabel).attr("class", "xLabel")
                                .style('height', labelHeight+'px').style('line-height', labelHeight+'px');
        }

        this.svg = svgContainer.insert("svg")
                    .attr('width', this.getSvgWidth() + this.margin.left + this.margin.right)
                    .attr('height', this.getPlotHeight() + this.margin.top + this.margin.bottom);

        svgContainer.on("mousemove", function() {
            var infobox = d3.select(".infobox");
            var coord = d3.mouse(this);
            infobox.style("left", (d3.event.pageX) + 15 + "px" );
            infobox.style("top", (d3.event.pageY) + "px");     
        });

        if (this.isRadial === false) {
            this.svg = this.svg.append("g")
                        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        } else {
            this.svg = this.svg.append("g")
                        .attr("transform", "translate(" + this.radius + "," + this.radius + ")");
        }
    };
}

function Axis (plot) {

    var plot = plot;
    this.showTicks = true;
    this.barWidth = 0;

    this.draw = function (scale, orient, ticks) {
        var axis = d3.svg.axis()
                    .scale(scale)
                    .orient(orient).ticks(ticks);

        var rendered = plot.svg.append("g")
            .attr("class", "x axis");

        if (orient === 'bottom') {
            rendered.attr("transform", "translate("+this.barWidth/2+"," + plot.getPlotHeight() + ")")
        }

        rendered.call(axis);

        if (this.showTicks) {

            if (orient === 'bottom') {
                plot.svg.append("g")
                    .attr("class", "grid")
                    .attr("transform", "translate("+this.barWidth/2+"," + plot.getPlotHeight() + ")")
                    .call(axis
                        .tickSize(-plot.getPlotHeight(), 0, 0)
                        .tickFormat("")
                    );
            } else {
                plot.svg.append("g")         
                    .attr("class", "grid")
                    .call(axis
                        .tickSize(-plot.getSvgWidth(), 0, 0)
                        .tickFormat("")
                    );
            }
        }
    }
}

function Axes (plot) {

    var plot = plot;
    this.x = new Axis(plot);
    this.y = new Axis(plot);

    this.draw = function(xScale, yScale) {
        this.x.draw(xScale, 'bottom', 5);
        this.y.draw(yScale, 'left', 5);
    };

}

function Line (plot, stacked) {
    var plot = plot;
    var self = this;
    this.xScale;
    this.yScale;

    this.points = false;
    this.interpolation = 'cardinal';
    this.area = false;
    this.point = new Point(plot);

    var line = d3.svg.line()
                .interpolate(this.interpolation) 
                .x(function(d) { return self.xScale(d.x); })
                .y(function(d) { return self.yScale(d.y); });

    var area = d3.svg.area()
                .interpolate(this.interpolation)
                .x(function(d) { return self.xScale(d.x); })
                .y0(plot.getPlotHeight())
                .y1(function(d) { return self.yScale(d.y); });

    if (stacked === true) {
        var line = d3.svg.line()
                    .interpolate(this.interpolation) 
                    .x(function(d) { return self.xScale(d.x); })
                    .y(function(d) { return self.yScale(d.y0 + d.y); });


        var area = d3.svg.area()
            .interpolate('cardinal')
            .x(function(d, i) { return self.xScale(d.x); })
            .y0(function(d) { return self.yScale(d.y0); })
            .y1(function(d) { return self.yScale(d.y0 + d.y); });
    }

    this.draw = function(series, xScale, yScale) {
        this.xScale = xScale;
        this.yScale = yScale;
        plot.svg.append("path")
            .attr("class", "line")
            .style("stroke", series.color)
            .attr("d", line(series.values));
        if (this.area === true) {
            plot.svg.append("path")
                    .attr("class", "area")
                    .style("fill", series.color)
                    .attr("d", area(series.values));
        }
        if (this.points) {
            this.point.draw(series, xScale, yScale);
        }
    }
}

function Point (plot) {
    var plot = plot;

    this.draw = function(series, xScale, yScale) {
        d3.select(plot.container)
            .append("div")
            .attr("class", "infobox").html("<p>Tooltip</p>");

        plot.svg.selectAll(".chart")
            .data(series.values)
            .enter()
            .append("circle")
              .attr("transform", function(d) { 
                return "translate(" + xScale(d.x) + ", " + yScale(d.y) + ")"; 
            })
              .attr("r", function(d){ return 4; }) 
              .attr("fill", "white")
              .style("stroke", series.color)
              .on("mouseover", this.mouseover_circle)
              .on("mouseout", this.mouseout_circle);
    }

    this.mouseover_circle = function(data,i) {     
        var formatDate = d3.time.format("%A %d. %B %Y");
        var circle = d3.select(this);
        circle.transition().duration(500).attr("r", 16);

        d3.select(".infobox")
        .style("display", "block")
        .style('opacity', 0)
        .transition().delay(200).duration(500).style('opacity', 1);  
          
        d3.select(".infobox p")
            .html("<strong>Date:</strong> " 
                + formatDate(new Date(data.x)) 
                + "<br/>" 
                + "<strong>Value:</strong> " 
                + data.y
                );
    }

    this.mouseout_circle = function() {
        var circle = d3.select(this);
        circle.transition().duration(500).attr("r", 4);
        d3.select(".infobox").style("display", "none"); 
    }

}

//----------------------------------------------------------------------------------------------------------------------

function Series() {

    var isStacked = false;

    this.parseDates = function (data) {
        var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;
        data.forEach(function (series) {
            series.values.forEach(function (value) {
                value.x = parseDate(value.x);
            });
        });
    }

    this.stack = function (data) {
        isStacked = true;

        //layering code (only for stacked charts)
        //D3.layout.stack can't handle the metadata in the data array, so create a stripped-down data array
        //Note - because objects are copied by reference, modifying the objects in the stripped-down array also 
            //modifies the original data array
        var stripped_data = [];
        data.forEach(function (series) {
            stripped_data.push(series.values);
        }, this);

        var stack = d3.layout.stack().offset("zero");

        stack(stripped_data);
    }

    this.xExtent = function (data) {
        //get the min value from all series
        var min = d3.min(data.map(function (series) {
            return d3.min(series.values.map(function (point) {
                return point.x;
            }));
        }));
        //get the max value from all series
        var max = d3.max(data.map(function (series) {
            return d3.max(series.values.map(function (point) {
                return point.x;
            }));
        }));
        return [min, max];
    }

    this.yExtent = function (data) {
        //min is either the min value from all series, or 0, whichever is lower
        var min = d3.min(data.map(function (series) {
            return d3.min(series.values.map(function (point) {
                return point.y;
            }));
        }));
        if (min > 0) {
            min = 0;
        }

        //max depends on whether series are stacked
        if (isStacked) { //if stacked, get max of y0+y in the final data series
            var max = d3.max(data[data.length-1].values.map(function (point) {
                return point.y0+point.y;
            }));
        } else { //if not stacked, get the max value from all series
            var max = d3.max(data.map(function (series) {
                return d3.max(series.values.map(function (point) {
                    return point.y;
                }));
            }));
        }

        return [min, max];
    }

}

function Cartesian(container, stacked) {

    var self = this;

    var stacked = typeof stacked !== 'undefined' ? stacked : false; //default

    this.plot = new Plot(container);
    this.line = new Line(this.plot, stacked);
    var series = new Series();

    this.bar = false;


    this.draw = function (data) {

        this.plot.draw();

        series.parseDates(data);

        if (stacked) {
            series.stack(data);
        }

        var xScale = d3.time.scale().range([0, this.plot.getSvgWidth()]);
        var yScale = d3.scale.linear().range([this.plot.getPlotHeight(), 0]);

        if (this.bar) {
            var barSpacing = 20;
            var barCount = data[0].values.length; //todo: don't assume all bars are in all series
            var barWidth = (this.plot.getSvgWidth()-((barCount-1)*barSpacing))/barCount;
            var barchartWidth = this.plot.getSvgWidth()-barWidth; //subtract the width of last bar to avoid overshooting end of chart
            xScale = d3.time.scale().range([0, barchartWidth]);
            this.plot.axes.x.barWidth = barWidth; //translate the tick to the center of the bar
        }

//----------------------------------------------------------------------------------------------------------------------

        xScale.domain(series.xExtent(data));
        yScale.domain(series.yExtent(data));
        this.plot.axes.draw(xScale, yScale);

        if (this.bar === true) {
            var max = series.yExtent(data)[1]; //refactor
            data.forEach(function(series, i) {
                series.values.forEach(function(value) {
                    this.plot.svg.append("rect")
                        .attr("class", "rect-line rect-area")
                        .style("fill", series.color)
                        .style("stroke", series.color)
                        .attr("x", function(d) { return xScale(value.x); })
                        .attr("width", barWidth)
                        //for y-axis, d3 has a top-left coordinate system
                        //todo - account for line size / line overlap?
                        .attr("y", function(d) { return self.plot.getPlotHeight()-yScale(max-value.y-value.y0); })
                        .attr("height", function(d) { return yScale(max-value.y); });
                }, this);
            }, this);
        } else {
            data.forEach(function(series, i) {
                this.line.draw(series, xScale, yScale);
            }, this);
        }
    }
}

function GroupedStacked(container) {

    this.draw = function () {
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
 
var x0 = d3.scale.ordinal()
    .rangeRoundBands([0, width], 0.1);
 
var x1 = d3.scale.ordinal();
 
var y = d3.scale.linear()
    .range([height, 0]);
 
var xAxis = d3.svg.axis()
    .scale(x0)
    .orient("bottom");
 
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));
 
var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
 
var svg = d3.select(container).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
 
var yBegin;
 
var innerColumns = {
  "column1" : ["Under 5 Years","5 to 13 Years","14 to 17 Years"],
  "column2" : ["18 to 24 Years"],
  "column3" : ["25 to 44 Years"],
  "column4" : ["45 to 64 Years", "65 Years and Over"]
}

d3.csv("../data.csv", function(error, data) {
  var columnHeaders = d3.keys(data[0]).filter(function(key) { return key !== "State"; });
  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "State"; }));
  data.forEach(function(d) {
    var yColumn = new Array();
    d.columnDetails = columnHeaders.map(function(name) {
      for (ic in innerColumns) {
        if($.inArray(name, innerColumns[ic]) >= 0){
          if (!yColumn[ic]){
            yColumn[ic] = 0;
          }
          yBegin = yColumn[ic];
          yColumn[ic] += +d[name];
          return {name: name, column: ic, yBegin: yBegin, yEnd: +d[name] + yBegin,};
        }
      }
    });
    d.total = d3.max(d.columnDetails, function(d) { 
      return d.yEnd; 
    });
  });
 
  x0.domain(data.map(function(d) { return d.State; }));
  x1.domain(d3.keys(innerColumns)).rangeRoundBands([0, x0.rangeBand()]);
 
  y.domain([0, d3.max(data, function(d) { 
    return d.total; 
  })]);
 
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
 
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".7em")
      .style("text-anchor", "end")
      .text("");
 
  var project_stackedbar = svg.selectAll(".project_stackedbar")
      .data(data)
    .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { return "translate(" + x0(d.State) + ",0)"; });
 
  project_stackedbar.selectAll("rect")
      .data(function(d) { return d.columnDetails; })
    .enter().append("rect")
      .attr("width", x1.rangeBand())
      .attr("x", function(d) { 
        return x1(d.column);
         })
      .attr("y", function(d) { 
        return y(d.yEnd); 
      })
      .attr("height", function(d) { 
        return y(d.yBegin) - y(d.yEnd); 
      })
      .style("fill", function(d) { return color(d.name); });
 
  var legend = svg.selectAll(".legend")
      .data(columnHeaders.slice().reverse())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
 
  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);
 
  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });
 
});
    }

}

function Grouped(container) {

    this.draw = function (data) {
              // First, we define sizes and colours...
          var outerW = 640; // outer width
          var outerH = 480; // outer height
          var padding = { t: 0, r: 0, b: 0, l: 0 };
          var w = outerW - padding.l - padding.r; // inner width
          var h = outerH - padding.t - padding.b; // inner height
          var c = [ "#E41A1C", "#377EB8", "#4DAF4A" ]; // ColorBrewer Set 1

          // Second, we define our data...
          // Create a two-dimensional array.
          // The first dimension has as many Array elements as there are series.
          // The second dimension has as many Number elements as there are groups.
          // It looks something like this...
          //  var data = [
          //    [ 0.10, 0.09, 0.08, 0.07, 0.06, ... ], // series 1
          //    [ 0.10, 0.09, 0.08, 0.07, 0.06, ... ], // series 2
          //    [ 0.10, 0.09, 0.08, 0.07, 0.06, ... ]  // series 3
          //  ];
          var numberGroups = 10; // groups
          var numberSeries = 3;  // series in each group
          var data = d3.range(numberSeries).map(function () { return d3.range(numberGroups).map(Math.random); });

          // Third, we define our scales...
          // Groups scale, x axis
          var x0 = d3.scale.ordinal()
              .domain(d3.range(numberGroups))
              .rangeBands([0, w], 0.2);

          // Series scale, x axis
          // It might help to think of the series scale as a child of the groups scale
          var x1 = d3.scale.ordinal()
              .domain(d3.range(numberSeries))
              .rangeBands([0, x0.rangeBand()]);

          // Values scale, y axis
          var y = d3.scale.linear()
              .domain([0, 1]) // Because Math.random returns numbers between 0 and 1
              .range([0, h]);

          // Visualisation selection
          var vis = d3.select(container)
              .append("svg:svg")
              .attr("width", outerW)
              .attr("height", outerH);

          // Series selection
          // We place each series into its own SVG group element. In other words,
          // each SVG group element contains one series (i.e. bars of the same colour).
          // It might be helpful to think of each SVG group element as containing one bar plot.
          var series = vis.selectAll("g.series")
              .data(data)
            .enter().append("svg:g")
              .attr("class", "series") // Not strictly necessary, but helpful when inspecting the DOM
              .attr("fill", function (d, i) { return c[i]; })
              .attr("transform", function (d, i) { return "translate(" + x1(i) + ")"; });

          // Groups selection
          var groups = series.selectAll("rect")
              .data(Object) // The second dimension in the two-dimensional data array
            .enter().append("svg:rect")
                .attr("x", 0)
                .attr("y", function (d) { return h - y(d); })
                .attr("width", x1.rangeBand())
                .attr("height", y)
                .attr("transform", function (d, i) { return "translate(" + x0(i) + ")"; });
    }
}

function Compare(container) {

    var width = 950;
    this.rightPadding = 100;
    var height = 300;
    this.bottomPadding = 0; //only meeded when displaying x-axis
    this.url;

    var plot = new Plot(container);
    plot.showTitle = false;
    plot.showXLabel = false;
    plot.showYLabel = false;
    plot.margin.top = 0;
    plot.margin.right = 0;
    plot.margin.bottom = 0;
    plot.margin.left = 0;
    plot.draw();

    this.draw = function (data) {
            var self = this;

            plot.svg.attr("width", width).attr("height", height); //dynamically update width and height

            var max = d3.max(data, function(d) { return d.value;} );

            var spacing = 10;
            var dx = (width - this.rightPadding) / max;
            var dy = ((height-this.bottomPadding) / data.length) - spacing;
    
            //bars
            var bars = plot.svg.selectAll(".bar")
                .data(data)
                .enter()
                .append("rect")
                .attr("x", function(d, i) {return 0;})
                .attr("y", function(d, i) {return dy*i + spacing*i;})
                .attr("width", function(d, i) {return dx*d.value})
                .attr("height", dy)
                .attr("fill", function(d, i) {return d.colour} );

            //labels
            var text = plot.svg.selectAll("text")
                .data(data)
                .enter()
                .append("text")
                    .attr('class', 'label')
                    .attr("x", function(d, i) {return (dx*d.value)+5})
                    .attr("y", function(d, i) {return dy*i + spacing*i + (dy/2) + 4;}) //4 accounts for text height
                    .html( function(d) {return d.label;});

            //text values
            var text = plot.svg.selectAll(".compare-chart-values")
                .data(data)
                .enter()
                .append("text")
                    .attr('class', 'compare-chart-values')
                    .text( function(d) { return d.value.toFixed(2); })
                    .attr("x", function(d, i) {
                        //position the values just left of the end of the bars
                        var width = this.getComputedTextLength() + 10;
                        return (dx*d.value)-(width);
                    })
                    .attr("y", function(d, i) {return dy*i + spacing*i + (dy/2) + 4;}) //4 accounts for text height
                    .style("display", function(d, i){
                        //only display the values when there is space inside the bar
                        var width = this.getComputedTextLength() + 10;
                        if (dx*d.value < width) {
                            return "none";
                        } else {
                            return "initial";
                        }
                    })
                    .style("font-weight", "bold")
                    .attr("fill", "white");
    };

    this.load = function() {
        d3.json(this.url, function (data) {
            this.draw(data);
        }.bind(this));
    };
}

function Pie(container) {

    this.width = 300;
    this.height = 300;
    this.radius = 150;
    this.innerRadius = 60;

    var plot = new Plot(container);
    plot.isRadial = true;
    plot.showTitle = false;
    plot.showXLabel = false;
    plot.showYLabel = false;
    plot.width = this.width;
    plot.height = this.height;
    plot.radius = this.radius;
    var legend = new Legend(container);

    this.arc = d3.svg.arc().outerRadius(this.radius).innerRadius(this.innerRadius);
    this.pie = d3.layout.pie().value(function(d) { return d.value; });
/*
    this.legend = function(container, data) {
        data.forEach(function(series, i) {
            legend.push(series);
        }, this);
    }
*/
    this.draw = function (data) {
        plot.draw();
        var self = this;

        plot.svg.data([data]);

        var arcs = plot.svg.selectAll("g.slice")
            .data(self.pie)
            .enter()
                .append("svg:g")
                    .attr("class", "slice");

        arcs.append("svg:path")
                .attr("fill", function(d, i) { return data[i].color; } ) 
                .attr("d", self.arc);

        arcs.append("svg:text")
                .attr("transform", function(d) { 
                d.innerRadius = 0;
                d.outerRadius = self.radius;
                return "translate(" + self.arc.centroid(d) + ")";
            })
            .attr("text-anchor", "middle")
            .text(function(d, i) { 
                var value = data[i].value;
                if (value > 3.0) {
                   return Math.round(data[i].value)+'%';
                }
            });
    };

    this.load = function() {
        d3.json(this.url, function (data) {
            this.draw(data);
        }.bind(this));
    };
}