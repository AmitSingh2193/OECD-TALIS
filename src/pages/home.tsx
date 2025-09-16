import { useEffect } from "react";
import D3BarChart from "../components/charts/D3BarChart";
// import RechartsBarChart from "../components/charts/RechartsBarChart";
import LimeSurvey from "./LimeSurvey/LimeSurvey";
import { useLocation } from "react-router-dom";
import oecd from "../assets/oecd.jpg";
import TalisData from "./TalisData/TalisData";

const Home = () => {
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);

  const country = queryParams.get("country"); // "India"
  const rid = queryParams.get("rid");
  const sid = queryParams.get("sid");

  useEffect(() => {
    if (rid) {
      localStorage.setItem("rid", rid);
    }
  }, [rid]);
  useEffect(() => {
    if (country) {
      localStorage.setItem("country", country);
    }
  }, [country]);
  useEffect(() => {
    if (sid) {
      localStorage.setItem("sid", sid);
    }
  }, [sid]);

  // Sample data for the charts
  const chartData = [
    { age: 20, salary: 30000 },
    { age: 25, salary: 40000 },
    { age: 30, salary: 50000 },
    { age: 35, salary: 60000 },
    { age: 40, salary: 70000 },
  ];

  return (
    <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="w-full bg-white shadow-md">
        <div className="container mx-auto px-4 max-w-6xl">
          <img
            src={oecd}
            alt="OECD"
            style={{ height: "100px", width: "200px", objectFit: "contain" }}
          />
        </div>
      </header>
      <div className="container mx-auto px-4 py-8 max-w-6xl dark:text-white">
        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          <D3BarChart data={chartData} referenceAge={29} />
          {/* <RechartsBarChart data={chartData} referenceAge={29} /> */}
        </div>

        <div>
          <TalisData />
        </div>

        {/* LimeSurvey Section */}
        <div>
          <LimeSurvey />
        </div>
      </div>
    </div>
  );
};

export default Home;