import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const providers = [
  { name: "Mailchimp", tier: "Free up to 500 contacts" },
  { name: "Kit", tier: "Free up to 10,000 subscribers" },
  { name: "Brevo", tier: "300 emails per day free" },
];

const SettingsPanel = () => (
  <div className="space-y-4">
    <Card className="p-6">
      <h3 className="font-display text-xl font-bold mb-1">Connect email provider</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Once connected, the Send button on each edition will deliver to all active subscribers in your list.
      </p>
      <div className="grid md:grid-cols-3 gap-4">
        {providers.map(p => (
          <Card key={p.name} className="p-4 flex flex-col gap-2">
            <div className="font-semibold">{p.name}</div>
            <div className="text-xs text-muted-foreground flex-1">{p.tier}</div>
            <Button size="sm" variant="outline" disabled>Connect (coming soon)</Button>
          </Card>
        ))}
      </div>
    </Card>
  </div>
);

export default SettingsPanel;
