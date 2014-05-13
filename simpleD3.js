    //input data
    var data = [
        {
            "label": "Fuel",
            "values": [
                {
                    "date": "2014-03-15 01:00:00",
                    "value": 1
                },
                {
                    "date": "2014-03-16 01:00:00",
                    "value": 3
                },
                {
                    "date": "2014-03-19 01:00:00",
                    "value": 2
                },
                {
                    "date": "2014-03-23 01:00:00",
                    "value": 4
                }
            ]
        },
    ];

    var width = 600;
    var height = 400;

    //parse dates
    var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;
    data[0].values.forEach(function(value) {
        value.date = parseDate(value.date);
    });

    //set scales
    var x = d3.time.scale().range([0, width])
                .domain(d3.extent(data[0].values, function(d) { return d.date; }));

    var y = d3.scale.linear().range([height, 0])
                .domain(d3.extent(data[0].values, function(d) { return d.value; }));

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom").ticks(10);

    var svg = d3.select("#chart")
        .append("svg")
            .attr('width', width)
            .attr('height', height)
        .append("g")
            .attr("class", "x axis")
            .call(xAxis);


    data[0].values.forEach(function(value) {
        svg.append("rect")
            .attr("x", x(value.date))
            .attr("width", 1)
            .attr("y", 0)
            .attr("height", y(value.value))
            .attr("fill", "steelblue")
    });