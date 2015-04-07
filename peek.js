/*! Peek.js (c) 2015 Mark Macdonald | http://mtmacdonald.github.io/peek/LICENSE */

function pkEscapeHtml(string) {
    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };
    return String(string).replace(/[&<>"'\/]/g, function (s) {
        return entityMap[s];
    });
}

function Legend(container) {

    this.showGroups = false;
    this.hasOutline = true;
    this.hasOpacity = false;
    this.opacity = 0.6;
    this.width = 300;

    var outlineWidth = 2;
    var keyWidth = 22;
    var keyHeight = 16;

    this.draw = function (data) {
        var legendContainer = d3.select(container).attr('class', 'pk-legendContainer');

        var legend = legendContainer.append("div").attr("class", "pk-legend");
        legend.style('width', this.width+'px');

        data.forEach(function(series, i) {
            var row = legend.append("div");

            var keyContainer = row.append("div").attr("class", "pk-keyContainer")
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
            text[++i] = pkEscapeHtml(series.label);
            if (this.showGroups === true) {
                text[++i] = ' - '+pkEscapeHtml(series.group);
            }
            if (series.units) {
                text[++i] = ' ('+pkEscapeHtml(series.units)+')';
            };

            row.append("span").html(text.join('')).attr('class', 'pk-keyText');
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
    this.margin = {top: 14, right: 25, bottom: 35, left: 45};
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

    this.getSvgHeight = function() {
        var titleHeight = this.showTitle === true ? labelHeight : 0;
        var xLabelHeight = this.showXLabel === true ? labelHeight : 0;
        var plotHeight = this.height - titleHeight - xLabelHeight - this.margin.top - this.margin.bottom;
        return plotHeight;
    }

    this.draw = function() {

        var chartContainer = d3.select(container).attr('class', 'pk-chart');

        var chart = chartContainer.insert("div").attr("class", "pk-plot pk-clear-after");
        //left container with yLabel
        var leftContainer = chart.insert("div").attr("class", "pk-leftContainer");
        if (this.showYLabel === true) {
            leftContainer.style('width', labelHeight+'px');
        }
        if (this.showYLabel === true) {
            leftContainer.insert("div").html(pkEscapeHtml(this.yLabel)).attr("class", "pk-yLabel")
                                .style('height', labelHeight+'px').style('line-height', labelHeight+'px')
                                .style('width', (this.getSvgHeight()+this.margin.top+this.margin.bottom)+'px'); /*must be same as height of svg area+margins*/
        }
        //main container with xLabel and plot area
        var mainContainer = chart.insert("div").attr("class", "pk-mainContainer");
        if (this.showTitle === true) {
            mainContainer.insert("div").html(pkEscapeHtml(this.title)).attr("class", "pk-title")
                                .style('height', labelHeight+'px').style('line-height', labelHeight+'px');
        }
        var svgContainer = mainContainer.insert("div").attr("class", "pk-svgContainer");
        if (this.showXLabel === true) {
            mainContainer.insert("div").html(pkEscapeHtml(this.xLabel)).attr("class", "pk-xLabel")
                                .style('height', labelHeight+'px').style('line-height', labelHeight+'px');
        }

        this.svg = svgContainer.insert("svg")
                    .attr('width', this.getSvgWidth() + this.margin.left + this.margin.right)
                    .attr('height', this.getSvgHeight() + this.margin.top + this.margin.bottom);

        svgContainer.on("mousemove", function() {
            var tooltip = d3.select(".pk-tooltip");
            var coord = d3.mouse(this);
            tooltip.style("left", (d3.event.pageX) + "px" );
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
    this.tickCount = 5;
    this.offset = 0;

    this.draw = function (scale, orient, ticks) {

        //fake x-axis: (line at bottom of chart hides the 'gaps' from the bar chart x-axis being shorter)
        if (orient === 'bottom') {
            plot.svg.append('line')
                .attr('x1', 0)
                .attr('y1', plot.getSvgHeight())
                .attr('x2', plot.getSvgWidth())
                .attr('y2', plot.getSvgHeight())
                .attr('class', 'pk-fakeAxis');
        }

        //real axes:
        var axis = d3.svg.axis()
                    .scale(scale)
                    .orient(orient).ticks(ticks);

        var rendered = plot.svg.append("g")
            .attr("class", "pk-axis");

        if (orient === 'bottom') {
            rendered.attr('transform', 'translate('+this.offset+',' + plot.getSvgHeight() + ')');
        }

        rendered.call(axis);
    }

    this.drawGrid = function (scale, orient) {
        if (this.showTicks) {

            var axis = d3.svg.axis()
                        .scale(scale)
                        .orient(orient).ticks(this.tickCount);

            if (orient === 'bottom') {
                plot.svg.append('g')
                    .attr('class', 'pk-grid pk-xGrid')
                    .attr('transform', "translate("+this.offset+"," + plot.getSvgHeight() + ")")
                    .call(axis
                        .tickSize(-plot.getSvgHeight(), 0, 0)
                        .tickFormat("")
                    );
            } else {
                plot.svg.append('g')         
                    .attr('class', 'pk-grid pk-yGrid')
                    .call(axis
                        .tickSize(-plot.getSvgWidth(), 0, 0)
                        .tickFormat('')
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

function Lines (plot) {
    var data;
    var plot = plot;
    var self = this;

    this.visible = true;
    this.interpolation = 'linear';
    this.lineWidth = 2;

    this.init = function (dataObject) {
        if (this.visible === true) {
            data = dataObject;
        }
    }

    this.draw = function(xScale, yScale) {
        if (this.visible === true) {

            var line = d3.svg.line().interpolate(this.interpolation).x(function(d) { return xScale(d.x); });
            if (data.isStacked === true) {
                line.y(function(d) { return yScale(d.y0 + d.y); });
            } else {
                line.y(function(d) { return yScale(d.y); });
            }

            data.getData().forEach(function (series) {     
                var element = plot.svg.append("path")
                    .attr("class", "pk-line")
                    .style("stroke", series.color)
                    .style("stroke-width", this.lineWidth)
                    .attr("d", line(series.values));
            }, this);
        }
    }
}

function Areas (plot) {
    var data;
    var plot = plot;
    var self = this;

    this.visible = false;
    this.interpolation = 'linear';
    this.hasOpacity = false;
    this.opacity = 0.6;

    this.init = function (dataObject) {
        if (this.visible === true) {
            data = dataObject;
        }
    }

    this.draw = function(xScale, yScale) {
        if (this.visible === true) {

            var area = d3.svg.area().interpolate(this.interpolation).x(function(d) { return xScale(d.x); });
            if (data.isStacked === true) {
                area.y0(function(d) { return yScale(d.y0); })
                area.y1(function(d) { return yScale(d.y0 + d.y); });
            } else {
                area.y0(plot.getSvgHeight())
                area.y1(function(d) { return yScale(d.y); });
            }

            data.getData().forEach(function (series) {     
                var element = plot.svg.append("path")
                        .attr("class", "pk-area")
                        .style("fill", series.color)
                        .attr("d", area(series.values));
                if (this.hasOpacity === true) {
                    element.style('fill-opacity', this.opacity);
                }
            }, this);
        }
    }
}

function Points (plot) {
    var data;
    var self = this;
    var plot = plot;

    this.visible = false;
    this.size = 4;
    this.fill = false;

    this.init = function (dataObject) {
        if (this.visible === true) {
            data = dataObject;
        }
    }

    this.draw = function(xScale, yScale) {
        if (this.visible === true) {
            data.getData().forEach(function (series) {     
                //------------------------------------------------------------------------------------------------------
                d3.select(plot.container)
                    .append("div")
                    .attr("class", "pk-tooltip").html("<p>Tooltip</p>");

                var point = plot.svg.selectAll(".chart")
                    .data(series.values)
                    .enter()
                    .append("circle")
                      .attr("transform", function(d) {
                        if (data.isStacked === true) {
                            return "translate(" + xScale(d.x) + ", " + yScale(d.y0+d.y) + ")";
                        } else {
                            return "translate(" + xScale(d.x) + ", " + yScale(d.y) + ")";
                        }
                    })
                    .attr("r", function(d){ return self.size; }) 
                    .style("stroke", series.color)
                    .on("mouseover", this.mouseover_circle)
                    .on("mouseout", this.mouseout_circle);

                if (this.fill) {
                    point.attr("fill", series.color);
                } else {
                    point.attr("fill", "white");
                }
                //------------------------------------------------------------------------------------------------------
            }, this);
        }
    }

    this.mouseover_circle = function(data,i) {     
        var formatDate = d3.time.format("%A %d. %B %Y");
        var circle = d3.select(this);
        circle.transition().duration(500).attr("r", 10);

        d3.select(".pk-tooltip")
        .style("display", "block")
        .style('opacity', 0)
        .transition().delay(200).duration(500).style('opacity', 1);  
          
        d3.select(".pk-tooltip p")
            .html("<strong>Date:</strong> " 
                + formatDate(new Date(data.x)) 
                + "<br/>" 
                + "<strong>Value:</strong> " 
                + data.y
                );
    }

    this.mouseout_circle = function() {
        var circle = d3.select(this);
        circle.transition().duration(500).attr("r", self.size);
        d3.select(".pk-tooltip").style("display", "none"); 
    }

}

function Bars(plot) {

    var plot = plot;
    var data;

    this.visible = false;
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
        if (this.visible === true) {
            data = dataObject;
            sampleCount =data.countSamples();
            groupCount = data.countGroups();

            sampleBoxWidth = plot.getSvgWidth() / sampleCount;
            groupBoxWidth = (sampleBoxWidth - (2 * outerGap));
            barWidth = (groupBoxWidth / groupCount) - innerGap + (innerGap / groupCount); //the final bar in each groupBox should not be proceeded by a gap

            plot.axes.x.offset = sampleBoxWidth/2; //translate the tick to the center of sampleBox
        }
    }

    this.draw = function(xScale, yScale) {
        if (this.visible === true) {
            var groups = data.getGroups();
            var max = data.yExtent()[1]; //refactor
            data.getData().forEach(function(series, i) {
                series.values.forEach(function(value) {
                    var bar = plot.svg.append("rect")
                        .attr("class", "pk-rect-line pk-rect-area")
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
                        .attr("y", function(d) { return plot.getSvgHeight()-yScale(max-value.y-value.y0); })
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
        if (this.isStacked) {
            stack();
        }
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

function Cartesian(container) {

    var self = this;

    this.data = new Data();
    this.plot = new Plot(container);
    this.lines = new Lines(this.plot);
    this.points = new Points(this.plot);
    this.areas = new Areas(this.plot);
    this.bars = new Bars(this.plot);

    this.draw = function (dataArray) {

        if (this.bars.visible === true) {
            this.data.isStackedByGroup = true; //bar charts are always stacked by group
        }

        this.data.init(dataArray);

        this.plot.draw();

        this.bars.init(this.data);
        this.lines.init(this.data);
        this.points.init(this.data);
        this.areas.init(this.data);

        if (this.bars.visible === true) {
            var xScale = d3.time.scale().range([0, this.plot.getSvgWidth()-this.bars.getSampleBoxWidth()]);
        } else {
            var xScale = d3.time.scale().range([0, this.plot.getSvgWidth()]);
        }
        var yScale = d3.scale.linear().range([this.plot.getSvgHeight(), 0]);
        xScale.domain(this.data.xExtent());
        yScale.domain(this.data.yExtent());

        this.plot.axes.drawGrid(xScale, yScale);
        this.bars.draw(xScale, yScale);
        this.lines.draw(xScale, yScale);
        this.areas.draw(xScale, yScale);
        this.plot.axes.draw(xScale, yScale);
        this.points.draw(xScale, yScale);
    }
}

function HorizontalBar(container) {

    var self = this;

    this.barHeight = 60;
    this.barSpacing = 10;
    this.hasOutline = true;
    this.outlineWidth = 2;
    this.hasOpacity = false;
    this.opacity = 0.6;

    this.plot = new Plot(container);
    this.plot.showTitle = false;
    this.plot.showXLabel = false;
    this.plot.showYLabel = false;
    this.plot.margin.top = 0;
    this.plot.margin.right = 0;
    this.plot.margin.bottom = 0;
    this.plot.margin.left = 0;

    var getMaxLabelWidth = function (data) {
        var longestLabel = 0;
        var longestRowIndex = 0;
        data.forEach(function(row, index) {
            if (longestLabel < row.label.length) {
                longestLabel = row.label.length;
                longestRowIndex = index;
            }
        });
        var fakeLabel = self.plot.svg.append("text")
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
            this.plot.height = data.length*(this.barHeight+this.barSpacing);
            this.plot.draw();

            //dynamically find the space needed for labels, from the maximum label width
            var maxLabelWidth = getMaxLabelWidth(data);
            var rightPadding = maxLabelWidth+10;

            var max = d3.max(data, function(d) { return d.value;} );

            var dx = (this.plot.width - rightPadding) / max;
            var dy = (this.plot.height / data.length) - (this.barSpacing);
    
            //bars
            var bars = this.plot.svg.selectAll(".bar")
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
            var text = this.plot.svg.selectAll("text")
                .data(data)
                .enter()
                .append("text")
                    .attr('class', 'pk-label')
                    .attr("x", function(d, i) {return (dx*d.value)+5})
                    .attr("y", function(d, i) {return dy*i + self.barSpacing*i + (dy/2) + 4 + self.outlineWidth;}) //4 accounts for text height
                    .html( function(d) {return pkEscapeHtml(d.label);});

            //text values
            var text = this.plot.svg.selectAll(".compare-chart-values")
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