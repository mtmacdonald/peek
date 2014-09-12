/*
    Example usage of peek.js
*/

var trend_data = [
    {
        "legend": "Foo",
        "colour": "steelblue",
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
            }
        ]
    },
    {
        "legend": "Baz",
        "colour": "firebrick",
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
        "metric": "Foo",
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
        "metric": "Baz",
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
        "value": 55.05,
        "colour": "steelblue"
    },
    {     
        "label": "Baz",
        "value": 10.07,
        "colour": "firebrick"
    }     
];

var pie_data_two = [
    {     
        "label": "Foo",
        "value": 30.05,
        "colour": "steelblue"
    },    
    {
        "label": "Baz",
        "value": 30.07,
        "colour": "firebrick"
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

    var trend_chart = new Trend("#trend-chart");
    trend_chart.render(trend_data);

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
