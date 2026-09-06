from pydantic_settings import BaseSettings
class Settings(BaseSettings):
    llm_provider:str='mock'; llm_api_key:str=''; model_name:str='gpt-4o-mini'; openai_base_url:str='https://api.openai.com/v1'; gemini_model:str='gemini-2.0-flash'
    class Config: env_file='.env'; extra='ignore'
settings=Settings()
