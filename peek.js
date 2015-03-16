/*! Peek.js (c) 2014 Mark Macdonald | http://mtmacdonald.github.io/peek/LICENSE */

function Legend(container) {

    this.showGroups = false;
    this.hasOutline = true;
    this.hasOpacity = false;
    this.opacity = 0.6;

    var outlineWidth = 2;
    var keyWidth = 22;
    var keyHeight = 16;

    this.draw = function (data) {
        var legend = d3.select(container).append("div").attr("class", "legend");
        data.forEach(function(series, i) {
            var row = legend.append("div");

            var keyContainer = row.append("div").attr("class", "keyContainer")
                                .insert("svg").attr('width', keyWidth).attr('height', keyHeight);

            var key = keyContainer.append("rect")
                .attr("x", 0+outlineWidth/2)
                .attr("y", 0+outlineWidth/2).attr("rx", 3).attr("ry", 3)
                .attr("width", (keyWidth - outlineWidth))
                .attr("height", (keyHeight - outlineWidth))
                .style("fill", series.color);
            if (this.hasOutline === true) {
                key.attr("stroke", series.color );
                key.style("stroke-width", outlineWidth) 
            }
            if (this.hasOpacity === true) {
                key.style('fill-opacity', this.opacity);
            }

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
            var tooltip = d3.select(".tooltip");
            var coord = d3.mouse(this);
            tooltip.style("left", (d3.event.pageX) + 15 + "px" );
            tooltip.style("top", (d3.event.pageY) + "px");     
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
    }

    this.drawGrid = function (scale, orient, ticks) {
        if (this.showTicks) {

            var axis = d3.svg.axis()
                        .scale(scale)
                        .orient(orient).ticks(ticks);

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

    this.drawGrid = function(xScale, yScale) {
        this.x.drawGrid(xScale, 'bottom', 5);
        this.y.drawGrid(yScale, 'left', 5);
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
    this.lineWidth = 2;
    this.hasAreaOpacity = false;
    this.opacity = 0.6;
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
            var line = plot.svg.append("path")
                .attr("class", "line")
                .style("stroke", series.color)
                .style("stroke-width", this.lineWidth)
                .attr("d", line(series.values));
        }
        if (this.showArea === true) {
            var area = plot.svg.append("path")
                    .attr("class", "area")
                    .style("fill", series.color)
                    .attr("d", area(series.values));
            if (this.hasAreaOpacity === true) {
                area.style('fill-opacity', this.opacity);
            }
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
            .attr("class", "tooltip").html("<p>Tooltip</p>");

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

        d3.select(".tooltip")
        .style("display", "block")
        .style('opacity', 0)
        .transition().delay(200).duration(500).style('opacity', 1);  
          
        d3.select(".tooltip p")
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
        d3.select(".tooltip").style("display", "none"); 
    }

}

//----------------------------------------------------------------------------------------------------------------------

function Data() {

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

function Bar(plot) {

    var plot = plot;
    var data;

    this.hasOutline = true;
    this.outlineWidth = 2;
    this.hasOpacity = false;
    this.opacity = 0.6;

    var sampleCount;
    var groupCount;
    var outerGap = 20;
    var innerGap = 5;

    var sampleBoxWidth;
    var groupBoxWidth;
    var barWidth;

    this.getSampleBoxWidth = function () {
        return sampleBoxWidth;
    }

    this.init = function (dataObject) {
        data = dataObject;
        sampleCount =data.countSamples();
        groupCount = data.countGroups();

        sampleBoxWidth = plot.getSvgWidth() / sampleCount;
        groupBoxWidth = (sampleBoxWidth - (2 * outerGap));
        barWidth = (groupBoxWidth / groupCount) - innerGap + (innerGap / groupCount); //the final bar in each groupBox should not be proceeded by a gap

        plot.axes.x.offset = sampleBoxWidth/2; //translate the tick to the center of sampleBox
    }

    this.draw = function(xScale, yScale) {
        var groups = data.getGroups();
        var max = data.yExtent()[1]; //refactor
        data.getData().forEach(function(series, i) {
            series.values.forEach(function(value) {
                var bar = plot.svg.append("rect")
                    .attr("class", "rect-line rect-area")
                    .style("fill", series.color)
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
                    .attr("y", function(d) { return plot.getPlotHeight()-yScale(max-value.y-value.y0); })
                    .attr("height", function(d) { return yScale(max-value.y); });
                if (this.hasOutline === true) {
                    bar.style("stroke", series.color);
                    bar.style("stroke-width", this.outlineWidth);
                }
                if (this.hasOpacity === true) {
                    bar.style('fill-opacity', this.opacity);
                }
            }, this);
        }, this);
    }
}

function Cartesian(container) {

    var self = this;

    this.type = 'line';

    this.data = new Data();
    this.plot = new Plot(container);
    this.line = new Line(this.plot);
    this.bar = new Bar(this.plot);

    this.draw = function (dataArray) {

        if (this.type === 'bar') {
            this.data.isStackedByGroup = true; //bar charts are always stacked by group
        }

        this.data.init(dataArray);

        this.plot.draw();
        

        if (this.type === 'bar') {
            this.bar.init(this.data);
        }

        if (this.type === 'bar') {
            var xScale = d3.time.scale().range([0, this.plot.getSvgWidth()-this.bar.getSampleBoxWidth()]);
        } else {
            var xScale = d3.time.scale().range([0, this.plot.getSvgWidth()]);
        }
        var yScale = d3.scale.linear().range([this.plot.getPlotHeight(), 0]);
        xScale.domain(this.data.xExtent());
        yScale.domain(this.data.yExtent());

        this.plot.axes.drawGrid(xScale, yScale);

        if (this.type === 'bar') {
            this.bar.draw(xScale, yScale);
        } else {
            this.data.getData().forEach(function(series, i) {
                this.line.draw(series, xScale, yScale, this.data.isStacked);
            }, this);
        }

        this.plot.axes.draw(xScale, yScale);
    }
}

function Compare(container) {

    this.barHeight = 60;
    this.barSpacing = 10;
    this.hasOutline = true;
    this.outlineWidth = 2;
    this.hasOpacity = false;
    this.opacity = 0.6;

    var plot = new Plot(container);
    plot.showTitle = false;
    plot.showXLabel = false;
    plot.showYLabel = false;
    plot.margin.top = 0;
    plot.margin.right = 0;
    plot.margin.bottom = 0;
    plot.margin.left = 0;

    var getMaxLabelWidth = function (data) {
        var longestLabel = 0;
        var longestRowIndex = 0;
        data.forEach(function(row, index) {
            if (longestLabel < row.label.length) {
                longestLabel = row.label.length;
                longestRowIndex = index;
            }
        });
        var fakeLabel = plot.svg.append("text")
            .attr("x", 0)
            .attr("y", 0)
            .style("visibility", "hidden")
            .text(data[longestRowIndex].label);
        var result = fakeLabel.node().getComputedTextLength();
        fakeLabel.remove();
        return result;
    }

    this.draw = function (data) {
            var self = this;

            //dynamically set the plot height based on the length of the input data
            plot.height = data.length*(this.barHeight+this.barSpacing);
            plot.draw();

            //dynamically find the space needed for labels, from the maximum label width
            var maxLabelWidth = getMaxLabelWidth(data);
            var rightPadding = maxLabelWidth+10;

            var max = d3.max(data, function(d) { return d.value;} );

            var dx = (plot.width - rightPadding) / max;
            var dy = (plot.height / data.length) - (this.barSpacing);
    
            //bars
            var bars = plot.svg.selectAll(".bar")
                .data(data)
                .enter()
                .append("rect")
                .attr("x", function(d, i) {return self.outlineWidth-1;})
                .attr("y", function(d, i) {return dy*i + self.barSpacing*i +(self.outlineWidth-1);})
                .attr("width", function(d, i) {return dx*d.value})
                .attr("height", dy)
                .attr("fill", function(d, i) {return d.color} );
                if (this.hasOutline === true) {
                    bars.style("stroke", function(d, i) {return d.color});
                    bars.style("stroke-width", this.outlineWidth);
                }
                if (this.hasOpacity === true) {
                    bars.style('fill-opacity', this.opacity);
                }
            //labels
            var text = plot.svg.selectAll("text")
                .data(data)
                .enter()
                .append("text")
                    .attr('class', 'label')
                    .attr("x", function(d, i) {return (dx*d.value)+5})
                    .attr("y", function(d, i) {return dy*i + self.barSpacing*i + (dy/2) + 4 + self.outlineWidth;}) //4 accounts for text height
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
                    .attr("y", function(d, i) {return dy*i + self.barSpacing*i + (dy/2) + 4 + self.outlineWidth;}) //4 accounts for text height
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
}

function Radial(container) {

    this.radius = 150;
    this.innerRadius = 60;
    this.hasOutline = false;
    this.outlineWidth = 2;
    this.hasOpacity = false;
    this.opacity = 0.6;

    var plot = new Plot(container);
    plot.isRadial = true;
    plot.showTitle = false;
    plot.showXLabel = false;
    plot.showYLabel = false;
    plot.width = this.radius*2;
    plot.height = this.radius*2;
    plot.radius = this.radius;

    this.draw = function (data) {

        var outerRadius = this.radius;
        if (this.hasOutline === true) {
            outerRadius = this.radius - this.outlineWidth;
        }
        this.arc = d3.svg.arc().outerRadius(outerRadius).innerRadius(this.innerRadius);
        this.pie = d3.layout.pie().value(function(d) { return d.value; });

        plot.draw();
        var self = this;

        plot.svg.data([data]);

        var arcs = plot.svg.selectAll("g.slice")
            .data(self.pie)
            .enter()
                .append("svg:g")
                    .attr("class", "slice");

        var segments = arcs.append("svg:path");
        if (this.hasOutline === true) {
            segments.attr("stroke", function(d, i) { return data[i].color; } );
            segments.style("stroke-width", this.outlineWidth);
        }
        segments.attr("fill", function(d, i) { return data[i].color; } );
        if (this.hasOpacity === true) {
            segments.style('fill-opacity', this.opacity);
        }
        segments.attr("d", self.arc);

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
}