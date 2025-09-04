from Models.dictionary import DusunTranslator
import json

def test_scraper():
    print("Initializing DusunTranslator...")
    translator = DusunTranslator()
    
    print("\nStarting dictionary scraping test...")
    translator.scrape_and_save_dictionary()
    
    print("\nChecking saved dictionary...")
    try:
        with open("dusun_dictionary.json", "r", encoding="utf-8") as f:
            entries = json.load(f)
            print(f"\nSuccessfully scraped {len(entries)} entries!")
            print("\nSample entries (first 10):")
            for entry in entries[:10]:
                print(f"English: {entry['english']} - Dusun: {entry['dusun']}")
    except FileNotFoundError:
        print("Error: Dictionary file was not created!")
    except json.JSONDecodeError:
        print("Error: Dictionary file is not valid JSON!")
    except Exception as e:
        print(f"Error reading dictionary: {str(e)}")

if __name__ == "__main__":
    test_scraper()
