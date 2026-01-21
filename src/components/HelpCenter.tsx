import { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  BookOpen,
  MessageCircle,
  Mail,
  ExternalLink,
  Lightbulb,
  CreditCard,
  Settings,
  Zap,
  ArrowLeft
} from 'lucide-react';

interface HelpCenterProps {
  onBack?: () => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    id: '1',
    category: 'Getting Started',
    question: 'What is Project Sapiens?',
    answer: 'Project Sapiens is an AI fluency learning platform designed to help you integrate AI into your daily life. Through guided lessons, hands-on labs, and real-world projects, you\'ll build confidence and practical skills in using AI tools effectively.'
  },
  {
    id: '2',
    category: 'Getting Started',
    question: 'How do I get started?',
    answer: 'Start with the "Foundations" learning path from your dashboard. This will guide you through the basics of AI, prompt writing, and practical applications. Each lesson includes exercises and journal prompts to help you reflect and apply what you learn.'
  },
  {
    id: '3',
    category: 'Getting Started',
    question: 'Do I need any technical background?',
    answer: 'No technical background is required! Project Sapiens is designed for everyone, regardless of their experience with technology or AI. We start with the fundamentals and build up gradually.'
  },
  {
    id: '4',
    category: 'AI Labs',
    question: 'What are AI Labs?',
    answer: 'AI Labs are interactive environments where you can practice using AI in real-world scenarios. Each lab provides a specific challenge or project, with an AI assistant to guide you through the process and provide feedback on your approach.'
  },
  {
    id: '5',
    category: 'AI Labs',
    question: 'How do I access AI Labs?',
    answer: 'AI Labs are available from the "Labs" section in the navigation menu. Some advanced labs may require completion of prerequisite lessons or a paid subscription.'
  },
  {
    id: '6',
    category: 'AI Labs',
    question: 'Can I save my progress in labs?',
    answer: 'Yes! Your progress is automatically saved as you work. You can return to any lab at any time to continue where you left off.'
  },
  {
    id: '7',
    category: 'Account & Billing',
    question: 'What\'s included in the free plan?',
    answer: 'The free plan includes access to foundational lessons, basic AI labs, and community features. You can complete the first learning path and explore introductory content without any payment.'
  },
  {
    id: '8',
    category: 'Account & Billing',
    question: 'What are the subscription tiers?',
    answer: 'We offer three plans: Free (basic lessons and labs), Pro ($29/month - unlimited labs, advanced content, priority support), and Enterprise (custom pricing - team features, admin tools, dedicated support).'
  },
  {
    id: '9',
    category: 'Account & Billing',
    question: 'How do I upgrade my account?',
    answer: 'Click on the "Billing" button in your dashboard to view available plans and upgrade. You can change your subscription at any time from the billing page.'
  },
  {
    id: '10',
    category: 'Account & Billing',
    question: 'Can I cancel my subscription?',
    answer: 'Yes, you can cancel your subscription at any time from the billing page. You\'ll retain access to paid features until the end of your billing period.'
  },
  {
    id: '11',
    category: 'Learning Paths',
    question: 'What are Learning Paths?',
    answer: 'Learning Paths are structured sequences of lessons designed to build specific skills. Each path takes you from foundational concepts to advanced applications in a logical, progressive order.'
  },
  {
    id: '12',
    category: 'Learning Paths',
    question: 'Can I skip lessons?',
    answer: 'While you can access any lesson within an unlocked path, we recommend following the suggested order for the best learning experience. Each lesson builds on concepts from previous ones.'
  },
  {
    id: '13',
    category: 'Learning Paths',
    question: 'How long does each path take?',
    answer: 'Most paths take 2-4 weeks to complete if you dedicate 30-60 minutes per day. However, you can learn at your own pace and take as much time as you need.'
  },
  {
    id: '14',
    category: 'Technical Support',
    question: 'The AI chat isn\'t responding. What should I do?',
    answer: 'First, try refreshing the page. If the issue persists, check your internet connection and ensure you\'re logged in. If you continue to experience issues, contact support through the help center.'
  },
  {
    id: '15',
    category: 'Technical Support',
    question: 'How do I reset my password?',
    answer: 'Go to the login page and click "Forgot Password". Enter your email address and you\'ll receive a password reset link. Follow the instructions in the email to set a new password.'
  },
  {
    id: '16',
    category: 'Technical Support',
    question: 'My progress isn\'t saving. Help!',
    answer: 'Make sure you have a stable internet connection. Progress is saved automatically when you complete actions. If you\'re consistently experiencing issues, try clearing your browser cache or contact support.'
  },
  {
    id: '17',
    category: 'Community & Network',
    question: 'How do I connect with other learners?',
    answer: 'The Intentional Network feature (available in Pro and Enterprise plans) allows you to connect with other learners, share projects, and collaborate on challenges. Access it from the "Network" tab in your dashboard.'
  },
  {
    id: '18',
    category: 'Community & Network',
    question: 'Can I share my projects publicly?',
    answer: 'Yes! You can share your projects with specific individuals or make them public for the entire community to see. Use the share button on any project to set visibility preferences.'
  }
];

const categories = [
  { name: 'Getting Started', icon: Lightbulb },
  { name: 'AI Labs', icon: Zap },
  { name: 'Learning Paths', icon: BookOpen },
  { name: 'Account & Billing', icon: CreditCard },
  { name: 'Technical Support', icon: Settings },
  { name: 'Community & Network', icon: MessageCircle }
];

export default function HelpCenter({ onBack }: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const filteredFAQs = useMemo(() => {
    let filtered = faqs;

    if (selectedCategory) {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F4]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {onBack && (
          <button
            onClick={onBack}
            className="bg-white border border-black px-4 py-2 mb-8 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            BACK
          </button>
        )}

        <div className="text-center mb-12">
          <h1 className="font-extrabold text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter mb-4">
            HELP CENTER
          </h1>
          <p className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Find answers to common questions, explore guides, and get the support you need.
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2"
              size={20}
              strokeWidth={2}
            />
            <input
              type="text"
              placeholder="SEARCH FOR HELP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-black focus:border-[#FF6A00] focus:outline-none transition-colors font-medium uppercase tracking-tight placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="mb-12">
          <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-6">
            BROWSE BY CATEGORY
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.name;

              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(isSelected ? null : category.name)}
                  className={`p-6 border-2 border-black transition-all ${
                    isSelected
                      ? 'bg-[#FF6A00] text-black shadow-none translate-x-[2px] translate-y-[2px]'
                      : 'bg-white shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                  }`}
                >
                  <Icon
                    size={28}
                    className="mx-auto mb-3"
                    strokeWidth={2}
                  />
                  <div className="text-xs font-extrabold uppercase tracking-tight text-center">
                    {category.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-6">
            {selectedCategory ? `${selectedCategory.toUpperCase()} QUESTIONS` : 'FREQUENTLY ASKED QUESTIONS'}
          </h2>

          {filteredFAQs.length === 0 ? (
            <div className="bg-white border-2 border-black p-12 text-center shadow-[2px_2px_0px_#000000]">
              <p className="font-medium">
                NO RESULTS FOUND. TRY ADJUSTING YOUR SEARCH OR CATEGORY FILTER.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white border-2 border-black shadow-[2px_2px_0px_#000000]"
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 text-left">
                      <div className="text-xs font-extrabold mb-2 text-[#FF6A00] uppercase tracking-tight">
                        {faq.category}
                      </div>
                      <div className="font-bold text-base">
                        {faq.question}
                      </div>
                    </div>
                    {expandedFAQ === faq.id ? (
                      <ChevronUp size={24} strokeWidth={2} className="ml-4 flex-shrink-0" />
                    ) : (
                      <ChevronDown size={24} strokeWidth={2} className="ml-4 flex-shrink-0" />
                    )}
                  </button>

                  {expandedFAQ === faq.id && (
                    <div className="px-6 pb-6 pt-2 border-t-2 border-black">
                      <p className="leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border-2 border-black p-8 shadow-[2px_2px_0px_#000000] mb-8">
          <h2 className="font-extrabold text-2xl uppercase tracking-tight mb-4">
            STILL NEED HELP?
          </h2>
          <p className="mb-6 leading-relaxed">
            Can't find what you're looking for? Our support team is here to help.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="mailto:support@projectsapiens.xyz"
              className="flex items-center gap-4 p-6 bg-[#F4F4F4] border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <div className="bg-[#FF6A00] border-2 border-black p-3">
                <Mail size={24} strokeWidth={2} />
              </div>
              <div>
                <div className="font-extrabold text-sm uppercase tracking-tight mb-1">
                  EMAIL SUPPORT
                </div>
                <div className="text-sm">
                  support@projectsapiens.xyz
                </div>
              </div>
            </a>

            <a
              href="/admin/tickets"
              className="flex items-center gap-4 p-6 bg-[#F4F4F4] border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <div className="bg-[#FF6A00] border-2 border-black p-3">
                <MessageCircle size={24} strokeWidth={2} />
              </div>
              <div>
                <div className="font-extrabold text-sm uppercase tracking-tight mb-1">
                  SUBMIT A TICKET
                </div>
                <div className="text-sm">
                  Get personalized support
                </div>
              </div>
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <a
            href="/about"
            className="p-6 bg-white border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={20} strokeWidth={2} />
              <h3 className="font-extrabold text-sm uppercase tracking-tight">
                ABOUT US
              </h3>
            </div>
            <p className="text-sm">
              Learn more about Project Sapiens and our mission
            </p>
          </a>

          <a
            href="/terms"
            className="p-6 bg-white border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <ExternalLink size={20} strokeWidth={2} />
              <h3 className="font-extrabold text-sm uppercase tracking-tight">
                TERMS OF SERVICE
              </h3>
            </div>
            <p className="text-sm">
              Read our terms and conditions
            </p>
          </a>

          <a
            href="/privacy"
            className="p-6 bg-white border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <ExternalLink size={20} strokeWidth={2} />
              <h3 className="font-extrabold text-sm uppercase tracking-tight">
                PRIVACY POLICY
              </h3>
            </div>
            <p className="text-sm">
              Learn how we protect your data
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
