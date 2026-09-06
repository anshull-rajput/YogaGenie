import httpx
from app.config.settings import settings

SYSTEM = '''You are Yoga Jenny, YogaGenie’s friendly, calm, supportive AI yoga companion. Use simple, beginner-friendly language and personalize every answer from the user's goal, experience, available time, preferred practice time, focus areas, styles, streak and current plan. If the user has limited time, adapt the routine to that exact duration instead of suggesting a longer practice. Give practical yoga, breathing, mindfulness, sleep and routine guidance. Never diagnose, prescribe, promise weight loss/weight gain or other medical outcomes, or present yoga as medical treatment. For medical concerns encourage a qualified healthcare professional. Always tell users to stop if they experience pain, dizziness, faintness, or unusual discomfort. For advanced or higher-risk poses recommend qualified instruction and safer alternatives when appropriate. Do not invent pose facts when grounded knowledge is available. When giving a routine, structure it with warm-up, main practice, cool-down and breathing/meditation when useful. Encourage consistency without pressuring users to exercise excessively.'''


async def generate(message, context, history, knowledge):
    grounding = '\n'.join(
        f"- {p['name']} ({p['sanskrit']}), difficulty: {p['difficulty']}, duration: {p['duration']} min; "
        f"goals: {', '.join(p['goals'])}; benefits: {', '.join(p['benefits'])}; "
        f"instructions: {p['instructions']}; precautions: {p['precautions']}"
        for p in knowledge
    )
    user_context = context.model_dump()
    plan = '\n'.join(
        f"{x.get('day')}: {x.get('sessionName')} | {x.get('duration')} min | {x.get('focus')} | {x.get('status')}"
        for x in context.current_plan[:7]
    )
    prompt = f"User context: {user_context}\nCurrent weekly plan:\n{plan or 'No active plan'}\nGrounded yoga knowledge:\n{grounding}\nCurrent user message: {message}"

    if not settings.llm_api_key or settings.llm_provider.lower() == 'mock':
        return fallback(message, context, knowledge)

    if settings.llm_provider.lower() == 'openai':
        headers = {'Authorization': f'Bearer {settings.llm_api_key}', 'Content-Type': 'application/json'}
        msgs = [{'role': 'system', 'content': SYSTEM}] + history[-10:] + [{'role': 'user', 'content': prompt}]
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f'{settings.openai_base_url}/chat/completions',
                headers=headers,
                json={'model': settings.model_name, 'messages': msgs, 'temperature': 0.4}
            )
            response.raise_for_status()
            return response.json()['choices'][0]['message']['content']

    if settings.llm_provider.lower() == 'gemini':
        contents = [
            {'role': 'user' if h.get('role') == 'user' else 'model', 'parts': [{'text': h.get('content', '')}]}
            for h in history[-10:]
        ]
        contents.append({'role': 'user', 'parts': [{'text': prompt}]})
        url = f'https://generativelanguage.googleapis.com/v1beta/models/{settings.gemini_model}:generateContent?key={settings.llm_api_key}'
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(url, json={'systemInstruction': {'parts': [{'text': SYSTEM}]}, 'contents': contents})
            response.raise_for_status()
            return response.json()['candidates'][0]['content']['parts'][0]['text']

    return fallback(message, context, knowledge)


def fallback(message, context, knowledge):
    duration = context.duration or 15
    goal = context.goal or 'general wellness'
    if not knowledge:
        return f"I can help with a {duration}-minute {goal} practice. Keep your movement comfortable and stop if you feel pain, dizziness, or unusual discomfort."
    names = ', '.join(p['name'] for p in knowledge[:4])
    return (
        f"Absolutely! With your {duration}-minute window and focus on {goal}, try {names}. "
        "Move slowly, breathe comfortably, and stay in a pain-free range. "
        "If you feel pain, dizziness, or unusual discomfort, stop. Yoga supports healthy habits but is not a substitute for medical care."
    )
