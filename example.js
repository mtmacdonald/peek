/*! Peek.js (c) 2014 Mark Macdonald | http://mtmacdonald.github.io/peek/LICENSE */

/*
    Example usage of Peek.js
*/

var timeData = [
    {
        "label": "Foo",
        "units": "kg",
        "group" : "A",
        "color": "steelblue",
        "values": [
            {
                x : "2014-03-01 00:00:00",
                y : 6
            },
            {
                x : "2014-03-02 00:00:00",
                y : 1.43
            },
            {
                x : "2014-03-03 00:00:00",
                y : 1.38
            },
            {
                x : "2014-03-04 00:00:00",
                y : 4.14
            },
            {
                x : "2014-03-05 00:00:00",
                y : 7.14
            }
        ]
    },
    {
        "label": "Foo",
        "units": "kg",
        "group" : "B",
        "color": "steelblue",
        "values": [
            {
                x : "2014-03-01 00:00:00",
                y : 2
            },
            {
                x : "2014-03-02 00:00:00",
                y : 4.5
            },
            {
                x : "2014-03-03 00:00:00",
                y : 6
            },
            {
                x : "2014-03-04 00:00:00",
                y : 1.1
            },
            {
                x : "2014-03-05 00:00:00",
                y : 0.8
            }
        ]
    },
    {
        "label": "Bar",
        "units": "m/s",
        "group" : "A",
        "color": "firebrick",
        "values": [
            {
                x : "2014-03-01 00:00:00",
                y : 2
            },
            {
                x : "2014-03-02 00:00:00",
                y : 4.4
            },
            {
                x : "2014-03-03 00:00:00",
                y : 0.8
            },
            {
                x : "2014-03-04 00:00:00",
                y : 7.24
            },
            {
                x : "2014-03-05 00:00:00",
                y : 6.0
            }
        ]
    },
    {
        "label": "Bar",
        "units": "m/s",
        "group" : "B",
        "color": "firebrick",
        "values": [
            {
                x : "2014-03-01 00:00:00",
                y : 4.2
            },
            {
                x : "2014-03-02 00:00:00",
                y : 2.4
            },
            {
                x : "2014-03-03 00:00:00",
                y : 0.6
            },
            {
                x : "2014-03-04 00:00:00",
                y : 5.1
            },
            {
                x : "2014-03-05 00:00:00",
                y : 9.0
            }
        ]
    },
    {
        "label": "Baz",
        "units": "l",
        "group" : "A",
        "color": "darkgreen",
        "values": [
            {
                x : "2014-03-01 00:00:00",
                y : 1
            },
            {
                x : "2014-03-02 00:00:00",
                y : 8.2
            },
            {
                x : "2014-03-03 00:00:00",
                y : 3.6
            },
            {
                x : "2014-03-04 00:00:00",
                y : 3.1
            },
            {
                x : "2014-03-05 00:00:00",
                y : 1.1
            }
        ]
    },
    {
        "label": "Baz",
        "units": "l",
        "group" : "B",
        "color": "darkgreen",
        "values": [
            {
                x : "2014-03-01 00:00:00",
                y : 3.2
            },
            {
                x : "2014-03-02 00:00:00",
                y : 2.2
            },
            {
                x : "2014-03-03 00:00:00",
                y : 4.6
            },
            {
                x : "2014-03-04 00:00:00",
                y : 5.1
            },
            {
                x : "2014-03-05 00:00:00",
                y : 0.1
            }
        ]
    }
];

var horizontal_bar_data = [
    {
        "label": "Foo",
        "value": 55,
        "colour": "steelblue"
    },
    {
        "label": "Baz",
        "value": 10,
        "colour": "firebrick"
    }
];

var pie_data_one = [
    {     
        "label": "Foo",
        "value": 90.1,
        "color": "steelblue"
    },
    {     
        "label": "Baz",
        "value": 9.9,
        "color": "firebrick"
    }     
];

var pie_data_two = [
    {     
        "label": "Foo",
        "value": 49.9,
        "color": "steelblue"
    },    
    {
        "label": "Baz",
        "value": 50.1,
        "color": "firebrick"
    }
];

$( document ).ready(function() {

    /*
        Charts are instantiated as objects. There are two different ways to pass
        data and draw the chart:

        i) by passing a data array to render() directly

                var trend_chart = new Trend("#trend-chart");
                trend_chart.render(trend_data); 

        ii) by setting the url to the data and calling draw()

                var trend_chart = new Trend("#trend-chart");
                trend_chart.url = 'trend.json'; 
                chart.draw();
    */

});
