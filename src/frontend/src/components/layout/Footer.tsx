export default function Footer() {
  const year = new Date().getFullYear();
  const utm = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}]`;

  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SRM</span>
              </div>
              <span className="font-display font-bold text-foreground text-lg">
                Service &amp; Repair Marketplace
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Connecting government institutions with skilled ITI-trained
              service providers across India.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-sm mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="/jobs"
                  className="hover:text-primary transition-colors"
                >
                  Browse Jobs
                </a>
              </li>
              <li>
                <a
                  href="/providers"
                  className="hover:text-primary transition-colors"
                >
                  Find Providers
                </a>
              </li>
              <li>
                <a
                  href="/#how-it-works"
                  className="hover:text-primary transition-colors"
                >
                  How It Works
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-sm mb-3">
              Support
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="/#contact"
                  className="hover:text-primary transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-primary transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-muted-foreground">
            © {year} Service &amp; Repair Marketplace. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with ❤️ using{" "}
            <a
              href={utm}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
