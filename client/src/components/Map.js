import React, { useRef, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { Button, Container, Table, Row, Col } from "react-bootstrap";
import { format } from "date-fns";
import L from "leaflet";

const BASE_URL = "http://localhost:3001";
const customIcon = new L.Icon({
  iconUrl: process.env.PUBLIC_URL + "/marker.png",
  iconSize: [48, 48],
  iconAnchor: [16, 32],
});

const Map = () => {
  const mapRef = useRef();
  const initialPosition = [51.505, -0.09];
  const [position, setPosition] = useState(initialPosition);
  const [downloadData, setDownloadData] = useState(null);
  const [points, setPoints] = useState(null);

  // Required command to reach point-position
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo(position, 10);
    }
  }, [position]);

  const handleMarkerPoint = ({ lat, lng }) => {
    setPosition([lat, lng]);
  };

  // Required command to reach data
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/data`);
      const formattedPoints = response.data.map((point) => ({
        ...point,
        lat: parseFloat(point.lat).toFixed(5),
        lng: parseFloat(point.lng).toFixed(5),
        datetime: format(new Date(point.datetime), "dd.MM.yyyy HH:mm:ss"),
      }));
      setPoints(formattedPoints);
      setDownloadData(JSON.stringify(formattedPoints));
    } catch (error) {
      console.error("No Data", error);
    }
  };

  // function to wait for map center
  const getMapCenter = () => {
    if (mapRef.current) {
      const map = mapRef.current;
      const center = map.getCenter();
      const [lat, lng] = Object.values(center);
      axios.post(`${BASE_URL}/api/data`, { lat, lng });
    }
  };

  // required function to delete point
  const handleDeletePoint = (index) => {
    if (points !== null) {
      const newPoints = [...points];
      newPoints.splice(index, 1);
      setPoints(newPoints);
    }
  };

  // Function to handle the download action
  const handleDownload = () => {
    if (downloadData !== null) {
      const blob = new Blob([downloadData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "points.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Container className="pt-4 text-center">
      <h1 className="">Map App</h1>
      <Row>
        {/* Map */}
        <Col className="mx-auto">
          <MapContainer
            ref={mapRef}
            center={position}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: "550px", width: "550px" }}
            touchZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position} icon={customIcon}>
              <Popup>Selected Point</Popup>
            </Marker>
          </MapContainer>
          <Button
            variant="primary"
            className="mt-2 w-full"
            onClick={getMapCenter}
          >
            Add Point
          </Button>
        </Col>
        {/* Point List */}
        <Col className="mx-auto">
          <div>
            {points !== null ? (
              <div>
                <Table bordered className="mt-4">
                  <thead>
                    <tr>
                      <th>Point</th>
                      <th>Lat</th>
                      <th>Lng</th>
                      <th>Datetime</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {points.map((point, index) => (
                      <tr key={index}>
                        <td>
                          <Button
                            variant="link"
                            onClick={() => handleMarkerPoint(point)}
                          >
                            Point {index + 1}
                          </Button>
                        </td>
                        <td>{point.lat}</td>
                        <td>{point.lng}</td>
                        <td>{point.datetime}</td>
                        <td>
                          <Button
                            variant="danger"
                            onClick={() => handleDeletePoint(index)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {/* Add the download button */}
                <Button
                  variant="primary"
                  onClick={handleDownload}
                  className="mt-4"
                >
                  Download JSON
                </Button>
              </div>
            ) : (
              <p>No points have been added yet.</p>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Map;
