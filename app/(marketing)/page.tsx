import type { Metadata } from "next";
import Link from "next/link";
import { NavigationHeader } from "@/components/marketing/navigation-header";

export const metadata: Metadata = {
  title: "Project Orchid | Your Singaporean Student Hub in the UK"
};

export default function LandingPage() {
  return (
    <div className="bg-background text-on-background font-body-md selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-on-primary focus:rounded-lg focus:font-label"
      >
        Skip to content
      </a>

      <NavigationHeader />

      <main id="main-content" className="pt-24">
        {/* Hero */}
        <section className="relative overflow-hidden orchid-gradient py-20 lg:py-32">
          <div className="max-w-container-max mx-auto px-gutter relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-label text-label">
                <span
                  className="material-symbols-outlined text-[16px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                  aria-hidden="true"
                >
                  verified
                </span>
                Celebrating 27 years &middot; Est. 1998
              </div>
              <h1 className="font-display text-h1 md:text-display tracking-tight text-on-surface">
                Your home away from <span className="text-primary">home</span>.
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                The official UKSSC platform connecting Singaporean students across Greater London, the South, Midlands, the North, and Scotland. Discover events, join your society, and build lasting community ties.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="px-8 py-4 bg-primary text-on-primary rounded-xl font-label text-body-md hover:-translate-y-1 transition-[transform,box-shadow] duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  Join the Community
                  <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                </Link>
                <a
                  href="#societies"
                  className="px-8 py-4 border-2 border-primary text-primary rounded-xl font-label text-body-md hover:bg-primary/5 transition-colors duration-200"
                >
                  Explore Societies
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl relative z-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Singaporean students gathered at a UK campus"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWGsg49ncgaoVsU1-W96Hv9WiRRd6qGU__4ewnkJPHu_AtYNZ16UApAAKf38Ur3S8U0fajThMgLvAY1mos9PNjjLmx8WKXeF2osvpnysPNLlgOK61WZz-UvdJC_8ESQbUyRXLSw90YN8LVZSzwC_czHZs7WlABf1Gn6DjjlSNQ-fEvGYWXgh93Opmh-JldW2tJBcf0w1j2NLdVI9jGYKnGGwCnifnka5XmmsO1EIn3gsxLi50Lu6Buy17nTmNaY7c5cHJrqbCjow"
                  fetchPriority="high"
                  width={560}
                  height={560}
                />
              </div>
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl -z-10" aria-hidden="true" />
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-secondary-container/20 rounded-full blur-3xl -z-10" aria-hidden="true" />
            </div>
          </div>
        </section>

        {/* Bento Grid */}
        <section id="students" className="py-24 max-w-container-max mx-auto px-gutter">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-display text-h1 text-on-surface">One Platform, Many Roles</h2>
            <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto">
              Whether you&apos;re a fresher just landing in the UK, a society committee leader, or a sponsor looking to connect with Singaporean talent, Project Orchid has the tools you need.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Students */}
            <div className="md:col-span-8 group relative overflow-hidden bg-surface-container-lowest rounded-3xl p-8 shadow-sm hover:shadow-xl transition-[box-shadow] duration-300 border border-outline-variant">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-6">
                  <div
                    className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"
                    aria-hidden="true"
                  >
                    <span className="material-symbols-outlined text-[32px]">school</span>
                  </div>
                  <h3 className="font-display text-h2 text-on-surface">For Students</h3>
                  <p className="text-on-surface-variant">
                    Navigate your UK journey with confidence. Access cross-society events, the annual BlastOff! career fair, leadership programmes, and peer forums tailored for the Singaporean community.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-body-sm font-label text-secondary">
                      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                        check_circle
                      </span>
                      Leaders Incubator &amp; Career Events
                    </li>
                    <li className="flex items-center gap-3 text-body-sm font-label text-secondary">
                      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                        check_circle
                      </span>
                      Pre-Departure Booklet &amp; Arrival Support
                    </li>
                  </ul>
                </div>
                <div className="w-full md:w-64 aspect-[4/5] rounded-2xl overflow-hidden shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Students collaborating on a tablet"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgw4cwQwufrqwuzjin5icIzu2x3IGy1zLSPy3QtaPuu7xuMUNqCY6fi8MP_tsw5zC3q3m94ix21OZeR7awWjRFtgkL0Jp3XLUqalwEdc-yGc76IeOP3CMYvRaVOoTHrq9Yotc7tbanstMIX86PZ2NLkZicV1JoZwmkbdlsz-0W6arbMf0v6AcT-uWQMRrO74h_Yt8jtvl0wOWlHgxB3cdoUY2YCUM90fzQ4QCm-Oax6IZCbYi8U0JzmO6LxTnH2HI0EF_Gy4lOmw"
                    loading="lazy"
                    width={256}
                    height={320}
                  />
                </div>
              </div>
            </div>

            {/* Societies */}
            <div
              id="societies"
              className="md:col-span-4 group bg-secondary-container rounded-3xl p-8 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="space-y-6">
                <div
                  className="w-12 h-12 rounded-2xl bg-white/50 flex items-center justify-center text-secondary"
                  aria-hidden="true"
                >
                  <span className="material-symbols-outlined text-[32px]">groups</span>
                </div>
                <h3 className="font-display text-h2 text-on-secondary-container">For Societies</h3>
                <p className="text-on-secondary-container/80 text-body-sm">
                  Tools for 30+ partner societies across 5 UK regions. Manage memberships, track reimbursements, and coordinate cross-society events with the wider UKSSC network.
                </p>
              </div>
              <Link
                href="/login"
                className="mt-8 flex items-center gap-2 font-label text-secondary font-bold"
              >
                Register Society{" "}
                <span className="material-symbols-outlined transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
                  chevron_right
                </span>
              </Link>
            </div>

            {/* Sponsors */}
            <div className="md:col-span-12 group relative overflow-hidden bg-surface-container-high rounded-3xl p-8 border border-outline-variant">
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="md:w-1/3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Professional handshake in a London boardroom"
                    className="rounded-2xl shadow-lg w-full h-48 object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAua3Ag4eVPznixFnpBdWZxQVFKE7qhQgnscOTabgcHxchr6cN_5ghwDZYdKYGcJzckK1WJC3P_CEDX2D8biO09lLhf7q0eXepyF0kY_RrAajUQXsZeQymJaWAXUCFFjrnu5zuXtElNuR7HywjH_LHMMA_G7cykXDhUuPGLbKHctJucURjJUKC3EcZuX75iBBOBB8zH1HAwqxSSsy5JrriAuckDO3OeL3-UPcdZPChWtGFBYqL4-Y9oIBg1jPSBpfelRC9qLnrMpg"
                    loading="lazy"
                    width={400}
                    height={192}
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="inline-block px-3 py-1 rounded bg-primary text-on-primary text-[10px] uppercase font-bold tracking-widest">
                    Partner with us
                  </div>
                  <h3 className="font-display text-h2 text-on-surface">For Sponsors &amp; Recruiters</h3>
                  <p className="text-on-surface-variant max-w-2xl">
                    Connect directly with Singaporean talent across 30+ university societies. Sponsor flagship events like BlastOff!, the Leaders Incubator, and our annual community retreats, and reach students at UCL, Imperial, LSE, Cambridge, Oxford, and beyond.
                  </p>
                  <a
                    href="mailto:enquiries@theukssc.co.uk"
                    className="text-primary font-label flex items-center gap-2 hover:underline"
                  >
                    Request a Partnership Deck{" "}
                    <span className="material-symbols-outlined" aria-hidden="true">
                      download
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="py-16 bg-surface-container-low border-y border-outline-variant/30">
          <div className="max-w-container-max mx-auto px-gutter flex flex-col md:flex-row items-center justify-between gap-12 opacity-80">
            <div className="space-y-2">
              <p className="font-label text-label text-on-surface-variant uppercase tracking-widest">
                Endorsed By
              </p>
              <div className="font-display text-h3 font-extrabold text-outline">UKSSC OFFICIAL</div>
            </div>
            <div className="flex flex-wrap justify-center gap-8 grayscale">
              <div className="font-display text-h3 font-bold opacity-40">UCLSS</div>
              <div className="font-display text-h3 font-bold opacity-40">CUMSA</div>
              <div className="font-display text-h3 font-bold opacity-40">IMPERIAL SG</div>
              <div className="font-display text-h3 font-bold opacity-40">LSE SG SOC</div>
              <div className="font-display text-h3 font-bold opacity-40">EUSSS</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="about" className="py-24 max-w-container-max mx-auto px-gutter">
          <div className="bg-primary rounded-[3rem] p-8 md:p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden="true">
              <div className="absolute top-0 right-0 w-96 h-96 bg-on-primary rounded-full blur-[100px]" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-fixed rounded-full blur-[100px]" />
            </div>
            <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
              <h2 className="font-display text-h1 md:text-display text-on-primary">
                Ready to bloom in the UK?
              </h2>
              <p className="text-on-primary/80 font-body-lg">
                The UKSSC has represented Singaporean students in the UK since 1998. From the Scottish Highlands to London, your community is here. Join 30+ societies, access leadership programmes, and make the most of your UK years.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/login"
                  className="bg-on-primary text-primary px-10 py-5 rounded-2xl font-label text-lg hover:scale-105 transition-transform duration-200 shadow-xl"
                >
                  Create Your Profile
                </Link>
                <a
                  href="#students"
                  className="bg-primary-container text-on-primary px-10 py-5 rounded-2xl font-label text-lg border border-on-primary/20 hover:bg-on-primary/10 transition-colors duration-200"
                >
                  View Member Benefits
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto bg-surface-container-low border-t border-outline-variant">
        <div className="max-w-container-max mx-auto px-gutter py-12 flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="space-y-6">
            <div className="font-display text-h3 font-bold text-primary">Project Orchid</div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
              The official digital platform of the UK Singapore Students&apos; Council, established 1998. Representing Singaporeans across 30+ university societies in the UK.
            </p>
            <div className="flex gap-4">
              <a
                className="text-on-surface-variant hover:text-primary transition-colors duration-200"
                href="https://www.theukssc.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="UKSSC Website"
              >
                <span className="material-symbols-outlined" aria-hidden="true">public</span>
              </a>
              <a
                className="text-on-surface-variant hover:text-primary transition-colors duration-200"
                href="https://t.me/uksscchannel"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
              >
                <span className="material-symbols-outlined" aria-hidden="true">chat</span>
              </a>
              <a
                className="text-on-surface-variant hover:text-primary transition-colors duration-200"
                href="mailto:enquiries@theukssc.co.uk"
                aria-label="Email us"
              >
                <span className="material-symbols-outlined" aria-hidden="true">mail</span>
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="space-y-4">
              <p className="font-label text-label text-on-surface uppercase tracking-widest font-bold">
                Organization
              </p>
              <ul className="space-y-2">
                <li>
                  <a
                    className="text-on-surface-variant font-label hover:text-secondary hover:translate-x-1 transition-[color,transform] duration-200 block"
                    href="https://www.theukssc.co.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    UKSSC Info
                  </a>
                </li>
                <li>
                  <a
                    className="text-on-surface-variant font-label hover:text-secondary hover:translate-x-1 transition-[color,transform] duration-200 block"
                    href="#about"
                  >
                    About Project Orchid
                  </a>
                </li>
                <li>
                  <a
                    className="text-on-surface-variant font-label hover:text-secondary hover:translate-x-1 transition-[color,transform] duration-200 block"
                    href="mailto:enquiries@theukssc.co.uk"
                  >
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <p className="font-label text-label text-on-surface uppercase tracking-widest font-bold">
                Resources
              </p>
              <ul className="space-y-2">
                <li>
                  <a
                    className="text-on-surface-variant font-label hover:text-secondary hover:translate-x-1 transition-[color,transform] duration-200 block"
                    href="mailto:enquiries@theukssc.co.uk"
                  >
                    Support Center
                  </a>
                </li>
                <li>
                  <a
                    className="text-on-surface-variant font-label hover:text-secondary hover:translate-x-1 transition-[color,transform] duration-200 block"
                    href="/privacy"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    className="text-on-surface-variant font-label hover:text-secondary hover:translate-x-1 transition-[color,transform] duration-200 block"
                    href="mailto:enquiries@theukssc.co.uk"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-container-max mx-auto px-gutter py-6 border-t border-outline-variant/30 text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            © 2024 UK Singapore Students&apos; Council (UKSSC). Built for the Orchid Community.
          </p>
        </div>
      </footer>
    </div>
  );
}
