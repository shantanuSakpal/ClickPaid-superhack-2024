"use client";

import { useEffect, useState } from 'react';
import { PriceServiceConnection } from "@pythnetwork/price-service-client";

const PriceConverter = () => {
  const connection = new PriceServiceConnection("https://hermes.pyth.network");

  const priceId = "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"; // ETH/USD price id

  const [ethPrice, setEthPrice] = useState(0);
  const [usdInput, setUsdInput] = useState('');
  const [ethInput, setEthInput] = useState('');

  const fetchPrices = async () => {
    try {
      const currentPrices = await connection.getLatestPriceFeeds([priceId]);
      const ethPriceData = currentPrices[0].price; // Get the price object

      // Extract the price value and convert to a usable format
      const priceValue = parseFloat(ethPriceData.price) / 1e8; // Convert from integer to float (assuming price is in smallest unit)
      setEthPrice(priceValue);
      console.log(currentPrices);
    } catch (error) {
      console.error("Error fetching prices:", error);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 15000); // Fetch every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const handleUsdChange = (e) => {
    const value = e.target.value;
    setUsdInput(value);
    if (value) {
      setEthInput((value / ethPrice).toFixed(6)); // Convert USD to ETH
    } else {
      setEthInput('');
    }
  };

  const handleEthChange = (e) => {
    const value = e.target.value;
    setEthInput(value);
    if (value) {
      setUsdInput((value * ethPrice).toFixed(2)); // Convert ETH to USD
    } else {
      setUsdInput('');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Price Converter</h1>
      <div className="mt-4">
        <label className="block mb-2">USD:</label>
        <input
          type="number"
          value={usdInput}
          onChange={handleUsdChange}
          className="border p-2 w-full"
          placeholder="Enter amount in USD"
        />
      </div>
      <div className="mt-4">
        <label className="block mb-2">ETH:</label>
        <input
          type="number"
          value={ethInput}
          onChange={handleEthChange}
          className="border p-2 w-full"
          placeholder="Enter amount in ETH"
        />
      </div>
      <div className="mt-4">
        <p className="font-semibold">Current ETH Price:</p>
        <p>1 ETH: ${ethPrice.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default PriceConverter;