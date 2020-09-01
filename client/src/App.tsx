import React from "react";
import "./App.css";
import { Route, Switch } from "react-router";
import { BrowserRouter } from "react-router-dom";
import { Home } from "./Home";
import { CreateEvent } from "./Events/CreateEvent";
import { EventPage } from "./Events/EventPage";

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <div className="App">
                <main className="App-content">
                    <Switch>
                        <Route path="/createEvent" component={CreateEvent} />
                        <Route path="/event/:eventId" component={EventPage} />
                        <Route path="/" component={Home} />
                    </Switch>
                </main>
            </div>
        </BrowserRouter>
    );
};

export default App;
