# JumBah

## Quick Start

1. **Install Dependencies**:

   ```bash
   cd Backend
   pip install -r requirements.txt
   ```

2. **Setup Environment**:
   Create `.env` file in Backend folder:

   ```env
   OPENAI_API_KEY=your_openai_api_key
   GOOGLE_API_KEY=your_google_api_key
   ```

3. **Start Backend**:

   ```bash
   cd Backend
   uvicorn app:app --reload
   ```

   Visit http://localhost:8000/docs for API documentation.

## Features

- Dusun language translation
- AI-enhanced translations (Gemini & GPT)
- Automated dictionary updates
- Interactive API documentation
