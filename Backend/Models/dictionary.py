from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import json
import time
import os
from typing import Dict, List
import openai
from openai import OpenAI
import google.generativeai as genai

class DusunTranslator:
    def __init__(self):
        self.dictionary: Dict[str, str] = {}
        self.client = None
        self.gemini_model = None
        self.load_dictionary()
        
        # Initialize Gemini model
        try:
            self.gemini_model = genai.GenerativeModel(
                model_name="gemini-2.5-flash",
                generation_config={
                    "temperature": 0.7,
                    "max_output_tokens": 150,
                }
            )
        except Exception as e:
            print(f"Failed to initialize Gemini: {str(e)}")
            
        # Initialize OpenAI as fallback if API key is available
        openai_api_key = os.getenv('OPENAI_API_KEY')
        if openai_api_key:
            try:
                self.client = OpenAI(api_key=openai_api_key)
            except Exception as e:
                print(f"Failed to initialize OpenAI: {str(e)}")

    def load_dictionary(self):
        """Load the dictionary from JSON file if it exists, otherwise scrape it"""
        try:
            with open("dusun_dictionary.json", "r", encoding="utf-8") as f:
                entries = json.load(f)
                self.dictionary = {entry["english"].lower(): entry["dusun"] for entry in entries}
        except FileNotFoundError:
            self.scrape_and_save_dictionary()

    def scrape_and_save_dictionary(self):
        """Scrape dictionary from Glosbe and save to JSON"""
        entries = []
        blog_url = "https://kandokfamily.blogspot.com/2015/03/mari-belajar-bahasa-dusun.html"
        
        # Setup Chrome with required options
        options = webdriver.ChromeOptions()
        options.add_argument('--headless=new')
        options.add_argument('--disable-gpu')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--window-size=1920,1080')
        options.add_experimental_option('excludeSwitches', ['enable-logging'])
        options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36')
        
        print("Initializing Chrome driver...")
        driver = webdriver.Chrome(options=options)
        wait = WebDriverWait(driver, 10)

        try:
            print("Starting dictionary scraping from blog...")
            driver.get(blog_url)
            
            # Wait for the blog content to load
            wait.until(EC.presence_of_element_located((By.CLASS_NAME, "post-body")))
            
            # Get the main content
            content = driver.find_element(By.CLASS_NAME, "post-body").text
            
            # Split content into lines
            lines = content.split('\n')
            
            # Process each line
            current_section = ""
            for line in lines:
                line = line.strip()
                
                # Skip empty lines
                if not line:
                    continue
                    
                # Look for section headers (usually in all caps)
                if line.isupper() and len(line) > 3:
                    current_section = line
                    continue
                
                try:
                    # Try different separators and formats
                    parts = None
                    english = None
                    dusun = None
                    
                    # Handle cases like "Good morning - Kopivosian do kosuabon"
                    if ' - ' in line:
                        parts = line.split(' - ', 1)
                        if parts and len(parts) == 2:
                            # Check if the first part has a slash (like "Monday/Isnin")
                            if '/' in parts[0]:
                                eng_parts = parts[0].split('/')
                                english = eng_parts[0].strip()
                                dusun = parts[1].strip()
                            else:
                                # Detect which part is likely Dusun by looking for common patterns
                                first_word = parts[0].strip().lower()
                                second_word = parts[1].strip()
                                
                                # Common Dusun prefixes
                                dusun_prefixes = ['min', 'mim', 'mom', 'kou', 'ko', 'ki', 'ku']
                                # Common Malay/English words that might appear in explanations
                                malay_words = ['ber', 'me', 'ter', 'se', 'di', 'ke', 'dari', 'yang', 'dan', 'untuk', 'dengan']
                                
                                # Check if first part starts with Dusun prefix
                                if any(first_word.startswith(prefix) for prefix in dusun_prefixes):
                                    dusun = parts[0].strip()
                                    english = parts[1].strip()
                                # Check if second part has Malay explanation patterns
                                elif any(word in parts[1].lower() for word in malay_words):
                                    dusun = parts[0].strip()
                                    english = parts[1].strip()
                                # Default to first part being English if no other patterns match
                                else:
                                    english = parts[0].strip()
                                    dusun = parts[1].strip()
                    
                    # Handle cases like "Good morning : Kopivosian do kosuabon"
                    elif ' : ' in line:
                        parts = line.split(' : ', 1)
                        if parts and len(parts) == 2:
                            # Apply same pattern detection logic
                            first_word = parts[0].strip().lower()
                            if any(first_word.startswith(prefix) for prefix in ['min', 'mim', 'mom', 'kou', 'ko', 'ki', 'ku']):
                                dusun = parts[0].strip()
                                english = parts[1].strip()
                            else:
                                english = parts[0].strip()
                                dusun = parts[1].strip()
                            
                    if english and dusun:
                        # Clean up the English part
                        english = english.lower()
                        if '[' in english:
                            english = english.split('[')[0].strip()
                        if ',' in english:
                            english = english.split(',')[0].strip()
                            
                        # Clean up the Dusun part
                        if '[' in dusun:
                            dusun = dusun.split('[')[0].strip()
                        if ',' in dusun:
                            dusun = dusun.split(',')[0].strip()
                        
                        # Skip invalid entries
                        if (len(english) < 2 or len(dusun) < 2 or 
                            '=' in english or '=' in dusun or
                            english.isupper() or  # Skip category headers
                            len(english.split()) > 5 or  # Skip long paragraphs
                            len(dusun.split()) > 5 or  # Skip long explanations
                            '.' in english or  # Skip sentences
                            len(english) > 50 or  # Skip very long text
                            len(dusun) > 50):  # Skip very long text
                            continue
                        
                        # Create the entry
                        entry = {
                            "english": english,
                            "dusun": dusun,
                            "category": current_section
                        }
                        
                        # Only add if it's a new unique entry and both parts look valid
                        if (entry not in entries and 
                            not any(e['english'] == english for e in entries) and
                            not any(e['dusun'] == dusun for e in entries) and
                            not english.startswith('hari') and  # Skip Malay day names
                            not english.startswith('tadau')):  # Skip Dusun day names
                            entries.append(entry)
                            print(f"Found translation: {english} - {dusun}")
                                
                except Exception as e:
                    print(f"Error processing line: {line}")
                    print(f"Error details: {str(e)}")
                    continue
                        
            if not entries:  # If scraping failed, use fallback data
                print("Scraping failed. Using fallback dictionary data...")
                entries = [
                    {"english": "hello", "dusun": "Kopivosian"},
                    {"english": "goodbye", "dusun": "Kotohuadan"},
                    {"english": "thank you", "dusun": "Pounsikou"},
                    {"english": "yes", "dusun": "Oou"},
                    {"english": "no", "dusun": "Aran"},
                    {"english": "good morning", "dusun": "Kopivosian do kosuabon"},
                    {"english": "good afternoon", "dusun": "Kopivosian do kotowonguon"},
                    {"english": "good evening", "dusun": "Kopivosian do minsosodop"},
                    {"english": "how are you", "dusun": "Nunu abal"},
                    {"english": "i am fine", "dusun": "Avasi zio"},
                    {"english": "what is your name", "dusun": "Isai ngaran nu"},
                    {"english": "my name is", "dusun": "Ngaran ku"},
                    {"english": "nice to meet you", "dusun": "Aramai do kopupusaan dika"},
                    {"english": "welcome", "dusun": "Kopivosian"},
                    {"english": "please", "dusun": "Kalaja po"},
                    {"english": "sorry", "dusun": "Posulimo"},
                    {"english": "excuse me", "dusun": "Oduo"},
                    {"english": "water", "dusun": "Waig"},
                    {"english": "food", "dusun": "Takanon"},
                    {"english": "friend", "dusun": "Kowusio"},
                    {"english": "food", "dusun": "takanon"},
                    {"english": "water", "dusun": "waig"},
                    {"english": "friend", "dusun": "toyoh"}
                ]
            
            # Save to JSON and update dictionary
            with open("dusun_dictionary.json", "w", encoding="utf-8") as f:
                json.dump(entries, f, ensure_ascii=False, indent=2)
            
            self.dictionary = {entry["english"].lower(): entry["dusun"] for entry in entries}
            print(f"Dictionary loaded with {len(entries)} entries")
                
        except Exception as e:
            print(f"Error occurred: {str(e)}")
        
        finally:
            driver.quit()

    def enhance_translation(self, text: str, translation: str) -> str:
        """Use ChatGPT to enhance the translation and make it more natural"""
        try:
            prompt = f"""
            Act as a Dusun language expert. Given the following:
            English text: {text}
            Basic translation: {translation}
            
            Please enhance this translation to make it more natural in Dusun.
            Consider:
            1. Proper word order
            2. Cultural context
            3. Common phrases and expressions
            4. Grammar rules
            
            Provide only the enhanced Dusun translation, nothing else.
            """
            
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a Dusun language expert."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=150
            )
            
            enhanced = response.choices[0].message.content.strip()
            return enhanced
        except Exception as e:
            print(f"Enhancement error: {str(e)}")
            return translation

    def enhance_translation_openai(self, original_text: str, basic_translation: str) -> str:
        """Enhance translation using OpenAI's ChatGPT"""
        try:
            prompt = f"""You are translating from English to Dusun (Bundu-Liwan dialect).
Original text: {original_text}
Basic dictionary translation: {basic_translation}
Please enhance this translation to be more natural and grammatically correct in Dusun.
Use the basic translation as a reference but improve the grammar and flow.
"""
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=100
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"OpenAI enhancement failed: {str(e)}")
            return None

    def enhance_translation_gemini(self, original_text: str, basic_translation: str) -> str:
        """Enhance translation using Google's Gemini"""
        try:
            prompt = f"""You are "Madu", a friendly sun bear and expert in Kadazandusun language (Bundu-Liwan dialect).
Your task is to enhance this translation to be more natural and grammatically correct.

Original English text: {original_text}
Basic dictionary translation: {basic_translation}

Rules:
1. Use ONLY the Bundu-Liwan dialect of Dusun
2. Keep the translation natural and grammatically correct
3. Return ONLY the enhanced translation, no explanations
4. Keep the translation concise and accurate
5. Use the basic translation as a reference, but improve the grammar and flow

Return only the enhanced Dusun translation:"""
            
            response = self.gemini_model.generate_content(prompt)
            
            if response.text:
                # Clean the response to get just the translation
                translation = response.text.strip()
                # Remove any markdown formatting or quotes if present
                translation = translation.strip('`"\' ')
                return translation
            return None
            
        except Exception as e:
            print(f"Gemini enhancement failed: {str(e)}")
            return None

    def translate(self, text: str, from_lang: str = "en", use_ai: bool = True) -> dict:
        """Translate text to Dusun using dictionary and optionally enhance with AI (OpenAI or Gemini)"""
        words = text.lower().split()
        translation = []
        found_words = []
        not_found = []
        
        # First pass: Direct dictionary lookup
        for word in words:
            if word in self.dictionary:
                translation.append(self.dictionary[word])
                found_words.append({"english": word, "dusun": self.dictionary[word]})
            else:
                translation.append(word)  # Keep unknown words as is
                not_found.append(word)
        
        basic_translation = " ".join(translation)
        
        # Second pass: Enhance with AI (Gemini first, OpenAI as fallback) if available and requested
        enhanced_translation = None
        has_ai_enhancement = False
        ai_provider = None

        if use_ai and (self.gemini_model or self.client) and not_found:
            try:
                # Try Gemini first
                if self.gemini_model:
                    enhanced_translation = self.enhance_translation_gemini(text, basic_translation)
                    if enhanced_translation:
                        ai_provider = "gemini"
                
                # Fall back to OpenAI only if Gemini fails or isn't available
                if not enhanced_translation and self.client:
                    enhanced_translation = self.enhance_translation_openai(text, basic_translation)
                    if enhanced_translation:
                        ai_provider = "openai"
                
                has_ai_enhancement = enhanced_translation is not None
            except Exception as e:
                print(f"AI enhancement failed: {str(e)}")
        
        return {
            "basic_translation": basic_translation,
            "enhanced_translation": enhanced_translation,
            "found_words": found_words,
            "not_found": not_found,
            "has_ai_enhancement": has_ai_enhancement,
            "ai_provider": ai_provider
        }

def init_translator():
    """Initialize the translator"""
    return DusunTranslator()

if __name__ == "__main__":
    translator = init_translator()
    # Test translation
    test_text = "Hello, how are you?"
    result = translator.translate(test_text)
    print(f"Original: {test_text}")
    print(f"Translation: {result}")
