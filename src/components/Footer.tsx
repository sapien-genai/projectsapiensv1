export default function Footer() {
  return (
    <footer className="bg-black text-[#F4F4F4] mt-24">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-tight mb-4">
              PLATFORM
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#paths" className="hover:text-[#FF6A00] transition-colors">Paths</a></li>
              <li><a href="#labs" className="hover:text-[#FF6A00] transition-colors">Labs</a></li>
              <li><a href="#community" className="hover:text-[#FF6A00] transition-colors">Community</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-tight mb-4">
              COMPANY
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#careers" className="hover:text-[#FF6A00] transition-colors">Careers</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-tight mb-4">
              RESOURCES
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#tools" className="hover:text-[#FF6A00] transition-colors">Tools</a></li>
              <li><a href="#api" className="hover:text-[#FF6A00] transition-colors">API</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-tight mb-4">
              SOCIAL
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#twitter" className="hover:text-[#FF6A00] transition-colors">Twitter</a></li>
              <li><a href="#linkedin" className="hover:text-[#FF6A00] transition-colors">LinkedIn</a></li>
              <li><a href="#github" className="hover:text-[#FF6A00] transition-colors">GitHub</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t-2 border-[#555555] pt-8">
          <p className="text-sm text-center">
            &copy; 2026 PROJECT SAPIENS
          </p>
        </div>
      </div>
    </footer>
  );
}
