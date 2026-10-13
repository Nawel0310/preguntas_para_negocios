import { Badge } from "@/components/ui/badge";
import type { ContactChannel } from "@/lib/types";

const TONE = { alta: "success", media: "warning", baja: "danger" } as const;

export function ContactStrategy({ contacts, tip }: { contacts: ContactChannel[]; tip: string }) {
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {contacts.map((c) => (
          <li key={c.channel} className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">{c.channel}</span>
              <Badge tone={TONE[c.effectiveness]}>Efectividad {c.effectiveness}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{c.tip}</p>
          </li>
        ))}
      </ul>
      {tip ? <p className="rounded-lg border-l-2 border-secondary bg-secondary/10 p-3 text-sm">{tip}</p> : null}
    </div>
  );
}
