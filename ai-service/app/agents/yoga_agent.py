from app.services.rag_service import retrieve
from app.services.llm_service import generate
from app.models.schemas import ChatRequest

async def chat(req:ChatRequest):
    knowledge=retrieve(req.message,req.user_context.goal)
    answer=await generate(req.message,req.user_context,req.conversation_history,knowledge)
    rec=[{'name':p['name'],'sanskrit':p['sanskrit'],'difficulty':p['difficulty']} for p in knowledge]
    return {'response':answer,'recommendations':rec,'sources':[p['name'] for p in knowledge]}
