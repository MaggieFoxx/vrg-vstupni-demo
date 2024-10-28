import MapComponent from "./MapComponent";
import "./index.css";
import Navbar from "./Navbar";

function App() {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <MapComponent />
    </div>
  );
}

export default App;
