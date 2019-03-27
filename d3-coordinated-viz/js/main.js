//begin script when window loads
window.onload = initialize();

function initialize(){
  setMap();
};


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
      .center([-8, 38.1])
      .rotate([84, 0])
      .parallels([43, 62])
      .scale(700)
      .translate(width / 2, height / 2);


    var path = d3.geo.path()
      .projection(projection);



    //use queue to parallelize asynchronous data loading
    d3_queue.queue()
        .defer(d3.csv, "data/NSAAChamps.csv") //load attributes from csv
        .defer(d3.json, "data/States.topojson")//load background spatial data
        .defer(d3.json, "data/Counties.topojson") //load choropleth spatial data
        .await(callback);



    function callback(error, csvData,statesData, countiesData){
        //translate europe TopoJSON
        var usaStates = topojson.feature(statesData, statesData.objects.states),
            nebraskaCounties = topojson.feature(countiesData, countiesData.objects.counties).features;

        var statesbound = map.append("path", convert)
            .datum(usaStates)
            .attr("class", "states")
            .attr("d", path);


      //  add France regions to map
        var countybound = map.selectAll(".counties")
            .data(nebraskaCounties)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "counties " + d.properties.FIPSCode})
            .attr("d", path);

        function convert(d) {
              return {
                path: new Path(d.path),
                value: +d.value
              }
            }


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
