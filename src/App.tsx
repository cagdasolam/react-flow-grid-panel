import ReactFlowGridSystem from "./components/ReactFlowGridSystem";
import "./styles/gridSystem.css";

function App() {
  return (
    <div className="app">
      <ReactFlowGridSystem
        availableNodes={[
          { imageUrl: "image1.jpg", label: "Node 1", isRoot: false },
          { imageUrl: "image2.jpg", label: "Node 2", isRoot: false },
          { imageUrl: "image3.jpg", label: "Master", isRoot: true },
        ]}
      />
    </div>
  );
}

export default App;
