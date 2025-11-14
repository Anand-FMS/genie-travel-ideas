import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Calendar, Heart, ArrowLeft } from "lucide-react";

interface ItineraryData {
  destination: string;
  budget: string;
  days: string;
  interests: string[];
}

const Results = () => {
  const navigate = useNavigate();
  const [itineraryData, setItineraryData] = useState<ItineraryData | null>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem('itineraryData');
    if (storedData) {
      setItineraryData(JSON.parse(storedData));
    } else {
      navigate('/');
    }
  }, [navigate]);

  if (!itineraryData) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>

            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">Your Itinerary</h1>
              <p className="text-xl text-muted-foreground">
                Based on your preferences
              </p>
            </div>

            {/* Trip Summary */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Trip Summary</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Destination</p>
                    <p className="font-semibold">{itineraryData.destination}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-semibold capitalize">{itineraryData.budget}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-semibold">{itineraryData.days} Days</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Interests</p>
                    <p className="font-semibold">{itineraryData.interests.join(", ")}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Placeholder for AI-generated itinerary */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">Generated Itinerary</h2>
              <div className="space-y-6 text-muted-foreground">
                <p className="text-lg">
                  Your personalized itinerary will appear here once connected to the AI API.
                </p>
                <div className="bg-muted/50 p-6 rounded-lg space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Day 1: Placeholder</h3>
                    <p>Morning activities, afternoon exploration, evening dining...</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Day 2: Placeholder</h3>
                    <p>Adventure activities, cultural experiences...</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Day 3: Placeholder</h3>
                    <p>Relaxation, shopping, local cuisine...</p>
                  </div>
                </div>
                <p className="text-sm italic">
                  Note: Connect your API endpoint to generate real AI-powered itineraries.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Results;
