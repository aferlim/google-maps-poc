var api_KEY = "AIzaSyDZDvl5bDjcfmV_6PJF9_MJx9xXaSTMHqE", session_token = "", min_length = 3;

// function uuidv4() {
//     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
//       var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
//       return v.toString(16);
//     });
// }

function initMap() {
    const brazil = { lat: -14.235004, lng: -51.92528 };

    const defaultBounds = {
        north: brazil.lat + 0.1,
        south: brazil.lat - 0.1,
        east: brazil.lng + 0.1,
        west: brazil.lng - 0.1,
    };

    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 4,
        center: brazil,
    });

    const input = document.getElementById("address");

    const options = {
        //bounds: defaultBounds,
        componentRestrictions: { country: "br" },
        fields: ["formatted_address", "geometry", "icon", "name"],
        origin: brazil,
        strictBounds: false,
        types: ["address"],
    };

    const autocomplete = new google.maps.places.Autocomplete(input, options);
    
    autocomplete.bindTo("bounds", map);
    
    const infowindow = new google.maps.InfoWindow();
    const infowindowContent = document.getElementById("infowindow-content");
    
    infowindow.setContent(infowindowContent);

    const marker = new google.maps.Marker({
        map,
        anchorPoint: new google.maps.Point(0, -29),
    });

    autocomplete.addListener("place_changed", () => {
        infowindow.close();
        marker.setVisible(false);

        const place = autocomplete.getPlace();

        console.log(place);
        console.log(place.geometry.location.lat());
        console.log(place.geometry.location.lng());

        if (!place.geometry || !place.geometry.location) {
          // User entered the name of a Place that was not suggested and
          // pressed the Enter key, or the Place Details request failed.
          window.alert(
            "Desculpe, não encontramos referência para: '" + place.name + "'\nDigite um endereço válido"
          );
          return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else {
          map.setCenter(place.geometry.location);
          map.setZoom(17);
        }

        marker.setPosition(place.geometry.location);
        marker.setVisible(true);

        infowindowContent.children["place-name"].textContent = place.name;
        infowindowContent.children["place-address"].textContent = place.formatted_address;

        infowindow.open(map, marker);
    });

    marker.addListener("click", () => {
        map.setZoom(17);
        map.setCenter(marker.getPosition());

        if (!infowindow.getMap()){
            infowindow.open(map, marker);
        }
        
    });

    var cov_row = 0;
    var max_rows = 5;
    var colors_coverage = ['#9c27b0', '#e91e63', '#03a9f4', '#ff9800', '#4caf50', '#cddc39'];

    var array_Circles = [];

    $("#add_coverage").click(function(e){
        cov_row = $('.coverage_rows > .row').length;

        if(cov_row > max_rows){
          e.preventDefault();
          return;
        }

        if(cov_row == max_rows){
          $("#add_coverage:visible").hide();
        }

        var $html = $($('[data-id=coverage_line]').clone());

        $html.find('div[data-id=coverage_color]')
          .css('background-color', colors_coverage[cov_row])
          .attr('data-id', 'coverage_color_' + cov_row);

        var prevValue = cov_row == 1 ? 
            $html.find('input[data-id=coverage_meters]').val() :
            $('input[name=coverage_meters]', $('.coverage_rows .row:eq(' + (cov_row - 1) +')')).val();

        if(prevValue){
          prevValue = parseInt(prevValue) + 1000;
        }else {
          prevValue = 1000;
        }

        $html.find('input[data-id=coverage_meters]')
          .attr('data-id', 'coverage_meters_' + cov_row)
          .val(prevValue);

        $html.find('input[data-id=coverage_value]')
          .attr('data-id', 'coverage_value_' + cov_row)
          .val("0");

        $html.find('span[data-id=coverage_remove]')
          .attr('data-id', 'coverage_remove_' + cov_row)
          .css('display', 'block');

        $html.find('a[data-id=coverage_remove_button]').click(function(e2) {
          $( this ).parents().eq(1).remove();
          ResetColorsPin();
          e2.preventDefault();
        });

        $html.attr('data-id', 'coverage_line_' + cov_row)
        .attr('data-value-item', cov_row);
        
        newCircle(cov_row, prevValue);

        $html.appendTo('.coverage_rows');
        e.preventDefault();

    });

    function ResetColorsPin(){
      
      $("#add_coverage:hidden").show();

      cov_row = $('.coverage_rows .color').each(function(ix, it) {
        $(it).css('background-color', colors_coverage[ix]);
      });

    }

    function newCircle(position, value) {
      var zoom = (15 - (position * 0.4 ));
      map.setZoom(zoom);

      var center = marker.getPosition();

      var radioCircle = new google.maps.Circle({
        strokeColor: colors_coverage[position],
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: colors_coverage[position],
        fillOpacity: 0.2,
        map,
        center: center,
        radius: value,
        draggable:false
      });

      google.maps.event.addListener(radioCircle, 'radius_changed', function (event) {
        console.log('circle radius changed: ' + radioCircle.getRadius());
      });

      // radioCircle.prototype = new google.maps.MVCObject();

      // radioCircle.prototype.center_changed = function() {
      //     console.log('funfou!');
      //     this.set('sizer_position', center);
      // }

      radioCircle.setEditable(true);

      array_Circles.push(radioCircle);

    }
}




