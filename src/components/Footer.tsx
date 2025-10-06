// src/components/Footer.tsx
import Link from 'next/link';
import Image from 'next/image'; // Import the Next.js Image component

// A helper component for the footer links
const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li>
    <Link href={href} className="text-gray-300 hover:text-white transition-colors">
      {children}
    </Link>
  </li>
);

// A helper component for the column titles
const FooterTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm font-bold text-red-600 tracking-wider uppercase mb-4">
    {children}
  </h3>
);

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo Column */}
          <div className="flex-shrink-0">
                    <Link href="/">
                      <Image
                        src="/images/vocta-football-logo.png"
                        alt="VOCTA Football Logo"
                        width={150}
                        height={30}
                        priority
                      />
                    </Link>
                </div>

          {/* VOCTA Column */}
          <div>
            <FooterTitle>VOCTA</FooterTitle>
            <ul className="space-y-2">
              <FooterLink href="#">About us</FooterLink>
              <FooterLink href="#">Partnerships</FooterLink>
              <FooterLink href="#">News</FooterLink>
              <FooterLink href="#">Careers</FooterLink>
            </ul>
          </div>

          {/* Learn More Column */}
          <div>
            <FooterTitle>Learn More</FooterTitle>
            <ul className="space-y-2">
              <FooterLink href="#">How it works</FooterLink>
              <FooterLink href="#">Authentication</FooterLink>
            </ul>
          </div>

          {/* Customer Service Column */}
          <div>
            <FooterTitle>Customer Service</FooterTitle>
            <ul className="space-y-2">
              <FooterLink href="#">FAQ</FooterLink>
              <FooterLink href="#">Email us</FooterLink>
            </ul>
          </div>

          {/* Connect Column */}
          <div>
            <FooterTitle>Connect</FooterTitle>
            <ul className="space-y-2">
              <FooterLink href="#">Facebook</FooterLink>
              <FooterLink href="#">X (Twitter)</FooterLink>
              <FooterLink href="#">Instagram</FooterLink>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex space-x-4 mb-4 sm:mb-0">
            {/* You can add real payment SVGs here if you like */}
            <span className="font-bold text-lg">VISA</span>
            <span className="font-bold text-lg">MasterCard</span>
            <span className="font-bold text-lg">PayPal</span>
          </div>
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} VOCTA Football Mania. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}