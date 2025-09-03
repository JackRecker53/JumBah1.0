from flask import Blueprint, request, jsonify
from Models.dictionary import init_translator

translator_bp = Blueprint('translator', __name__)
translator = init_translator()

@translator_bp.route('/translate', methods=['POST'])
def translate():
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'error': 'Missing text parameter'
            }), 400
            
        text = data['text']
        from_lang = data.get('from_lang', 'en')  # Default to English
        
        translation = translator.translate(text, from_lang)
        
        return jsonify({
            'original': text,
            'translation': translation,
            'from_lang': from_lang,
            'to_lang': 'dusun'
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500
