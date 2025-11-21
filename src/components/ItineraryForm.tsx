import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { MapPin, DollarSign, Calendar, Heart } from "lucide-react";

const interests = [
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
    interests: [] as string[]
  });

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const response = await fetch(
      "https://NEW-CLOUDFLARE-URL.trycloudflare.com/webhook/tripgenie-webhook",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    const data = await response.json();

    sessionStorage.setItem(
      "generatedItinerary",
      data.itinerary || data.message || JSON.stringify(data)
    );

    navigate("/results");
  } catch (error) {
    console.error("Error generating itinerary:", error);
    alert("Could not connect to AI server. Check if n8n and the tunnel are running.");
  }
};



  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <Card className="max-w-3xl mx-auto p-8 shadow-lg border-border/50">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Destination */}
            <div className="space-y-3">
              <Label htmlFor="destination" className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Destination
              </Label>
              <Input
                id="destination"
                placeholder="e.g., Paris, Tokyo, Bali"
                value={formData.destination}
                onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                required
                className="h-12 text-lg"
              />
            </div>

            {/* Budget */}
            <div className="space-y-3">
              <Label htmlFor="budget" className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Budget
              </Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))} required>
                <SelectTrigger className="h-12 text-lg">
                  <SelectValue placeholder="Select your budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Budget-friendly</SelectItem>
                  <SelectItem value="medium">Medium - Comfortable</SelectItem>
                  <SelectItem value="luxury">Luxury - Premium experience</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Number of Days */}
            <div className="space-y-3">
              <Label htmlFor="days" className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Number of Days
              </Label>
              <Input
                id="days"
                type="number"
                min="1"
                max="30"
                placeholder="e.g., 7"
                value={formData.days}
                onChange={(e) => setFormData(prev => ({ ...prev, days: e.target.value }))}
                required
                className="h-12 text-lg"
              />
            </div>

            {/* Travel Interests */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Travel Interests
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {interests.map((interest) => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      id={interest}
                      checked={formData.interests.includes(interest)}
                      onCheckedChange={() => handleInterestToggle(interest)}
                    />
                    <label
                      htmlFor={interest}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {interest}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              size="lg" 
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            >
              Generate Itinerary
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
};

export default ItineraryForm;
