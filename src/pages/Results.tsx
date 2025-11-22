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
  const [parsedItinerary, setParsedItinerary] = useState<any>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem("itineraryData");
    const itineraryRaw = sessionStorage.getItem("generatedItinerary");

    if (!storedData) {
      navigate("/");
      return;
    }

    setItineraryData(JSON.parse(storedData));

    if (itineraryRaw) {
      try {
        const obj = JSON.parse(itineraryRaw);
        setParsedItinerary(obj);
      } catch {
        setParsedItinerary(null);
      }
    }
  }, [navigate]);

  if (!itineraryData) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-10">

            <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>

            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">Your Itinerary</h1>
              <p className="text-xl text-muted-foreground">Based on your preferences</p>
            </div>

            {/* Trip Summary */}
            <Card className="p-6 space-y-6">
              <h2 className="text-2xl font-bold">Trip Summary</h2>

              <div className="grid md:grid-cols-2 gap-6">

                <SummaryItem icon={<MapPin />} title="Destination" value={itineraryData.destination} />
                <SummaryItem icon={<DollarSign />} title="Budget" value={itineraryData.budget} />
                <SummaryItem icon={<Calendar />} title="Duration" value={`${itineraryData.days} Days`} />
                <SummaryItem icon={<Heart />} title="Interests" value={itineraryData.interests.join(", ")} />

              </div>
            </Card>

            {/* AI-generated Itinerary */}
            <Card className="p-8 space-y-8">
              <h2 className="text-2xl font-bold mb-4">Detailed Itinerary</h2>

              {!parsedItinerary ? (
                <p className="text-muted-foreground text-lg">
                  Unable to display itinerary.
                </p>
              ) : (
                <div className="space-y-12">
                  {parsedItinerary.itinerary?.map((day: any) => (
                    <DayCard key={day.day} day={day} />
                  ))}
                </div>
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


// 🔹 Subcomponents – Cleaner UI

const SummaryItem = ({ icon, title, value }: any) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="font-semibold capitalize">{value}</p>
    </div>
  </div>
);

const DayCard = ({ day }: any) => (
  <div className="border rounded-xl p-6 shadow-sm bg-white space-y-4">
    <h3 className="text-2xl font-bold">Day {day.day} — {day.theme}</h3>

    {/* Schedule */}
    <div className="space-y-3">
      <ScheduleBlock label="Morning" text={day.schedule.morning} />
      <ScheduleBlock label="Afternoon" text={day.schedule.afternoon} />
      <ScheduleBlock label="Evening" text={day.schedule.evening} />
    </div>

    {/* Food */}
    <div className="mt-4 space-y-2">
      <h4 className="text-xl font-semibold">Food Recommendations</h4>
      <ul className="list-disc ml-5 space-y-1">
        <li><strong>Breakfast:</strong> {day.food_recommendations.breakfast}</li>
        <li><strong>Lunch:</strong> {day.food_recommendations.lunch}</li>
        <li><strong>Dinner:</strong> {day.food_recommendations.dinner}</li>
      </ul>
    </div>

    {/* Tips */}
    <div className="mt-4">
      <h4 className="text-xl font-semibold">Travel Tips</h4>
      <p className="text-muted-foreground">{day.local_travel_tips}</p>
    </div>
  </div>
);

const ScheduleBlock = ({ label, text }: any) => (
  <div>
    <p className="font-semibold">{label}</p>
    <p className="text-muted-foreground">{text}</p>
  </div>
);
