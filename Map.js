import React, { Component } from 'react';
import { View, Image, Button, StatusBar } from 'react-native';
import { ImagePicker, Location, Permissions } from 'expo';
import MapView, { Callout } from 'react-native-maps';
import Lightbox from 'react-native-lightbox';
import geolib from 'geolib';
import _ from 'lodash';

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: null,
      errorMessage: '',
      markers: [],
      lightboxOpen:false,
      isDrawing: false,
      panDrag: [],
      polygon: [],
    };
    this.getCurrentLocation = this.getCurrentLocation.bind(this);
    this.toggleDrawOnMap = this.toggleDrawOnMap.bind(this);
    this.filterMarker = this.filterMarker.bind(this);

    this.drawPolygon = _.throttle(this.drawPolygon, 150);
  }
  componentWillMount() {
    setTimeout(() => {
      this.setState({statusBarHeight: StatusBar.currentHeight});
    }, 500);
  }
  componentDidMount() {
    this.getCurrentLocation();
  }

  async longPress(event) {

    const {coordinate, position } = event;
    let newMarker = {
      coordinate,
      position
    };
    let markers = [...this.state.markers, newMarker];

    this.setState({
      markers: markers
    });
  }

  getCurrentLocation() {
    navigator.geolocation.getCurrentPosition(({coords}) => {
      const myLocation = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      }
      let markMyPlace = {coordinate: myLocation};
      this.setState({
        location: myLocation,
        markers: [markMyPlace]
      });
    });
  }

  toggleDrawOnMap() {
    this.setState({
      isDrawing: !this.state.isDrawing,
      panDrag: [],
      polygon: []
    });
  }

  drawPolygon(coordinate) {
    let newArray = [...this.state.panDrag, {...coordinate}];
    this.setState({
      panDrag: newArray
    });
  }
  panDragMap(e) {
    if (this.state.isDrawing) {
      this.drawPolygon(e.nativeEvent.coordinate);
    }
  }

  filterMarker() {
    let getMarker = this.state.markers.filter(marker => {
      if(geolib.isPointInside(marker.coordinate, this.state.panDrag)) {
        return marker;
      }
    });
    let list = this.state.panDrag.concat(this.state.panDrag[0]);
    this.setState({markers: getMarker,
      polygon: list,
      panDrag: [],
      isDrawing: !this.state.isDrawing
    });
  }

  render() {
    return(
      <View style={{flex: 1, position: 'relative', paddingTop: this.state.statusBarHeight}}>
        <MapView
          style={{flex: 1}}
          initialRegion={this.state.location}
          showsUserLocation={true}
          showsMyLocationButton={true}
          scrollEnabled={!this.state.isDrawing}
          onLongPress={e => this.longPress(e.nativeEvent)}
          onPanDrag={e => this.panDragMap(e)}
        >
          {this.state.markers.map((marker, key) => (
            <MapView.Marker key={key} coordinate={marker.coordinate}>
            </MapView.Marker>
          ))}
          {this.state.panDrag.length > 0 && <MapView.Polyline
            coordinates={this.state.panDrag}
            fillColor='red'
            strokeWidth={2}
            miterLimit={30}
          />}
          {this.state.polygon.length > 0 && <MapView.Polygon
            fillColor='red'
            coordinates={this.state.polygon}
            strokeWidth={2}
            style={{opacity: 0.6}}
          />}
        </MapView>
        <Button
          style={{position: 'absolute', top: 0}}
          title='Daw'
          onPress={this.toggleDrawOnMap}
        />
        <Button
          style={{position: 'absolute', top: 0}}
          title='Get marker inside polygon!'
          onPress={this.filterMarker}
        />
      </View>
    )
  }
}