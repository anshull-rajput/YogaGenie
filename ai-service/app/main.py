from fastapi import FastAPI,HTTPException
from app.models.schemas import ChatRequest,ChatResponse
from app.agents.yoga_agent import chat
app=FastAPI(title='YogaGenie Yoga Jenny AI',version='1.0.0')
@app.get('/health')
async def health(): return {'ok':True,'service':'yoga-jenny-ai'}
@app.post('/chat',response_model=ChatResponse)
async def chat_endpoint(req:ChatRequest):
    try:return await chat(req)
    except Exception as e: raise HTTPException(status_code=503,detail='AI service temporarily unavailable') from e
