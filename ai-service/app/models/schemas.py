from pydantic import BaseModel, Field
from typing import Any
class UserContext(BaseModel):
    name:str|None=None; goal:str|None=None; experience:str|None=None; duration:int|None=None; preferredTime:str|None=None; frequency:int|None=None; streak:int=0; focusAreas:list[str]=[]; styles:list[str]=[]; current_plan:list[dict[str,Any]]=[]
class ChatRequest(BaseModel):
    message:str=Field(min_length=1,max_length=4000); user_context:UserContext=UserContext(); conversation_history:list[dict[str,str]]=[]
class ChatResponse(BaseModel):
    response:str; recommendations:list[dict[str,Any]]=[]; sources:list[str]=[]
