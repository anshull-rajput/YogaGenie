from pydantic import BaseModel, Field
from typing import Any

class UserContext(BaseModel):
    name: str | None = None
    goal: str | None = None
    experience: str | None = None
    duration: int | None = None
    preferredTime: str | None = None
    frequency: int | None = None
    streak: int = 0
    focusAreas: list[str] = Field(default_factory=list)
    styles: list[str] = Field(default_factory=list)
    current_plan: list[dict[str, Any]] = Field(default_factory=list)

class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    user_context: UserContext = Field(default_factory=UserContext)
    conversation_history: list[dict[str, str]] = Field(default_factory=list)

class ChatResponse(BaseModel):
    response: str
    recommendations: list[dict[str, Any]] = Field(default_factory=list)
    sources: list[str] = Field(default_factory=list)
