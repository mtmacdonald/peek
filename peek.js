
//For D3 help: https://leanpub.com/D3-Tips-and-Tricks/read#leanpub-auto-starting-with-a-basic-graph




$( document ).ready(function() {

    //chart dimensions
    var margin = {top: 20, right: 20, bottom: 20, left: 20};
    var width = 600 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    var parseDate = d3.time.format("%d-%b-%y").parse;

    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom").ticks(5);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left").ticks(5);

    var line = d3.svg.line()
                .interpolate('cardinal') 
                .x(function(d) { return x(d.date); })
                .y(function(d) { return y(d.value); });

    var svg = d3.select('#chart')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); //make space for axes

    //grid generator
    function make_x_axis() {        
        return d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(5)
    };
    function make_y_axis() {        
        return d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(5)
    };

    //fetch the data
    d3.json("data.json", function(data) {


        data.forEach(function(metric) {

            //convert the date format for each metric
            metric.values.forEach(function(value) {
                value.date = parseDate(value.date);
            });

            //scale for each metric
            x.domain(d3.extent(metric.values, function(d) { return d.date; }));
            y.domain([0, d3.max(metric.values, function(d) { return d.value; })]);

            //draw each metric
            svg.append("path")
                .attr("class", "line")
                .attr("d", line(metric.values)); //before - .attr("d", line);
        });

        //axes
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        //ticks
        svg.append("g")         
            .attr("class", "grid")
            .attr("transform", "translate(0," + height + ")")
            .call(make_x_axis()
                .tickSize(-height, 0, 0)
                .tickFormat("")
            );
        svg.append("g")         
            .attr("class", "grid")
            .call(make_y_axis()
                .tickSize(-width, 0, 0)
                .tickFormat("")
            );
    });
});
