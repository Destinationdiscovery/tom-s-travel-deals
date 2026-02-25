import { useState, useEffect } from "react";
import { Mail, ExternalLink, Link2, Send, Loader2 } from "lucide-react";
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
  const [from, setFrom] = useState("info@mail.travelonly.com");
  const [clientName, setClientName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [emailLog, setEmailLog] = useState<any[]>([]);
  
  const [quotes, setQuotes] = useState<any[]>([]);

  useEffect(() => {
    fetchEmailLog();
    fetchQuotes();
  }, []);

  const fetchEmailLog = async () => {
    const { data } = await supabase.from("email_log").select("*").order("created_at", { ascending: false }).limit(20);
    setEmailLog(data || []);
  };

  const fetchQuotes = async () => {
    const { data } = await supabase.from("client_quotes").select("id, client_name, client_email, resort_name, share_token, status").order("created_at", { ascending: false }).limit(50);
    setQuotes(data || []);
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

  const insertQuoteLink = (quoteId: string) => {
    const quote = quotes.find((q) => q.id === quoteId);
    if (!quote?.share_token) {
      toast({ title: "No share link", description: "This quote doesn't have a share link yet. Save it first.", variant: "destructive" });
      return;
    }
    const url = `${window.location.origin}/quote/${quote.share_token}`;
    setBody((prev) => prev + `\n\nView your quote: ${url}`);
    if (!to && quote.client_email) setTo(quote.client_email);
    if (!clientName && quote.client_name) setClientName(quote.client_name);
    toast({ title: "Quote link inserted" });
  };

  const handleSendViaResend = async () => {
    if (!to.trim()) {
      toast({ title: "Missing email", description: "Please enter a recipient email.", variant: "destructive" });
      return;
    }
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: { from, to, subject, text: body },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      await supabase.from("email_log").insert({
        client_name: clientName || to,
        client_email: to,
        email_type: selectedTemplate as any,
        subject,
      } as any);

      toast({ title: "Email sent!", description: `Delivered to ${to} via Resend.` });
      fetchEmailLog();
    } catch (err: any) {
      toast({ title: "Failed to send", description: err.message || "Check your Resend configuration.", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendViaOutlook = async () => {
    if (!to.trim()) {
      toast({ title: "Missing email", description: "Please enter a recipient email.", variant: "destructive" });
      return;
    }

    const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);

    await supabase.from("email_log").insert({
      client_name: clientName || to,
      client_email: to,
      email_type: selectedTemplate as any,
      subject,
    } as any);

    toast({ title: "Email opened in Outlook!", description: "The email log has been updated." });
    fetchEmailLog();
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
              <div><Label>From</Label><Input type="email" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="info@mail.travelonly.com" /></div>
              <div><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
              <div><Label>Body</Label><Textarea value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[250px] font-mono text-sm" /></div>

              {/* Insert quote link */}
              {quotes.length > 0 && (
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Insert Quote Link</Label>
                    <Select onValueChange={insertQuoteLink}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select a quote to insert link..." />
                      </SelectTrigger>
                      <SelectContent>
                        {quotes.filter((q) => q.share_token).map((q) => (
                          <SelectItem key={q.id} value={q.id}>
                            <span className="flex items-center gap-2">
                              <Link2 className="h-3 w-3" />
                              {q.client_name} — {q.resort_name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleSendViaResend} disabled={isSending} className="gap-2">
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {isSending ? "Sending..." : "Send Email"}
                </Button>
                <Button variant="outline" onClick={handleSendViaOutlook} className="gap-2"><Mail className="h-4 w-4" /> Send via Outlook</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Links */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Quick Links</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => window.open("https://outlook.live.com/mail/", "_blank")}>
                <ExternalLink className="h-3.5 w-3.5" /> Outlook Email
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => window.open("https://tob.sax.softvoyage.com/", "_blank")}>
                <ExternalLink className="h-3.5 w-3.5" /> Sirev Booking
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => window.open("https://www.expediataap.ca/", "_blank")}>
                <ExternalLink className="h-3.5 w-3.5" /> Expedia TAAP
              </Button>
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
