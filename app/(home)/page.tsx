"use client";
import React, { useState, useEffect } from "react";
import {
  Layout,
  Input,
  Card,
  Row,
  Col,
  Spin,
  Switch,
  Divider,
  message,
} from "antd";
import axios from "axios";
import moment from "moment";

const { Header, Content } = Layout;
const { Search } = Input;

const apiKey = "a1342faff3f6848782878d38ed9ba25a"; // Get your API key from OpenWeather API
const defaultCity = "10001"; // Default postal code is New York

// Type definitions for the weather and forecast data structures
interface WeatherData {
  name: string;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  weather: {
    description: string;
  }[];
  main: {
    temp: number;
    temp_max: number;
    temp_min: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number;
  };
}

interface ForecastData {
  dt_txt: string;
  weather: {
    description: string;
  }[];
  main: {
    temp: number;
  };
}

function Home() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [zipCode, setZipCode] = useState(defaultCity);

  useEffect(() => {
    fetchWeatherData(zipCode);
  }, []);

  const fetchWeatherData = async (zip: string) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?zip=${zip}&appid=${apiKey}&units=metric`,
      );
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?zip=${zip},us&appid=${apiKey}&units=metric`,
      );

      setWeatherData(response.data as WeatherData);
      setForecastData(forecastResponse.data.list.slice(0, 7) as ForecastData[]); // 7-day forecast
    } catch (error: any) {
      message.error(`Error: ${error?.response?.data?.message}`);
    }
    setLoading(false);
  };

  const handleSearch = (value: string) => {
    setZipCode(value);
    fetchWeatherData(value);
  };

  return (
    <Layout>
      <Header style={{ color: "white", textAlign: "center", fontSize: "24px" }}>
        Weather Forecast
      </Header>
      <Content style={{ padding: "20px" }}>
        <Search
          placeholder="Enter postal code"
          enterButton="Search"
          size="large"
          onSearch={handleSearch}
          style={{ marginBottom: "20px" }}
        />

        {loading ? (
          <Card
            style={{
              width: "100%",
              height: "80vh",
            }}
          >
            <Spin tip="Loading..." />
          </Card>
        ) : (
          weatherData && (
            <Card
              title={`${weatherData.name}, ${weatherData.sys.country}`}
              bordered={false}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <p>
                    <strong>Current Weather: </strong>
                    {weatherData.weather[0].description}
                  </p>
                  <p>
                    <strong>Current Temperature: </strong>
                    {weatherData.main.temp} °C
                  </p>
                  <p>
                    <strong>Max Temperature: </strong>
                    {weatherData.main.temp_max} °C
                  </p>
                  <p>
                    <strong>Min Temperature: </strong>
                    {weatherData.main.temp_min} °C
                  </p>
                </Col>
                <Col span={12}>
                  <Switch
                    checked={showMore}
                    onChange={() => setShowMore(!showMore)}
                    checkedChildren="Hide More"
                    unCheckedChildren="Show More"
                  />
                  {showMore && (
                    <div style={{ marginTop: "20px" }}>
                      <p>
                        <strong>Wind Speed: </strong>
                        {weatherData.wind.speed} m/s
                      </p>
                      <p>
                        <strong>Humidity: </strong>
                        {weatherData.main.humidity} %
                      </p>
                      <p>
                        <strong>Pressure: </strong>
                        {weatherData.main.pressure} hPa
                      </p>
                      <p>
                        <strong>Sunrise: </strong>
                        {moment.unix(weatherData.sys.sunrise).format("HH:mm")}
                      </p>
                      <p>
                        <strong>Sunset: </strong>
                        {moment.unix(weatherData.sys.sunset).format("HH:mm")}
                      </p>
                    </div>
                  )}
                </Col>
              </Row>
              <Divider />
              <h3>7-Day Forecast</h3>
              <Row gutter={16}>
                {forecastData.map((day, index) => (
                  <Col key={index} span={8}>
                    <Card>
                      <p>
                        <strong>Date: </strong>
                        {moment(day.dt_txt).format("YYYY-MM-DD")}
                      </p>
                      <p>
                        <strong>Weather: </strong>
                        {day.weather[0].description}
                      </p>
                      <p>
                        <strong>Temperature: </strong>
                        {day.main.temp} °C
                      </p>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )
        )}
      </Content>
    </Layout>
  );
}

export default Home;
