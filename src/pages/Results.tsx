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
  morning?: { title: string; description: string };
  afternoon?: { title: string; description: string };
  evening?: { title: string; description: string };
  food_recommendations?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  local_tips?: string;
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

  const [itineraryObj, setItineraryObj] = useState<FullItinerary | null>(null);

  useEffect(() => {
    const rawItinerary = sessionStorage.getItem("generatedItinerary");

    if (!rawItinerary) {
      navigate("/");
      return;
    }

    try {
      setItineraryObj(JSON.parse(rawItinerary));
    } catch (e) {
      console.error("JSON Parse Error:", e);
    }
  }, []);

  if (!itineraryObj) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-4xl space-y-10">

          <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>

          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">{itineraryObj.trip_name}</h1>
            <p className="text-lg text-muted-foreground">
              Your personalized AI-generated itinerary
            </p>
          </div>

          {/* Trip Summary */}
          <Card className="p-6 shadow-md space-y-6">
            <h2 className="text-2xl font-bold">Trip Summary</h2>

            <div className="grid md:grid-cols-2 gap-6">

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <p className="font-semibold">{itineraryObj.destination}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-semibold">{itineraryObj.budget}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">{itineraryObj.duration_days} Days</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
              <div>
                <p className="text-sm text-muted-foreground">Interests</p>
                <p className="font-semibold">{itineraryObj.interests?.join(", ") || "N/A"}</p>
              </div>
              </div>

            </div>
          </Card>

          {/* Daily Itinerary */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold">Daily Itinerary</h2>

            {itineraryObj.itinerary.map((day) => (
              <Card key={day.day} className="p-6 shadow-md space-y-5">

                <h3 className="text-2xl font-bold">
                  Day {day.day}: {day.theme}
                </h3>

                <div className="space-y-4">

                  {day.morning && (
                    <div>
                      <p className="font-semibold text-lg">🌅 Morning: {day.morning.title}</p>
                      <p className="text-muted-foreground">{day.morning.description}</p>
                    </div>
                  )}

                  {day.afternoon && (
                    <div>
                      <p className="font-semibold text-lg">🌞 Afternoon: {day.afternoon.title}</p>
                      <p className="text-muted-foreground">{day.afternoon.description}</p>
                    </div>
                  )}

                  {day.evening && (
                    <div>
                      <p className="font-semibold text-lg">🌙 Evening: {day.evening.title}</p>
                      <p className="text-muted-foreground">{day.evening.description}</p>
                    </div>
                  )}

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

