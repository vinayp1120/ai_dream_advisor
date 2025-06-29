const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterAPI {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || OPENROUTER_API_KEY;
    if (!this.apiKey) {
      console.warn('OpenRouter API key not found. Using fallback script generation.');
    }
  }

  async generateTherapyScript(idea: string, therapistPersonality: string, therapistName: string): Promise<string> {
    if (!this.apiKey) {
      return this.generateFallbackScript(idea, therapistPersonality, therapistName);
    }

    try {
      const systemPrompt = this.getTherapistPrompt(therapistPersonality, therapistName, idea);

      const request: OpenRouterRequest = {
        model: "mistralai/mistral-small-3.2-24b-instruct:free",
        messages: [
          {
            role: "system",
            content: systemPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 850
      };

      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://dreamadvisor.app',
          'X-Title': 'DreamAdvisor - AI Startup Therapist'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error:', response.status, errorText);
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const result: OpenRouterResponse = await response.json();
      
      if (result.choices && result.choices.length > 0) {
        return result.choices[0].message.content.trim();
      } else {
        throw new Error('No response generated');
      }

    } catch (error) {
      console.error('Error generating therapy script:', error);
      return this.generateFallbackScript(idea, therapistPersonality, therapistName);
    }
  }

  private getTherapistPrompt(personality: string, name: string, idea: string): string {
    const prompts = {
      'Brutally Honest': `Act as Dr. Reality Check, a startup therapist known for your no-nonsense, brutally honest approach. You've spent 15+ years dissecting business ideas with sharp market analysis, risk assessment, and business model validation. You don't sugar-coat, you don't flatter — you tell it exactly how it is. Give me a structured breakdown of what's wrong with my idea, where it might fail, and how to fix it with practical, tough-love advice. Be direct, clinical, and real. Don't waste time on praise unless it's earned.

The idea: ${idea}

Limit your response to 850 characters.`,

      'Encouraging': `Act as Prof. Eternal Optimist, a warm, supportive entrepreneurship coach with 20+ years of experience. You specialize in motivation, team morale, and visionary thinking. Your style is uplifting, encouraging, and emotionally intelligent. No matter how rough the idea is, you highlight its potential, build up confidence, and inspire forward momentum. Offer visionary insight, emotional reassurance, and a practical next step that reignites belief.

The idea: ${idea}

Limit your response to 850 characters.`,

      'Witty & Sharp': `Act as Dr. Sarcasm, a quick-witted, humor-laced startup therapist with 12+ years in the creative industry. You blend comedy with critique, roasting bad ideas just enough to make people laugh and think. You're not mean—you're clever. Give a brutally honest, funny, and insight-packed take on the idea. Entertain while advising. Use sarcasm to reframe the problem, spot creative gaps, and suggest improvements—all while keeping it fun.

The idea: ${idea}

Limit your response to 850 characters.`,

      'Wise & Experienced': `Act as The Startup Sage, a wise, seasoned strategist with 25+ years of experience building and scaling companies. You speak with calm authority, offering deep insight, long-term perspective, and practical wisdom. Your feedback is grounded in strategic logic, startup history, and leadership theory. Break down this idea with a mentor's care—identify strengths, critical risks, and long-term scaling advice as if guiding a founder through a pivotal moment.

The idea: ${idea}

Limit your response to 850 characters.`,

      'Disruptive Thinker': `Act as Rebel Innovator, a bold and provocative startup therapist with 10+ years of experience disrupting industries. You question assumptions, hate playing it safe, and thrive on rule-breaking ideas. Your feedback is edgy, future-focused, and rebellious. Tear apart conventional parts of the idea, challenge norms, and suggest wildly innovative directions. Be daring. Make me rethink everything. You're here to provoke innovation.

The idea: ${idea}

Limit your response to 850 characters.`
    };

    return prompts[personality as keyof typeof prompts] || prompts['Brutally Honest'];
  }

  private generateFallbackScript(idea: string, personality: string, name: string): string {
    const fallbackScripts = {
      'Brutally Honest': `Look, I'm not here to sugarcoat things. "${idea}" - let's break this down. 

First question: Have you actually talked to potential customers, or are you just assuming they want this? Because assumption is the mother of all startup failures.

The market validation is your biggest hurdle here. You need to prove people will actually pay for this before you build anything. And please, for the love of all that's holy, don't say "if we just get 1% of the market."

That said, there's a kernel of something here if you can execute properly. The key is starting small and validating demand.

My advice? Talk to 50 potential customers this week. If 10 of them don't immediately see the value, pivot or iterate. Reality check complete.`,

      'Encouraging': `Oh my goodness, "${idea}" - what a fascinating concept! I can absolutely see the passion and creativity behind this vision.

You know what I love about this? You're identifying a real gap in the market that people are hungry for solutions to address. The timing feels perfect for this type of innovation.

The monetization opportunities are exciting - you could start with a freemium model, add premium features, maybe even explore licensing deals down the road.

Sure, there will be challenges, but every great startup faces obstacles. That's what makes the entrepreneurial journey so rewarding and transformative!

My advice? Start with an MVP, get user feedback early and often, and iterate quickly based on what you learn. You've got something special here - I can feel the potential! Now go make it happen!`,

      'Witty & Sharp': `Well, well, well... "${idea}". I have to admit, it's... creative. And by creative, I mean I've never seen anything quite like it before. Whether that's good or bad remains to be seen.

The complexity of execution is only slightly terrifying, but hey, if you enjoy impossible challenges and sleepless nights, this is absolutely perfect for you.

Your target market might exist somewhere in an alternate dimension, but stranger things have succeeded in Silicon Valley. I've seen people make millions selling virtual pet rocks, so who am I to judge?

Look, I'm not saying it's impossible. I'm just saying you might want to simplify it until your grandmother can explain it to her cat. Then simplify it some more.

But who knows? Maybe you'll prove me wrong and I'll be eating my words. Wouldn't be the first time someone succeeded despite my skepticism.`,

      'Wise & Experienced': `Ah, "${idea}". This reminds me of several successful companies I've observed over the years, but with a unique twist that could become your competitive advantage.

In my experience, the key to success here will be execution and timing. The market appears ready for disruption in this space, much like we saw with ride-sharing before Uber.

I've seen similar concepts fail because founders focused on features instead of solving real problems. The winners always start with deep customer understanding and build from there.

Focus on building strong foundations first - get your unit economics right, build a defensible moat, and scale methodically. Remember, every unicorn started as someone's "crazy" idea.

My strategic advice? Build, measure, learn, repeat until you find product-market fit. Then scale like your business depends on it - because it does. The fundamentals never change, only the execution evolves.`,

      'Disruptive Thinker': `"${idea}" - now THIS is what I'm talking about! You're not just thinking outside the box, you're setting the box on fire and dancing around the flames!

This has the potential to completely disrupt the status quo. The incumbents won't see this coming, and that's exactly where you want to be.

The beauty of this idea is that it challenges fundamental assumptions about how things should work. Don't let anyone tell you to "play it safe" - the biggest wins come from the biggest risks.

You know what? Forget market research. Forget focus groups. Build something so revolutionary that people have no choice but to pay attention.

My challenge to you? Move fast and break things. Build something that makes the competition scramble to catch up. The world needs more rebels like you who aren't afraid to challenge everything. Now go disrupt something!`
    };

    return fallbackScripts[personality as keyof typeof fallbackScripts] || fallbackScripts['Brutally Honest'];
  }
}