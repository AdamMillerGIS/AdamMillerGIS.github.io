//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap(){
    //use queue to parallelize asynchronous data loading
    d3_queue.queue()
        .defer(d3.csv, "data/NSAAChamps.csv") //load attributes from csv
        .defer(d3.json, "data/counties.topojson") //load choropleth spatial data
        .await(callback);

  function callback(error, csvData, counties){
      //translate europe TopoJSON
      var nebraskaCounties = topojson.feature(counties, counties.objects.counties).features;


      //examine the results
      console.log(nebraskaCounties);
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
