
//http://mikemcdearmon.com/portfolio/techposts/charting-libraries-using-d3
//http://www.recursion.org/d3-for-mere-mortals/
//http://exposedata.com/tutorial/d3/
//http://chimera.labs.oreilly.com/books/1230000000345/index.html

//http://techslides.com/over-1000-d3-js-examples-and-demos/

//http://code.shutterstock.com/rickshaw/
//http://nvd3.org/
//http://dimplejs.org/

//http://jsfiddle.net/GyWpN/


//http://alignedleft.com/tutorials/d3 **************************

$( document ).ready(function() {

    //chart dimensions
    var margin = {top: 20, right: 20, bottom: 20, left: 20};
    var width = 600 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    var data = [10,2,15,20,41,25,30];

    var x = d3.scale.linear().domain([0,data.length]).range([0,width]);
    var y = d3.scale.linear().domain([0,d3.max(data)]).range([height,0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("right");

    var line = d3.svg.line()
                .interpolate('basis') //smooth out lines
                .x(function(d,i) { return x(i); })
                .y(function(d) { return y(d); });

    var svg = d3.select('#chart')
        .datum(data)
        .attr('width', width)
        .attr('height', height)
        .append("g");

    //build chart
    svg.append("path")
        .attr("class", "line")
        .attr("d", line);

    //build axes
    svg.append('g')
        .attr('class', 'axis')
        .call(yAxis);
    svg.append('g')
        .attr('class', 'axis')
        .attr("transform", "translate(0," + (height - margin.bottom) + ")") //move x-axis to bottom
        .call(xAxis);

});

