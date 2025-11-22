// src/pages/Results.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Calendar, Heart, ArrowLeft } from "lucide-react";

interface ItineraryDay {
  day: number;
  theme?: string;
  morning?: { title?: string; description?: string };
  afternoon?: { title?: string; description?: string };
  evening?: { title?: string; description?: string };
  food_recommendations?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  local_tips?: string;
}

interface FullItinerary {
  trip_name?: string;
  destination?: string;
  duration_days?: number;
  budget?: string;
  interests?: string[];
  itinerary?: ItineraryDay[];
}

const Results = () => {
  const navigate = useNavigate();
  const [itineraryObj, setItineraryObj] = useState<FullItinerary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const rawItinerary = sessionStorage.getItem("generatedItinerary");
    const formDataRaw = sessionStorage.getItem("itineraryData");

    if (!formDataRaw) {
      navigate("/");
      return;
    }

    if (!rawItinerary) {
      setErrorMessage("No itinerary found. Please generate one first.");
      return;
    }

    // Try to parse the saved string into an object.
    // AI output may already be valid JSON string, or it may be an escaped JSON.
    let parsed: any = null;

    try {
      // If it's already an object string like {"trip_name": ...}
      parsed = JSON.parse(rawItinerary);
    } catch {
      // If parse failed, maybe rawItinerary has extra characters, try to extract JSON substring
      try {
        const first = rawItinerary.indexOf("{");
        const last = rawItinerary.lastIndexOf("}");
        if (first !== -1 && last !== -1 && last > first) {
          const sub = rawItinerary.slice(first, last + 1);
          parsed = JSON.parse(sub);
        } else {
          // Could be plain text itinerary — set a fallback object
          parsed = {
            trip_name: "Generated Itinerary",
            destination: undefined,
            itinerary: [
              {
                day: 1,
                theme: "Itinerary (raw text)",
                morning: { title: "", description: rawItinerary }
              }
            ]
          };
        }
      } catch (e) {
        parsed = {
          trip_name: "Generated Itinerary",
          itinerary: [
            { day: 1, theme: "Itinerary (raw)", morning: { title: "", description: rawItinerary } }
          ]
        };
      }
    }

    // If parsed has a top-level content.parts[0].text (rare), unwrap it
    if (parsed?.content?.[0]?.parts?.[0]?.text) {
      const inner = parsed.content[0].parts[0].text;
      try {
        const innerParsed = JSON.parse(inner);
        parsed = innerParsed;
      } catch {
        // leave as-is: treat inner text as description
        parsed = {
          trip_name: parsed.trip_name || "Generated Itinerary",
          itinerary: [{ day: 1, theme: "Itinerary (raw)", morning: { title: "", description: inner } }]
        };
      }
    }

    setItineraryObj(parsed);
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

  const interests = Array.isArray(itineraryObj?.interests) ? itineraryObj.interests.join(", ") : "N/A";

  const days = Array.isArray(itineraryObj?.itinerary) ? itineraryObj.itinerary : [];

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

          <Card className="p-6 shadow-md space-y-6">
            <h2 className="text-2xl font-bold">Trip Summary</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <p className="font-semibold">{itineraryObj.destination || "To be determined"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-semibold">{itineraryObj.budget || "Flexible"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">{itineraryObj.duration_days || "—"} Days</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Interests</p>
                  <p className="font-semibold">{interests || "—"}</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-8">
            <h2 className="text-3xl font-bold">Daily Itinerary</h2>

            {!days || days.length === 0 ? (
              <Card className="p-6">
                <p className="text-muted-foreground">No daily items found in the AI response.</p>
              </Card>
            ) : (
              days.map((d, idx) => {
                const dayNum = d?.day ?? idx + 1;
                return (
                  <Card key={dayNum} className="p-6 shadow-md space-y-4">
                    <h3 className="text-2xl font-bold">Day {dayNum}{d?.theme ? `: ${d.theme}` : ""}</h3>

                    {d.morning && (
                      <div>
                        <p className="font-semibold text-lg">🌅 Morning: {d.morning.title || ""}</p>
                        <p className="text-muted-foreground">{d.morning.description || ""}</p>
                      </div>
                    )}

                    {d.afternoon && (
                      <div>
                        <p className="font-semibold text-lg">🌞 Afternoon: {d.afternoon.title || ""}</p>
                        <p className="text-muted-foreground">{d.afternoon.description || ""}</p>
                      </div>
                    )}

                    {d.evening && (
                      <div>
                        <p className="font-semibold text-lg">🌙 Evening: {d.evening.title || ""}</p>
                        <p className="text-muted-foreground">{d.evening.description || ""}</p>
                      </div>
                    )}

                    {d.food_recommendations && (
                      <div>
                        <p className="font-semibold text-lg">🍽 Food Recommendations</p>
                        <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
                          {d.food_recommendations.breakfast && <li><strong>Breakfast:</strong> {d.food_recommendations.breakfast}</li>}
                          {d.food_recommendations.lunch && <li><strong>Lunch:</strong> {d.food_recommendations.lunch}</li>}
                          {d.food_recommendations.dinner && <li><strong>Dinner:</strong> {d.food_recommendations.dinner}</li>}
                        </ul>
                      </div>
                    )}

                    {d.local_tips && (
                      <div>
                        <p className="font-semibold text-lg">💡 Local Tips</p>
                        <p className="text-muted-foreground">{d.local_tips}</p>
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
