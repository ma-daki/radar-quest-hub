import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EmailSubscribe() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const { error } = await supabase
      .from("email_subscribers" as any)
      .insert({ email } as any);

    setLoading(false);

    if (error) {
      if (error.code === "23505") {
        toast({ title: "Already subscribed!", description: "This email is already on our list." });
        setSubscribed(true);
      } else {
        toast({ title: "Error", description: "Could not subscribe. Try again.", variant: "destructive" });
      }
      return;
    }

    setSubscribed(true);
    toast({ title: "Subscribed! 🎉", description: "You'll get notified about new opportunities." });
  };

  if (subscribed) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
        <CheckCircle className="h-4 w-4" />
        You're subscribed to opportunity alerts!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="pl-10"
        />
      </div>
      <Button type="submit" disabled={loading} className="shrink-0">
        {loading ? "Subscribing…" : "Get Alerts"}
      </Button>
    </form>
  );
}
