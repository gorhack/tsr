import React from "react";
import "./App.css";
import {User} from "./Users/User";

const App: React.FC = () => {
    return (
        <div className="App">
            <main className="App-content">
                <User />
                <div>Hello, world</div>
                <div>v2</div>
            </main>
        </div>
    );
};

export default App;
