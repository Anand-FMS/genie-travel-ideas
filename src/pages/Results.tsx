// src/pages/Results.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Calendar, Heart, ArrowLeft } from "lucide-react";

/* ---------------- TYPES ---------------- */

interface ItineraryDay {
  day?: number;
  theme?: string;
  morning?: string;
  afternoon?: string;
  evening?: string;
}

interface FullItinerary {
  trip_name?: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  budget?: string;
  interests?: string[];
  itinerary?: ItineraryDay[];
}

/* ---------------- COMPONENT ---------------- */

const Results = () => {
  const navigate = useNavigate();
  const [itineraryObj, setItineraryObj] = useState<FullItinerary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    const raw = sessionStorage.getItem("generatedItinerary");

    console.log("RAW generatedItinerary:", raw);

    if (!raw) {
      setErrorMessage("No generated itinerary found. Please generate one first.");
      return;
    }

    try {
      const parsed = JSON.parse(raw);

      let payload: any = null;

      // Case 1: Array response (n8n default)
      if (Array.isArray(parsed)) {
        payload = parsed[0];
      }
      // Case 2: Object response
      else if (typeof parsed === "object") {
        payload = parsed;
      }

      if (!payload) {
        throw new Error("Invalid payload structure");
      }

      // Case A: itinerary is STRING (stringified JSON)
      const itineraryString =
        payload["itinerary "] || payload["itinerary"];

      if (typeof itineraryString === "string") {
        const itineraryJson = JSON.parse(itineraryString);
        setItineraryObj(itineraryJson);
        return;
      }

      // Case B: itinerary already parsed (best case)
      if (payload.itinerary && Array.isArray(payload.itinerary)) {
        setItineraryObj(payload);
        return;
      }

      throw new Error("Unsupported response structure");
    } catch (err) {
      console.error("Parsing error:", err);
      setErrorMessage("Unexpected response format from server.");
    }
  }, []);

  /* ---------------- ERROR STATE ---------------- */

  if (errorMessage) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-16">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p className="text-muted-foreground">{errorMessage}</p>
            <Button className="mt-6" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!itineraryObj) return null;

  /* ---------------- DERIVED VALUES ---------------- */

  const interests =
    Array.isArray(itineraryObj.interests) && itineraryObj.interests.length > 0
      ? itineraryObj.interests.join(", ")
      : "—";

  const days = Array.isArray(itineraryObj.itinerary)
    ? itineraryObj.itinerary
    : [];

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-4xl space-y-8">

          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Button>

          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold">
              {itineraryObj.trip_name || "Your Itinerary"}
            </h1>
            <p className="text-lg text-muted-foreground">
              A personalized AI-generated travel plan
            </p>
          </div>

          {/* -------- Trip Summary -------- */}

          <Card className="p-6 shadow-md space-y-6">
            <h2 className="text-2xl font-bold">Trip Summary</h2>

            <div className="grid md:grid-cols-2 gap-6">

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <p className="font-semibold">
                    {itineraryObj.destination || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-semibold">
                    {itineraryObj.budget || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dates</p>
                  <p className="font-semibold">
                    {itineraryObj.start_date || "—"} →{" "}
                    {itineraryObj.end_date || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Interests</p>
                  <p className="font-semibold">{interests}</p>
                </div>
              </div>

            </div>
          </Card>

          {/* -------- Daily Itinerary -------- */}

          <div className="space-y-8">
            <h2 className="text-3xl font-bold">Daily Itinerary</h2>

            {days.length === 0 ? (
              <Card className="p-6">
                <p className="text-muted-foreground">
                  No daily items found in the AI response.
                </p>
              </Card>
            ) : (
              days.map((day, idx) => (
                <Card key={idx} className="p-6 shadow-md space-y-4">
                  <h3 className="text-2xl font-bold">
                    Day {day.day || idx + 1}
                    {day.theme ? ` – ${day.theme}` : ""}
                  </h3>

                  {day.morning && (
                    <p className="text-muted-foreground">
                      🌅 <strong>Morning:</strong> {day.morning}
                    </p>
                  )}

                  {day.afternoon && (
                    <p className="text-muted-foreground">
                      🌞 <strong>Afternoon:</strong> {day.afternoon}
                    </p>
                  )}

                  {day.evening && (
                    <p className="text-muted-foreground">
                      🌙 <strong>Evening:</strong> {day.evening}
                    </p>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Results;
