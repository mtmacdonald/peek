/*! Peek.js (c) 2014 Mark Macdonald | http://mtmacdonald.github.io/peek/LICENSE */

// todo stacked line charts: http://stackoverflow.com/questions/14713503/how-to-handle-layers-with-missing-data-points-in-d3-layout-stack

function Legend(container) {

    var legend = d3.select(container).append("div").attr("class", "legend");

    this.push = function(series) {
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
    }
}

function Chart(container) {

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

    var titleHeight = this.showTitle === true ? labelHeight : 0;
    var xLabelHeight = this.showXLabel === true ? labelHeight : 0;
    var yLabelWidth = this.showYLabel === true ? labelHeight : 0;

    var plotWidth = this.width - yLabelWidth - this.margin.left - this.margin.right;
    var plotHeight = this.height - titleHeight - xLabelHeight - this.margin.top - this.margin.bottom;

    this.axes = new Axes(this);

    this.getPlotWidth = function() {
        return plotWidth;
    }

    this.getPlotHeight = function() {
        return plotHeight;
    }

    this.draw = function() {
        //chart div
        var chart = d3.select(container).insert("div").attr("class", "chart p-clear-after");
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
        var plot = mainContainer.insert("div").attr("class", "plot");
        if (this.showXLabel === true) {
            mainContainer.insert("div").html(this.xLabel).attr("class", "xLabel")
                                .style('height', labelHeight+'px').style('line-height', labelHeight+'px');
        }

        this.svg = plot.insert("svg")
                    .attr('width', plotWidth + this.margin.left + this.margin.right)
                    .attr('height', plotHeight + this.margin.top + this.margin.bottom);

        plot.on("mousemove", function() {
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

function Axis (chart) {

    var chart = chart;
    this.showTicks = true;
    this.barWidth = 0;

    this.draw = function (scale, orient, ticks) {
        var axis = d3.svg.axis()
                    .scale(scale)
                    .orient(orient).ticks(ticks);

        var rendered = chart.svg.append("g")
            .attr("class", "x axis");

        if (orient === 'bottom') {
            rendered.attr("transform", "translate("+this.barWidth/2+"," + chart.getPlotHeight() + ")")
        }

        rendered.call(axis);

        if (this.showTicks) {

            if (orient === 'bottom') {
                chart.svg.append("g")
                    .attr("class", "grid")
                    .attr("transform", "translate("+this.barWidth/2+"," + chart.getPlotHeight() + ")")
                    .call(axis
                        .tickSize(-chart.getPlotHeight(), 0, 0)
                        .tickFormat("")
                    );
            } else {
                chart.svg.append("g")         
                    .attr("class", "grid")
                    .call(axis
                        .tickSize(-chart.getPlotWidth(), 0, 0)
                        .tickFormat("")
                    );
            }
        }
    }
}

function Axes (chart) {

    var chart = chart;
    this.x = new Axis(chart);
    this.y = new Axis(chart);

    this.draw = function(xScale, yScale) {
        this.x.draw(xScale, 'bottom', 5);
        this.y.draw(yScale, 'left', 5);
    };

}

function Line (chart, stacked) {
    var chart = chart;
    var self = this;
    this.xScale;
    this.yScale;

    this.points = false;
    this.interpolation = 'cardinal';
    this.area = false;
    this.point = new Point(chart);

    var line = d3.svg.line()
                .interpolate(this.interpolation) 
                .x(function(d) { return self.xScale(d.x); })
                .y(function(d) { return self.yScale(d.y); });

    var area = d3.svg.area()
                .interpolate(this.interpolation)
                .x(function(d) { return self.xScale(d.x); })
                .y0(chart.getPlotHeight())
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
        chart.svg.append("path")
            .attr("class", "line")
            .style("stroke", series.color)
            .attr("d", line(series.values));
        if (this.area === true) {
            chart.svg.append("path")
                    .attr("class", "area")
                    .style("fill", series.color)
                    .attr("d", area(series.values));
        }
        if (this.points) {
            this.point.draw(series, xScale, yScale);
        }
    }
}

function Point (chart) {
    var chart = chart;

    this.draw = function(series, xScale, yScale) {
        d3.select(chart.container)
            .append("div")
            .attr("class", "infobox").html("<p>Tooltip</p>");

        chart.svg.selectAll(".chart")
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

function Xy(container, stacked, width, height) {

    var stacked = typeof stacked !== 'undefined' ? stacked : false; //default

    this.url;

    var chart = new Chart(container);
    chart.draw();
    this.line = new Line(chart, stacked);
    var legend = new Legend(container);

    this.bar = false;

    var xScale = d3.time.scale().range([0, chart.getPlotWidth()]);
    var yScale = d3.scale.linear().range([chart.getPlotHeight(), 0]);

    this.parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

    this.render = function (data) {

        if (this.bar) {
            var barSpacing = 20;
            var barCount = data[0].values.length; //todo: don't assume all bars are in all series
            var barWidth = (chart.getPlotWidth()-((barCount-1)*barSpacing))/barCount;
            var barchartWidth = chart.getPlotWidth()-barWidth; //subtract the width of last bar to avoid overshooting end of chart
            xScale = d3.time.scale().range([0, barchartWidth]);
            chart.axes.x.barWidth = barWidth; //translate the tick to the center of the bar
        }

//----------------------------------------------------------------------------------------------------------------------
        if (stacked) {
            //layering code (only for stacked charts)
            //D3.layout.stack can't handle the metadata in the data array, so create a stripped-down data array
            //Note - because objects are copied by reference, modifying the objects in the stripped-down array also 
                //modifies the original data array
            var stripped_data = [];
            data.forEach(function (series) {
                stripped_data.push(series.values);
            }, this);

            var stack = d3.layout.stack()
                  .offset("zero");

            var layers = stack(stripped_data);
        }
//----------------------------------------------------------------------------------------------------------------------

       //for x-axis scale, merge all datasets and get the extent of the dates
        var merged = [];

            data.forEach(function (series) {
                //first parse dates
                series.values.forEach(function (value) {
                    value.x = this.parseDate(value.x);
                }, this);
                //then merge into one array
                merged = merged.concat(series.values);
            }, this);

        xScale.domain(d3.extent(merged, function(d) { return d.x; }));

        var max = 0;

//----------------------------------------------------------------------------------------------------------------------
        //y-axis domain range for stacked charts
        if (stacked) {
            var last = data[data.length-1];
            max = d3.max(last.values, function(d) { return d.y0+d.y; });
//----------------------------------------------------------------------------------------------------------------------
        } else {
            //y-axis domain range for regular charts
            //for y-axis scale, get the minimum and maximum for each series
            //todo - handle y-axis scale properly for stacking        
            data.forEach(function(series, i) {
                var localMax = d3.max(series.values, function(d) { return d.y; });
                if (localMax > max) {
                    max = localMax;
                }
            }, this);
        }

        yScale.domain([0, max]);

        chart.axes.draw(xScale, yScale);

        if (this.bar === true) {
            data.forEach(function(series, i) {
                series.values.forEach(function(value) {
                    chart.svg.append("rect")
                        .attr("class", "rect-line rect-area")
                        .style("fill", series.color)
                        .style("stroke", series.color)
                        .attr("x", function(d) { return xScale(value.x); })
                        .attr("width", barWidth)
                        //for y-axis, d3 has a top-left coordinate system
                        //todo - account for line size / line overlap?
                        .attr("y", function(d) { return chart.getPlotHeight()-yScale(max-value.y-value.y0); })
                        .attr("height", function(d) { return yScale(max-value.y); });
                });
                legend.push(series);
            }, this);
        } else {
            data.forEach(function(series, i) {
                this.line.draw(series, xScale, yScale);
                legend.push(series);
            }, this);
        }
    }
}

function Grouped(container) {

    this.render = function (data) {
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
          // It might be helpful to think of each SVG group element as containing one bar chart.
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

    var chart = new Chart(container);
    chart.showTitle = false;
    chart.showXLabel = false;
    chart.showYLabel = false;
    chart.margin.top = 0;
    chart.margin.right = 0;
    chart.margin.bottom = 0;
    chart.margin.left = 0;
    chart.draw();

    this.render = function (data) {
            var self = this;

            chart.svg.attr("width", width).attr("height", height); //dynamically update width and height

            var max = d3.max(data, function(d) { return d.value;} );

            var spacing = 10;
            var dx = (width - this.rightPadding) / max;
            var dy = ((height-this.bottomPadding) / data.length) - spacing;
    
            //bars
            var bars = chart.svg.selectAll(".bar")
                .data(data)
                .enter()
                .append("rect")
                .attr("x", function(d, i) {return 0;})
                .attr("y", function(d, i) {return dy*i + spacing*i;})
                .attr("width", function(d, i) {return dx*d.value})
                .attr("height", dy)
                .attr("fill", function(d, i) {return d.colour} );

            //labels
            var text = chart.svg.selectAll("text")
                .data(data)
                .enter()
                .append("text")
                    .attr('class', 'label')
                    .attr("x", function(d, i) {return (dx*d.value)+5})
                    .attr("y", function(d, i) {return dy*i + spacing*i + (dy/2) + 4;}) //4 accounts for text height
                    .html( function(d) {return d.label;});

            //text values
            var text = chart.svg.selectAll(".compare-chart-values")
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
            this.render(data);
        }.bind(this));
    };  

    this.draw = function () {
        this.load();
    };
}

function Pie(container) {

    this.width = 300;
    this.height = 300;
    this.radius = 150;
    this.innerRadius = 60;

    var chart = new Chart(container);
    chart.isRadial = true;
    chart.showTitle = false;
    chart.showXLabel = false;
    chart.showYLabel = false;
    chart.width = this.width;
    chart.height = this.height;
    chart.radius = this.radius;
    chart.draw();
    var legend = new Legend(container);

    this.arc = d3.svg.arc().outerRadius(this.radius).innerRadius(this.innerRadius);
    this.pie = d3.layout.pie().value(function(d) { return d.value; });

    this.legend = function(container, data) {
        data.forEach(function(series, i) {
            legend.push(series);
        }, this);

    }

    this.render = function (data) {

        var self = this;

        chart.svg.data([data]);

        var arcs = chart.svg.selectAll("g.slice")
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
            this.render(data);
        }.bind(this));
    };

    this.draw = function () {
        this.load();
    };

}