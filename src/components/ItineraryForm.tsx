import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { MapPin, DollarSign, Heart, Calendar, Users } from "lucide-react";

const interestsList = [
  "Adventure",
  "Beaches",
  "Food",
  "Culture",
  "History",
  "Nature",
  "Nightlife",
];

const ItineraryForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    source: "",
    destination: "",
    budget: 0,
    fromDate: "",
    toDate: "",
    passengers: 1,
    interests: [] as string[],
  });

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        source: formData.source,
        destination: formData.destination,
        start_date: formData.fromDate,
        end_date: formData.toDate,
        budget_per_person: formData.budget,
        passengers: formData.passengers,
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

      setIsLoading(false);
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
        <Card className="max-w-3xl mx-auto p-8 shadow-lg relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background/95 z-50 flex items-center justify-center">
              <p className="text-lg font-semibold">Generating itinerary…</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Source */}
            <div>
              <Label className="flex items-center gap-2">
                <MapPin /> From
              </Label>
              <Input
                required
                value={formData.source}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, source: e.target.value }))
                }
                placeholder="e.g. Chennai"
              />
            </div>

            {/* Destination */}
            <div>
              <Label>Destination</Label>
              <Input
                required
                value={formData.destination}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, destination: e.target.value }))
                }
              />
            </div>

            {/* Budget */}
            <div>
              <Label className="flex items-center gap-2">
                <DollarSign /> Budget per person (₹)
              </Label>
              <Input
                type="number"
                min={0}
                max={100000}
                required
                value={formData.budget}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    budget: Number(e.target.value),
                  }))
                }
              />
            </div>

            {/* Dates */}
            <div>
              <Label>From Date</Label>
              <Input
                type="date"
                required
                value={formData.fromDate}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, fromDate: e.target.value }))
                }
              />
            </div>

            <div>
              <Label>To Date</Label>
              <Input
                type="date"
                required
                value={formData.toDate}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, toDate: e.target.value }))
                }
              />
            </div>

            {/* Passengers */}
            <div>
              <Label className="flex items-center gap-2">
                <Users /> Passengers
              </Label>
              <Input
                type="number"
                min={1}
                max={20}
                required
                value={formData.passengers}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    passengers: Number(e.target.value),
                  }))
                }
              />
            </div>

            {/* Interests */}
            <div>
              <Label className="flex items-center gap-2">
                <Heart /> Interests
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {interestsList.map((interest) => (
                  <div key={interest} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.interests.includes(interest)}
                      onCheckedChange={() =>
                        handleInterestToggle(interest)
                      }
                    />
                    <span>{interest}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              Generate Itinerary
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
};

export default ItineraryForm;
