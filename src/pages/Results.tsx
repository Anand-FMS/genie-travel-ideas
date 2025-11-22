import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Calendar, Heart, ArrowLeft } from "lucide-react";

interface ItineraryDay {
  day: number;
  theme: string;
  morning: { title: string; description: string };
  afternoon: { title: string; description: string };
  evening: { title: string; description: string };
  food_recommendations: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  local_tips: string;
}

interface FullItinerary {
  trip_name: string;
  destination: string;
  duration_days: number;
  budget: string;
  interests: string[];
  itinerary: ItineraryDay[];
}

const Results = () => {
  const navigate = useNavigate();

  const [itineraryData, setItineraryData] = useState<any>(null);
  const [itineraryObj, setItineraryObj] = useState<FullItinerary | null>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem("itineraryData");
    const rawItinerary = sessionStorage.getItem("generatedItinerary");

    if (!storedData || !rawItinerary) {
      navigate("/");
      return;
    }

    setItineraryData(JSON.parse(storedData));

    // Parse formatted JSON itinerary returned from Gemini
    try {
      setItineraryObj(JSON.parse(rawItinerary));
    } catch (e) {
      console.error("Parsing error:", e);
    }
  }, [navigate]);

  if (!itineraryData || !itineraryObj) return null;

  // Defensive check: ensure itinerary is an array and filter out any undefined entries
  const validItinerary = Array.isArray(itineraryObj.itinerary) 
    ? itineraryObj.itinerary.filter((day: ItineraryDay | undefined) => day !== undefined && day !== null)
    : [];

  if (validItinerary.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-16">
          <div className="container mx-auto px-4 max-w-4xl text-center space-y-6">
            <h1 className="text-3xl font-bold">No Itinerary Data</h1>
            <p className="text-muted-foreground">The AI response format was unexpected. Please try generating again.</p>
            <Button onClick={() => navigate('/')}>Back to Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-4xl space-y-10">

          {/* Back Button */}
          <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Button>

          {/* Page Title */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">{itineraryObj.trip_name}</h1>
            <p className="text-lg text-muted-foreground">
              A personalized AI-generated travel plan
            </p>
          </div>

          {/* SUMMARY */}
          <Card className="p-6 shadow-md space-y-6">
            <h2 className="text-2xl font-bold">Trip Summary</h2>

            <div className="grid md:grid-cols-2 gap-6">

              {/* Destination */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <p className="font-semibold">{itineraryObj.destination}</p>
                </div>
              </div>

              {/* Budget */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-semibold">{itineraryObj.budget}</p>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">{itineraryObj.duration_days} Days</p>
                </div>
              </div>

              {/* Interests */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Interests</p>
                  <p className="font-semibold">
                    {itineraryObj.interests.join(", ")}
                  </p>
                </div>
              </div>

            </div>
          </Card>

          {/* ITINERARY */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold">Daily Itinerary</h2>

            {validItinerary.map((day: ItineraryDay) => (
              <Card key={day.day} className="p-6 shadow-md space-y-5">

                <h3 className="text-2xl font-bold">
                  Day {day.day}: {day.theme}
                </h3>

                <div className="space-y-4">

                  {/* Morning */}
                  {day.morning && (
                    <div>
                      <p className="font-semibold text-lg">🌅 Morning: {day.morning.title}</p>
                      <p className="text-muted-foreground">{day.morning.description}</p>
                    </div>
                  )}

                  {/* Afternoon */}
                  {day.afternoon && (
                    <div>
                      <p className="font-semibold text-lg">🌞 Afternoon: {day.afternoon.title}</p>
                      <p className="text-muted-foreground">{day.afternoon.description}</p>
                    </div>
                  )}

                  {/* Evening */}
                  {day.evening && (
                    <div>
                      <p className="font-semibold text-lg">🌙 Evening: {day.evening.title}</p>
                      <p className="text-muted-foreground">{day.evening.description}</p>
                    </div>
                  )}

                  {/* Food */}
                  {day.food_recommendations && (
                    <div>
                      <p className="font-semibold text-lg">🍽 Food Recommendations</p>
                      <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
                        {day.food_recommendations.breakfast && (
                          <li><strong>Breakfast:</strong> {day.food_recommendations.breakfast}</li>
                        )}
                        {day.food_recommendations.lunch && (
                          <li><strong>Lunch:</strong> {day.food_recommendations.lunch}</li>
                        )}
                        {day.food_recommendations.dinner && (
                          <li><strong>Dinner:</strong> {day.food_recommendations.dinner}</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Tips */}
                  {day.local_tips && (
                    <div>
                      <p className="font-semibold text-lg">💡 Local Tips</p>
                      <p className="text-muted-foreground">{day.local_tips}</p>
                    </div>
                  )}

                </div>

              </Card>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Results;
