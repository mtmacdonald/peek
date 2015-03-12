/*! Peek.js (c) 2014 Mark Macdonald | http://mtmacdonald.github.io/peek/LICENSE */

/*
    Example input data for Peek.js
*/

var timeData = [
    {
        "label": "Foo",
        "units": "kg",
        "group" : "A",
        "color": "#69A9CA",
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
        "color": "#8583C2",
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
        "label": "Foo",
        "units": "kg",
        "group" : "C",
        "color": "#67D1B8",
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
        "color": "#C76842",
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
        "color": "#C06472",
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
        "label": "Bar",
        "units": "m/s",
        "group" : "C",
        "color": "#C99336",
        "values": [
            {
                x : "2014-03-01 00:00:00",
                y : 5
            },
            {
                x : "2014-03-02 00:00:00",
                y : 1.5
            },
            {
                x : "2014-03-03 00:00:00",
                y : 7
            },
            {
                x : "2014-03-04 00:00:00",
                y : 2.1
            },
            {
                x : "2014-03-05 00:00:00",
                y : 5.8
            }
        ]
    },
    {
        "label": "Baz",
        "units": "l",
        "group" : "A",
        "color": "#68843C",
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
        "color": "#84D747",
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
    },
    {
        "label": "Baz",
        "units": "l",
        "group" : "C",
        "color": "#6C7970",
        "values": [
            {
                x : "2014-03-01 00:00:00",
                y : 1
            },
            {
                x : "2014-03-02 00:00:00",
                y : 2.5
            },
            {
                x : "2014-03-03 00:00:00",
                y : 5
            },
            {
                x : "2014-03-04 00:00:00",
                y : 3.1
            },
            {
                x : "2014-03-05 00:00:00",
                y : 1.8
            }
        ]
    },
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

function getFirstGroupData() {
    var data = JSON.parse(JSON.stringify(timeData)); //clone
    var firstGroupName = data[0].group;
    var i = data.length;
    while (i--) { //iterate data in reverse to allow safe deletion
        if (data[i].group !== firstGroupName) {
            data.splice(i, 1);
        }          
    }
    return data;
}

function getFirstGroupFirstSeriesData() {
    var data = JSON.parse(JSON.stringify(timeData)); //clone
    data.splice(1, data.length);
    return data;
}

function getAllGroupsFirstSeriesData() {
    var data = JSON.parse(JSON.stringify(timeData)); //clone
    var alreadyIncluded = [];
    var i = data.length;
    while (i--) { //iterate data in reverse to allow safe deletion
        if (!(alreadyIncluded.indexOf(data[i].group) > -1)) {
            alreadyIncluded.push(data[i].group);
        } else {
            data.splice(i, 1);
        }
    }
    return data;
}
