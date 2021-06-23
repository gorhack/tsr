import React from "react";
import "./App.css";
import { Route, Switch } from "react-router";
import { BrowserRouter } from "react-router-dom";
import { Home } from "./Home";
import { CreateEvent } from "./Event/CreateEvent";
import { EventPage } from "./Event/EventPage";
import { StompSocketProvider } from "./StompSocketContext";
import { PrimaryNavigation } from "./Navigation/PrimaryNavigation";
import { Footer } from "./Navigation/Footer";
import { About } from "./About";
import { UserSettings } from "./Users/UserSettings";
import { UserContextProvider } from "./Users/UserContext";
import OrganizationSettings from "./Organization/OrganizationSettings";

const App: React.FC = () => {
    return (
        <StompSocketProvider>
            <UserContextProvider>
                <BrowserRouter>
                    <div className="App">
                        <div className="App-Container">
                            <PrimaryNavigation />
                            <main className="App-Content">
                                <Switch>
                                    <Route path="/createEvent" component={CreateEvent} />
                                    <Route path="/editEvent/:eventId" component={CreateEvent} />
                                    <Route path="/event/:eventId" component={EventPage} />
                                    <Route path="/about" component={About} />
                                    <Route
                                        path="/organization/:organizationId"
                                        component={OrganizationSettings}
                                    />
                                    <Route path="/settings" component={UserSettings} />
                                    <Route path="/" component={Home} />
                                </Switch>
                            </main>
                            <Footer />
                        </div>
                    </div>
                </BrowserRouter>
            </UserContextProvider>
        </StompSocketProvider>
    );
};

export default App;
