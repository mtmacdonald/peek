
//For D3 help: https://leanpub.com/D3-Tips-and-Tricks/read#leanpub-auto-starting-with-a-basic-graph

function Chart() {

    this.margin = {top: 50, right: 50, bottom: 50, left: 50};
    this.width = 600 - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom;
    this.svg;

    this.parseDate = d3.time.format("%d-%b-%y").parse;

    this.x = d3.time.scale().range([0, this.width]);
    this.y = d3.scale.linear().range([this.height, 0]);

    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom").ticks(5);

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left").ticks(5);

    this.line = d3.svg.line()
                .interpolate('cardinal') 
                .x(function(d) { return this.x(d.date); })
                .y(function(d) { return this.y(d.value); });

    this.svg = function () {
        this.svg = d3.select('#chart')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    };

    this.render_line = function(metric) {
        //draw each metric
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

    this.render = function (data) {

        this.svg();

        data.forEach(function(metric) {

            //convert the date format for each metric
            metric.values.forEach(function(value) {
                value.date = this.parseDate(value.date);
            }, this);

            //scale for each metric
            this.x.domain(d3.extent(metric.values, function(d) { return d.date; }));
            this.y.domain([0, d3.max(metric.values, function(d) { return d.value; })]);

            this.render_line(metric);

        }, this);
  
        this.render_x_axis();
        this.render_y_axis();

        this.render_x_ticks();
        this.render_y_ticks();
    }

    this.load = function() {
        d3.json("data.json", function (data) {
            this.render(data);
        }.bind(this));
    };

    this.draw = function () {
        this.load();
    };
}

$( document ).ready(function() {

    chart = new Chart();
    chart.draw();

});
