// src/pages/Results.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Calendar, Heart, ArrowLeft, Info } from "lucide-react";

type Nullable<T> = T | undefined | null;

interface ItineraryDay {
  day?: number;
  theme?: string;
  morning?: { title?: string; description?: string } | string;
  afternoon?: { title?: string; description?: string } | string;
  evening?: { title?: string; description?: string } | string;
  food_recommendations?: { breakfast?: string; lunch?: string; dinner?: string };
  local_tips?: string;
}

interface FullItinerary {
  trip_name?: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  budget?: string;
  interests?: string[];
  research?: any;
  itinerary?: ItineraryDay[];
}

const Results = () => {
  const navigate = useNavigate();
  const [itineraryObj, setItineraryObj] = useState<FullItinerary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showResearch, setShowResearch] = useState(false);

  useEffect(() => {
    const storedForm = sessionStorage.getItem("itineraryData");
    const raw = sessionStorage.getItem("generatedItinerary");

    if (!storedForm) {
      navigate("/");
      return;
    }

    if (!raw) {
      setErrorMessage("No generated itinerary found. Please generate one first.");
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      setItineraryObj(parsed);
    } catch (e) {
      setErrorMessage("Invalid itinerary data format.");
    }
  }, [navigate]);

  if (errorMessage) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-16">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p className="text-muted-foreground">{errorMessage}</p>
            <Button className="mt-6" onClick={() => navigate("/")}>Back</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!itineraryObj) return null;

  const interests = Array.isArray(itineraryObj.interests) && itineraryObj.interests.length > 0
    ? itineraryObj.interests.join(", ")
    : "—";

  const days: ItineraryDay[] = Array.isArray(itineraryObj.itinerary) ? itineraryObj.itinerary : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-4xl space-y-8">
          <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Button>

          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold">{itineraryObj.trip_name || "Your Itinerary"}</h1>
            <p className="text-lg text-muted-foreground">A personalized AI-generated travel plan</p>
          </div>

          {/* ✨ NEW SECTION — RESEARCH DATA */}
          {itineraryObj.research && (
            <Card className="p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Info className="h-6 w-6 text-primary" />
                  Destination Research & Cultural Guide
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setShowResearch(!showResearch)}
                >
                  {showResearch ? "Hide" : "Show"}
                </Button>
              </div>

              {showResearch && (
                <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">

                  {Object.entries(itineraryObj.research).map(([key, val]) => (
                    <div key={key}>
                      <p className="font-semibold text-foreground capitalize">
                        {key.replace(/_/g, " ")}:
                      </p>
                      {Array.isArray(val) ? (
                        <ul className="list-disc ml-6">
                          {val.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>{String(val)}</p>
                      )}
                    </div>
                  ))}

                </div>
              )}
            </Card>
          )}
          
          {/* Trip Summary */}
          <Card className="p-6 shadow-md space-y-6">
            <h2 className="text-2xl font-bold">Trip Summary</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <p className="font-semibold">{itineraryObj.destination || "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-semibold">{itineraryObj.budget || "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Dates</p>
                  <p className="font-semibold">
                    {itineraryObj.start_date || "—"} → {itineraryObj.end_date || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Interests</p>
                  <p className="font-semibold">{interests}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Daily Itinerary (unchanged) */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold">Daily Itinerary</h2>
            {!days || days.length === 0 ? (
              <Card className="p-6"><p className="text-muted-foreground">No daily items found in the AI response.</p></Card>
            ) : (
              days.map((d, idx) => {
                const dayNum = d?.day ?? idx + 1;
                return (
                  <Card key={dayNum} className="p-6 shadow-md space-y-4">
                    <h3 className="text-2xl font-bold">Day {dayNum}{d?.theme ? `: ${d.theme}` : ""}</h3>
                    {d.morning && typeof d.morning === "object" && (
                      <div>
                        <p className="font-semibold text-lg">🌅 Morning: {d.morning.title || ""}</p>
                        <p className="text-muted-foreground">{d.morning.description || ""}</p>
                      </div>
                    )}
                    {d.afternoon && typeof d.afternoon === "object" && (
                      <div>
                        <p className="font-semibold text-lg">🌞 Afternoon: {d.afternoon.title || ""}</p>
                        <p className="text-muted-foreground">{d.afternoon.description || ""}</p>
                      </div>
                    )}
                    {d.evening && typeof d.evening === "object" && (
                      <div>
                        <p className="font-semibold text-lg">🌙 Evening: {d.evening.title || ""}</p>
                        <p className="text-muted-foreground">{d.evening.description || ""}</p>
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Results;
