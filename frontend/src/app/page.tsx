"use client";
import OrderBookSection from "../components/OrderBookSection";
import { useEffect, useState } from "react";
// import Chart from "react-apexcharts";
import axios from "axios";
import { CandlestickData } from "@/interfaces/CandlestickData";
import { v4 as uuidv4 } from "uuid";

import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function Home() {
  const chartOptions: ApexCharts.ApexOptions = {
    title: {
      text: "ETH/USDT",
      style: {
        color: "white",
      },
    },
    chart: {
      type: "candlestick",
    },
    xaxis: {
      type: "datetime",
      labels: {
        datetimeFormatter: {
          year: "yyyy",
          month: "MMM yyyy",
          day: "dd MMM",
          hour: "HH:mm",
        },
      },
    },
  };

  const [series, setSeries] = useState<CandlestickData[]>([]);
  const [historicalDataHasBeenFetched, setHistoricalDataHasBeenFetched] =
    useState<boolean>(false);

  const [lastCandlestickTimestamp, setLastCandlestickTimestamp] =
    useState<Date>();
  const [lastCandlestickData, setLastCandlesitckData] =
    useState<CandlestickData>();

  const fetchHistoricalData = async () => {
    try {
      const endTime = Date.now();
      const startTime = endTime - 1 * 60 * 60 * 1000; // 1 hours ago

      const response = await axios.get(
        `https://api.binance.com/api/v1/klines?symbol=ETHUSDT&interval=1m&startTime=${startTime}&endTime=${endTime}`
      );
      // Data format: [timestamp, open, high, low, close]
      const formattedData: CandlestickData[] = response.data.map(
        (candle: number[]) => ({
          x: new Date(candle[0]),
          y: [candle[1], candle[2], candle[3], candle[4]],
        })
      );

      setSeries(formattedData);
      if (formattedData.length > 0) {
        setLastCandlestickTimestamp(formattedData[formattedData.length - 1].x);
      }
    } catch (error) {
      console.error("Error fetching historical data:", error);
    }
  };

  // initiate session id
  useEffect(() => {
    const sessionId = localStorage.getItem("sessionId");

    if (!sessionId) {
      const uniqueId = uuidv4();
      localStorage.setItem("sessionId", uniqueId);
    }
  }, []);

  useEffect(() => {
    fetchHistoricalData().then(() => setHistoricalDataHasBeenFetched(true));
  }, []);

  useEffect(() => {
    if (historicalDataHasBeenFetched) {
      const socket = new WebSocket(
        "wss://stream.binance.com:9443/ws/ethusdt@kline_1m"
      );

      socket.onopen = () => {
        console.log("Binance WebSocket connected");
      };

      socket.onerror = (error) => {
        console.error("Binance WebSocket error:", error);
      };

      socket.onmessage = (message) => {
        const candle = JSON.parse(message.data);
        const newRealTimeData = {
          x: new Date(candle.k.t),
          y: [
            parseFloat(candle.k.o),
            parseFloat(candle.k.h),
            parseFloat(candle.k.l),
            parseFloat(candle.k.c),
          ],
        };
        setLastCandlesitckData(newRealTimeData);

        if (
          lastCandlestickTimestamp &&
          newRealTimeData.x > lastCandlestickTimestamp
        ) {
          // A new candlestick interval has started, add it to historical data
          setSeries((prevData) => [...prevData, newRealTimeData]);
          setLastCandlestickTimestamp(newRealTimeData.x);
        } else {
          // Update the last candlestick in historical data with new real-time data
          if (series.length > 0) {
            const lastHistoricalDataIndex = series.length - 1;
            const updatedLastCandlestick = {
              ...series[lastHistoricalDataIndex],
              y: newRealTimeData.y,
            };
            setSeries((prevData) => {
              const newData = [...prevData];
              newData[lastHistoricalDataIndex] = updatedLastCandlestick;
              return newData;
            });
          }
        }
      };

      return () => {
        socket.close();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastCandlestickTimestamp, historicalDataHasBeenFetched]);

  return (
    <div className="flex gap-4 w-screen p-2">
      <div className="w-2/3">
        <Chart
          options={chartOptions}
          series={[{ data: series }]}
          type="candlestick"
        />
      </div>
      <OrderBookSection currentPrice={lastCandlestickData?.y[3] ?? 0} />
    </div>
  );
}
