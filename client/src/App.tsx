import React from "react";
import "./App.css";
import { User } from "./Users/User";
import { Route, Switch } from "react-router";
import { BrowserRouter } from "react-router-dom";

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <div className="App">
                <main className="App-content">
                    <Switch>
                        <Route path="/">
                            <User />
                            <div>Hello, world</div>
                            <div>v2</div>
                        </Route>
                    </Switch>
                </main>
            </div>
        </BrowserRouter>
    );
};

export default App;
