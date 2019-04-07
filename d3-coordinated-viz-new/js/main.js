//First line of main.js...wrap everything in a self-executing anonymous function to move to local scope
(function(){

    //pseudo-global variables
    var attrArray = ["Girls Basketball", "Boys Basketball", "Football", "Volleyball", "Wrestling","Total"]; //list of attributes
    var expressed = attrArray[0]; //initial attribute

    //create the colors for the legend
    var legendColors = ["#fee5d9",
                "#fcae91",
                "#fb6a4a",
                "#de2d26",
                "#a50f15"]

    //chart frame dimensions
    var chartWidth = window.innerWidth * 0.425,
        chartHeight = 473,
        leftPadding = 30,
        rightPadding = 2,
        topBottomPadding = 5,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

    //create a scale to size bars proportionally to frame and for axis
    var yScale = d3.scale.linear()
        .range([463, 0])
        .domain([-.1, 4]);



    //begin script when window loads
    window.onload = setMap();

    //set up choropleth map
    function setMap(){
        //create the heading for the page
        createHead();




        //map frame dimensions
        var width = window.innerWidth * 0.5,
            height = 460;

        //create new svg container for the map
        var map = d3.select("body")
            .append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height);

        //create Albers equal area conic projection centered on Nebraska
        var projection = d3.geo.albers()
            .center([-8, 41])
            .rotate([92, 0])
            .parallels([42, 99])
            .scale(3400)
            .translate([width / 2, height / 2]);

        //create path variable based on projection
        var path = d3.geo.path()
            .projection(projection);

        //use d3.queue to parallelize asynchronous data loading
        d3.queue()
            .defer(d3.csv, "data/unitsData.csv") //load attributes from csv
            .defer(d3.json, "data/States.topojson") //load background spatial data
            .defer(d3.json, "data/Counties.topojson") //load choropleth spatial data
            .await(callback);




     //Callback function to load data
    function callback(error, csvData, states, counties){




            //translate State and County TopoJSONs
            var stateBoundaries = topojson.feature(states, states.objects.states),
                countyBoundaries = topojson.feature(counties, counties.objects.counties).features;

            //add States countries to map
            var states = map.append("path")
                .datum(stateBoundaries)
                .attr("class", "states")
                .attr("d", path);

        //join csv data to GeoJSON enumeration units
        countyBoundaries = joinData(countyBoundaries, csvData);

        //create the color scale
        var colorScale = makeColorScale(csvData);

        //add enumeration units to the map
        setEnumerationUnits(countyBoundaries, map, path, colorScale);

        //add coordinated visualization to the map
        setChart(csvData, colorScale);


        //Create the interactive Title
        createTitle(expressed);

        //call the fuction to create the dropdown
        createDropdown(csvData);

        //call the function to create the chloropleth legend
        createLegend(colorScale);

        };



    };//end of setMap



    //create the join fuction to join the csv & toposjson
    function joinData(countyBoundaries, csvData){
        //variables for data join
        var attrArray = ["Girls Basketball", "Boys Basketball", "Football", "Volleyball", "Wrestling","Total"];

        //loop through csv to assign each set of csv attribute values to geojson county
        for (var i=0; i<csvData.length; i++){
            var csvCounty = csvData[i]; //the current county
            var csvKey = csvCounty.FIPSCode; //the CSV primary key

            //loop through geojson regions to find correct county
            for (var a=0; a<countyBoundaries.length; a++){

                var geojsonProps = countyBoundaries[a].properties; //the current county geojson properties
                var geojsonKey = geojsonProps.FIPSCode; //the geojson primary key

                //where primary keys match, transfer csv data to geojson properties object
                if (geojsonKey == csvKey){

                    //assign all attributes and values
                    attrArray.forEach(function(attr){
                        var val = parseFloat(csvCounty[attr]); //get csv attribute value
                        geojsonProps[attr] = val; //assign attribute and value to geojson properties
                    });
                };
            };
        };

        return countyBoundaries;
    };

    //function to create the enumeration units
    function setEnumerationUnits(countyBoundaries, map, path, colorScale){

         //in setEnumerationUnits()...add Nebraska Counties to map
        var counties = map.selectAll(".counties")
            .data(countyBoundaries)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "counties " + d.properties.FIPSCode;
            })
            .attr("d", path)
            .style("fill", function(d){
                return choropleth(d.properties, colorScale);
            })
            //Example 2.5 line 1...regions event listeners
            .on("mouseover", function(d){
                highlight(d.properties);
            })
            .on("mouseout", function(d){
                dehighlight(d.properties);
            })
            .on("mousemove", moveLabel);

        //add style descriptor to each path
        var desc = counties.append("desc")
            .text('{"stroke": "#000", "stroke-width": "0.5px"}');


    };
    //function to create the interactive legend
    function createLegend(colorScale){

      //create the array to hold the legend text
      var legendText = []

      //loop through the chloropleth array to find the max and min values of each color break
      for (var i=0; i<legendColors.length; i++){
        var val = colorScale.invertExtent(legendColors[i]);

        if (val[0] == undefined){
          val[0] = 0
        };
        if (val[1] == undefined){
          val[1] = "+"
        };
        legendText.push(val[0] + " - " + val[1])


      };
      legendText[4] = legendText[4].replace(' - ',' ')

      //create the legend svg
      var legend = d3.select("body")
          .append("svg")
          // .attr("width", 200)
          // .attr("height", 30)
          .attr("class", "legend")





      //create a legend item and append it to the legend
      var legendItem = legend.selectAll(".legendItem")
        .data(d3.range(5))
    		.enter()
    		.append("g")
    			.attr("class", "legenditem")
          .attr("transform", function(d, i) { return "translate( 20 ," + i * 31 + ")"; });

      //assign a color value to the legend item
      legendItem.append("rect")
    		.attr("x", 10 )
    		.attr("y", 1)
    		.attr("width", 20)
    		.attr("height", 20)
    		.attr("class", "rect")
    		.style("fill", function(d, i) { return legendColors[i]; })
        .style("stroke", "black" );

      //assign text to each legend item
      legendItem.append("text")
      	.attr("x", 70)
      	.attr("y", 16)
      	.style("text-anchor", "left")
      	.text(function(d, i) { return legendText[i]; });
    };



    //function to create color scale generator
    function makeColorScale(data){
        var colorClasses = [
            "#fee5d9",
            "#fcae91",
            "#fb6a4a",
            "#de2d26",
            "#a50f15"
        ];

        //create color scale generator
        var colorScale = d3.scale.threshold()
            .range(colorClasses);

        //build array of all values of the expressed attribute
        var domainArray = [];
        for (var i=0; i<data.length; i++){
            var val = parseFloat(data[i][expressed]);
            domainArray.push(val);
        };

        //cluster data using ckmeans clustering algorithm to create natural breaks
        var clusters = ss.ckmeans(domainArray, 5);
        //reset domain array to cluster minimums
        domainArray = clusters.map(function(d){
            return d3.min(d);
        });
        //remove first value from domain array to create class breakpoints
        domainArray.shift();

        //assign array of last 4 cluster minimums as domain
        colorScale.domain(domainArray);

        return colorScale;


    };

    //function to test for data value and return color
    function choropleth(props, colorScale){
        //make sure attribute value is a number
        var val = parseFloat(props[expressed]);
        //if attribute value exists, assign a color; otherwise assign gray
        if (typeof val == 'number' && !isNaN(val)){
            return colorScale(val);
        } else {
            return "#CCC";
        };
    };

    //function to create coordinated bar chart
    function setChart(csvData, colorScale){
        //create a second svg element to hold the bar chart
        var chart = d3.select("body")
            .append("svg")
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .attr("class", "chart");

        //create a rectangle for chart background fill
        var chartBackground = chart.append("rect")
            .attr("class", "chartBackground")
            .attr("width", chartInnerWidth)
            .attr("height", chartInnerHeight)
            .attr("transform", translate);

        //append the NSAA Logo to the Chart
        var chartImage = chart.append("image")
            .attr('xlink:href', 'img/nsaa.png')
            .attr('width', 151)
            .attr('height', 91)
            .attr('x', 70)
            .attr('y', 50);


        //in setChart()...set bars for each province
        var bars = chart.selectAll(".bar")
            .data(csvData)
            .enter()
            .append("rect")
            .sort(function(a, b){
                return a[expressed]-b[expressed]
            })
            .attr("class", function(d){
                return "bar " + d.FIPSCode;
            })
            .attr("width", chartInnerWidth / csvData.length - 1)
            //Example 2.5 line 11...bars event listeners
            .on("mouseover", highlight)
            .on("mouseout", dehighlight)
            .on("mousemove", moveLabel);

            var desc = bars.append("desc")
                .text('{"stroke": "none", "stroke-width": "0px"}')

        updateChart(bars, csvData.length, colorScale);



        //create vertical axis generator
        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left");

        //place axis
        var axis = chart.append("g")
            .attr("class", "axis")
            .attr("transform", translate)
            .call(yAxis);

        //create frame for chart border
        var chartFrame = chart.append("rect")
            .attr("class", "chartFrame")
            .attr("width", chartInnerWidth)
            .attr("height", chartInnerHeight)
            .attr("transform", translate);

        //set bar positions, heights, and colors
        updateChart(bars, csvData.length, colorScale);


    }; //end of setChart

    //function to create the heading of the page
    function createHead(){
      var head = d3.select("body")
          .append("svg")
          .attr("width", window.innerWidth )
          .attr("height", 50)
          .attr("class", "head");

      //create a rectangle for header background fill
      var headBackground = head.append("rect")
          .attr("class", "headBackground")
          .attr("width", window.innerWidth )
          .attr("height", 50);

        //append the text to the header
      var headName = head.append("text")
        .attr("x", 40)
        .attr("y", 40)
        .attr("class", "headName")
        .text("Nebraska High School Sports Championships - Last 5 Seasons")
        .style("text-anchor", "left");

    }

    //function to create the interactive text
    function createTitle(attribute){
      var title = d3.select("body")//create the title svg
          .append("svg")
          .attr("width", 900)
          .attr("height", 50)
          .attr("class", "title");

      //create a rectangle for titlebox background fill
      var titleBackground = title.append("rect")
          .attr("class", "titleBackground")
          .attr("width", 900)
          .attr("height", 50);

          //append the interactive text to the title box
      var titleName = title.append("text")
        .attr("x",30)
        .attr("y", 30)
        .attr("class", "titleName")
        .text(expressed + " Championships per school in each county");

    };

    //Example 1.1 line 1...function to create a dropdown menu for attribute selection
    function createDropdown(csvData){
        //add select element
        var dropdown = d3.select("body")
            .append("select")
            .attr("class", "dropdown")
            .on("change", function(){
                changeAttribute(this.value, csvData)
            });

        //add initial option
        var titleOption = dropdown.append("option")
            .attr("class", "titleOption")
            .attr("disabled", "true")
            .text("Select Sport");

        //add attribute name options
        var attrOptions = dropdown.selectAll("attrOptions")
            .data(attrArray)
            .enter()
            .append("option")
            .attr("value", function(d){ return d })
            .text(function(d){ return d });
    };

    //dropdown change listener handler
    function changeAttribute(attribute, csvData){
        //change the expressed attribute
        expressed = attribute;

        //recreate the color scale
        var colorScale = makeColorScale(csvData);

        //recolor enumeration units
        var counties = d3.selectAll(".counties")
            .transition()
            .duration(1000)
            .style("fill", function(d){
                return choropleth(d.properties, colorScale)
            });

       //re-sort, resize, and recolor bars
        var bars = d3.selectAll(".bar")
            //re-sort bars
            .sort(function(a, b){
                return a[expressed] - b[expressed];
            })
            .transition() //add animation
            .delay(function(d, i){
                return i * 20
            })
            .duration(500);
        // create a new legend svg
        var legend = d3.selectAll(".legend")
            .append("svg")
                // .attr("width", 200)
                // .attr("height", 30)
            .attr("class", "legend")

        d3.select(".legend").remove();//remove the old legend svg

        //call the update chart function
        updateChart(bars, csvData.length, colorScale);

        //create a new legend with the newly referenced data
        createLegend(colorScale);

        var titleName = d3.select(".titleName")
            .text(expressed + " Championships per school in each county");
    };// end changeAttribute

    //function to position, size, and color bars in chart
    function updateChart(bars, n, colorScale){
        //position bars
        bars.attr("x", function(d, i){
                return i * (chartInnerWidth / n) + leftPadding;
            })
            //size/resize bars
            .attr("height", function(d, i){
                return 463 - yScale(parseFloat(d[expressed]));
            })
            .attr("y", function(d, i){
                return yScale(parseFloat(d[expressed])) + topBottomPadding ;
            })
            //color/recolor bars
            .style("fill", function(d){
                return choropleth(d, colorScale);
            })





    };//end updateCharts

     //function to highlight enumeration units and bars
    function highlight(props){
        //change stroke
        var selected = d3.selectAll("." + props.FIPSCode)
            .style("stroke", "74ADDD")
            .style("stroke-width", "2")

        setLabel(props);
    };


     //function to reset the element style on mouseout
    function dehighlight(props){
        var selected = d3.selectAll("." + props.FIPSCode)
            .style("stroke", function(){
                return getStyle(this, "stroke")
            })
            .style("stroke-width", function(){
                return getStyle(this, "stroke-width")
            });

        function getStyle(element, styleName){
            var styleText = d3.select(element)
                .select("desc")
                .text();

            var styleObject = JSON.parse(styleText);

            return styleObject[styleName];


        };

        //remove info label
        d3.select(".infolabel")
            .remove();
    };




    //function to create dynamic label
    function setLabel(props){
        //label content
        var labelAttribute = "<h1>" + props[expressed] +
            "</h1><b>" + expressed + "</b>";

        //create info label div
        var infolabel = d3.select("body")
            .append("div")
            .attr("class", "infolabel")
            .attr("id", props.FIPSCode + "_label")
            .html(labelAttribute);

        //add the county name to the info label
        var countyName = infolabel.append("div")
            .attr("class", "labelname")
            .html(props.Counties);
    };

    //function to move info label with mouse
    function moveLabel(){
        //get width of label
        var labelWidth = d3.select(".infolabel")
            .node()
            .getBoundingClientRect()
            .width;

        //use coordinates of mousemove event to set label coordinates
        var x1 = d3.event.clientX + 10,
            y1 = d3.event.clientY - 75,
            x2 = d3.event.clientX - labelWidth - 10,
            y2 = d3.event.clientY + 25;

        //horizontal label coordinate, testing for overflow
        var x = d3.event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1;
        //vertical label coordinate, testing for overflow
        var y = d3.event.clientY < 75 ? y2 : y1;

        d3.select(".infolabel")
            .style("left", x + "px")
            .style("top", y + "px");
    };



})(); //last line of main.js
