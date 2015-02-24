/*! Peek.js (c) 2014 Mark Macdonald | http://mtmacdonald.github.io/peek/LICENSE */

function Legend (container) {

    var legend = d3.select(container);

    legend.append("div").attr("class", "legend");

    this.push = function(metric) {
        var row = legend.append("div");

        row.append("span").attr("class", "key")
            .style('border-style', 'solid')
            .style('border-width', '5px')
            .style('border-color', metric.color);

        var text = [], i = -1;
        text[++i] = metric.label;
        if (metric.units) {
            text[++i] = ' ('+metric.units+')';
        };

        row.append("span").html(text.join('')).attr('class', 'key-text');
    }
}



//----------------------------------------------------------------------------------------------------------------------

function Pie(container) {

    this.width = 300;
    this.height = 300;
    this.radius = 150;
    this.innerRadius = 60;

    var legend = new Legend(container);

    this.arc = d3.svg.arc().outerRadius(this.radius).innerRadius(this.innerRadius);
    this.pie = d3.layout.pie().value(function(d) { return d.value; });

        this.plot = d3.select(container)
                        .append("div")
                        .attr("class", "plotbox");

        this.svg = this.plot
            .append("svg")
                .attr("width", this.width)
                .attr("height", this.height)
            .append("g")
                .attr("transform", "translate(" + this.radius + "," + this.radius + ")");

    this.legend = function(container, data) {
        data.forEach(function(metric, i) {
            legend.push(metric);
        }, this);
    }

    this.render = function (data) {

        var self = this;

        this.svg.data([data]);

        var arcs = this.svg.selectAll("g.slice")
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

function Plot(container, width, height) {

    var width = typeof width !== 'undefined' ? width : 600; //default
    var height = typeof height !== 'undefined' ? height : 400; //default

    this.margin = {top: 0, right: 20, bottom: 50, left: 50};
    this.width = width - this.margin.left - this.margin.right;
    this.height = height - this.margin.top - this.margin.bottom;

    this.canvas = d3.select(container)
                    .append("div")
                    .attr("class", "plot");

    this.svg = this.canvas.append("svg")
        .attr('width', this.width + this.margin.left + this.margin.right)
        .attr('height', this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
}

function Trend(container, width, height) {

    this.url;

    this.container = container;

    this.controls;

    var plot = new Plot(container, width, height);
    var legend = new Legend(container);

    this.interpolate = 'cardinal';

    this.showTooltip = false;

    this.parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

    this.x = d3.time.scale().range([0, plot.width]);
    this.y = d3.scale.linear().range([plot.height, 0]);

    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom").ticks(5);

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left").ticks(5);

    this.line = d3.svg.line()
                .interpolate(this.interpolate) 
                .x(function(d) { return this.x(d.date); })
                .y(function(d) { return this.y(d.value); });

    this.render_line = function(metric, i) {
        this.line.interpolate(this.interpolate);
        plot.svg.append("path")
            .attr("class", "line")
            .style("stroke", metric.color)
            .attr("d", this.line(metric.values));
    }

    this.render_circles = function(metric, i) {
        var that = this;

        d3.select(this.container)
            .append("div")
            .attr("class", "infobox").html("<p>Tooltip</p>");

        plot.svg.selectAll(".plot")
            .data(metric.values)
            .enter()
            .append("circle")
              .attr("transform", function(d) { 
                return "translate(" + that.x(d.date) + ", " + that.y(d.value) + ")"; 
            })
              .attr("r", function(d){ return 4; }) 
              .attr("fill", "white")
              .style("stroke", metric.color)
              .on("mouseover", this.mouseover_circle)
              .on("mouseout", this.mouseout_circle);

        plot.canvas.on("mousemove", function(){
            var infobox = d3.select(".infobox");
            var coord = d3.mouse(this);
            infobox.style("left", (d3.event.pageX) + 15 + "px" );
            infobox.style("top", (d3.event.pageY) + "px");
        });
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
                + formatDate(new Date(data.date)) 
                + "<br/>" 
                + "<strong>Value:</strong> " 
                + data.value
                );
    }

    this.mouseout_circle = function() {
        var circle = d3.select(this);
        circle.transition().duration(500).attr("r", 4);
        d3.select(".infobox").style("display", "none"); 
    }

    this.render_x_axis = function() {
        plot.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + plot.height + ")")
            .call(this.xAxis);
    }

    this.render_y_axis = function() {
        plot.svg.append("g")
            .attr("class", "y axis")
            .call(this.yAxis);
    }

    this.render_x_ticks = function() {
        plot.svg.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(0," + plot.height + ")")
            .call(this.xAxis
                .tickSize(-plot.height, 0, 0)
                .tickFormat("")
            );
    }

    this.render_y_ticks = function () {
        plot.svg.append("g")         
            .attr("class", "grid")
            .call(this.yAxis
                .tickSize(-plot.width, 0, 0)
                .tickFormat("")
            );
    }

    this.render = function (data) {

        //for x-axis scale, merge all datasets and get the extent of the dates
        var merged = [];
        data.forEach(function(metric) {
            //first parse dates
            metric.values.forEach(function(value) {
                value.date = this.parseDate(value.date);
            }, this);
            //then merge into one array
            merged = merged.concat(metric.values);
        }, this);
        this.x.domain(d3.extent(merged, function(d) { return d.date; }));

        //for y-axis scale, get the minimum and maximum for each metric
        var max = 0;
        data.forEach(function(metric, i) {
            var localMax = d3.max(metric.values, function(d) { return d.value; });
            if (localMax > max) {
                max = localMax;
            }
        }, this);
        this.y.domain([0, max]);

        this.render_x_axis();
        this.render_y_axis();

        this.render_x_ticks();
        this.render_y_ticks();

        //plot values
        data.forEach(function(metric, i) {
            this.render_line(metric, i);
            if(this.showTooltip) {
                this.render_circles(metric, i);                
            }
            legend.push(metric);
        }, this);
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

    this.width = 950;
    this.rightPadding = 100;
    this.height = 300;
    this.bottomPadding = 0; //only meeded when displaying x-axis
    this.url;

    this.plot = d3.select(container)
                    .append("div")
                    .attr("class", "plotbox");

    this.svg = this.plot
                .append("svg")
                    .attr("width", this.width)
                    .attr("height", this.height);

    this.render = function (data) {
            var self = this;

            this.svg.attr("width", this.width).attr("height", this.height); //dynamically update width and height

            var max = d3.max(data, function(d) { return d.value;} );

            var spacing = 10;
            var dx = (this.width - this.rightPadding) / max;
            var dy = ((this.height-this.bottomPadding) / data.length) - spacing;
    
            //bars
            var bars = this.svg.selectAll(".bar")
                .data(data)
                .enter()
                .append("rect")
                .attr("x", function(d, i) {return 0;})
                .attr("y", function(d, i) {return dy*i + spacing*i;})
                .attr("width", function(d, i) {return dx*d.value})
                .attr("height", dy)
                .attr("fill", function(d, i) {return d.colour} );

            //labels
            var text = this.svg.selectAll("text")
                .data(data)
                .enter()
                .append("text")
                    .attr('class', 'label')
                    .attr("x", function(d, i) {return (dx*d.value)+5})
                    .attr("y", function(d, i) {return dy*i + spacing*i + (dy/2) + 4;}) //4 accounts for text height
                    .html( function(d) {return d.label;});

            //text values
            var text = this.svg.selectAll(".compare-chart-values")
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

function Stacked(container, width, height) {

    this.url;

    this.container = container;

    this.controls;

    var plot = new Plot(container, width, height);
    var legend = new Legend(container);

    this.color = d3.scale.category20c();

    this.parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

    this.x = d3.time.scale().range([0, plot.width]);
    this.y = d3.scale.linear().range([plot.height, 0]);
    this.yAxisScale = d3.scale.linear().range([0, plot.height]);

    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom").ticks(5);

    this.yAxis = d3.svg.axis()
        .scale(this.yAxisScale)
        .orient("left").ticks(5);

    this.render_x_axis = function() {
        plot.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + plot.height + ")")
            .call(this.xAxis);
    }

    this.render_y_axis = function() {
        plot.svg.append("g")
            .attr("class", "y axis")
            .call(this.yAxis);
    }

    this.render = function (data) {

        //for y-axis scale, iterate the all values and find the total for the biggest stack
        var maximums = {};
        data.forEach(function(metric) {
            metric.values.forEach(function(value) {
                if (!maximums.hasOwnProperty(value.date)) {
                    maximums[value.date] = 0;
                }
                maximums[value.date] += value.value;
            }, this);
        }, this);
        var yMax = d3.max(d3.values(maximums));
        this.y.domain([yMax, 0]);
        this.yAxisScale.domain([yMax, 0]);

        //for x-axis scale, merge all datasets and get the extent of the dates
        var merged = [];
        data.forEach(function(metric) {
            //first parse dates
            metric.values.forEach(function(value) {
                value.date = this.parseDate(value.date);
            }, this);
            //then merge into one array
            merged = merged.concat(metric.values);
        }, this);
        this.x.domain(d3.extent(merged, function(d) { return d.date; }));

        //iterate and plot each value, keeping track of the accumalated stack height
        var heightCounter = {};
        data.forEach(function(metric, i) {

            metric.values.forEach(function(value) {

                if (!heightCounter.hasOwnProperty(value.date)) {
                    heightCounter[value.date] = 0;
                }

                var heightShift = plot.height - this.y(value.value)
                plot.svg.append("rect")
                    .attr("x", this.x(value.date) - 2)
                    .attr("width", 5)
                    .attr("y", heightCounter[value.date])
                    .attr("height", this.y(value.value))
                    .attr("fill", metric.color)
                    .attr("transform", "translate(" + 0 + "," + heightShift + ")")

                if (heightCounter.hasOwnProperty(value.date)) {
                    heightCounter[value.date] -= this.y(value.value);
                }
            }, this);
            legend.push(metric);

        }, this);

        this.render_x_axis();
        this.render_y_axis();
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
