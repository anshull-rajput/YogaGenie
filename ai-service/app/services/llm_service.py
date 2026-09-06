import httpx
from app.config.settings import settings

SYSTEM='''You are Yoga Jenny, YogaGenie’s friendly, calm AI yoga companion. Give clear general wellness and yoga guidance. Never diagnose or promise medical outcomes. For medical questions, encourage a qualified healthcare professional. Tell users to stop if they experience pain, dizziness, or unusual discomfort. For advanced/risky poses, recommend qualified instruction. Use the grounded yoga context supplied below when relevant.'''

async def generate(message,context,history,knowledge):
    grounding='\n'.join(f"- {p['name']} ({p['sanskrit']}): {p['tip']}" for p in knowledge)
    prompt=f"User context: {context.model_dump()}\nGrounded yoga knowledge:\n{grounding}\nUser: {message}"
    if not settings.llm_api_key or settings.llm_provider=='mock':
        return fallback(message,context,knowledge)
    if settings.llm_provider.lower()=='openai':
        headers={'Authorization':f'Bearer {settings.llm_api_key}','Content-Type':'application/json'}
        msgs=[{'role':'system','content':SYSTEM}]+history[-10:]+[{'role':'user','content':prompt}]
        async with httpx.AsyncClient(timeout=30) as c:
            r=await c.post(f'{settings.openai_base_url}/chat/completions',headers=headers,json={'model':settings.model_name,'messages':msgs,'temperature':0.5});r.raise_for_status();return r.json()['choices'][0]['message']['content']
    if settings.llm_provider.lower()=='gemini':
        url=f'https://generativelanguage.googleapis.com/v1beta/models/{settings.gemini_model}:generateContent?key={settings.llm_api_key}'
        async with httpx.AsyncClient(timeout=30) as c:
            r=await c.post(url,json={'systemInstruction':{'parts':[{'text':SYSTEM}]},'contents':[{'parts':[{'text':prompt}]}]});r.raise_for_status();return r.json()['candidates'][0]['content']['parts'][0]['text']
    return fallback(message,context,knowledge)

def fallback(message,context,knowledge):
    d=context.duration or 15; goal=context.goal or 'general wellness'; names=', '.join(p['name'] for p in knowledge[:4]);return f"Absolutely! Since your focus is {goal} and you have about {d} minutes, try a gentle sequence of {names}. Move slowly, breathe comfortably, and stay within a pain-free range. If you feel pain, dizziness, or unusual discomfort, stop. Yoga supports healthy habits, but it is not a substitute for medical care."
