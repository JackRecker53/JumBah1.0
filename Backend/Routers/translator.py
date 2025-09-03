from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from Models.dictionary import init_translator
from typing import Optional, Dict, Any

router = APIRouter()
translator = init_translator()

class TranslationRequest(BaseModel):
    text: str
    from_lang: Optional[str] = "en"

class TranslationResponse(BaseModel):
    original: str
    translations: Dict[str, str]
    from_lang: str
    to_lang: str = "dusun"
    details: Dict[str, Any]
    ai_provider: Optional[str] = None

@router.post("/translate")
async def translate(request: TranslationRequest):
    try:
        result = translator.translate(
            request.text,
            request.from_lang,
            use_ai=True  # Set to False to disable AI enhancement
        )
        
        return {
            "original": request.text,
            "from_lang": request.from_lang,
            "to_lang": "dusun",
            "translations": {
                "basic": result["basic_translation"],
                "enhanced": result["enhanced_translation"]
            },
            "details": {
                "found_words": result["found_words"],
                "not_found": result["not_found"],
                "has_ai_enhancement": result["has_ai_enhancement"]
            },
            "ai_provider": result["ai_provider"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
