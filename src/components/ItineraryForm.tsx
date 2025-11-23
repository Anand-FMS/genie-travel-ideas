import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { MapPin, DollarSign, Calendar, Heart } from "lucide-react";

const interestsList = [
  "Adventure",
  "Beaches",
  "Food",
  "Culture",
  "History",
  "Nature",
  "Nightlife"
];

const ItineraryForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    destination: "",
    budget: "",
    dateFrom: "",
    dateTo: "",
    interests: [] as string[],
  });

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://nonformative-unsatisfied-fawn.ngrok-free.dev/webhook/tripgenie-webhook",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error(`Server returned ${response.status}`);

      const data = await response.json();

      sessionStorage.setItem("itineraryData", JSON.stringify(formData));
      sessionStorage.setItem("generatedItinerary", JSON.stringify(data));

      navigate("/results");

    } catch (error) {
      console.error("Error generating itinerary:", error);
      alert("Could not connect — ensure n8n & tunnel are running and returning valid JSON.");
    }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <Card className="max-w-3xl mx-auto p-8 shadow-lg border-border/50">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Destination */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Destination
              </Label>
              <Input
                placeholder="e.g., Paris, Tokyo, Goa"
                value={formData.destination}
                onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                required
                className="h-12 text-lg"
              />
            </div>

            {/* Budget */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" /> Budget
              </Label>
              <Input
                placeholder="e.g., medium"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                required
                className="h-12 text-lg"
              />
            </div>

            {/* FROM DATE */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> From Date
              </Label>
              <Input
                type="date"
                value={formData.dateFrom}
                onChange={(e) => setFormData(prev => ({ ...prev, dateFrom: e.target.value }))}
                required
                className="h-12 text-lg"
              />
            </div>

            {/* TO DATE */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> To Date
              </Label>
              <Input
                type="date"
                value={formData.dateTo}
                onChange={(e) => setFormData(prev => ({ ...prev, dateTo: e.target.value }))}
                required
                className="h-12 text-lg"
              />
            </div>

            {/* Interests */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" /> Travel Interests
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {interestsList.map((interest) => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.interests.includes(interest)}
                      onCheckedChange={() => handleInterestToggle(interest)}
                    />
                    <label className="text-sm font-medium cursor-pointer">{interest}</label>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full h-14 text-lg font-bold">
              Generate Itinerary
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
};

export default ItineraryForm;



