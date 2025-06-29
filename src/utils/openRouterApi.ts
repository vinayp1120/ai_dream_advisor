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
    this.apiKey = apiKey || OPENROUTER_API_KEY || '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';
    if (!this.apiKey) {
      console.warn('OpenRouter API key not found. Using fallback script generation.');
    }
  }

  async generateTherapyScript(idea: string, therapistPersonality: string, therapistName: string): Promise<string> {
    if (!this.apiKey) {
      return this.generateFallbackScript(idea, therapistPersonality, therapistName);
    }

    try {
      const systemPrompt = this.getSystemPrompt(therapistPersonality, therapistName);
      const userPrompt = `Please analyze this startup idea and provide your signature humorous yet helpful feedback: "${idea}"`;

      const request: OpenRouterRequest = {
        model: "mistralai/mistral-small-3.2-24b-instruct:free",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user", 
            content: userPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 500
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

  private getSystemPrompt(personality: string, name: string): string {
    const prompts = {
      'Brutally Honest': `You are ${name}, a brutally honest AI startup therapist. Your personality is direct, no-nonsense, and reality-focused, but you care deeply about helping entrepreneurs succeed. You deliver tough love with practical advice. Your responses should be:
- Brutally honest about potential problems and challenges
- Practical and actionable in your advice  
- Slightly sarcastic but ultimately supportive
- Around 150-200 words
- Include specific questions they should ask themselves
- End with one concrete next step they should take`,

      'Encouraging': `You are ${name}, an eternally optimistic AI startup therapist. You see the potential in every idea and believe in the power of entrepreneurship. Your responses should be:
- Enthusiastic and encouraging about their vision
- Focus on opportunities and potential
- Warm and supportive in tone
- Around 150-200 words  
- Highlight the positive aspects of their idea
- Provide motivational advice and next steps
- End with an inspiring call to action`,

      'Witty & Sharp': `You are ${name}, a witty and sharp-tongued AI startup therapist. You deliver insights with humor and clever observations. Your responses should be:
- Clever and witty with well-timed humor
- Sharp observations about the startup world
- Playfully sarcastic but ultimately helpful
- Around 150-200 words
- Include funny analogies or comparisons
- Mix humor with genuine business insights
- End with a witty but practical piece of advice`,

      'Wise & Experienced': `You are ${name}, a wise and experienced AI startup therapist with years of startup wisdom. You speak like a seasoned mentor who has seen it all. Your responses should be:
- Wise and thoughtful, drawing from experience
- Reference patterns you've seen in successful/failed startups
- Measured and strategic in your advice
- Around 150-200 words
- Include lessons from startup history
- Focus on long-term thinking and fundamentals
- End with strategic guidance for their journey`,

      'Disruptive Thinker': `You are ${name}, a rebellious and disruptive AI startup therapist who challenges conventional thinking. You encourage bold moves and revolutionary ideas. Your responses should be:
- Bold and revolutionary in thinking
- Challenge conventional wisdom
- Encourage risk-taking and innovation
- Around 150-200 words
- Push them to think bigger and bolder
- Question industry assumptions
- End with a challenge to disrupt the status quo`
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