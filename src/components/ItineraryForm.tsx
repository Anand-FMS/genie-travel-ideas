// src/pages/ItineraryForm.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { MapPin, DollarSign, Heart, Calendar } from "lucide-react";

const interestsList = ["Adventure", "Beaches", "Food", "Culture", "History", "Nature", "Nightlife"];

const ItineraryForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    destination: "",
    budget: "",
    fromDate: "",
    toDate: "",
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
    setIsLoading(true);

    try {
      const payload = {
        destination: formData.destination,
        budget: formData.budget,
        start_date: formData.fromDate,
        end_date: formData.toDate,
        interests: formData.interests,
      };

      const response = await fetch(
        "https://nonformative-unsatisfied-fawn.ngrok-free.dev/webhook/tripgenie-webhook",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Invalid response from server");

      const data = await response.json();

      sessionStorage.setItem("itineraryData", JSON.stringify(payload));
      sessionStorage.setItem("generatedItinerary", JSON.stringify(data));

      navigate("/results");
    } catch (error) {
      console.error("Error generating itinerary:", error);
      alert("Could not connect to server — check n8n.");
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <Card className="max-w-3xl mx-auto p-8 shadow-lg border-border/50 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 rounded-lg flex flex-col items-center justify-center gap-6">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0s" }}></div>
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.4s" }}></div>
              </div>
              <p className="text-lg font-semibold text-foreground">Generating your personalized itinerary…</p>
              <p className="text-sm text-muted-foreground">This may take a few moments</p>
            </div>
          )}
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
                  <SelectValue placeholder="Select budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* From Date */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> From Date
              </Label>
              <Input
                type="date"
                value={formData.fromDate}
                onChange={(e) => setFormData(prev => ({ ...prev, fromDate: e.target.value }))}
                required
                className="h-12 text-lg"
              />
            </div>

            {/* To Date */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> To Date
              </Label>
              <Input
                type="date"
                value={formData.toDate}
                onChange={(e) => setFormData(prev => ({ ...prev, toDate: e.target.value }))}
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

            <Button type="submit" className="w-full h-14 text-lg font-bold" disabled={isLoading}>
              {isLoading ? "Generating..." : "Generate Itinerary"}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
};

export default ItineraryForm;



