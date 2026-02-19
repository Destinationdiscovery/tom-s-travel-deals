import { useState, useEffect } from "react";
import { Mail, Send, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { emailTemplates, fillTemplate } from "./EmailTemplates";
import { format } from "date-fns";

const EmailComposer = () => {
  const [selectedTemplate, setSelectedTemplate] = useState("quote");
  const [to, setTo] = useState("");
  const [clientName, setClientName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [emailLog, setEmailLog] = useState<any[]>([]);
  const [bookingPortalUrl, setBookingPortalUrl] = useState(() => localStorage.getItem("rtg_booking_portal") || "");

  useEffect(() => {
    fetchEmailLog();
  }, []);

  const fetchEmailLog = async () => {
    const { data } = await supabase.from("email_log").select("*").order("created_at", { ascending: false }).limit(20);
    setEmailLog(data || []);
  };

  const applyTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = emailTemplates.find((t) => t.id === templateId);
    if (!template) return;
    const filled = fillTemplate(template, {
      clientName: clientName || "[Client Name]",
      resortName: "[Resort Name]",
      destination: "[Destination]",
      checkIn: "[Check-In]",
      checkOut: "[Check-Out]",
      numTravellers: "[#]",
      totalPrice: "[Total]",
      quoteLink: "[Quote Link]",
    });
    setSubject(filled.subject);
    setBody(filled.body);
  };

  const handleSendViaOutlook = async () => {
    if (!to.trim()) {
      toast({ title: "Missing email", description: "Please enter a recipient email.", variant: "destructive" });
      return;
    }

    const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);

    // Log the email
    const template = emailTemplates.find((t) => t.id === selectedTemplate);
    await supabase.from("email_log").insert({
      client_name: clientName || to,
      client_email: to,
      email_type: selectedTemplate as any,
      subject,
    } as any);

    toast({ title: "Email opened in Outlook!", description: "The email log has been updated." });
    fetchEmailLog();
  };

  const saveBookingPortal = () => {
    localStorage.setItem("rtg_booking_portal", bookingPortalUrl);
    toast({ title: "Saved", description: "Booking portal URL saved." });
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Email System</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label>Template</Label>
                  <Select value={selectedTemplate} onValueChange={applyTemplate}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {emailTemplates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label>Client Name</Label>
                  <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="John Smith" />
                </div>
              </div>
              <div><Label>To</Label><Input type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="client@email.com" /></div>
              <div><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
              <div><Label>Body</Label><Textarea value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[250px] font-mono text-sm" /></div>
              <div className="flex gap-2">
                <Button onClick={handleSendViaOutlook} className="gap-2"><Mail className="h-4 w-4" /> Send via Outlook</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Booking Portal */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Booking Portal</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Input value={bookingPortalUrl} onChange={(e) => setBookingPortalUrl(e.target.value)} placeholder="https://your-booking-portal.com" />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={saveBookingPortal}>Save</Button>
                {bookingPortalUrl && (
                  <Button variant="outline" size="sm" onClick={() => window.open(bookingPortalUrl, "_blank")} className="gap-1">
                    <ExternalLink className="h-3 w-3" /> Open
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Email Log */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Email Log</CardTitle></CardHeader>
            <CardContent>
              {emailLog.length === 0 ? (
                <p className="text-xs text-muted-foreground">No emails logged yet.</p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {emailLog.map((log) => (
                    <div key={log.id} className="text-xs p-2 rounded-lg bg-muted/50">
                      <p className="font-medium text-foreground">{log.client_name}</p>
                      <p className="text-muted-foreground truncate">{log.subject}</p>
                      <p className="text-muted-foreground">{format(new Date(log.created_at), "MMM d, h:mm a")}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmailComposer;
