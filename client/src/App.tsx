import React from "react";
import "./App.css";
import { Route, Switch } from "react-router";
import { BrowserRouter } from "react-router-dom";
import { Home } from "./Home";
import { CreateEvent } from "./Event/CreateEvent";
import { EventPage } from "./Event/EventPage";
import { StompSocketProvider } from "./StompSocketContext";
import { PrimaryNavigation } from "./PrimaryNavigation";

const App: React.FC = () => {
    return (
        <StompSocketProvider>
            <BrowserRouter>
                <div className="App">
                    <div className="App-header">
                        <PrimaryNavigation />
                        <main className="App-content">
                            <Switch>
                                <Route path="/createEvent" component={CreateEvent} />
                                <Route path="/event/:eventId" component={EventPage} />
                                <Route path="/" component={Home} />
                            </Switch>
                        </main>
                    </div>
                </div>
            </BrowserRouter>
        </StompSocketProvider>
    );
};

export default App;
