import React from "react";
import "./App.css";
import { Routes, Route } from "react-router";
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

const App: React.FC = () => {
    return (
        <StompSocketProvider>
            <UserContextProvider>
                <BrowserRouter>
                    <div className="App">
                        <div className="App-Container">
                            <PrimaryNavigation />
                            <main className="App-Content">
                                <Routes>
                                    <Route path="/createEvent" element={<CreateEvent />} />
                                    <Route path="/editEvent/:eventId" element={<CreateEvent />} />
                                    <Route path="/event/:eventId" element={<EventPage />} />
                                    <Route path="/about" element={<About />} />
                                    <Route path="/settings" element={<UserSettings />} />
                                    <Route path="/" element={<Home />} />
                                </Routes>
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
