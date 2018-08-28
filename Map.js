import React, { Component } from 'react';
import { View, Image, Button, StatusBar } from 'react-native';
import { ImagePicker, Location, Permissions } from 'expo';
import MapView, { Callout } from 'react-native-maps';
import Lightbox from 'react-native-lightbox';
import geolib from 'geolib';

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: null,
      errorMessage: '',
      markers: [],
      lightboxOpen:false,
      isDrawing: false,
      panDrag: []
    };
    this.getCurrentLocation = this.getCurrentLocation.bind(this);
    this.toggleDrawOnMap = this.toggleDrawOnMap.bind(this);
    this.filterMarker = this.filterMarker.bind(this);
  }
  componentWillMount() {
    setTimeout(() => {
      this.setState({statusBarHeight: StatusBar.currentHeight})}, 500);
  }
  componentDidMount() {
    this.getCurrentLocation();
  }

  async longPress(event) {
    const { Permissions } = Expo;
    await Expo.Permissions.askAsync(Permissions.CAMERA_ROLL);
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false
    });

    const {coordinate, position } = event;
    let newMarker = {
      coordinate,
      position,
      image: result.uri
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
    this.setState({isDrawing: !this.state.isDrawing});
  }

  panDragMap(coordinate) {
    if (this.state.isDrawing) {
      let newArray = [...this.state.panDrag, {...coordinate}];
      this.setState({
        panDrag: newArray
      });
    }
  }

  filterMarker() {
    let getMarker = this.state.markers.filter(marker => {
      if(geolib.isPointInside(marker.coordinate, this.state.panDrag)) {
        return marker;
      }
    });
    console.log(getMarker);
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
          onPanDrag={e => this.panDragMap(e.nativeEvent.coordinate)}
        >
          {this.state.markers.map((marker, key) => (
            <MapView.Marker key={key} coordinate={marker.coordinate}>
              <Callout>
                {marker.image &&
                  <Lightbox>
                    <Image
                      style={{resizeMode: 'center', width: 100, height: 200}}
                      source={{ uri: marker.image }}/>
                  </Lightbox>
                }
              </Callout>
            </MapView.Marker>
          ))}
          {this.state.panDrag.length > 0 && <MapView.Polygon
            coordinates={this.state.panDrag}
            fillColor='red'
            strokeWidth={3}
            miterLimit={30}
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