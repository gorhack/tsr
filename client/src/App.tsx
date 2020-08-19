import React from "react";
import "./App.css";
import { User } from "./Users/User";
import { Route, Switch } from "react-router";
import { BrowserRouter } from "react-router-dom";
import { Home } from "./Home";
import { CreateEvent } from "./Events/CreateEvent";

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <div className="App">
                <main className="App-content">
                    <Switch>
                        <Route path="/createEvent">
                            <CreateEvent />
                        </Route>
                        <Route path="/">
                            <User />
                            <Home />
                        </Route>
                    </Switch>
                </main>
            </div>
        </BrowserRouter>
    );
};

export default App;
