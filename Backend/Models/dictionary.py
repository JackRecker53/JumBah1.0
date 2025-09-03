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
        """Scrape dictionary from the web and save to JSON"""
        entries = []
        url = "https://online.anyflip.com/luckd/sblx/mobile/index.html"
        
        # Setup Chrome with required options
        options = webdriver.ChromeOptions()
        options.add_argument('--headless=new')
        options.add_argument('--disable-gpu')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--window-size=1920,1080')
        options.add_experimental_option('excludeSwitches', ['enable-logging'])
        # Add user agent to appear more like a regular browser
        options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36')
        # Enable JavaScript
        options.add_argument('--enable-javascript')
        # Increase timeout for page load
        options.add_argument('--page-load-strategy=eager')
        
        print("Initializing Chrome driver...")
        driver = webdriver.Chrome(options=options)
        
        try:
            print("Accessing dictionary webpage...")
            driver.get(url)
            
            print("Waiting for content to load...")
            wait = WebDriverWait(driver, 30)
            
            # Wait for the page to fully load
            print("Waiting for page to load...")
            time.sleep(10)  # Give time for JavaScript to execute
            
            # Try to find iframes
            iframes = driver.find_elements(By.TAG_NAME, "iframe")
            print(f"Found {len(iframes)} iframes")
            
            # Try each iframe
            for idx, iframe in enumerate(iframes):
                try:
                    print(f"Trying iframe {idx + 1}")
                    driver.switch_to.frame(iframe)
                    
                    # Look for content inside this iframe
                    content_present = False
                    try:
                        content = driver.find_element(By.CLASS_NAME, "flipbook-container")
                        if content:
                            content_present = True
                            print("Found flipbook content")
                    except:
                        pass
                    
                    # If no content, switch back and try next iframe
                    if not content_present:
                        driver.switch_to.default_content()
                        continue
                        
                    # If we found content, break the loop
                    break
                except:
                    driver.switch_to.default_content()
                    continue
            
            # Wait for the book content
            print("Waiting for book content...")
            time.sleep(5)  # Give initial time for content to load
            
            # Try different selectors that might contain the dictionary content
            selectors = [
                ".page-content",
                ".flipbook-page",
                "#bookContainer",
                ".pageContent",
                ".flip-page-content",
                ".page",
                ".text-layer"
            ]
            
            # Try to navigate through pages using AnyFlip's page navigation
            print("Attempting to extract content from pages...")
            for selector in selectors:
                try:
                    # First try to find the page elements
                    pages = driver.find_elements(By.CSS_SELECTOR, selector)
                    if pages:
                        print(f"Found content using selector: {selector}")
                        for page_num, page in enumerate(pages, 1):
                            print(f"Processing page {page_num}")
                            # Try to make the page visible
                            driver.execute_script("arguments[0].scrollIntoView(true);", page)
                            time.sleep(2)  # Give more time for content to render
                            
                            # Get the text content of the page
                            text = page.text
                            if text:
                                print(f"Found text content on page {page_num}")
                                lines = text.split('\n')
                                for line in lines:
                                    # Look for dictionary entry patterns
                                    if ' - ' in line or ':' in line:
                                        try:
                                            # Try different separators
                                            if ' - ' in line:
                                                english, dusun = line.split(' - ', 1)
                                            else:
                                                english, dusun = line.split(':', 1)
                                            
                                            # Clean up and validate the entry
                                            english = english.strip().lower()
                                            dusun = dusun.strip()
                                            
                                            if english and dusun and len(english) > 1 and len(dusun) > 1:
                                                entries.append({
                                                    "english": english,
                                                    "dusun": dusun
                                                })
                                                print(f"Found entry: {english} - {dusun}")
                                        except ValueError:
                                            continue
                        
                        if entries:  # If we found entries, break the loop
                            break
                            
                except Exception as e:
                    print(f"Error with selector {selector}: {str(e)}")
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
