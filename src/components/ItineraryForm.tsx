// src/pages/ItineraryForm.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    days: "",
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

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      // Receive clean JSON returned by Respond to Webhook (n8n)
      const cleanJson = await response.json();

      // Save user inputs
      sessionStorage.setItem("itineraryData", JSON.stringify(formData));

      // Save Gemini JSON
      sessionStorage.setItem("generatedItinerary", JSON.stringify(cleanJson));

      navigate("/results");

    } catch (error) {
      console.error("Error generating itinerary:", error);
      alert("Could not connect to AI server or got invalid JSON. Check n8n & tunnel.");
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
              <Select
                onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}
                required
              >
                <SelectTrigger className="h-12 text-lg">
                  <SelectValue placeholder="Select your budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Days */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Days
              </Label>
              <Input
                type="number"
                min="1"
                max="30"
                value={formData.days}
                onChange={(e) => setFormData(prev => ({ ...prev, days: e.target.value }))}
                required
                className="h-12 text-lg"
              />
            </div>

            {/* Interests */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" /> Interests
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


