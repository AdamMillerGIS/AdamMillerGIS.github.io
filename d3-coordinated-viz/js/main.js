//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap(){

      //map frame dimensions
    var width = 960,
      height = 460;

    //create new svg container for the map
    var map = d3.select("body")
      .append("svg")
      .attr("class", "map")
      .attr("width", width)
      .attr("height", height);

    //create Albers equal area conic projection centered on France
    var projection = d3.geo.albers()
      .center([0.00, 38.15])
      .rotate([88.27, 0.00, 0])
      .parallels([29.5, 45.5])
      .scale(553.54)
      .translate(width / 2, height / 2);


    var path = d3.geo.path()
      .projection(projection);



    //use queue to parallelize asynchronous data loading
    d3_queue.queue()
        .defer(d3.csv, "data/NSAAChamps.csv") //load attributes from csv
        .defer(d3.json, "data/states.topojson")//load background spatial data
        .defer(d3.json, "data/counties.topojson") //load choropleth spatial data
        .await(callback);

    function callback(error, csvData,states, counties){
        //translate europe TopoJSON
        var usaStates = topojson.feature(states, states.objects.states),
            nebraskaCounties = topojson.feature(counties, counties.objects.counties).features;

        var states = map.append("path")
            .datum(usaStates)
            .attr("class", "states")
            .attr("d", path);


      //  add France regions to map
        var regions = map.selectAll(".regions")
            .data(nebraskaCounties)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "regions " + d.properties.FIPSCode
            })
            .attr("d", path);




        //examine the results
        //console.log(usaStates)
        // console.log(csvData)
        // console.log(nebraskaCounties);
  };


        //Example 1.4 line 10
        // function callback(error, csvData, counties){
        //     //translate counties TopoJSON
        //     var county = topojson.feature(counties, counties.objects.counties).features;
        //
        //     //examine the results
        //     console.log(county);
        // };
};
