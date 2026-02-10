import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Marker } from "react-native-maps";

const DraggableMarker = ({
  markerPosition,
  setMarkerPosition,
}: {
  markerPosition: any;
  setMarkerPosition: any;
}) => {
  return (
    <Marker
      coordinate={markerPosition}
      onDragEnd={(e) => {
        const newCoord = e.nativeEvent.coordinate;
        setMarkerPosition(newCoord);
      }}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={true}
      draggable
    >
      <View
        style={{
          width: 40,
          height: 60,
        }}
      >
        <Image
          style={{ width: 40, height: 60 }}
          source={require("@/assets/icons/markerSelector.svg")}
          contentFit="contain"
        />
      </View>
    </Marker>
  );
};

export default DraggableMarker;

const styles = StyleSheet.create({});
