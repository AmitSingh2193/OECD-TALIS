import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../state/hooks";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import D3BarChart from "../components/charts/D3BarChart";
import RechartsBarChart from "../components/charts/RechartsBarChart";
import LimeSurvey from "./LimeSurvey/LimeSurvey";
import { useLocation } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const { user, credentials } = useAppSelector((state) => state.auth);
  const [, setIsModalOpen] = useState(false);
  const { theme, setTheme } = useTheme();

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
      localStorage.setItem("country", country)
    }
  }, [country]);
  useEffect(() => {
    if (sid) {
      localStorage.setItem("sid", sid)
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
      <div className="container mx-auto px-4 py-8 max-w-6xl dark:text-white">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold dark:text-white">
            Welcome!
          </h1>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          <D3BarChart data={chartData} referenceAge={29} />
          <RechartsBarChart data={chartData} referenceAge={29} />
        </div>

        {/* LimeSurvey Section */}
        <div>
          <LimeSurvey/>
        </div>

        {/* Dashboard Section */}
        <div className="bg-white p-8 rounded-lg shadow-sm w-full max-w-4xl mb-8 dark:bg-gray-800 dark:shadow-gray-900">
          <h2 className="mb-6 text-2xl font-semibold dark:text-white">
            Dashboard
          </h2>
          <p className="mb-6 dark:text-gray-300">
            Welcome to your dashboard. Here are some quick actions:
          </p>

          <div className="flex gap-4 mb-6">
            <PrimaryButton onClick={() => setIsModalOpen(true)}>
              Open Dialog
            </PrimaryButton>
            <PrimaryButton
              onClick={() => navigate("/order-page")}
              variant="outline"
            >
              Go to Orders
            </PrimaryButton>
            <SecondaryButton onClick={() => console.log("Secondary action")}>
              Another Action
            </SecondaryButton>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white p-8 rounded-lg shadow-sm w-full max-w-4xl mb-8 dark:bg-gray-800 dark:shadow-gray-900">
          <h2 className="mb-6 text-2xl font-semibold dark:text-white">
            Frequently Asked Questions
          </h2>

         

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="mb-4 text-lg font-medium dark:text-white">
              Your Account
            </h3>
            <p className="dark:text-gray-300">Email:</p>
          </div>
          <p className="dark:text-gray-300">Password: </p>

          <div className="flex gap-4 mt-4">
            <PrimaryButton
              onClick={() => navigate("/order-test")}
              className="flex-1"
            >
              Order a Test
            </PrimaryButton>
            <PrimaryButton
              onClick={() => navigate("/profile")}
              variant="outline"
              className="flex-1"
            >
              Go to Profile
            </PrimaryButton>
            <SecondaryButton
              onClick={() => navigate("/logout")}
              className="flex-1"
              variant="danger"
            >
              Logout
            </SecondaryButton>
          </div>
        </div>

        {/* Sample Dialog */}
      
      </div>
    </div>
  );
};

export default Home;
