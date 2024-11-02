from fastapi import FastAPI
from googletrans import Translator

app = FastAPI()
translator = Translator()

@app.post("/translate")
async def translate(text: str, targetLang: str):
    translated = translator.translate(text, dest=targetLang)
    return {"translatedText": translated.text}
