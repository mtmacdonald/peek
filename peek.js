
//For D3 help: https://leanpub.com/D3-Tips-and-Tricks/read#leanpub-auto-starting-with-a-basic-graph

function Pie() {

    this.width = 300;
    this.height = 300;
    this.radius = 150;
    this.innerRadius = 60;
    this.color = d3.scale.category20c();

    this.arc = d3.svg.arc().outerRadius(this.radius).innerRadius(this.innerRadius);
    this.pie = d3.layout.pie().value(function(d) { return d.value; });

    this.legend = function(container, data) {

        data.forEach(function(metric, i) {

            var row = d3.select(container).append("div");

            row.append("span").attr("class", "key").style('background-color', this.color(i));

            row.append("span").text(metric.label).attr('class', 'key-text');
        }, this);

    }

    this.render = function (container, data) {

        var self = this;

        this.plot = d3.select(container)
                        .append("div")
                        .attr("class", "plotbox");

        this.svg = this.plot
            .append("svg")
                .attr("width", this.width)
                .attr("height", this.height)
            .append("g")
                .attr("transform", "translate(" + this.radius + "," + this.radius + ")")

        this.svg.data([data]);

        var arcs = this.svg.selectAll("g.slice")
            .data(self.pie)
            .enter()
                .append("svg:g")
                    .attr("class", "slice");

        arcs.append("svg:path")
                .attr("fill", function(d, i) { return self.color(i); } ) 
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

function Trend(container) {

    this.url;

    this.container = container;

    this.controls;

    this.legend;

    this.plot;
    this.svg;

    this.margin = {top: 0, right: 20, bottom: 50, left: 50};
    this.width = 600 - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom;


    this.parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

    this.x = d3.time.scale().range([0, this.width]);
    this.y = d3.scale.linear().range([this.height, 0]);

    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom").ticks(5);

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left").ticks(5);

    this.line = d3.svg.line()
                //.interpolate('cardinal') 
                .x(function(d) { return this.x(d.date); })
                .y(function(d) { return this.y(d.value); });


    this.layout = function () {

        this.plot = d3.select(this.container)
                        .append("div")
                        .attr("id", "plot");

        this.legend = d3.select(this.container)
                        .append("div")
                        .attr("id", "legend")

        this.controls = d3.select(this.container)
                        .append("div")
                        .attr("id", "controls");

        this.svg = this.plot
            .append("svg")
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    };

    this.render_line = function(metric) {
        this.svg.append("path")
            .attr("class", "line")
            .style("stroke", metric.color)
            .attr("d", this.line(metric.values));
    }

    this.render_x_axis = function() {
        this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(this.xAxis);
    }

    this.render_y_axis = function() {
        this.svg.append("g")
            .attr("class", "y axis")
            .call(this.yAxis);
    }

    this.render_x_ticks = function() {
        this.svg.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(0," + this.height + ")")
            .call(this.xAxis
                .tickSize(-this.height, 0, 0)
                .tickFormat("")
            );
    }

    this.render_y_ticks = function () {
        this.svg.append("g")         
            .attr("class", "grid")
            .call(this.yAxis
                .tickSize(-this.width, 0, 0)
                .tickFormat("")
            );
    }

    this.append_to_legend = function(metric) {
        var row = this.legend
            .append("div");

        row.append("span").attr("class", "key").style('background-color', metric.color);

        row.append("span").text(metric.metric+' ('+metric.units+")").attr('class', 'key-text');
    }

    this.render = function (data) {

        this.layout();

        data.forEach(function(metric) {

            //convert the date format for each metric
            metric.values.forEach(function(value) {
                value.date = this.parseDate(value.date);
            }, this);

            //scale for each metric
            this.x.domain(d3.extent(metric.values, function(d) { return d.date; }));
            this.y.domain([0, d3.max(metric.values, function(d) { return d.value; })]);

            this.render_line(metric);

            this.append_to_legend(metric);

        }, this);

        this.render_x_axis();
        this.render_y_axis();

        this.render_x_ticks();
        this.render_y_ticks();
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
    this.color = d3.scale.category20c();

    //this.x = d3.scale.linear().range([this.width-this.rightPadding, 0]);

    this.render = function (data) {
            var self = this;

            var max = d3.max(data, function(d) { return d.value;} );

            var spacing = 10;
            var dx = (this.width - this.rightPadding) / max;
            var dy = ((this.height-this.bottomPadding) / data.length) - spacing;

            this.plot = d3.select(container)
                            .append("div")
                            .attr("class", "plotbox");

            this.svg = this.plot
                .append("svg")
                    .attr("width", this.width)
                    .attr("height", this.height)
    
            //bars
            var bars = this.svg.selectAll(".bar")
                .data(data)
                .enter()
                .append("rect")
                .attr("x", function(d, i) {return 0;})
                .attr("y", function(d, i) {return dy*i + spacing*i;})
                .attr("width", function(d, i) {return dx*d.value})
                .attr("height", dy)
                .attr("fill", this.color(1) );

            //labels
            var text = this.svg.selectAll("text")
                .data(data)
                .enter()
                .append("text")
                    .attr('class', 'label')
                    .attr("x", function(d, i) {return (dx*d.value)+5})
                    .attr("y", function(d, i) {return dy*i + spacing*i + (dy/2) + 4;}) //4 accounts for text height
                    .text( function(d) {return d.label;});

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

function Stacked(container) {

    this.url;

    this.container = container;

    this.controls;

    this.legend;

    this.plot;
    this.svg;

    this.margin = {top: 0, right: 20, bottom: 50, left: 50};
    this.width = 600 - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom;

    this.color = d3.scale.category20c();

    this.heightCounter = {};

    this.parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

    this.x = d3.time.scale().range([0, this.width]);
    this.y = d3.scale.linear().range([0, this.height]);

    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom").ticks(5);

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left").ticks(5);

    this.layout = function () {

        this.plot = d3.select(this.container)
                        .append("div")
                        .attr("id", "plot");

        this.legend = d3.select(this.container)
                        .append("div")
                        .attr("id", "legend")

        this.controls = d3.select(this.container)
                        .append("div")
                        .attr("id", "controls");

        this.svg = this.plot
            .append("svg")
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    };

    this.render_x_axis = function() {
        this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(this.xAxis);
    }

    this.render_y_axis = function() {
        this.svg.append("g")
            .attr("class", "y axis")
            .call(this.yAxis);
    }

    this.append_to_legend = function(metric) {
        var row = this.legend
            .append("div");

        row.append("span").attr("class", "key").style('background-color', metric.color);

        row.append("span").text(metric.metric+' ('+metric.units+")").attr('class', 'key-text');
    }

    this.render = function (data) {

        this.layout();

        //for y-axis scale, get the sum of the maximum of each dataset (because we stack datasets)
        var yMax = [];
        data.forEach(function(metric){
            var metricMax = d3.max(metric.values, function(d) { return d.value; }); //local maximum
            yMax.push(metricMax);
        }, this);
        yMax = d3.sum(yMax); //global maximum
        this.y.domain([0, yMax]);

        //for x-axis, merge all datasets and get the extent of the dates
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

        data.forEach(function(metric, i) {

            //render bar
            metric.values.forEach(function(value) {

                //accumulate the heights over each metric
                //if (this.heightCounter.hasOwnProperty(value.date)) {
                //    this.heightCounter[value.date] += value.value;
                //} else {
                //    this.heightCounter[value.date] = value.value;
                //}

                var heightShift = this.height - this.y(value.value)/* - this.heightCounter[value.date]*/;
                console.log(this.heightCounter[value.date]);
                this.svg.append("rect")
                    .attr("x", this.x(value.date))
                    .attr("width", 10)
                    .attr("y", 0) //this.heightCounter[value.date]
                    .attr("height", this.y(value.value))
                    .attr("fill", metric.color)
                    .attr("transform", "translate(" + 0 + "," + heightShift + ")")

            }, this);
            this.append_to_legend(metric);

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

$( document ).ready(function() {

    chart = new Trend("#trend-chart");
    chart.url = 'trend.json';
    chart.draw();

    chart = new Stacked("#stacked-bar-chart");
    chart.url = 'stacked.json';
    chart.draw();

    chart = new Compare('#compare-chart');
    chart.url = 'bar.json';
    chart.draw();

    //in the pie charts we don't fetch the data directly from JSON
    data_one = [
        {
            "label": "Fuel",
            "value": 55.05
        },
        {
            "label": "Urea",
            "value": 10.07
        }
    ];

    data_two = [
        {
            "label": "Fuel",
            "value": 30.05
        },
        {
            "label": "Urea",
            "value": 30.07
        }
    ];

    chart = new Pie;
    chart.render("#pie-one", data_one);
    chart.render("#pie-two", data_two);
    chart.legend("#pie-legend", data_one);
});
