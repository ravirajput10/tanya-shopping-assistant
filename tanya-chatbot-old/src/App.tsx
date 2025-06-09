import "./App.css";
import TanyaShoppingAssistantStream from "./components/tanya-widget/tanya-shopping-assistent";

function App() {
  return (
    <div className="app-container ">
      <main className="bg-white px-4 w-full min-h-screen rounded-l-[3vw] py-6">
        {/* Shopping Assistant Popover */}
        <div className="right-3 bottom-5 z-50">
          <TanyaShoppingAssistantStream />
        </div>
      </main>
    </div>
  );
}

export default App;
