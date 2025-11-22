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
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      const response = await fetch(
        "https://nonformative-unsatisfied-fawn.ngrok-free.dev/webhook/tripgenie-webhook",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      // If n8n returned an empty body or non-JSON, response.json() may fail.
      // We'll attempt to read as text first and parse safely.
      let rawResponseText = "";
      try {
        rawResponseText = await response.text();
      } catch (e) {
        rawResponseText = "";
      }

      // Try to parse as JSON if the response is JSON text
      let responseJson: any = null;
      try {
        responseJson = rawResponseText ? JSON.parse(rawResponseText) : null;
      } catch {
        // not a plain JSON object; keep rawResponseText for extraction
      }

      // Save user input so Results page can show the summary
      sessionStorage.setItem("itineraryData", JSON.stringify(formData));

      // Extract AI text from various possible shapes:
      // 1) If responseJson exists and contains content.parts[0].text
      // 2) If responseJson has 'itinerary' or 'text' etc.
      // 3) Otherwise, rawResponseText (the node output)
      const tryGetFromObj = (obj: any) => {
        if (!obj) return null;
        // common gemini paths
        if (obj.content && Array.isArray(obj.content) && obj.content[0]?.parts?.[0]?.text) {
          return obj.content[0].parts[0].text;
        }
        if (obj.parts && Array.isArray(obj.parts) && obj.parts[0]?.text) {
          return obj.parts[0].text;
        }
        if (typeof obj.itinerary === "string") return obj.itinerary;
        if (typeof obj.text === "string") return obj.text;
        if (obj.output_text) return obj.output_text;
        // if the model already returned the final object, stringify it so Results can parse
        if (obj.trip_name || obj.itinerary) return JSON.stringify(obj);
        return null;
      };

      let aiText = tryGetFromObj(responseJson) || "";

      // If aiText still empty, try to extract from rawResponseText using regex for a JSON-looking block
      if (!aiText && rawResponseText) {
        // If the response is already a JSON string (escaped JSON inside quotes), try to unescape
        const trimmed = rawResponseText.trim();
        // If the text starts with "{" or "[" treat as direct JSON string
        if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
          aiText = trimmed;
        } else {
          // Look for the first '{' and last '}', extract substring
          const first = trimmed.indexOf("{");
          const last = trimmed.lastIndexOf("}");
          if (first !== -1 && last !== -1 && last > first) {
            aiText = trimmed.slice(first, last + 1);
          } else {
            // fallback to whole text
            aiText = trimmed;
          }
        }
      }

      // Final fallback: if still nothing, store the raw JSON or an informative message
      if (!aiText) {
        aiText = responseJson ? JSON.stringify(responseJson) : rawResponseText || "";
      }

      // Save the raw AI text (string) for Results to parse/format.
      sessionStorage.setItem("generatedItinerary", aiText);

      setLoading(false);
      navigate("/results");
    } catch (error) {
      console.error("Error generating itinerary:", error);
      setLoading(false);
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
                placeholder="e.g., Paris, Tokyo, Goa"
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
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Days */}
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

            {/* Interests */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Travel Interests
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {interestsList.map((interest) => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      id={interest}
                      checked={formData.interests.includes(interest)}
                      onCheckedChange={() => handleInterestToggle(interest)}
                    />
                    <label htmlFor={interest} className="text-sm font-medium cursor-pointer">
                      {interest}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Itinerary"}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
};

export default ItineraryForm;


