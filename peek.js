/*! Peek.js (c) 2014 Mark Macdonald | http://mtmacdonald.github.io/peek/LICENSE */

function Legend(container) {

    this.showGroups = false;

    this.draw = function (data) {
        var legend = d3.select(container).append("div").attr("class", "legend");
        data.forEach(function(series, i) {
            var row = legend.append("div");

            row.append("span").attr("class", "key")
                .style('background-color', series.color)
                .style('border-color', series.color); //show color when printing

            var text = [], i = -1;
            text[++i] = series.label;
            if (this.showGroups === true) {
                text[++i] = ' - '+series.group;
            }
            if (series.units) {
                text[++i] = ' ('+series.units+')';
            };

            row.append("span").html(text.join('')).attr('class', 'key-text');
        }, this);
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
    this.offset = 0;

    this.draw = function (scale, orient, ticks) {
        var axis = d3.svg.axis()
                    .scale(scale)
                    .orient(orient).ticks(ticks);

        var rendered = plot.svg.append("g")
            .attr("class", "x axis");

        if (orient === 'bottom') {
            rendered.attr("transform", "translate("+this.offset+"," + plot.getPlotHeight() + ")")
        }

        rendered.call(axis);

        if (this.showTicks) {

            if (orient === 'bottom') {
                plot.svg.append("g")
                    .attr("class", "grid x-grid")
                    .attr("transform", "translate("+this.offset+"," + plot.getPlotHeight() + ")")
                    .call(axis
                        .tickSize(-plot.getPlotHeight(), 0, 0)
                        .tickFormat("")
                    );
            } else {
                plot.svg.append("g")         
                    .attr("class", "grid y-grid")
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

function Line (plot) {
    var plot = plot;
    var self = this;
    this.xScale;
    this.yScale;

    this.showLines = true;
    this.showPoints = false;
    this.showArea = false;
    this.interpolation = 'linear';
    this.point = new Point(plot);

    this.draw = function(series, xScale, yScale, stacked) {

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

        this.xScale = xScale;
        this.yScale = yScale;
        if (this.showLines === true) {
            plot.svg.append("path")
                .attr("class", "line")
                .style("stroke", series.color)
                .attr("d", line(series.values));
        }
        if (this.showArea === true) {
            plot.svg.append("path")
                    .attr("class", "area")
                    .style("fill", series.color)
                    .attr("d", area(series.values));
        }
        if (this.showPoints === true) {
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

    var self = this;
    var data;

    this.isStacked = false;
    this.isStackedByGroup = false;
    this.stackOffset = 'zero';

    this.init = function(dataArray) {
        data = dataArray;
        parseDates();
        fetchGroups();
        stack();
        fetchXExtent();
        fetchYExtent();
    }

    //todo - interpolate missing data points ... e.g. http://stackoverflow.com/questions/14713503

    this.getData = function() {
        return data;
    }

    //------------------------------------------------------------------------------------------------------------------

    this.countSamples = function () {
        
        return data[0].values.length; //todo: don't assume each series is the same length
    }

    //------------------------------------------------------------------------------------------------------------------

    var parseDates = function () {
        var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;
        data.forEach(function (series) {
            series.values.forEach(function (value) {
                value.x = parseDate(value.x);
            });
        });
    }

    var stack = function () {

        //layering code (only for stacked charts)
        //D3.layout.stack can't handle the metadata in the data array, so create a stripped-down data array
        //Note - because objects are copied by reference, modifying the objects in the stripped-down array also 
            //modifies the original data array

        var stack = d3.layout.stack().offset(self.stackOffset);

        if (self.isStackedByGroup === true) {
            var groups = getGroupsWithSeries();
            for (key in groups) {
                if (groups.hasOwnProperty(key)) {
                    stack(groups[key]);
                }
            }
        } else {
            var stripped_data = [];
            data.forEach(function (series) {
                stripped_data.push(series.values);
            });
            stack(stripped_data);
        }
    }

    //------------------------------------------------------------------------------------------------------------------

    var groups = []; 

    this.getGroups = function () {
        return groups;
    }

    this.countGroups = function () {
        return groups.length;
    }

    var fetchGroups = function () {
        data.forEach(function (series) {
            if (!(groups.indexOf(series.group) > -1)) {
                groups.push(series.group);
            }
        });
    }

    var getGroupsWithSeries = function () {
        var groupsWithSeries = {};
        groups.forEach(function (name) {
            groupsWithSeries[name] = [];
        });
        data.forEach(function (series) {
            groupsWithSeries[series.group].push(series.values);
        });
        return groupsWithSeries;
    }

    //------------------------------------------------------------------------------------------------------------------

    var xExtent = 0;
    var yExtent = 0;

    this.xExtent = function () {
        return xExtent;
    }

    this.yExtent = function () {
        return yExtent;
    }

    var fetchXExtent = function () {
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
        xExtent = [min, max];
    }

    var fetchYExtent = function () {
        //min is either the min value from all series, or 0, whichever is lower
        var min = d3.min(data.map(function (series) {
            return d3.min(series.values.map(function (point) {
                return point.y;
            }));
        }));
        if (min > 0) {
            min = 0;
        }

        //max depends on whether series are not stacked, stacked, or grouped and stacked
        if (self.isStacked) { //if stacked, get max of y0+y in the final data series
            var max = 0;
            var groups = getGroupsWithSeries();
            for (key in groups) {
                if (groups.hasOwnProperty(key)) {
                    var lastSeriesInGroup = groups[key][groups[key].length-1];
                    var localMax = d3.max(lastSeriesInGroup.map(function (point) {
                        return point.y0+point.y;
                    }));
                    if (localMax > max) {
                        max = localMax;
                    }
                }
            }
        } else { //if not stacked, get the max value from all series
            var max = d3.max(data.map(function (series) {
                return d3.max(series.values.map(function (point) {
                    return point.y;
                }));
            }));
        }

        yExtent = [min, max];
    }

}

function Cartesian(container, stacked) {

    var self = this;

    this.bar = false;
    this.isStacked = false;
    this.stackOffset = 'zero';

    this.plot = new Plot(container);
    this.line = new Line(this.plot);

    this.draw = function (data) {

        var series = new Series();

        if (this.isStacked) {
            series.isStacked = true;
            series.stackOffset = this.stackOffset;
            if (this.bar) {
                series.isStackedByGroup = true;
            }
        }

        series.init(data);

        this.plot.draw();


        if (this.bar) {
            var sampleCount = series.countSamples();
            var groupCount = series.countGroups();
            var outerGap = 20;
            var innerGap = 5;

            var sampleBoxWidth = this.plot.getSvgWidth() / sampleCount;
            var groupBoxWidth = (sampleBoxWidth - (2 * outerGap));
            var barWidth = (groupBoxWidth / groupCount) - innerGap + (innerGap / groupCount); //the final bar in each groupBox should not be proceeded by a gap

            this.plot.axes.x.offset = sampleBoxWidth/2; //translate the tick to the center of sampleBox
        }

        if (this.bar) {
            var xScale = d3.time.scale().range([0, this.plot.getSvgWidth()-sampleBoxWidth]);
        } else {
            var xScale = d3.time.scale().range([0, this.plot.getSvgWidth()]);
        }
        var yScale = d3.scale.linear().range([this.plot.getPlotHeight(), 0]);
        xScale.domain(series.xExtent());
        yScale.domain(series.yExtent());
        this.plot.axes.draw(xScale, yScale);

        if (this.bar) {
            var groups = series.getGroups();
            var max = series.yExtent()[1]; //refactor
            series.getData().forEach(function(series, i) {
                series.values.forEach(function(value) {
                    this.plot.svg.append("rect")
                        .attr("class", "rect-line rect-area")
                        .style("fill", series.color)
                        .style("stroke", series.color)
                        .attr("x", function(d) {
                            var x = xScale(value.x)+outerGap;
                            //------------------------------------------------------------------------------------------
                            //add offset for group
                            var offset = groups.indexOf(series.group);
                            x += (barWidth+innerGap)*offset;
                            return x;
                        })
                        .attr("width", barWidth)
                        //for y-axis, d3 has a top-left coordinate system
                        //todo - account for line size / line overlap?
                        .attr("y", function(d) { return self.plot.getPlotHeight()-yScale(max-value.y-value.y0); })
                        .attr("height", function(d) { return yScale(max-value.y); });
                }, this);
            }, this);
        } else {
            series.getData().forEach(function(series, i) {
                this.line.draw(series, xScale, yScale, this.isStacked);
            }, this);
        }
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