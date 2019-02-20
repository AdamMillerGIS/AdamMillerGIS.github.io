/* Map of GeoJSON data from MegaCities.geojson */

//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var map = L.map('mapid', {
        center: [40, -98],
        zoom: 4
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);



    //call getData function
    getData(map);
};


//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 100;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};


//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
   //Determine which attribute to visualize with proportional symbols
   var attribute = attributes[0];

   console.log(attribute)

   //create marker options
   var options = {
       fillColor: "#ff7800",
       color: "#000",
       weight: 1,
       opacity: 1,
       fillOpacity: 0.8
   };

   //For each feature, determine its value for the selected attribute
   var attValue = Number(feature.properties[attribute]);

   //Give each feature's circle marker a radius based on its attribute value
   options.radius = calcPropRadius(attValue);

   //create circle marker layer
   var layer = L.circleMarker(latlng, options);

   //build popup content string
   var popupContent = "<p><b>State:</b> " + feature.properties.State + "</p>";

   var year = attribute.split("_")[1];
   popupContent +=  "<p><b>Electric Vehicles per 1000 in:</b></p> "
   popupContent += "<p><b> " + year + ":</b> " + feature.properties[attribute] + "</p>";

   //bind the popup to the circle marker
   layer.bindPopup(popupContent, {
    offset: new L.Point(0,-options.radius)
    });

   //event listeners to open popup on hover
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        }
    });

    ///event listeners to open popup on hover and fill panel on click...Example 2.5 line 4
   layer.on({
       mouseover: function(){
           this.openPopup();
       },
       mouseout: function(){
           this.closePopup();
       },
       click: function(){
           $("#panel").html(popupContent);
       }
   });

   //return the circle marker to the L.geoJson pointToLayer option
   return layer;
};



//Step 3: Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
  //create a Leaflet GeoJSON layer and add it to the map
  L.geoJson(data, {
      pointToLayer: function(feature, latlng){
          return pointToLayer(feature, latlng, attributes);
      }
  }).addTo(map);
};

//Step 1: Create new sequence controls
function createSequenceControls(map,attributes){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');

    //set slider attributes
    $('.range-slider').attr({
    max: 3,
    min: 0,
    value: 0,
    step: 1
    });

        //below Example 3.4...add skip buttons
    $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel').append('<button class="skip" id="forward">Skip</button>');
    //Below Example 3.5...replace button content with images
    $('#reverse').html('<img src="img/rewind.png">');
    $('#forward').html('<img src="img/forward.png">');

    //Step 5: click listener for buttons
    $('.skip').click(function(){
           //get the old index value
           var index = $('.range-slider').val();

           //Step 6: increment or decrement depending on button clicked
           if ($(this).attr('id') == 'forward'){
               index++;
               //Step 7: if past the last attribute, wrap around to first attribute
               index = index > 3 ? 0 : index;
           } else if ($(this).attr('id') == 'reverse'){
               index--;
               //Step 7: if past the first attribute, wrap around to last attribute
               index = index < 0 ? 3 : index;
           };

           //Step 8: update slider
           $('.range-slider').val(index);

           //Called in both skip button and slider event listener handlers
            //Step 9: pass new attribute to update symbols
            updatePropSymbols(map, attributes[index]);
       });

//Step 5: input listener for slider
    $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var index = $(this).val();

        //Called in both skip button and slider event listener handlers
        //Step 9: pass new attribute to update symbols
        updatePropSymbols(map, attributes[index]);

        console.log(index)
        console.log(attributes)
    });
};


//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
      //Example 3.16 line 4
       if (layer.feature && layer.feature.properties[attribute]){
           //access feature properties
           var props = layer.feature.properties;

           //update each feature's radius based on new attribute values
           var radius = calcPropRadius(props[attribute]);
           layer.setRadius(radius);

           //add city to popup content string
           var popupContent = "<p><b>State:</b> " + props.State + "</p>";

           //add formatted attribute to panel content string
           var year = attribute.split("_")[1];
           popupContent +=  "<p><b>Electric Vehicles per 1000 in:</b></p> "
           popupContent += "<p><b> " + year + ":</b> " + props[attribute] + "</p>";

           //replace the layer popup
           layer.bindPopup(popupContent, {
               offset: new L.Point(0,-radius)
           });
       };
     });

};

//Above Example 3.8...Step 3: build an attributes array from the data
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("V") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};

//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/ElectricVehicles.geojson", {
        dataType: "json",
        success: function(response){

            //create an attributes Array
            var attributes = processData(response);
            //call function to create proportional symbols
            createPropSymbols(response, map, attributes);
            createSequenceControls(map,attributes);
        }
    });
};




$(document).ready(createMap);