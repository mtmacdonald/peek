/*! Peek.js (c) 2014 Mark Macdonald | http://mtmacdonald.github.io/peek/LICENSE */

// todo stacked line charts: http://stackoverflow.com/questions/14713503/how-to-handle-layers-with-missing-data-points-in-d3-layout-stack

function Legend (container) {

    var legend = d3.select(container).append("div").attr("class", "legend");

    this.push = function(metric) {
        var row = legend.append("div");

        row.append("span").attr("class", "key")
            .style('background-color', metric.color)
            .style('border-color', metric.color); //show color when printing

        var text = [], i = -1;
        text[++i] = metric.label;
        if (metric.units) {
            text[++i] = ' ('+metric.units+')';
        };

        row.append("span").html(text.join('')).attr('class', 'key-text');
    }
}

function Plot(container, width, height, radius) {

    var width = typeof width !== 'undefined' ? width : 600; //default
    var height = typeof height !== 'undefined' ? height : 400; //default
    var radius = typeof radius !== 'undefined' ? radius : false; //default

    this.margin = {top: 20, right: 20, bottom: 50, left: 50};
    this.width = width - this.margin.left - this.margin.right;
    this.height = height - this.margin.top - this.margin.bottom;

    this.axes = new Axes(this);

    this.container = container; //Do not delete - needed for tooltip

    this.chart = d3.select(container).insert("div").attr("class", "chart p-clear-after");
    this.leftContainer = this.chart.insert("div").attr("class", "left-container");
        this.leftContainer.insert("div").html('Y Label').attr("class", "yLabel");
    this.mainContainer = this.chart.insert("div").attr("class", "main-container");

    this.mainContainer.insert("div").html('Chart Title').attr("class", "title");
    this.canvas = this.mainContainer.insert("div").attr("class", "canvas");
    this.mainContainer.insert("div").html('X Label').attr("class", "xLabel");

    this.svg = this.canvas.insert("svg")
                .attr('width', this.width + this.margin.left + this.margin.right)
                .attr('height', this.height + this.margin.top + this.margin.bottom);

    this.canvas.on("mousemove", function() {
        var infobox = d3.select(".infobox");
        var coord = d3.mouse(this);
        infobox.style("left", (d3.event.pageX) + 15 + "px" );
        infobox.style("top", (d3.event.pageY) + "px");     
    });

    if (radius === false) {
        this.svg = this.svg.append("g")
                    .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    } else {
        this.svg = this.svg.append("g")
                    .attr("transform", "translate(" + radius + "," + radius + ")");
    }
}

function Axis (plot) {

    var plot = plot;
    this.showTicks = true;

    this.draw = function (scale, orient, ticks) {
        var axis = d3.svg.axis()
                    .scale(scale)
                    .orient(orient).ticks(ticks);

        var rendered = plot.svg.append("g")
            .attr("class", "x axis");

        if (orient === 'bottom') {
            rendered.attr("transform", "translate(0," + plot.height + ")")
        }

        rendered.call(axis);

        if (this.showTicks) {

            if (orient === 'bottom') {
                plot.svg.append("g")
                    .attr("class", "grid")
                    .attr("transform", "translate(0," + plot.height + ")")
                    .call(axis
                        .tickSize(-plot.height, 0, 0)
                        .tickFormat("")
                    );
            } else {
                plot.svg.append("g")         
                    .attr("class", "grid")
                    .call(axis
                        .tickSize(-plot.width, 0, 0)
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
                .y0(plot.height)
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

    this.draw = function(metric, xScale, yScale) {
        this.xScale = xScale;
        this.yScale = yScale;
        plot.svg.append("path")
            .attr("class", "line")
            .style("stroke", metric.color)
            .attr("d", line(metric.values));
        if (this.area === true) {
            plot.svg.append("path")
                    .attr("class", "area")
                    .style("fill", metric.color)
                    .attr("d", area(metric.values));
        }
        if (this.points) {
            this.point.draw(metric, xScale, yScale);
        }
    }
}

function Point (plot) {
    var plot = plot;

    this.draw = function(metric, xScale, yScale) {
        d3.select(plot.container)
            .append("div")
            .attr("class", "infobox").html("<p>Tooltip</p>");

        plot.svg.selectAll(".plot")
            .data(metric.values)
            .enter()
            .append("circle")
              .attr("transform", function(d) { 
                return "translate(" + xScale(d.x) + ", " + yScale(d.y) + ")"; 
            })
              .attr("r", function(d){ return 4; }) 
              .attr("fill", "white")
              .style("stroke", metric.color)
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

    var plot = new Plot(container, width, height);
    this.line = new Line(plot, stacked);
    var legend = new Legend(container);

    var xScale = d3.time.scale().range([0, plot.width]);
    var yScale = d3.scale.linear().range([plot.height, 0]);

    this.parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

    this.render = function (data) {

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

            data.forEach(function (metric) {
                //first parse dates
                metric.values.forEach(function (value) {
                    value.x = this.parseDate(value.x);
                }, this);
                //then merge into one array
                merged = merged.concat(metric.values);
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
            //for y-axis scale, get the minimum and maximum for each metric
            //todo - handle y-axis scale properly for stacking        
            data.forEach(function(metric, i) {
                var localMax = d3.max(metric.values, function(d) { return d.y; });
                if (localMax > max) {
                    max = localMax;
                }
            }, this);
        }

        yScale.domain([0, max]);

        plot.axes.draw(xScale, yScale);

        data.forEach(function(metric, i) {
            this.line.draw(metric, xScale, yScale);
            legend.push(metric);
        }, this);
    }
}

function Box (plot, stacked) {
    var plot = plot;
    var self = this;
    this.xScale;
    this.yScale;

    this.interpolation = 'cardinal';
    this.area = false;

    //var line = d3.svg.line()
    //            .interpolate(this.interpolation) 
    //            .x(function(d) { return self.xScale(d.x); })
    //            .y(function(d) { return self.yScale(d.y); });

    //var area = d3.svg.area()
    //            .interpolate(this.interpolation)
    //            .x(function(d) { return self.xScale(d.x); })
    //            .y0(plot.height)
    //            .y1(function(d) { return self.yScale(d.y); });


    this.draw = function(metric, xScale, yScale) {
        this.xScale = xScale;
        this.yScale = yScale;
    //    plot.svg.append("path")
    //        .attr("class", "line")
    //        .style("stroke", metric.color)
    //        .attr("d", line(metric.values));
    //    if (this.area === true) {
    //        plot.svg.append("path")
    //                .attr("class", "area")
    //                .style("fill", metric.color)
    //                .attr("d", area(metric.values));
    //    }
    //    if (this.points) {
    //        this.point.draw(metric, xScale, yScale);
    //    }
    }
}

function Bar2 (container, width, height) {

    var stacked = typeof stacked !== 'undefined' ? stacked : true; //default

    this.url;

    var plot = new Plot(container, width, height);
    this.line = new Line(plot, stacked);
    var legend = new Legend(container);

    var xScale = d3.time.scale().range([0, plot.width]);
    //var yScale = d3.scale.linear().range([plot.height, 0]);
    //var xScale = d3.scale.ordinal().rangeRoundBands([0, plot.width]);
    var yScale = d3.scale.linear().range([0, plot.height]);
    var zScale = d3.scale.ordinal().range(["darkblue", "blue", "lightblue"]);

    this.parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

    this.render = function (data) {

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

            data.forEach(function (metric) {
                //first parse dates
                metric.values.forEach(function (value) {
                    value.x = this.parseDate(value.x);
                }, this);
                //then merge into one array
                merged = merged.concat(metric.values);
            }, this);

        xScale.domain(d3.extent(merged, function(d) { return d.x; }));

        var max = 0;

//----------------------------------------------------------------------------------------------------------------------
        //y-axis domain range for stacked charts
        if (stacked) {
            var last = data[data.length-1];
            max = d3.max(last.values, function(d) { return d.y0+d.y; });
//----------------------------------------------------------------------------------------------------------------------
        }
        yScale.domain([0, max]);

        plot.axes.draw(xScale, yScale);
 
        //xScale.domain(layers[0].map(function(d) { return d.x; }));
        //yScale.domain([0, d3.max(layers[layers.length - 1], function(d) { return d.y0 + d.y; })]);
  
        //plot.svg.attr("transform", "translate(10,470)");

        // Add a group for each column.
        var valgroup = plot.svg.selectAll("g.valgroup")
        .data(layers)
        .enter().append("svg:g")
        .attr("class", "valgroup")
        .style("fill", function(d, i) { return data[i].color; })
        .style("stroke", function(d, i) { return d3.rgb(data[i].color).darker(); });
 
        // Add a rect for each date.
        var rect = valgroup.selectAll("rect")
        .data(function(d){return d;})
        .enter().append("svg:rect")
        .attr("x", function(d) { return xScale(d.x); })
        .attr("y", function(d) { return yScale(d.y0); })
        .attr("height", function(d) { return yScale(d.y); })
        .attr("width", 40/*xScale.rangeBand()*/);
    }  
}


//----------------------------------------------------------------------------------------------------------------------

function Bar (plot) {
    var plot = plot;

    this.draw = function(value, color, y, heightShift, xScale, yScale) {
        plot.svg.append("rect")
            .attr("x", xScale(value.x) - 2)
            .attr("width", 5)
            .attr("y", y)
            .attr("height", yScale(value.y))
            .attr("fill", color)
            .attr("transform", "translate(" + 0 + "," + heightShift + ")")
    }
}

//----------------------------------------------------------------------------------------------------------------------

function Stacked(container, width, height) {

    this.url;

    this.container = container;

    this.controls;

    var plot = new Plot(container, width, height);
    var bar = new Bar(plot);
    var legend = new Legend(container);

    this.color = d3.scale.category20c();

    this.parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

    var xScale = d3.time.scale().range([0, plot.width]);
    var yScale = d3.scale.linear().range([plot.height, 0]);
    var yAxisScale = d3.scale.linear().range([0, plot.height]);

    this.render = function (data) {

        //for y-axis scale, iterate the all values and find the total for the biggest stack
        var maximums = {};
        data.forEach(function(metric) {
            metric.values.forEach(function(value) {
                if (!maximums.hasOwnProperty(value.x)) {
                    maximums[value.x] = 0;
                }
                maximums[value.x] += value.y;
            }, this);
        }, this);
        var yMax = d3.max(d3.values(maximums));
        yScale.domain([yMax, 0]);
        yAxisScale.domain([yMax, 0]);

        //for x-axis scale, merge all datasets and get the extent of the dates
        var merged = [];
        data.forEach(function(metric) {
            //first parse dates
            metric.values.forEach(function(value) {
                value.x = this.parseDate(value.x);
            }, this);
            //then merge into one array
            merged = merged.concat(metric.values);
        }, this);
        xScale.domain(d3.extent(merged, function(d) { return d.x; }));

        //iterate and plot each value, keeping track of the accumalated stack height
        var heightCounter = {};
        data.forEach(function(metric, i) {

            metric.values.forEach(function(value) {

                if (!heightCounter.hasOwnProperty(value.x)) {
                    heightCounter[value.x] = 0;
                }
                var heightShift = plot.height - yScale(value.y);
                bar.draw(value, metric.color, heightCounter[value.x], heightShift, xScale, yScale)
                if (heightCounter.hasOwnProperty(value.x)) {
                    heightCounter[value.x] -= yScale(value.y);
                }
            }, this);
            legend.push(metric);

        }, this);

        plot.axes.x.showTicks = false;
        plot.axes.y.showTicks = false;
        plot.axes.draw(xScale, yAxisScale);
    }

    this.load = function() {
        d3.json(this.url, function (data) {
            this.render(data);
        }.bind(this));
    };

    this.draw = function () {
        this.load();
    };
}

function Compare(container) {

    var width = 950;
    this.rightPadding = 100;
    var height = 300;
    this.bottomPadding = 0; //only meeded when displaying x-axis
    this.url;

    var plot = new Plot(container, width, height);

    this.render = function (data) {
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

    var plot = new Plot(container, this.width, this.height, this.radius);
    var legend = new Legend(container);

    this.arc = d3.svg.arc().outerRadius(this.radius).innerRadius(this.innerRadius);
    this.pie = d3.layout.pie().value(function(d) { return d.value; });

    this.legend = function(container, data) {
        data.forEach(function(metric, i) {
            legend.push(metric);
        }, this);

    }

    this.render = function (data) {

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
            this.render(data);
        }.bind(this));
    };

    this.draw = function () {
        this.load();
    };

}