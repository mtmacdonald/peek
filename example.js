/*! Peek.js (c) 2014 Mark Macdonald | http://mtmacdonald.github.io/peek/LICENSE */

/*
    Example usage of Peek.js
*/

var trend_data = [
    {
        "label": "Foo",
        "units": "tonnes",
        "color": "steelblue",
        "values": [
            {
                "date": "2014-03-15 01:00:00",
                "value": 6
            },
            {
                "date": "2014-03-16 01:00:00",
                "value": 1.43
            },
            {
                "date": "2014-03-19 01:00:00",
                "value": 1.38
            },
            {
                "date": "2014-03-25 01:00:00",
                "value": 4.14
            },
            {
                "date": "2014-03-28 01:00:00",
                "value": 7.14
            }
        ]
    },
    {
        "label": "Baz",
        "units": "tonnes",
        "color": "firebrick",
        "values": [
            {
                "date": "2014-03-14 01:00:00",
                "value": 1.14
            },
            {
                "date": "2014-03-15 01:00:00",
                "value": 0.43
            },
            {
                "date": "2014-03-19 01:00:00",
                "value": 0.38
            },
            {
                "date": "2014-03-21 01:00:00",
                "value": 3.14
            }
        ]
    }
];

var stacked_data = [
    {
        "label": "Foo",
        "units": "tonnes",
        "color": "steelblue",
        "values": [
            {
                "date": "2014-03-15 00:00:00",
                "value": 6
            },
            {
                "date": "2014-03-16 00:00:00",
                "value": 1.43
            },
            {
                "date": "2014-03-19 00:00:00",
                "value": 1.38
            },
            {
                "date": "2014-03-25 00:00:00",
                "value": 4.14
            }
        ]
    },
    {
        "label": "Baz",
        "units": "litres",
        "color": "firebrick",
        "values": [
            {
                "date": "2014-03-14 00:00:00",
                "value": 1.14
            },
            {
                "date": "2014-03-15 00:00:00",
                "value": 0.43
            },
            {
                "date": "2014-03-19 00:00:00",
                "value": 6
            },
            {
                "date": "2014-03-21 00:00:00",
                "value": 3.14
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

    var line_chart = new Trend("#line-chart");
    line_chart.line.points = true;
    line_chart.line.area = false;
    line_chart.render(trend_data);

    //var area_chart = new Trend("#area-chart");
    //area_chart.line.points = true;
    //area_chart.line.area = true;
    //area_chart.render(trend_data);

    var stacked_chart = new Stacked("#stacked-bar-chart");
    stacked_chart.render(stacked_data);

    var compare_chart = new Compare('#compare-chart');
    compare_chart.render(horizontal_bar_data);

    var pie_one = new Pie("#pie-one");
    var pie_two = new Pie("#pie-two");
    pie_one.render(pie_data_one);
    pie_two.render(pie_data_two);
    pie_one.legend("#pie-legend", pie_data_one);

});
