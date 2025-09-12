import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ReactGA from "react-ga4";
import Login from "./pages/login";
import { Provider } from "react-redux";
import { store } from "./state/store";
import Home from "./pages/home";
import { ThemeProvider } from "next-themes";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <Home />,
  },
]);

const GA_ID = import.meta.env.VITE_GA_ID;
ReactGA.initialize(GA_ID);

function App() {
  
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </ThemeProvider>
  );
}

export default App;
