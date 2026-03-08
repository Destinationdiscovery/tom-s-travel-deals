import { useState, useRef } from "react";
import { Megaphone, Copy, Download, Mail, Loader2, ExternalLink } from "lucide-react";
import { openWorkOutlook } from "@/lib/openWorkOutlook";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DealForm {
  destination: string;
  resortName: string;
  price: string;
  originalPrice: string;
  discountPercent: string;
  travelDates: string;
  highlights: string;
}

const emptyForm: DealForm = {
  destination: "",
  resortName: "",
  price: "",
  originalPrice: "",
  discountPercent: "",
  travelDates: "",
  highlights: "",
};

const DealMaker = () => {
  const [form, setForm] = useState<DealForm>(emptyForm);
  const [socialContent, setSocialContent] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [posterHtml, setPosterHtml] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const posterRef = useRef<HTMLDivElement>(null);

  const update = (field: keyof DealForm, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const isFormValid = form.destination.trim() && form.resortName.trim() && form.price.trim();

  const generate = async (type: "social" | "email" | "poster") => {
    if (!isFormValid) {
      toast({ title: "Fill required fields", description: "Destination, resort name, and price are required.", variant: "destructive" });
      return;
    }
    setLoading(type);
    try {
      const { data, error } = await supabase.functions.invoke("generate-deal-content", {
        body: { ...form, contentType: type },
      });
      if (error) throw error;
      if (type === "social") setSocialContent(data.content);
      else if (type === "email") setEmailContent(data.content);
      else if (type === "poster") setPosterHtml(data.content);
    } catch (e: any) {
      toast({ title: "Generation failed", description: e.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  const openInOutlook = (content: string) => {
    const subject = `🔥 Deal Alert: ${form.resortName} in ${form.destination}`;
    openWorkOutlook('', subject, content);
  };

  const downloadPoster = async () => {
    if (!posterRef.current) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext("2d")!;

      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080">
          <foreignObject width="1080" height="1080">
            <div xmlns="http://www.w3.org/1999/xhtml" style="width:1080px;height:1080px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1a1a2e,#16213e,#0f3460);color:white;font-family:system-ui;padding:60px;box-sizing:border-box;">
              <div style="text-align:center;width:100%;">
                <div style="font-size:24px;text-transform:uppercase;letter-spacing:4px;opacity:0.7;margin-bottom:20px;">Limited Time Deal</div>
                <div style="font-size:52px;font-weight:800;margin-bottom:10px;">${form.resortName}</div>
                <div style="font-size:28px;opacity:0.8;margin-bottom:30px;">${form.destination}</div>
                <div style="font-size:72px;font-weight:900;color:#f59e0b;margin-bottom:10px;">$${form.price}</div>
                ${form.originalPrice ? `<div style="font-size:24px;text-decoration:line-through;opacity:0.5;">Was $${form.originalPrice}</div>` : ""}
                ${form.discountPercent ? `<div style="font-size:32px;font-weight:700;color:#10b981;margin-top:10px;">Save ${form.discountPercent}%</div>` : ""}
                ${form.travelDates ? `<div style="font-size:20px;opacity:0.7;margin-top:30px;">${form.travelDates}</div>` : ""}
                <div style="font-size:18px;margin-top:40px;opacity:0.5;">ReviewThenGo.com</div>
              </div>
            </div>
          </foreignObject>
        </svg>
      `;

      const img = new Image();
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
      });
      
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const link = document.createElement("a");
      link.download = `deal-${form.resortName.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast({ title: "Poster downloaded!" });
    } catch {
      toast({ title: "Download failed", description: "Try right-clicking the poster and saving it instead.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Deal Maker</h1>
        <p className="text-sm text-muted-foreground mt-1">Create promotional content for your travel deals.</p>
      </div>

      {/* Deal Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary" /> Deal Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Destination *</Label><Input value={form.destination} onChange={(e) => update("destination", e.target.value)} placeholder="Cancun, Mexico" /></div>
            <div><Label>Resort Name *</Label><Input value={form.resortName} onChange={(e) => update("resortName", e.target.value)} placeholder="Dreams Riviera Cancun" /></div>
            <div><Label>Price (CAD) *</Label><Input value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="1299" /></div>
            <div><Label>Original Price</Label><Input value={form.originalPrice} onChange={(e) => update("originalPrice", e.target.value)} placeholder="1899" /></div>
            <div><Label>Discount %</Label><Input value={form.discountPercent} onChange={(e) => update("discountPercent", e.target.value)} placeholder="30" /></div>
            <div><Label>Travel Dates</Label><Input value={form.travelDates} onChange={(e) => update("travelDates", e.target.value)} placeholder="March 15-22, 2026" /></div>
          </div>
          <div><Label>Highlights</Label><Textarea value={form.highlights} onChange={(e) => update("highlights", e.target.value)} placeholder="All-inclusive, beachfront, spa, kids club..." className="min-h-[60px]" /></div>
        </CardContent>
      </Card>

      {/* Output Tabs */}
      <Tabs defaultValue="social">
        <TabsList>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="email">Email Blast</TabsTrigger>
          <TabsTrigger value="poster">Deal Poster</TabsTrigger>
        </TabsList>

        <TabsContent value="social" className="space-y-3">
          <Button onClick={() => generate("social")} disabled={loading === "social" || !isFormValid} className="gap-2">
            {loading === "social" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}
            Generate Social Posts
          </Button>
          {socialContent && (
            <Card>
              <CardContent className="p-4">
                <pre className="whitespace-pre-wrap text-sm text-foreground font-sans">{socialContent}</pre>
                <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={() => copyText(socialContent)}>
                  <Copy className="h-3 w-3" /> Copy All
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="email" className="space-y-3">
          <Button onClick={() => generate("email")} disabled={loading === "email" || !isFormValid} className="gap-2">
            {loading === "email" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            Generate Email Blast
          </Button>
          {emailContent && (
            <Card>
              <CardContent className="p-4">
                <pre className="whitespace-pre-wrap text-sm text-foreground font-sans">{emailContent}</pre>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => copyText(emailContent)}>
                    <Copy className="h-3 w-3" /> Copy
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => openInOutlook(emailContent)}>
                    <ExternalLink className="h-3 w-3" /> Open in Outlook
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="poster" className="space-y-3">
          <Button onClick={() => generate("poster")} disabled={loading === "poster" || !isFormValid} className="gap-2">
            {loading === "poster" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Generate Poster
          </Button>
          {posterHtml && (
            <Card>
              <CardContent className="p-4">
                <div
                  ref={posterRef}
                  className="w-full max-w-[540px] mx-auto aspect-square rounded-lg overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "40px",
                    textAlign: "center",
                  }}
                >
                  <div>
                    <p className="text-xs uppercase tracking-[4px] opacity-70 mb-3">Limited Time Deal</p>
                    <h2 className="text-3xl font-extrabold mb-1">{form.resortName}</h2>
                    <p className="text-lg opacity-80 mb-4">{form.destination}</p>
                    <p className="text-5xl font-black text-amber-400 mb-1">${form.price}</p>
                    {form.originalPrice && <p className="text-base line-through opacity-50">Was ${form.originalPrice}</p>}
                    {form.discountPercent && <p className="text-xl font-bold text-emerald-400 mt-1">Save {form.discountPercent}%</p>}
                    {form.travelDates && <p className="text-sm opacity-70 mt-4">{form.travelDates}</p>}
                    {posterHtml && <p className="text-xs opacity-60 mt-4 italic">{posterHtml}</p>}
                    <p className="text-xs opacity-40 mt-6">ReviewThenGo.com</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={downloadPoster}>
                  <Download className="h-3 w-3" /> Download Poster
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DealMaker;
