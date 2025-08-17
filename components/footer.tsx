import ShowUpLogo from "./showup-logo";

interface FooterProps {
  bottomLinks?: {
    text: string;
    url: string;
  }[];
}

export default function Footer({
  bottomLinks = [
    { text: "About", url: "/about" },
    { text: "Contact", url: "/contact" },
    { text: "Privacy", url: "/privacy" },
  ],
}: FooterProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-t border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShowUpLogo width={100} height={20} />
            <span className="font-medium text-blue-600">- Stake to Attend Events</span>
          </div>
          <ul className="flex gap-4">
            {bottomLinks.map((link, linkIdx) => (
              <li key={linkIdx}>
                <a
                  href={link.url}
                  className="hover:text-foreground transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}