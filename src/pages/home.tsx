import { useEffect } from "react";
// import RechartsBarChart from "../components/charts/RechartsBarChart";
import LimeSurvey from "./LimeSurvey/LimeSurvey";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
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

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header */}
      <Header />

      <div>
        <TalisData />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl dark:text-white">
        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          {/* <RechartsBarChart data={chartData} referenceAge={29} /> */}
        </div>

        {/* LimeSurvey Section */}
        <div className="text-left">
          <LimeSurvey />
        </div>
      </div>
    </div>
  );
};

export default Home;
