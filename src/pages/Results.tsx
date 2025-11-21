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
  const [generatedItinerary, setGeneratedItinerary] = useState<string>("");

  useEffect(() => {
    // Load saved form data
    const storedData = sessionStorage.getItem("itineraryData");
    const itinerary = sessionStorage.getItem("generatedItinerary");

    if (storedData) {
      setItineraryData(JSON.parse(storedData));
    } else {
      navigate("/");
    }

    if (itinerary) {
      setGeneratedItinerary(itinerary);
    }
  }, [navigate]);

  if (!itineraryData) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">

            <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>

            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">Your Itinerary</h1>
              <p className="text-xl text-muted-foreground">Based on your preferences</p>
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

            {/* AI-generated itinerary */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">Generated Itinerary</h2>

              {generatedItinerary ? (
                <pre className="whitespace-pre-wrap text-lg text-foreground">
                  {generatedItinerary}
                </pre>
              ) : (
                <p className="text-muted-foreground text-lg">
                  Generating itinerary... Please wait.
                </p>
              )}
            </Card>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Results;
